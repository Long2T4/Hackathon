from flask import Blueprint, request, jsonify, current_app
from services.places_service import fetch_clinics

clinics_bp = Blueprint('clinics', __name__)


@clinics_bp.route('/clinics', methods=['GET'])
def clinics():
    try:
        lat = float(request.args.get('lat', 0))
        lng = float(request.args.get('lng', 0))
        radius = int(request.args.get('radius', 8000))
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid lat/lng/radius parameters'}), 400

    if lat == 0 and lng == 0:
        return jsonify({'error': 'Location coordinates required'}), 400

    radius = min(max(radius, 1000), 50000)

    try:
        results = fetch_clinics(lat, lng, radius)
        return jsonify({'clinics': results, 'count': len(results)})
    except Exception as e:
        current_app.logger.error(f'Clinics error: {e}')
        return jsonify({'error': 'Could not fetch clinic data'}), 500
