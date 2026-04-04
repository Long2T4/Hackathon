import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, RotateCcw } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import MessageBubble from './MessageBubble.jsx'
import VoiceInput from './VoiceInput.jsx'
import ClinicFinder from './ClinicFinder.jsx'
import VisitCard from './VisitCard.jsx'

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-sm">🏥</span>
      </div>
      <div className="bg-white border border-gray-100 shadow-sm rounded-3xl rounded-bl-lg px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="typing-dot w-2 h-2 bg-teal-400 rounded-full"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Chat({ lang }) {
  const { messages, isLoading, error, triageResult, sendUserMessage, clearChat } = useChat(lang)
  const [inputText, setInputText] = useState('')
  const [showClinics, setShowClinics] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const t = (es, en) => lang === 'es' ? es : en

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    if (!inputText.trim()) return
    sendUserMessage(inputText)
    setInputText('')
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

  const hasTriageResult = Boolean(triageResult)

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} lang={lang} />
        ))}

        {isLoading && <TypingIndicator />}

        {/* Error */}
        {error && (
          <div className="mx-2 mb-3 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Post-triage actions */}
        {hasTriageResult && !isLoading && (
          <div className="mt-4 space-y-3 animate-slide-up">
            <div className="border-t border-dashed border-gray-200 pt-4">
              <p className="text-xs text-gray-400 text-center mb-3">
                {t('Acciones recomendadas', 'Recommended actions')}
              </p>

              <VisitCard lang={lang} triageResult={triageResult} messages={messages} />

              <button
                onClick={() => setShowClinics(s => !s)}
                className="btn-secondary w-full mt-3"
              >
                {showClinics
                  ? t('Ocultar clínicas', 'Hide clinics')
                  : t('Clínicas Cerca de Mí', 'Find Clinics Near Me')}
              </button>

              {showClinics && <ClinicFinder lang={lang} />}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-100 bg-white px-3 py-3">
        {/* Clear chat button */}
        {messages.length > 1 && (
          <div className="flex justify-end mb-2">
            <button
              onClick={clearChat}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={t('Nueva consulta', 'New consultation')}
            >
              <RotateCcw size={11} />
              {t('Nueva consulta', 'New consultation')}
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <VoiceInput lang={lang} onTranscript={handleVoiceTranscript} />

          <div className="flex-1 bg-gray-100 rounded-2xl flex items-end px-4 py-2.5 min-h-[48px]">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t(
                'Describe tus síntomas aquí...',
                'Describe your symptoms here...'
              )}
              rows={1}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none leading-relaxed max-h-32"
              style={{ fieldSizing: 'content' }}
              aria-label={t('Describe tus síntomas', 'Describe your symptoms')}
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="flex-shrink-0 w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-teal-200 disabled:opacity-40 disabled:shadow-none transition-all active:scale-95"
            aria-label={t('Enviar mensaje', 'Send message')}
          >
            <Send size={18} />
          </button>
        </div>

        <p className="text-[10px] text-gray-400 text-center mt-2">
          {t(
            'No es un diagnóstico médico · En caso de emergencia llame al 911',
            'Not a medical diagnosis · In emergency call 911'
          )}
        </p>
      </div>
    </div>
  )
}
