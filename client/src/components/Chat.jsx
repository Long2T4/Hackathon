import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, RotateCcw, Paperclip, X, FileText } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import MessageBubble from './MessageBubble.jsx'
import VoiceInput from './VoiceInput.jsx'
import ClinicFinder from './ClinicFinder.jsx'
import VisitCard from './VisitCard.jsx'
import ReminderCard from './ReminderCard.jsx'

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-sm">🤖</span>
      </div>
      <div className="bg-white/10 backdrop-blur rounded-3xl rounded-bl-lg px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="typing-dot w-2 h-2 bg-white/60 rounded-full"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function FilePreview({ file, onRemove }) {
  const isImage = file.type.startsWith('image/')
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file, isImage])

  return (
    <div className="relative inline-flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2 mb-2">
      {isImage && preview ? (
        <img src={preview} alt="preview" className="w-10 h-10 rounded-xl object-cover" />
      ) : (
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
          <FileText size={18} className="text-white/60" />
        </div>
      )}
      <div>
        <p className="text-white text-xs font-semibold truncate max-w-[120px]">{file.name}</p>
        <p className="text-white/40 text-[10px]">{(file.size / 1024).toFixed(0)} KB</p>
      </div>
      <button
        onClick={onRemove}
        className="ml-1 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center"
      >
        <X size={10} className="text-white" />
      </button>
    </div>
  )
}

export default function Chat({ lang }) {
  const { messages, isLoading, error, triageResult, sendUserMessage, clearChat } = useChat(lang)
  const [inputText, setInputText] = useState('')
  const [showClinics, setShowClinics] = useState(false)
  const [attachedFile, setAttachedFile] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  const t = (es, en) => lang === 'es' ? es : en

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!inputText.trim() && !attachedFile) return

    if (attachedFile) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1]
        const mediaType = attachedFile.type
        const message = inputText.trim() ||
          t('Por favor explica este documento en español simple.', 'Please explain this document in simple Spanish.')
        await sendUserMessage(message, { base64, mediaType, fileName: attachedFile.name })
        setAttachedFile(null)
        setInputText('')
      }
      reader.readAsDataURL(attachedFile)
    } else {
      sendUserMessage(inputText)
      setInputText('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoiceTranscript = useCallback((transcript) => {
    setInputText(transcript)
    inputRef.current?.focus()
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) setAttachedFile(file)
    e.target.value = ''
  }

  return (
    <div
      className="flex flex-col flex-1 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {/* Header */}
        <div className="text-center mb-6 mt-2">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">
            {t('Hoy', 'Today')}
          </p>
          <h2 className="text-white font-display text-2xl font-semibold">
            {t('¿Cómo puedo ayudarte?', 'How can I help you?')}
          </h2>
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mt-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/70 text-xs font-medium">
              {t('Escuchando...', 'Listening...')} 👋
            </span>
          </div>
        </div>

        {messages.filter(m => m.id !== 'welcome').map(msg => (
          <MessageBubble key={msg.id} message={msg} lang={lang} dark />
        ))}

        {isLoading && <TypingIndicator />}

        {error && (
          <div className="mx-2 mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Post-triage actions */}
        {triageResult && !isLoading && (
          <div className="mt-4 space-y-3">
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-white/40 text-center mb-3">
                {t('Acciones recomendadas', 'Recommended actions')}
              </p>

              {/* Visit Card */}
              <VisitCard lang={lang} triageResult={triageResult} messages={messages} />

              {/* Reminder */}
              <div className="mt-3">
                <ReminderCard
                  lang={lang}
                  urgency={triageResult.urgency}
                  symptoms={triageResult.userSymptoms}
                />
              </div>

              {/* Clinics */}
              <button
                onClick={() => setShowClinics(s => !s)}
                className="w-full mt-3 py-3 rounded-2xl border border-white/20 text-white/80 text-sm font-semibold"
              >
                {showClinics
                  ? t('Ocultar clínicas', 'Hide clinics')
                  : t('🏥 Clínicas Cerca de Mí', '🏥 Find Clinics Near Me')}
              </button>
              {showClinics && <ClinicFinder lang={lang} />}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        className="px-3 py-3"
        style={{
          background: 'rgba(255,255,255,0.05)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {messages.length > 1 && (
          <div className="flex justify-end mb-2">
            <button
              onClick={clearChat}
              className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60"
            >
              <RotateCcw size={11} />
              {t('Nueva consulta', 'New consultation')}
            </button>
          </div>
        )}

        {attachedFile && (
          <FilePreview file={attachedFile} onRemove={() => setAttachedFile(null)} />
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 text-white/60 hover:bg-white/20 transition-all"
            aria-label={t('Adjuntar archivo', 'Attach file')}
          >
            <Paperclip size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <VoiceInput lang={lang} onTranscript={handleVoiceTranscript} dark />

          <div className="flex-1 bg-white/10 rounded-2xl flex items-end px-4 py-2.5 min-h-[48px]">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('Describe tus síntomas aquí...', 'Describe your symptoms here...')}
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 resize-none outline-none leading-relaxed max-h-32"
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={(!inputText.trim() && !attachedFile) || isLoading}
            className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-gray-900 shadow-lg disabled:opacity-30 transition-all active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>

        <p className="text-[10px] text-white/20 text-center mt-2">
          {t(
            'No es un diagnóstico médico · En caso de emergencia llame al 911',
            'Not a medical diagnosis · In emergency call 911'
          )}
        </p>
      </div>
    </div>
  )
}