from flask import Blueprint, request, jsonify, current_app
from services.claude_service import get_chat_response, generate_visit_card_data
import anthropic

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON body'}), 400

    message = data.get('message', '').strip()
    history = data.get('history', [])
    lang = data.get('lang', 'es')

    if not message:
        return jsonify({'error': 'Message is required / Se requiere un mensaje'}), 400

    if len(message) > 2000:
        return jsonify({'error': 'Message too long / Mensaje demasiado largo'}), 400

    try:
        result = get_chat_response(message, history, lang)
        return jsonify(result)
    except anthropic.APIConnectionError:
        return jsonify({
            'error': 'No se pudo conectar con el servicio de IA. Intente de nuevo. / Could not connect to AI service. Please try again.'
        }), 503
    except anthropic.RateLimitError:
        return jsonify({
            'error': 'Demasiadas solicitudes. Espere un momento. / Too many requests. Please wait a moment.'
        }), 429
    except Exception as e:
        current_app.logger.error(f'Chat error: {e}')
        return jsonify({
            'error': 'Error interno del servidor. / Internal server error.'
        }), 500


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
