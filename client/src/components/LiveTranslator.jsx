import { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, MicOff, Volume2, Loader2, Pencil, Check, X } from 'lucide-react'

const SUPPORTED = typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

function useSpeech(lang) {
  const recRef = useRef(null)
  const [listening, setListening] = useState(false)

  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ audio: true }).catch(() => {})
  }, [])

  const start = useCallback((onResult) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = lang === 'es' ? 'es-MX' : 'en-US'
    rec.continuous = false
    rec.interimResults = false
    rec.onstart = () => setListening(true)
    rec.onresult = (e) => onResult(e.results[0][0].transcript)
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    recRef.current = rec
    try { rec.start() } catch (e) { console.error(e) }
  }, [lang])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setListening(false)
  }, [])

  return { listening, start, stop }
}

function speak(text, lang) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = lang === 'es' ? 'es-MX' : 'en-US'
  utt.rate = 0.9
  window.speechSynthesis.speak(utt)
}

async function translateText(text, fromLang) {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, from: fromLang }),
  })
  if (!res.ok) throw new Error('Translation failed')
  const data = await res.json()
  return data.translation
}

// Single panel — shows speaker controls + receives translated text from opposite side
function HalfPanel({ speakerLang, emoji, flipped, translatedText, translatedLang, onNewTranslation }) {
  const [original, setOriginal] = useState('')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [showIntro, setShowIntro] = useState(false)
  const { listening, start, stop } = useSpeech(speakerLang)

  const isPatient = speakerLang === 'es'
  const activeColor = isPatient ? '#22c55e' : '#a855f7'

  const handleRecord = () => {
    if (listening) { stop(); return }
    start(async (transcript) => {
      setOriginal(transcript)
      setLoading(true)
      try {
        const result = await translateText(transcript, speakerLang)
        // Send translation to the OPPOSITE panel
        onNewTranslation(result, speakerLang === 'es' ? 'en' : 'es')
        if (navigator.vibrate) navigator.vibrate([100, 50, 100])
      } catch {
        onNewTranslation(isPatient ? 'Error al traducir.' : 'Translation error.', speakerLang === 'es' ? 'en' : 'es')
      } finally {
        setLoading(false)
      }
    })
  }

  const handleEditSave = async () => {
    setEditing(false)
    setOriginal(editText)
    setLoading(true)
    try {
      const result = await translateText(editText, speakerLang)
      onNewTranslation(result, speakerLang === 'es' ? 'en' : 'es')
    } catch {
      onNewTranslation('Error.', speakerLang === 'es' ? 'en' : 'es')
    } finally {
      setLoading(false)
    }
  }

  const panelBg = isPatient
    ? 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 100%)'
    : 'linear-gradient(160deg, #faf5ff 0%, #ede9fe 100%)'

  const btnColor = isPatient ? 'bg-green-500' : 'bg-violet-500'
  const textAccent = isPatient ? 'text-green-700' : 'text-violet-700'
  const bgAccent = isPatient ? 'bg-green-50 border-green-100' : 'bg-violet-50 border-violet-100'

  return (
    <div
      className="flex-1 flex flex-col px-4 py-4 relative overflow-hidden"
      style={{
        transform: flipped ? 'rotate(180deg)' : 'none',
        background: panelBg,
        boxShadow: listening ? `inset 0 0 0 3px ${activeColor}` : 'none',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* Doctor intro button */}
      {!isPatient && (
        <button
          onClick={() => setShowIntro(true)}
          className="absolute top-3 right-3 text-[10px] font-semibold bg-white/80 border border-violet-100 text-violet-500 px-2 py-1 rounded-full z-10"
        >
          👋 Show Doctor
        </button>
      )}

      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{emoji}</span>
        <div>
          <p className="font-bold text-gray-800 text-sm">
            {isPatient ? 'Paciente 🇲🇽' : 'Doctor 🇺🇸'}
          </p>
          <p className="text-[10px] text-gray-400">
            {isPatient ? 'Habla Español → English' : 'Speak English → Español'}
          </p>
        </div>
        {listening && (
          <div
            className="ml-auto w-3 h-3 rounded-full"
            style={{
              background: activeColor,
              boxShadow: `0 0 0 4px ${activeColor}40`,
              animation: 'pulse 1s ease-in-out infinite',
            }}
          />
        )}
      </div>

      {/* Mic button */}
      <button
        onClick={handleRecord}
        disabled={loading}
        className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm text-white shadow-lg transition-all ${btnColor}`}
        style={{ boxShadow: listening ? `0 0 0 6px ${activeColor}40` : undefined }}
      >
        {loading ? <Loader2 size={20} className="animate-spin" />
          : listening ? <MicOff size={20} />
          : <Mic size={20} />}
        {loading ? (isPatient ? 'Traduciendo...' : 'Translating...')
          : listening ? (isPatient ? 'Detener' : 'Stop')
          : (isPatient ? 'Hablar' : 'Speak')}
      </button>

      {/* What I said */}
      {original && !editing && (
        <div className="mt-3 bg-white/70 rounded-xl p-3 border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              {isPatient ? '🇲🇽 Lo que dijiste' : '🇺🇸 What you said'}
            </p>
            <button onClick={() => { setEditText(original); setEditing(true) }} className="text-gray-300 hover:text-gray-500">
              <Pencil size={11} />
            </button>
          </div>
          <p className="text-sm text-gray-700">{original}</p>
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        <div className="mt-3 bg-white rounded-xl p-3 border-2 border-violet-200">
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            className="w-full text-sm text-gray-700 bg-transparent outline-none resize-none"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button onClick={handleEditSave} className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <Check size={11} /> {isPatient ? 'Guardar' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
              <X size={11} /> {isPatient ? 'Cancelar' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Translation received FROM the other side — tap to replay */}
      {translatedText && (
        <button
          onClick={() => speak(translatedText, translatedLang)}
          className={`mt-3 w-full text-left rounded-xl p-3 border ${bgAccent}`}
        >
          <div className="flex items-center justify-between mb-1">
            <p className={`text-[10px] font-bold uppercase tracking-wide ${textAccent}`}>
              {isPatient ? '🇺🇸 Doctor dijo — toca para escuchar' : '🇲🇽 Paciente dijo — tap to hear'}
            </p>
            <Volume2 size={13} className={textAccent} />
          </div>
          <p className={`text-sm font-semibold ${textAccent}`}>{translatedText}</p>
        </button>
      )}

      {/* Doctor intro overlay */}
      {showIntro && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20" style={{ background: 'rgba(139,92,246,0.97)' }}>
          <p className="text-white text-center font-bold text-lg mb-4">Hello Doctor 👋</p>
          <p className="text-white/90 text-center text-sm leading-relaxed mb-6">
            I am using this AI tool to help me communicate accurately in Spanish. Please speak clearly into the phone when it's your turn.
          </p>
          <button onClick={() => setShowIntro(false)} className="bg-white text-violet-600 font-bold px-6 py-2.5 rounded-full text-sm">
            Got it
          </button>
        </div>
      )}
    </div>
  )
}

export default function LiveTranslator({ lang }) {
  // Shared state — patient's translation goes to doctor, doctor's goes to patient
  const [patientTranslation, setPatientTranslation] = useState({ text: '', lang: 'en' })
  const [doctorTranslation, setDoctorTranslation] = useState({ text: '', lang: 'es' })

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ height: '100%' }}>
      {/* Doctor half — flipped, receives patient's translation */}
      <HalfPanel
        speakerLang="en"
        emoji="👨‍⚕️"
        flipped={true}
        translatedText={patientTranslation.text}
        translatedLang={patientTranslation.lang}
        onNewTranslation={(text, lang) => setDoctorTranslation({ text, lang })}
      />

      {/* Divider */}
      <div className="flex items-center justify-center bg-gray-800 py-2 px-4 gap-3 flex-shrink-0">
        <div className="flex-1 h-px bg-gray-600" />
        <span className="text-white text-xs font-bold tracking-widest">MiSalud</span>
        <div className="flex-1 h-px bg-gray-600" />
      </div>

      {/* Patient half — receives doctor's translation */}
      <HalfPanel
        speakerLang="es"
        emoji="🧑"
        flipped={false}
        translatedText={doctorTranslation.text}
        translatedLang={doctorTranslation.lang}
        onNewTranslation={(text, lang) => setPatientTranslation({ text, lang })}
      />
    </div>
  )
}