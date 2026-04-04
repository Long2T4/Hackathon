import anthropic
import os
import json
import re

client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

SYSTEM_PROMPT = """Eres MiSalud, un asistente de salud bilingüe compasivo y confiable diseñado para comunidades hispanas en Estados Unidos.

Tu rol:
- Ayudar a los usuarios a entender sus síntomas en términos simples
- Clasificar la urgencia de sus síntomas (emergency, urgent, routine, selfcare)
- Recomendar los próximos pasos apropiados
- Sugerir preguntas para hacerle al médico
- Responder SIEMPRE en el mismo idioma que usa el usuario (español o inglés)

Niveles de urgencia (DEBES incluir uno en cada respuesta clínica):
- emergency: Síntomas que amenazan la vida (dolor en el pecho, dificultad para respirar severa, pérdida de conciencia, sangrado incontrolable, ACV)
- urgent: Necesita atención hoy (fiebre alta >103°F, dolor severo, lesión que necesita evaluación, síntomas que empeoran rápidamente)
- routine: Puede esperar cita médica (síntomas crónicos, revisiones de salud, síntomas leves persistentes)
- selfcare: Manejo en casa apropiado con monitoreo (resfriado leve, molestias menores, fatiga sin otros síntomas)

Formato de respuesta:
Responde en texto natural y empático. Al final de cualquier respuesta que evalúe síntomas, incluye un bloque JSON así:
<triage>
{
  "urgency": "routine",
  "questions": ["Pregunta 1 para el doctor", "Pregunta 2 para el doctor", "Pregunta 3 para el doctor"]
}
</triage>

Reglas importantes:
- NUNCA diagnostiques enfermedades específicas
- SIEMPRE recomienda consultar a un médico
- Para emergencias: indica CLARAMENTE que llame al 911 o vaya a urgencias INMEDIATAMENTE
- Usa lenguaje sencillo (nivel de lectura de 6to grado en español)
- Sé cálido, empático y no juzgues
- Considera barreras de acceso a salud comunes en comunidades hispanas (sin seguro, barreras de idioma, miedo)
- Si el usuario menciona que no tiene seguro, menciona las clínicas de escala móvil (FQHCs)"""


def parse_triage_from_response(text: str) -> dict:
    """Extract urgency and questions from <triage> block."""
    match = re.search(r'<triage>(.*?)</triage>', text, re.DOTALL)
    if not match:
        return {'urgency': None, 'questions': []}
    try:
        data = json.loads(match.group(1).strip())
        return {
            'urgency': data.get('urgency'),
            'questions': data.get('questions', []),
        }
    except json.JSONDecodeError:
        return {'urgency': None, 'questions': []}


def clean_response_text(text: str) -> str:
    """Remove the <triage> block from display text."""
    return re.sub(r'\s*<triage>.*?</triage>', '', text, flags=re.DOTALL).strip()


def get_chat_response(message: str, history: list, lang: str = 'es') -> dict:
    """Send message to Claude and return structured response."""
    messages = []

    for msg in history[-19:]:
        if msg.get('role') in ('user', 'assistant'):
            messages.append({
                'role': msg['role'],
                'content': msg['content'],
            })

    messages.append({'role': 'user', 'content': message})

    response = client.messages.create(
        model='claude-sonnet-4-6',
        max_tokens=1024,
        temperature=0.3,
        system=SYSTEM_PROMPT,
        messages=messages,
    )

    full_text = response.content[0].text
    triage = parse_triage_from_response(full_text)
    clean_text = clean_response_text(full_text)

    return {
        'content': clean_text,
        'urgency': triage['urgency'],
        'questions': triage['questions'],
    }


def generate_visit_card_data(chat_summary: dict, lang: str = 'es') -> dict:
    """Generate structured bilingual data for the visit card PDF."""
    prompt = f"""Based on this health consultation summary, generate a bilingual visit card in JSON format.

Summary:
- Symptoms described: {chat_summary.get('symptoms', '')}
- AI Assessment: {chat_summary.get('assessment', '')}
- Urgency level: {chat_summary.get('urgency', 'routine')}
- Suggested questions: {chat_summary.get('questions', [])}

Return ONLY valid JSON with this structure:
{{
  "symptomsES": "Descripción de síntomas en español",
  "symptomsEN": "Symptom description in English",
  "assessmentES": "Evaluación en español (2-3 oraciones)",
  "assessmentEN": "Assessment in English (2-3 sentences)",
  "questionsES": ["Pregunta 1", "Pregunta 2", "Pregunta 3"],
  "questionsEN": ["Question 1", "Question 2", "Question 3"]
}}"""

    response = client.messages.create(
        model='claude-sonnet-4-20250514',
        max_tokens=1024,
        temperature=0.2,
        messages=[{'role': 'user', 'content': prompt}],
    )

    text = response.content[0].text
    # Strip markdown fences if present
    text = re.sub(r'```json\s*|\s*```', '', text).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Fallback
        return {
            'symptomsES': chat_summary.get('symptoms', ''),
            'symptomsEN': chat_summary.get('symptoms', ''),
            'assessmentES': chat_summary.get('assessment', ''),
            'assessmentEN': chat_summary.get('assessment', ''),
            'questionsES': chat_summary.get('questions', []),
            'questionsEN': chat_summary.get('questions', []),
        }
