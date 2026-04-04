import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { generateVisitCardData } from '../utils/api.js'
import { generateVisitCardPDF } from '../utils/pdfGenerator.js'

export default function VisitCard({ lang, triageResult, messages }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const t = (es, en) => lang === 'es' ? es : en

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const chatSummary = {
        symptoms: triageResult?.userSymptoms || '',
        assessment: triageResult?.content || '',
        urgency: triageResult?.urgency || 'routine',
        questions: triageResult?.questions || [],
        messages: messages.slice(-10).map(m => ({
          role: m.role,
          content: m.content,
        })),
      }

      const data = await generateVisitCardData(chatSummary, lang)
      generateVisitCardPDF({ ...data, urgency: triageResult?.urgency })
    } catch (err) {
      // Fallback: generate PDF from local data without backend
      try {
        generateVisitCardPDF({
          symptomsES: triageResult?.userSymptoms || '—',
          symptomsEN: triageResult?.userSymptoms || '—',
          assessmentES: triageResult?.content || '—',
          assessmentEN: triageResult?.content || '—',
          urgency: triageResult?.urgency || 'routine',
          questionsES: triageResult?.questions || [],
          questionsEN: triageResult?.questions || [],
        })
      } catch (pdfErr) {
        setError(t(
          'No se pudo generar el PDF. Intente de nuevo.',
          'Could not generate PDF. Please try again.'
        ))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="btn-orange w-full"
        aria-label={t('Generar tarjeta de visita en PDF', 'Generate visit card PDF')}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
        {t('Generar Tarjeta de Visita', 'Generate Visit Card')}
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
      )}

      <p className="mt-2 text-[10px] text-gray-400 text-center leading-tight">
        {t(
          'Descarga un PDF bilingüe para llevar a tu cita médica',
          'Download a bilingual PDF to bring to your appointment'
        )}
      </p>
    </div>
  )
}
