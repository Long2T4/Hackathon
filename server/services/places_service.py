import requests
import os
import math

PLACES_API_KEY = os.environ.get('GOOGLE_PLACES_API_KEY', '')
NEARBY_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json'


def haversine_distance(lat1, lon1, lat2, lon2) -> float:
    """Return distance in meters between two coordinates."""
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def fetch_clinics(lat: float, lng: float, radius: int = 8000) -> list:
    """Query Google Places for community health centers near the given coordinates."""
    if not PLACES_API_KEY:
        return _mock_clinics(lat, lng)

    results = []
    seen_ids = set()

    keywords = ['community health center', 'centro de salud', 'federally qualified health center']

    for keyword in keywords:
        params = {
            'location': f'{lat},{lng}',
            'radius': radius,
            'keyword': keyword,
            'type': 'health',
            'key': PLACES_API_KEY,
        }

        resp = requests.get(NEARBY_SEARCH_URL, params=params, timeout=10)
        data = resp.json()

        for place in data.get('results', []):
            pid = place.get('place_id')
            if pid in seen_ids:
                continue

            rating = place.get('rating', 0)
            if rating < 3.0:
                continue

            seen_ids.add(pid)

            place_lat = place['geometry']['location']['lat']
            place_lng = place['geometry']['location']['lng']
            distance = haversine_distance(lat, lng, place_lat, place_lng)

            opening_hours = place.get('opening_hours', {})

            results.append({
                'place_id': pid,
                'name': place.get('name', ''),
                'address': place.get('vicinity', ''),
                'rating': rating,
                'open_now': opening_hours.get('open_now'),
                'distance': round(distance),
                'lat': place_lat,
                'lng': place_lng,
            })

    # Sort by distance
    results.sort(key=lambda x: x['distance'])
    return results[:10]


def _mock_clinics(lat: float, lng: float) -> list:
    """Return mock data when no API key is configured."""
    return [
        {
            'place_id': 'mock_1',
            'name': 'Community Health Center of Central Atlanta',
            'address': '44 Boulevard NE, Atlanta, GA 30312',
            'rating': 4.2,
            'open_now': True,
            'distance': 1200,
            'lat': lat + 0.01,
            'lng': lng + 0.01,
        },
        {
            'place_id': 'mock_2',
            'name': 'Mercy Care – Centro de Salud',
            'address': '979 John Wesley Dobbs Ave NE, Atlanta, GA 30314',
            'rating': 4.5,
            'open_now': True,
            'distance': 2400,
            'lat': lat + 0.02,
            'lng': lng - 0.01,
        },
        {
            'place_id': 'mock_3',
            'name': 'Grady Primary Care Center',
            'address': '80 Jesse Hill Jr Dr SE, Atlanta, GA 30303',
            'rating': 3.8,
            'open_now': False,
            'distance': 3100,
            'lat': lat - 0.01,
            'lng': lng + 0.02,
        },
    ]
