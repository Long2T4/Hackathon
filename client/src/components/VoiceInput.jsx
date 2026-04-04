import { Mic, MicOff } from 'lucide-react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js'
import { useEffect } from 'react'

export default function VoiceInput({ lang, onTranscript }) {
  const { isListening, transcript, speechError, supported, startListening, stopListening } =
    useSpeechRecognition(lang)

  useEffect(() => {
    if (!isListening && transcript) {
      onTranscript(transcript)
    }
  }, [isListening, transcript, onTranscript])

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={isListening ? stopListening : startListening}
      className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
        isListening
          ? 'bg-red-500 recording-indicator text-white'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
      aria-label={
        isListening
          ? (lang === 'es' ? 'Detener grabación' : 'Stop recording')
          : (lang === 'es' ? 'Hablar' : 'Speak')
      }
      title={isListening
        ? (lang === 'es' ? 'Tocca para detener' : 'Tap to stop')
        : (lang === 'es' ? 'Presiona para hablar' : 'Press to speak')}
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  )
}
