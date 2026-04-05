import requests
import os
import math

PLACES_API_KEY = os.environ.get('GOOGLE_PLACES_API_KEY', '')
NEARBY_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json'


def haversine_distance(lat1, lon1, lat2, lon2) -> float:
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def fetch_clinics(lat: float, lng: float, radius: int = 8000) -> list:
    if not PLACES_API_KEY:
        return _mock_clinics(lat, lng)

    results = []
    seen_ids = set()
    keywords = ['community health center', 'centro de salud', 'urgent care', 'clinic']

    for keyword in keywords:
        params = {
            'location': f'{lat},{lng}',
            'radius': radius,
            'keyword': keyword,
            'type': 'health',
            'key': PLACES_API_KEY,
        }

        try:
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
        except Exception as e:
            print(f'Places API error for keyword "{keyword}": {e}')
            continue

    results.sort(key=lambda x: x['distance'])
    return results[:10]


def fetch_place_phone(place_id: str) -> str | None:
    if not PLACES_API_KEY:
        return None
    try:
        params = {
            'place_id': place_id,
            'fields': 'formatted_phone_number',
            'key': PLACES_API_KEY,
        }
        resp = requests.get(PLACE_DETAILS_URL, params=params, timeout=8)
        data = resp.json()
        return data.get('result', {}).get('formatted_phone_number')
    except Exception:
        return None


def _mock_clinics(lat: float, lng: float) -> list:
    """Return mock clinics relative to the user's actual coordinates."""
    return [
        {
            'place_id': 'mock_1',
            'name': 'Community Health Center',
            'address': f'Near ZIP code area',
            'rating': 4.2,
            'open_now': True,
            'distance': 1200,
            'lat': lat + 0.01,
            'lng': lng + 0.01,
        },
        {
            'place_id': 'mock_2',
            'name': 'Urgent Care Clinic',
            'address': f'Near your location',
            'rating': 4.0,
            'open_now': True,
            'distance': 2400,
            'lat': lat + 0.02,
            'lng': lng - 0.01,
        },
        {
            'place_id': 'mock_3',
            'name': 'Family Health Center',
            'address': f'Near your location',
            'rating': 3.8,
            'open_now': False,
            'distance': 3100,
            'lat': lat - 0.01,
            'lng': lng + 0.02,
        },
    ]