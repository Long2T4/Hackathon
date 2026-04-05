import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, MessageCircle, Loader2 } from 'lucide-react'

const URGENCY_CONFIG = {
  emergency: { light: 'bg-red-50 border-red-200', text: 'text-red-700', label: { es: 'EMERGENCIA', en: 'EMERGENCY' }, icon: '🚨' },
  urgent: { light: 'bg-orange-50 border-orange-200', text: 'text-orange-700', label: { es: 'URGENTE', en: 'URGENT' }, icon: '⚡' },
  routine: { light: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: { es: 'RUTINA', en: 'ROUTINE' }, icon: '📅' },
  selfcare: { light: 'bg-green-50 border-green-200', text: 'text-green-700', label: { es: 'AUTOCUIDADO', en: 'SELF-CARE' }, icon: '🌿' },
}

export default function AnalysisScreen({ lang, patientData, symptomsData, onBack, onNext, onChat }) {
  const t = (es, en) => lang === 'es' ? es : en
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => { runAnalysis() }, [])

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const message = `Patient: ${patientData?.firstName} ${patientData?.lastName}, Age: ${patientData?.age}, ZIP: ${patientData?.zip}, Insurance: ${patientData?.insurance}. Symptoms: ${symptomsData?.text}. Severity: ${symptomsData?.severity}. Duration: ${symptomsData?.duration}.`
      const body = { message, history: [], lang }
      if (symptomsData?.file) body.file = symptomsData.file
      const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('Analysis failed')
      setAnalysis(await res.json())
    } catch (e) {
      setError(t('Error al analizar. Intente de nuevo.', 'Analysis error. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const urgency = analysis ? (URGENCY_CONFIG[analysis.urgency] || URGENCY_CONFIG.routine) : null

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500 font-medium">{t('Paso 3 de 4', 'Step 3 of 4')}: {t('Análisis', 'Analysis')}</p>
          <p className="text-xs font-bold text-violet-600">75%</p>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full" style={{ width: '75%' }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-1">{t('PASO 3 DE 4', 'STEP 3 OF 4')}</p>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">{t('Análisis Diagnóstico', 'Diagnostic Analysis')}</h2>
        <p className="text-sm text-gray-400 mb-6">{t('Nuestra IA procesó tu información y la comparó con literatura médica', 'Our AI processed your info and cross-referenced with medical literature')}</p>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 bg-violet-100 rounded-3xl flex items-center justify-center">
              <Loader2 size={28} className="text-violet-600 animate-spin" />
            </div>
            <p className="text-gray-500 font-medium text-sm">{t('Analizando síntomas...', 'Analyzing symptoms...')}</p>
            <p className="text-gray-400 text-xs">{t('Esto puede tardar unos segundos', 'This may take a few seconds')}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 rounded-2xl p-4 border border-red-200 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
            <button onClick={runAnalysis} className="mt-2 text-xs font-bold text-red-600 underline">{t('Intentar de nuevo', 'Try again')}</button>
          </div>
        )}

        {analysis && !loading && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('HALLAZGOS INICIALES', 'INITIAL FINDINGS')}</p>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">{analysis.likelyConcern}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{analysis.summary}</p>

              {analysis.conditions?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">{t('Otras posibles condiciones:', 'Other potential conditions:')}</p>
                  <div className="space-y-1">
                    {analysis.conditions.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        <span className="text-sm text-gray-600">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-2">
                {urgency && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${urgency.light}`}>
                    <span className="text-sm">{urgency.icon}</span>
                    <span className={`text-xs font-bold ${urgency.text}`}>{t('Nivel:', 'Level:')} {lang === 'es' ? urgency.label.es : urgency.label.en}</span>
                  </div>
                )}
                <button onClick={onChat} className="flex items-center gap-1.5 bg-violet-50 text-violet-600 text-xs font-bold px-3 py-1.5 rounded-full border border-violet-100">
                  <MessageCircle size={12} /> {t('Preguntar IA', 'Ask AI')}
                </button>
              </div>

              {analysis.urgency === 'emergency' && (
                <div className="flex gap-2 mt-3">
                  <a href="tel:911" className="flex-1 bg-red-500 text-white text-xs font-bold py-2.5 rounded-xl text-center">📞 {t('Llamar al 911', 'Call 911')}</a>
                  <a href="https://www.google.com/maps/search/emergency+room+near+me" target="_blank" rel="noopener noreferrer" className="flex-1 bg-white text-red-600 text-xs font-bold py-2.5 rounded-xl text-center border border-red-200">🏥 {t('Urgencias cercanas', 'Nearest ER')}</a>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🏥</span>
                <p className="text-sm font-bold text-gray-900">{t('Recomendación Clínica', 'Clinical Guidance')}</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{analysis.clinicalGuidance}</p>
            </div>

            {analysis.explanation && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-sm font-bold text-gray-900 mb-2">{t('¿Qué está pasando?', 'What\'s Going On?')}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{analysis.explanation}</p>
              </div>
            )}

            {analysis.questions?.length > 0 && (
              <div className="bg-violet-50 rounded-2xl border border-violet-100 p-4">
                <p className="text-xs font-bold text-violet-700 mb-2">❓ {t('Preguntas para tu doctor:', 'Questions for your doctor:')}</p>
                <div className="space-y-1.5">
                  {analysis.questions.map((q, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-violet-400 text-xs font-bold mt-0.5">{i + 1}.</span>
                      <p className="text-xs text-violet-800">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => onNext(analysis)} className="w-full bg-gray-800 rounded-2xl overflow-hidden relative h-24 flex items-end">
              <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }} />
              <div className="relative p-4 w-full flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-sm">{t('Clínicas Cercanas', 'Nearby Facilities')}</p>
                  <p className="text-white/60 text-xs">{t('Encontraremos las mejores opciones para ti', 'We\'ll find the best options for you')}</p>
                </div>
                <button className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full">{t('Ver mapa', 'View Map')}</button>
              </div>
            </button>
          </div>
        )}
      </div>

      {!loading && (
        <div className="px-4 py-4 bg-white border-t border-gray-100 flex gap-3">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm">
            <ArrowLeft size={16} /> {t('Atrás', 'Back')}
          </button>
          <button onClick={() => analysis && onNext(analysis)} disabled={!analysis} className="flex-1 bg-violet-600 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg shadow-violet-200">
            {t('Ver Clínicas', 'See Clinics')} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}