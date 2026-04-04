# MiSalud 🌿

**Bilingual AI Health Navigator for Hispanic Communities**

MiSalud helps Spanish-speaking users understand their symptoms, find nearby affordable clinics, and generate a bilingual visit card PDF for their appointment.

---

## Features

- 🗣️ **Bilingual Chat** — Describe symptoms in Spanish or English; AI responds in the same language
- 🎙️ **Voice Input** — Speak your symptoms (Spanish or English)
- 🚦 **Urgency Triage** — Emergency / Urgent / Routine / Self-care classification
- 🏥 **Clinic Finder** — Nearby community health centers via Google Places
- 📄 **Visit Card PDF** — Bilingual PDF to bring to appointments
- 💡 **Insurance Guide** — Plain-language cards + eligibility quiz (Medicaid, CHIP, ACA, FQHCs)

---

## Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- Anthropic API key (required)
- Google Places API key (optional — uses mock data if absent)

### 1. Clone & configure

```bash
git clone <repo>
cd misalud
cp .env.example .env
# Edit .env with your API keys
```

### 2. Start the Flask backend

```bash
cd server
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

### 3. Start the React frontend

```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to Claude AI |
| GET | `/api/clinics?lat=X&lng=Y&radius=Z` | Find nearby clinics |
| POST | `/api/visit-card` | Generate structured visit card data |
| GET | `/api/health` | Health check |

---

## Project Structure

```
misalud/
├── client/                    # React + Vite + Tailwind frontend
│   └── src/
│       ├── components/        # Chat, ClinicFinder, InsuranceGuide, etc.
│       ├── hooks/             # useChat, useGeolocation, useSpeechRecognition
│       └── utils/             # api.js, pdfGenerator.js
└── server/                    # Python Flask backend
    ├── routes/                # chat.py, clinics.py
    └── services/              # claude_service.py, places_service.py
```

---

## Notes

- **No Google Places API key?** The clinic finder returns 3 mock clinics in Atlanta, GA.
- Rate limiting is set to **30 requests/min per IP** on the backend.
- All responses are limited to the last **20 messages** to manage token usage.
- The app works fully offline for Insurance Guide and Visit Card generation (PDF is client-side).

---

*Este proyecto no es un sustituto de atención médica profesional. · This project is not a substitute for professional medical care.*
