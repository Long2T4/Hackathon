import anthropic
import os
import json
import re

client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

SYSTEM_PROMPT = """Eres MiSalud, un asistente de salud bilingüe para comunidades hispanas en EE.UU.

REGLAS DE FORMATO:
- Responde SIEMPRE en el idioma del usuario (español o inglés)
- USA SIEMPRE el formato estructurado
- Respuestas CORTAS y SIMPLES — nivel de lectura de 6to grado
- NUNCA escribas párrafos largos
- USA viñetas, no párrafos
- MÁXIMO 3-4 puntos por sección

FORMATO DE RESPUESTA:

## [Emoji] [Frase corta de empatía — 1 oración]

## ⚠️ Llama al 911 si tienes:
- 🚩 [señal de alarma 1]
- 🚩 [señal de alarma 2]

## ✅ Qué hacer ahora:
- [paso 1 simple]
- [paso 2 simple]

## 💊 En casa puedes:
- [remedio casero 1]
- [remedio casero 2]

---

SIEMPRE incluye al final:
<triage>
{
  "urgency": "emergency|urgent|routine|selfcare",
  "questions": ["Pregunta 1 para el doctor", "Pregunta 2", "Pregunta 3"]
}
</triage>

URGENCIA:
- emergency: dolor de pecho, dificultad para respirar severa, pérdida de conciencia
- urgent: fiebre >103F, dolor severo, síntomas que empeoran rápido
- routine: síntomas crónicos leves
- selfcare: resfriado leve, cansancio sin otros síntomas

REGLAS:
- NUNCA diagnostiques enfermedades específicas
- SIEMPRE recomienda ver a un médico
- Usa palabras simples
- Si no tiene seguro, menciona clínicas comunitarias (FQHC)"""


def parse_triage_from_response(text: str) -> dict:
    match = re.search(r'<triage>(.*?)</triage>', text, re.DOTALL)
    if not match:
        return {'urgency': None, 'questions': []}
    try:
        data = json.loads(match.group(1).strip())
        return {'urgency': data.get('urgency'), 'questions': data.get('questions', [])}
    except json.JSONDecodeError:
        return {'urgency': None, 'questions': []}


def clean_response_text(text: str) -> str:
    return re.sub(r'\s*<triage>.*?</triage>', '', text, flags=re.DOTALL).strip()


def get_chat_response(message: str, history: list, lang: str = 'es') -> dict:
    messages = []
    for msg in history[-19:]:
        if msg.get('role') in ('user', 'assistant'):
            messages.append({'role': msg['role'], 'content': msg['content']})
    messages.append({'role': 'user', 'content': message})
    response = client.messages.create(model='claude-sonnet-4-6', max_tokens=1024, temperature=0.3, system=SYSTEM_PROMPT, messages=messages)
    full_text = response.content[0].text
    triage = parse_triage_from_response(full_text)
    return {'content': clean_response_text(full_text), 'urgency': triage['urgency'], 'questions': triage['questions']}


def analyze_symptoms(message: str, lang: str = 'es', file_data: dict = None) -> dict:
    lang_instruction = 'Respond in Spanish.' if lang == 'es' else 'Respond in English.'
    prompt = f"""You are a medical AI assistant. Analyze these patient symptoms and return a JSON response.

Patient info and symptoms: {message}

{lang_instruction}

Return ONLY valid JSON:
{{
  "likelyConcern": "Short name of likely condition",
  "summary": "2-3 sentence plain language summary",
  "conditions": ["Other condition 1", "Other condition 2", "Other condition 3"],
  "urgency": "emergency|urgent|routine|selfcare",
  "clinicalGuidance": "1-2 sentences on recommended care setting",
  "explanation": "2-3 sentences explaining in simple terms what is happening",
  "clinicianSummary": "1-2 sentence medical summary in English for the doctor",
  "questions": ["Question 1 for doctor", "Question 2", "Question 3"],
  "redFlags": ["Warning sign 1", "Warning sign 2", "Warning sign 3"]
}}

Rules:
- NEVER say it IS a specific diagnosis — say likely or may be
- Use simple language for summary and explanation
- clinicianSummary must always be in English
- questions should be in the user language ({lang})
- urgency: emergency=chest pain/cant breathe, urgent=high fever/severe pain, routine=mild ongoing, selfcare=minor"""

    messages_content = [{'type': 'text', 'text': prompt}]
    if file_data:
        media_type = file_data.get('mediaType', 'image/jpeg')
        base64_data = file_data.get('base64', '')
        if media_type == 'application/pdf':
            messages_content.insert(0, {'type': 'document', 'source': {'type': 'base64', 'media_type': 'application/pdf', 'data': base64_data}})
        else:
            messages_content.insert(0, {'type': 'image', 'source': {'type': 'base64', 'media_type': media_type, 'data': base64_data}})

    response = client.messages.create(model='claude-sonnet-4-6', max_tokens=1024, temperature=0.2, messages=[{'role': 'user', 'content': messages_content}])
    text = re.sub(r'```json\s*|\s*```', '', response.content[0].text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            'likelyConcern': 'Ver con médico / See a doctor',
            'summary': text[:300],
            'conditions': [],
            'urgency': 'routine',
            'clinicalGuidance': 'Consulta con tu médico. / Consult your doctor.',
            'explanation': '',
            'clinicianSummary': message[:200],
            'questions': [],
            'redFlags': [],
        }


def generate_visit_card_data(chat_summary: dict, lang: str = 'es') -> dict:
    prompt = f"""Generate a bilingual visit card in JSON format.

Summary:
- Symptoms: {chat_summary.get('symptoms', '')}
- Assessment: {chat_summary.get('assessment', '')}
- Urgency: {chat_summary.get('urgency', 'routine')}
- Questions: {chat_summary.get('questions', [])}

Return ONLY valid JSON:
{{
  "clinicianSummary": "2-sentence medical summary in English",
  "symptomsES": "Descripcion breve en espanol",
  "symptomsEN": "Brief description in English",
  "assessmentES": "Evaluacion en espanol",
  "assessmentEN": "Assessment in English",
  "questionsES": ["Pregunta 1", "Pregunta 2", "Pregunta 3"],
  "questionsEN": ["Question 1", "Question 2", "Question 3"]
}}"""

    response = client.messages.create(model='claude-sonnet-4-6', max_tokens=1024, temperature=0.2, messages=[{'role': 'user', 'content': prompt}])
    text = re.sub(r'```json\s*|\s*```', '', response.content[0].text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            'clinicianSummary': chat_summary.get('assessment', ''),
            'symptomsES': chat_summary.get('symptoms', ''),
            'symptomsEN': chat_summary.get('symptoms', ''),
            'assessmentES': chat_summary.get('assessment', ''),
            'assessmentEN': chat_summary.get('assessment', ''),
            'questionsES': chat_summary.get('questions', []),
            'questionsEN': chat_summary.get('questions', []),
        }