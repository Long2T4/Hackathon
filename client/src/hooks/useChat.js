import { useState, useCallback } from 'react'
import { sendMessage } from '../utils/api.js'

export function useChat(lang) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: lang === 'es'
        ? '¡Hola! Soy tu asistente de salud MiSalud. 🌿\n\nPuedes describirme tus síntomas en español o inglés, y te ayudaré a entender qué podría estar pasando y qué hacer a continuación.\n\nTambién puedes adjuntar una foto de una receta o documento médico y te lo explico en español simple.\n\n*Recuerda: No soy un médico. Mi objetivo es orientarte, no diagnosticarte.*'
        : 'Hello! I\'m your MiSalud health assistant. 🌿\n\nYou can describe your symptoms in Spanish or English, and I\'ll help you understand what might be happening and what to do next.\n\nYou can also attach a photo of a prescription or medical document and I\'ll explain it in simple terms.\n\n*Remember: I\'m not a doctor. My goal is to guide you, not diagnose you.*',
      urgency: null,
      timestamp: new Date(),
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [triageResult, setTriageResult] = useState(null)

  const sendUserMessage = useCallback(async (text, fileData = null) => {
    if (!text.trim() && !fileData) return
    if (isLoading) return

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim() || (fileData ? `📎 ${fileData.fileName}` : ''),
      timestamp: new Date(),
      hasFile: Boolean(fileData),
      fileName: fileData?.fileName,
    }

    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setError(null)

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .slice(-19)
        .map(m => ({ role: m.role, content: m.content }))

      const response = await sendMessage(text.trim(), history, lang, fileData)

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        urgency: response.urgency,
        questions: response.questions,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMsg])

      // Show triage actions for ANY health-related response
      if (response.urgency || (response.questions && response.questions.length > 0)) {
        setTriageResult({
          urgency: response.urgency || 'selfcare',
          content: response.content,
          questions: response.questions || [],
          userSymptoms: text.trim(),
        })
      }
    } catch (err) {
      setError(
        lang === 'es'
          ? 'Error al conectar con el servidor. Por favor intente de nuevo.'
          : 'Error connecting to the server. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, lang])

  const clearChat = useCallback(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: lang === 'es'
        ? '¡Hola! Soy tu asistente de salud MiSalud. 🌿\n\nPuedes describirme tus síntomas en español o inglés, y te ayudaré a entender qué podría estar pasando y qué hacer a continuación.\n\nTambién puedes adjuntar una foto de una receta o documento médico y te lo explico en español simple.\n\n*Recuerda: No soy un médico. Mi objetivo es orientarte, no diagnosticarte.*'
        : 'Hello! I\'m your MiSalud health assistant. 🌿\n\nYou can describe your symptoms in Spanish or English, and I\'ll help you understand what might be happening and what to do next.\n\nYou can also attach a photo of a prescription or medical document and I\'ll explain it in simple terms.\n\n*Remember: I\'m not a doctor. My goal is to guide you, not diagnose you.*',
      urgency: null,
      timestamp: new Date(),
    }])
    setTriageResult(null)
    setError(null)
  }, [lang])

  return { messages, isLoading, error, triageResult, sendUserMessage, clearChat }
}