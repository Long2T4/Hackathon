import { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, Phone, Globe, Star, Navigation, MessageCircle, RotateCcw, Loader2 } from 'lucide-react'
import VisitCard from './VisitCard.jsx'

function ClinicItem({ clinic, index, lang, urgency }) {
  const t = (es, en) => lang === 'es' ? es : en
  const phone = clinic.phone || null
  const stars = Math.round(clinic.rating || 0)
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clinic.address)}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name)}`

  const costHint = urgency === 'emergency'
    ? { es: 'Ir a urgencias inmediatamente', en: 'Go to ER immediately', color: 'text-red-600 bg-red-50' }
    : clinic.name.toLowerCase().includes('community') || clinic.name.toLowerCase().includes('mercy')
    ? { es: 'Opcion mas asequible para pagos directos', en: 'Most affordable option for self-pay', color: 'text-green-700 bg-green-50' }
    : { es: 'Llama para preguntar sobre costos', en: 'Call to ask about costs', color: 'text-blue-700 bg-blue-50' }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 ${index === 0 ? 'border-violet-200' : 'border-gray-100'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${index === 0 ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 text-sm flex-1">{clinic.name}</p>
            {index === 0 && <span className="text-[10px] font-bold bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">{t('Mejor opcion', 'Best Match')}</span>}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={10} className={i < stars ? 'text-orange-400 fill-orange-400' : 'text-gray-200 fill-gray-200'} />)}
            {clinic.rating && <span className="text-[10px] text-gray-400 ml-1">{clinic.rating.toFixed(1)}</span>}
            {clinic.open_now !== undefined && <span className={`ml-2 text-[10px] font-semibold ${clinic.open_now ? 'text-green-600' : 'text-gray-400'}`}>• {clinic.open_now ? t('Abierto', 'Open') : t('Cerrado', 'Closed')}</span>}
          </div>
          <div className="flex items-start gap-1 mt-1">
            <MapPin size={10} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500">{clinic.address}</p>
          </div>
          {clinic.distance && <p className="text-[10px] text-gray-400 mt-0.5 ml-3.5">{(clinic.distance / 1609).toFixed(1)} mi · ~{Math.round(clinic.distance / 400)} min</p>}
          {phone && (
            <div className="flex items-center gap-1 mt-1 ml-0.5">
              <Phone size={10} className="text-gray-400" />
              <p className="text-xs text-gray-500">{phone}</p>
            </div>
          )}
          <div className={`mt-2 text-[10px] font-medium px-2 py-1 rounded-lg ${costHint.color}`}>{lang === 'es' ? costHint.es : costHint.en}</div>
          <div className="flex gap-2 mt-3">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 border border-gray-200 rounded-xl py-2 text-xs font-semibold text-gray-600"><Navigation size={11} /> {t('Mapa', 'Map')}</a>
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 border border-gray-200 rounded-xl py-2 text-xs font-semibold text-gray-600"><Globe size={11} /> {t('Direcciones', 'Directions')}</a>
            <a
              href={phone ? `tel:${phone}` : undefined}
              onClick={!phone ? (e) => e.preventDefault() : undefined}
              className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold text-white ${phone ? 'bg-violet-600' : 'bg-gray-300'}`}
            >
              <Phone size={11} />
              {phone || t('Sin numero', 'No number')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResultsScreen({ lang, symptomsData, analysisData, onBack, onHome, onChat, onRestart }) {
  const t = (es, en) => lang === 'es' ? es : en
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const triageResult = analysisData ? {
    content: analysisData.summary || '',
    urgency: analysisData.urgency || 'routine',
    questions: analysisData.questions || [],
    clinicianSummary: analysisData.clinicianSummary || '',
  } : null

  const syntheticMessages = symptomsData?.text
    ? [{ id: 'symptom', role: 'user', content: symptomsData.text }]
    : []

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`/api/clinics?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=8000`)
        const data = await res.json()
        setClinics(data.clinics || [])
      } catch { setError(t('No se pudieron cargar las clinicas.', 'Could not load clinics.')) }
      setLoading(false)
    }, () => { setError(t('Activa tu ubicacion para ver clinicas cercanas.', 'Enable location to see nearby clinics.')); setLoading(false) })
  }, [])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onHome}
              className="flex items-center gap-1.5 text-violet-600 font-bold text-base"
            >
              <div className="w-6 h-6 bg-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              MiSalud
            </button>
            <span className="text-gray-300">·</span>
            <p className="text-xs text-gray-500 font-medium">
              {t('Paso 3 de 3', 'Step 3 of 3')}: {t('Clinicas', 'Clinics')}
            </p>
          </div>
          <p className="text-xs font-bold text-violet-600">100%</p>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full w-full" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">{t('Clínicas Recomendadas', 'Matched Clinics')}</h2>
        <p className="text-sm text-gray-400 mb-4">{t('Basado en tus síntomas, urgencia y ubicación', 'Based on your symptoms, urgency level, and location')}</p>

        {analysisData && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center text-sm">🩺</div>
              <div>
                <p className="text-xs text-gray-400">{t('Tu evaluación', 'Your assessment')}</p>
                <p className="text-sm font-semibold text-gray-900">{analysisData.likelyConcern} · <span className="text-orange-500">{analysisData.urgency}</span></p>
              </div>
            </div>
            <button onClick={onBack} className="text-[10px] font-semibold text-violet-500 border border-violet-100 px-2 py-1 rounded-full">{t('Revisar', 'Review')}</button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 size={24} className="text-violet-500 animate-spin" />
            <p className="text-sm text-gray-400">{t('Buscando clínicas...', 'Finding clinics...')}</p>
          </div>
        )}

        {error && <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 mb-4"><p className="text-orange-700 text-sm">{error}</p></div>}

        {!loading && clinics.length > 0 && (
          <div className="space-y-3 mb-6">
            {clinics.slice(0, 5).map((clinic, i) => (
              <ClinicItem key={clinic.place_id || i} clinic={clinic} index={i} lang={lang} urgency={analysisData?.urgency} />
            ))}
          </div>
        )}

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">{t('¿No encuentras lo que necesitas?', 'Not finding what you need?')}</p>
            <p className="text-xs text-gray-400">{t('Pregúntale a la IA', 'Ask the AI')}</p>
          </div>
          <button onClick={onChat} className="flex items-center gap-1.5 bg-violet-600 text-white text-xs font-bold px-3 py-2 rounded-xl">
            <MessageCircle size={12} /> {t('Chat IA', 'Chat AI')}
          </button>
        </div>

        <VisitCard lang={lang} triageResult={triageResult} messages={syntheticMessages} />

        <button onClick={onRestart} className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-400 font-medium">
          <RotateCcw size={14} /> {t('Nueva consulta', 'New consultation')}
        </button>
      </div>

      <div className="px-4 py-4 bg-white border-t border-gray-100 flex gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm">
          <ArrowLeft size={16} /> {t('Atrás', 'Back')}
        </button>
        <button onClick={onChat} className="flex-1 bg-violet-600 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-violet-200">
          <MessageCircle size={16} /> {t('Chat con IA', 'Chat with AI')}
        </button>
      </div>
    </div>
  )
}