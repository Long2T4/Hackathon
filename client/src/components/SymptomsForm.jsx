import { useState, useRef } from 'react'
import { ArrowLeft, ArrowRight, Mic, MicOff } from 'lucide-react'

const SEVERITY = [
  { id: 'mild', es: 'Leve', en: 'Mild', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'moderate', es: 'Moderado', en: 'Moderate', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'severe', es: 'Severo', en: 'Severe', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'critical', es: 'Critico', en: 'Critical', color: 'bg-red-100 text-red-700 border-red-200' },
]

const DURATIONS = [
  { value: 'today', es: 'Hoy', en: 'Today' },
  { value: '1-3days', es: '1-3 dias', en: '1-3 days' },
  { value: '4-7days', es: '4-7 dias', en: '4-7 days' },
  { value: '1-2weeks', es: '1-2 semanas', en: '1-2 weeks' },
  { value: '1month+', es: 'Mas de 1 mes', en: 'More than 1 month' },
]

export default function SymptomsForm({ lang, onBack, onHome, onNext }) {
  const t = (es, en) => lang === 'es' ? es : en
  const [text, setText] = useState('')
  const [severity, setSeverity] = useState('')
  const [duration, setDuration] = useState('')
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)

  const valid = text.trim() && severity && duration

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = lang === 'es' ? 'es-MX' : 'en-US'
    rec.continuous = false
    rec.interimResults = false
    rec.onstart = () => setListening(true)
    rec.onresult = (e) => setText(prev => (prev + ' ' + e.results[0][0].transcript).trim())
    rec.onend = () => setListening(false)
    recRef.current = rec
    rec.start()
  }

  const stopListening = () => { recRef.current?.stop(); setListening(false) }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
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
              {t('Paso 1 de 3', 'Step 1 of 3')}: {t('Sintomas', 'Symptoms')}
            </p>
          </div>
          <p className="text-xs font-bold text-violet-600">33%</p>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full" style={{ width: '33%' }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">
          {t('Cuentanos como te sientes', 'Tell us how you\'re feeling')}
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          {t('Describe tus sintomas con detalle para un mejor analisis', 'Describe your symptoms in detail for better analysis')}
        </p>

        {/* Symptom text */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <label className="text-xs font-semibold text-gray-500 mb-2 block">
            {t('Que sintomas tienes?', 'What symptoms are you experiencing?')}
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={5}
            maxLength={500}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none border border-gray-100 resize-none"
            placeholder={t(
              'Ej: Tengo fiebre de 38C desde hace 2 dias, dolor de cabeza fuerte y tos seca...',
              'e.g. I\'ve had a fever for 2 days, strong headache and dry cough...'
            )}
          />
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={listening ? stopListening : startListening}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                listening ? 'bg-red-500 text-white recording-indicator' : 'bg-violet-50 text-violet-600'
              }`}
            >
              {listening ? <MicOff size={12} /> : <Mic size={12} />}
              {listening ? t('Detener', 'Stop') : t('Hablar', 'Speak')}
            </button>
            <span className="text-[10px] text-gray-400">{text.length}/500</span>
          </div>
        </div>

        {/* Severity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <label className="text-xs font-semibold text-gray-500 mb-3 block">
            {t('Que tan severos son tus sintomas?', 'How severe are your symptoms?')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SEVERITY.map(s => (
              <button
                key={s.id}
                onClick={() => setSeverity(s.id)}
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  severity === s.id ? s.color : 'bg-gray-50 text-gray-500 border-gray-100'
                }`}
              >
                {lang === 'es' ? s.es : s.en}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <label className="text-xs font-semibold text-gray-500 mb-2 block">
            {t('Cuanto tiempo llevas con estos sintomas?', 'How long have you had these symptoms?')}
          </label>
          <select
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none border border-gray-100"
          >
            <option value="">{t('Seleccionar duracion', 'Select duration')}</option>
            {DURATIONS.map(d => (
              <option key={d.value} value={d.value}>{lang === 'es' ? d.es : d.en}</option>
            ))}
          </select>
        </div>

        {/* Emergency */}
        <div className="bg-red-50 rounded-2xl p-4 border border-red-100 mb-6">
          <p className="text-xs font-bold text-red-700 mb-1">
            {t('Emergencia?', 'Emergency?')}
          </p>
          <p className="text-xs text-red-600">
            {t(
              'Si tienes dolor en el pecho, dificultad para respirar o sangrado severo, llama al 911 inmediatamente.',
              'If you have chest pain, difficulty breathing, or severe bleeding, call 911 immediately.'
            )}
          </p>
          <a href="tel:911" className="mt-2 inline-flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {t('Llamar al 911', 'Call 911')}
          </a>
        </div>
      </div>

      <div className="px-4 py-4 bg-white border-t border-gray-100 flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm"
        >
          <ArrowLeft size={16} /> {t('Atras', 'Back')}
        </button>
        <button
          onClick={() => valid && onNext({ text, severity, duration, file: null })}
          disabled={!valid}
          className="flex-1 bg-violet-600 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg shadow-violet-200"
        >
          {t('Analizar Sintomas', 'Analyze Symptoms')} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
