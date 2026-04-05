import { useState, useCallback } from 'react'
import { sendMessage } from '../utils/api.js'

function buildWelcome(lang, analysisData, symptomsData) {
  if (analysisData && symptomsData?.text) {
    const concern = analysisData.likelyConcern || ''
    const urgency = analysisData.urgency || 'routine'
    if (lang === 'es') {
      return `Hola! Ya revise tu analisis.\n\n**Sintomas reportados:** ${symptomsData.text.slice(0, 120)}${symptomsData.text.length > 120 ? '...' : ''}\n\n**Evaluacion inicial:** ${concern} (Nivel: ${urgency})\n\nPuedes preguntarme cualquier duda sobre tu condicion, medicamentos, que llevar al doctor, o cualquier otra cosa. Estoy aqui para ayudarte.\n\n*Recuerda: No soy un medico. Mi objetivo es orientarte, no diagnosticarte.*`
    }
    return `Hello! I've already reviewed your analysis.\n\n**Reported symptoms:** ${symptomsData.text.slice(0, 120)}${symptomsData.text.length > 120 ? '...' : ''}\n\n**Initial assessment:** ${concern} (Level: ${urgency})\n\nYou can ask me anything about your condition, medications, what to bring to the doctor, or anything else. I'm here to help.\n\n*Remember: I'm not a doctor. My goal is to guide you, not diagnose you.*`
  }
  if (lang === 'es') {
    return 'Hola! Soy tu asistente de salud MiSalud.\n\nPuedes describirme tus sintomas en espanol o ingles, y te ayudare a entender que podria estar pasando y que hacer a continuacion.\n\nTambien puedes adjuntar una foto de una receta o documento medico y te lo explico en espanol simple.\n\n*Recuerda: No soy un medico. Mi objetivo es orientarte, no diagnosticarte.*'
  }
  return "Hello! I'm your MiSalud health assistant.\n\nYou can describe your symptoms in Spanish or English, and I'll help you understand what might be happening and what to do next.\n\nYou can also attach a photo of a prescription or medical document and I'll explain it in simple terms.\n\n*Remember: I'm not a doctor. My goal is to guide you, not diagnose you.*"
}

export function useChat(lang, analysisData = null, symptomsData = null) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: buildWelcome(lang, analysisData, symptomsData),
      urgency: null,
      timestamp: new Date(),
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [triageResult, setTriageResult] = useState(null)

  // Build history including hidden context message if we have analysis
  const buildHistory = useCallback((currentMessages) => {
    const history = currentMessages
      .filter(m => m.id !== 'welcome')
      .slice(-19)
      .map(m => ({ role: m.role, content: m.content }))

    // Prepend a hidden context message so the AI knows the situation
    if (analysisData && symptomsData?.text) {
      const ctx = `[Patient context — do not repeat this to the user]: Symptoms: ${symptomsData.text}. Assessment: ${analysisData.likelyConcern}. Urgency: ${analysisData.urgency}. Clinical guidance: ${analysisData.clinicalGuidance || ''}. Red flags: ${(analysisData.redFlags || []).join(', ')}.`
      return [{ role: 'user', content: ctx }, { role: 'assistant', content: 'Understood, I have the patient context.' }, ...history]
    }
    return history
  }, [analysisData, symptomsData])

  const sendUserMessage = useCallback(async (text, fileData = null) => {
    if (!text.trim() && !fileData) return
    if (isLoading) return

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim() || (fileData ? `[file: ${fileData.fileName}]` : ''),
      timestamp: new Date(),
      hasFile: Boolean(fileData),
      fileName: fileData?.fileName,
    }

    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setError(null)

    try {
      const history = buildHistory([...messages, userMsg])
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

      if (response.urgency || (response.questions && response.questions.length > 0)) {
        setTriageResult({
          urgency: response.urgency || 'selfcare',
          content: response.content,
          questions: response.questions || [],
          userSymptoms: text.trim(),
        })
      }
    } catch {
      setError(
        lang === 'es'
          ? 'Error al conectar con el servidor. Por favor intente de nuevo.'
          : 'Error connecting to the server. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, lang, buildHistory])

  const clearChat = useCallback(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: buildWelcome(lang, analysisData, symptomsData),
      urgency: null,
      timestamp: new Date(),
    }])
    setTriageResult(null)
    setError(null)
  }, [lang, analysisData, symptomsData])

  return { messages, isLoading, error, triageResult, sendUserMessage, clearChat }
}
