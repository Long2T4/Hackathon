from flask import Blueprint, request, jsonify, current_app
from services.claude_service import get_chat_response, generate_visit_card_data, analyze_symptoms
import anthropic

chat_bp = Blueprint('chat', __name__)
client = anthropic.Anthropic()


@chat_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON body'}), 400
    message = data.get('message', '').strip()
    history = data.get('history', [])
    lang = data.get('lang', 'es')
    file_data = data.get('file', None)
    if not message and not file_data:
        return jsonify({'error': 'Message or file is required'}), 400
    try:
        if file_data:
            result = get_chat_response_with_file(message, history, lang, file_data)
        else:
            result = get_chat_response(message, history, lang)
        return jsonify(result)
    except anthropic.APIConnectionError:
        return jsonify({'error': 'No se pudo conectar. / Could not connect.'}), 503
    except anthropic.RateLimitError:
        return jsonify({'error': 'Demasiadas solicitudes. / Too many requests.'}), 429
    except Exception as e:
        current_app.logger.error(f'Chat error: {e}')
        return jsonify({'error': 'Error interno. / Internal error.'}), 500


@chat_bp.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON body'}), 400
    message = data.get('message', '').strip()
    lang = data.get('lang', 'es')
    file_data = data.get('file', None)
    if not message:
        return jsonify({'error': 'Message required'}), 400
    try:
        result = analyze_symptoms(message, lang, file_data)
        return jsonify(result)
    except Exception as e:
        current_app.logger.error(f'Analyze error: {e}')
        return jsonify({'error': 'Analysis failed'}), 500


def get_chat_response_with_file(message, history, lang, file_data):
    from services.claude_service import parse_triage_from_response, clean_response_text, SYSTEM_PROMPT
    media_type = file_data.get('mediaType', 'image/jpeg')
    base64_data = file_data.get('base64', '')
    if media_type == 'application/pdf':
        file_content = {'type': 'document', 'source': {'type': 'base64', 'media_type': 'application/pdf', 'data': base64_data}}
    else:
        file_content = {'type': 'image', 'source': {'type': 'base64', 'media_type': media_type, 'data': base64_data}}
    text_content = {'type': 'text', 'text': f'{message}\n\nIf this is a medical document, explain it in simple language.'}
    messages = []
    for msg in history[-10:]:
        if msg.get('role') in ('user', 'assistant'):
            messages.append({'role': msg['role'], 'content': msg['content']})
    messages.append({'role': 'user', 'content': [file_content, text_content]})
    response = client.messages.create(model='claude-sonnet-4-6', max_tokens=1024, temperature=0.3, system=SYSTEM_PROMPT, messages=messages)
    full_text = response.content[0].text
    triage = parse_triage_from_response(full_text)
    return {'content': clean_response_text(full_text), 'urgency': triage['urgency'], 'questions': triage['questions']}


@chat_bp.route('/visit-card', methods=['POST'])
def visit_card():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON body'}), 400
    chat_summary = data.get('chatSummary', {})
    lang = data.get('lang', 'es')
    if not chat_summary:
        return jsonify({'error': 'Chat summary required'}), 400
    try:
        result = generate_visit_card_data(chat_summary, lang)
        return jsonify(result)
    except Exception as e:
        current_app.logger.error(f'Visit card error: {e}')
        return jsonify({'error': 'Could not generate visit card data'}), 500


@chat_bp.route('/translate', methods=['POST'])
def translate():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400
    text = data.get('text', '').strip()
    from_lang = data.get('from', 'es')
    if not text:
        return jsonify({'error': 'Text required'}), 400
    try:
        target = 'English' if from_lang == 'es' else 'Spanish'
        source = 'Spanish' if from_lang == 'es' else 'English'
        response = client.messages.create(model='claude-sonnet-4-6', max_tokens=512, messages=[{'role': 'user', 'content': f'Translate this {source} text to {target}. Return ONLY the translation:\n\n{text}'}])
        return jsonify({'translation': response.content[0].text.strip()})
    except Exception as e:
        current_app.logger.error(f'Translation error: {e}')
        return jsonify({'error': 'Translation failed'}), 500