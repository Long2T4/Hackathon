import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, Paperclip, X, FileText, RotateCcw, Mic, MicOff } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import MessageBubble from './MessageBubble.jsx'
import VisitCard from './VisitCard.jsx'
import ReminderCard from './ReminderCard.jsx'
import ClinicFinder from './ClinicFinder.jsx'

const QUICK_QUESTIONS = {
  es: ['¿Puedo tomar medicamentos sin receta?', '¿Qué remedios caseros me ayudarían?', '¿Cuándo debo ir a urgencias?', '¿Cuánto tiempo voy a tardar en sanar?', '¿Es contagioso?', '¿Debo evitar algún alimento?'],
  en: ['Can I take over-the-counter medication?', 'What home remedies might help?', 'When should I go to the ER?', 'How long until I feel better?', 'Is this contagious?', 'Should I avoid any foods?'],
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-sm">🤖</span>
      </div>
      <div className="bg-white/10 backdrop-blur rounded-3xl rounded-bl-lg px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0,1,2].map(i => <div key={i} className="typing-dot w-2 h-2 bg-white/60 rounded-full" style={{ animationDelay: `${i*0.2}s` }} />)}
        </div>
      </div>
    </div>
  )
}

export default function AIChatScreen({ lang, setLang, patientData, symptomsData, analysisData, onBack }) {
  const { messages, isLoading, error, triageResult, sendUserMessage, clearChat } = useChat(lang)
  const [inputText, setInputText] = useState('')
  const [attachedFile, setAttachedFile] = useState(null)
  const [showClinics, setShowClinics] = useState(false)
  const [listening, setListening] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const recRef = useRef(null)

  const t = (es, en) => lang === 'es' ? es : en

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isLoading])

  const handleSend = async (text) => {
    const msg = text || inputText
    if (!msg.trim() && !attachedFile) return
    if (attachedFile) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        await sendUserMessage(msg || t('Explica este documento.', 'Explain this document.'), { base64: e.target.result.split(',')[1], mediaType: attachedFile.type, fileName: attachedFile.name })
        setAttachedFile(null)
        setInputText('')
      }
      reader.readAsDataURL(attachedFile)
    } else {
      sendUserMessage(msg)
      setInputText('')
    }
  }

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = lang === 'es' ? 'es-MX' : 'en-US'
    rec.continuous = false
    rec.interimResults = false
    rec.onstart = () => setListening(true)
    rec.onresult = (e) => setInputText(e.results[0][0].transcript)
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    recRef.current = rec
    rec.start()
  }

  const showQuickQuestions = messages.filter(m => m.id !== 'welcome').length === 0

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
            <ArrowLeft size={16} className="text-white" />
          </button>
          <div>
            <p className="text-white font-semibold text-sm">{t('Chat con IA', 'AI Chat')}</p>
            <p className="text-white/40 text-[10px]">{t('Pregunta lo que quieras', 'Ask anything')}</p>
          </div>
        </div>
        <button onClick={() => setLang(l => l === 'es' ? 'en' : 'es')} className="text-xs font-bold bg-white/10 text-white/70 px-2 py-1 rounded-full">
          {lang === 'es' ? 'EN' : 'ES'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {patientData && showQuickQuestions && (
          <div className="bg-violet-500/20 border border-violet-500/30 rounded-2xl p-3 mb-4">
            <p className="text-violet-300 text-xs font-semibold mb-1">🧠 {t('Contexto cargado', 'Context loaded')}</p>
            <p className="text-violet-200/70 text-[10px]">{t(`Hola ${patientData.firstName}, tengo tu información lista.`, `Hi ${patientData.firstName}, I have your information ready.`)}</p>
          </div>
        )}

        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/70 text-xs font-medium">{t('Hoy', 'Today')}</span>
          </div>
          <h2 className="text-white font-display text-xl font-semibold mt-2">{t('¿Cómo puedo ayudarte?', 'How can I help you?')}</h2>
        </div>

        {messages.filter(m => m.id !== 'welcome').map(msg => (
          <MessageBubble key={msg.id} message={msg} lang={lang} dark />
        ))}

        {isLoading && <TypingIndicator />}
        {error && <div className="mx-2 mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 text-sm">{error}</div>}

        {showQuickQuestions && (
          <div className="mb-4">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">{t('Preguntas frecuentes', 'Common questions')}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {(QUICK_QUESTIONS[lang] || QUICK_QUESTIONS.es).map((q, i) => (
                <button key={i} onClick={() => handleSend(q)} className="bg-white/10 text-white/80 text-xs font-medium px-3 py-2 rounded-full border border-white/10">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {triageResult && !isLoading && (
          <div className="mt-4 space-y-3">
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-white/40 text-center mb-3">{t('Acciones recomendadas', 'Recommended actions')}</p>
              <VisitCard lang={lang} triageResult={triageResult} messages={messages} />
              <div className="mt-3"><ReminderCard lang={lang} urgency={triageResult.urgency} symptoms={triageResult.userSymptoms} /></div>
              <button onClick={() => setShowClinics(s => !s)} className="w-full mt-3 py-3 rounded-2xl border border-white/20 text-white/80 text-sm font-semibold">
                {showClinics ? t('Ocultar clínicas', 'Hide clinics') : t('🏥 Clínicas Cerca de Mí', '🏥 Find Clinics Near Me')}
              </button>
              {showClinics && <ClinicFinder lang={lang} />}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-3 py-3" style={{ background: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {messages.length > 1 && (
          <div className="flex justify-end mb-2">
            <button onClick={clearChat} className="flex items-center gap-1 text-xs text-white/30"><RotateCcw size={11} /> {t('Nueva consulta', 'New consultation')}</button>
          </div>
        )}

        {attachedFile && (
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2 mb-2">
            <FileText size={14} className="text-white/60" />
            <p className="text-white text-xs truncate max-w-[120px]">{attachedFile.name}</p>
            <button onClick={() => setAttachedFile(null)} className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center"><X size={8} className="text-white" /></button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 text-white/60">
            <Paperclip size={18} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={e => { const f = e.target.files[0]; if (f) setAttachedFile(f); e.target.value = '' }} className="hidden" />

          <button onClick={listening ? () => { recRef.current?.stop(); setListening(false) } : startListening} className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${listening ? 'bg-red-500' : 'bg-white/10 text-white/60'}`}>
            {listening ? <MicOff size={18} className="text-white" /> : <Mic size={18} />}
          </button>

          <div className="flex-1 bg-white/10 rounded-2xl flex items-end px-4 py-2.5 min-h-[48px]">
            <textarea ref={inputRef} value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }} placeholder={t('Describe tus síntomas o haz una pregunta...', 'Describe symptoms or ask a question...')} rows={1} className="flex-1 bg-transparent text-sm text-white placeholder-white/30 resize-none outline-none leading-relaxed max-h-32" disabled={isLoading} />
          </div>

          <button onClick={() => handleSend()} disabled={(!inputText.trim() && !attachedFile) || isLoading} className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-gray-900 shadow-lg disabled:opacity-30 active:scale-95">
            <Send size={18} />
          </button>
        </div>

        <p className="text-[10px] text-white/20 text-center mt-2">{t('No es un diagnóstico médico · En emergencias llame al 911', 'Not a medical diagnosis · In emergency call 911')}</p>
      </div>
    </div>
  )
}