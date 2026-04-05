import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, MessageCircle, Loader2, RotateCcw, AlertTriangle } from 'lucide-react'

const URGENCY_CONFIG = {
  emergency: { light: 'bg-red-50 border-red-200', text: 'text-red-700', label: { es: 'EMERGENCIA', en: 'EMERGENCY' }, icon: '🚨' },
  urgent: { light: 'bg-orange-50 border-orange-200', text: 'text-orange-700', label: { es: 'URGENTE', en: 'URGENT' }, icon: '⚡' },
  routine: { light: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: { es: 'RUTINA', en: 'ROUTINE' }, icon: '📅' },
  selfcare: { light: 'bg-green-50 border-green-200', text: 'text-green-700', label: { es: 'AUTOCUIDADO', en: 'SELF-CARE' }, icon: '🌿' },
}

export default function AnalysisScreen({ lang, symptomsData, initialAnalysis, onAnalysisDone, onBack, onHome, onNext, onChat }) {
  const t = (es, en) => lang === 'es' ? es : en
  const [loading, setLoading] = useState(!initialAnalysis)
  const [analysis, setAnalysis] = useState(initialAnalysis || null)
  const [error, setError] = useState(null)
  const [dismissedEmergency, setDismissedEmergency] = useState(false)

  useEffect(() => {
    if (!initialAnalysis) runAnalysis()
  }, [])

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const message = `Symptoms: ${symptomsData?.text}. Severity: ${symptomsData?.severity}. Duration: ${symptomsData?.duration}.`
      const body = { message, history: [], lang }
      if (symptomsData?.file) body.file = symptomsData.file
      const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      setAnalysis(data)
      onAnalysisDone?.(data)
    } catch {
      setError(t('Error al analizar. Intente de nuevo.', 'Analysis error. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const urgency = analysis ? (URGENCY_CONFIG[analysis.urgency] || URGENCY_CONFIG.routine) : null
  const isEmergency = analysis?.urgency === 'emergency' && !dismissedEmergency

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Emergency full-screen overlay */}
      {isEmergency && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center px-6 text-center" style={{ background: 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)' }}>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <AlertTriangle size={40} className="text-white" />
          </div>
          <h2 className="text-white font-bold text-3xl mb-3">{t('EMERGENCIA', 'EMERGENCY')}</h2>
          <p className="text-white/90 text-base leading-relaxed mb-2 max-w-xs">
            {t('Tus sintomas sugieren una condicion que requiere atencion medica inmediata.', 'Your symptoms suggest a condition requiring immediate medical attention.')}
          </p>
          <p className="text-white/70 text-sm mb-8">{analysis.likelyConcern}</p>
          <a
            href="tel:911"
            className="w-full max-w-xs bg-white text-red-700 font-bold text-xl py-5 rounded-3xl flex items-center justify-center gap-3 shadow-2xl mb-4"
          >
            📞 {t('Llamar al 911 AHORA', 'Call 911 NOW')}
          </a>
          <a
            href="https://www.google.com/maps/search/emergency+room+near+me"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-xs bg-red-800/60 text-white font-semibold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 mb-6"
          >
            🏥 {t('Urgencias mas cercanas', 'Find nearest ER')}
          </a>
          <button
            onClick={() => setDismissedEmergency(true)}
            className="text-white/50 text-xs underline"
          >
            {t('Ver el analisis completo', 'View full analysis anyway')}
          </button>
        </div>
      )}
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
              {t('Paso 2 de 3', 'Step 2 of 3')}: {t('Analisis', 'Analysis')}
            </p>
          </div>
          <p className="text-xs font-bold text-violet-600">66%</p>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full" style={{ width: '66%' }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">{t('Analisis Diagnostico', 'Diagnostic Analysis')}</h2>
        <p className="text-sm text-gray-400 mb-6">{t('Nuestra IA proceso tu informacion y la comparo con literatura medica', 'Our AI processed your info and cross-referenced with medical literature')}</p>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 bg-violet-100 rounded-3xl flex items-center justify-center">
              <Loader2 size={28} className="text-violet-600 animate-spin" />
            </div>
            <p className="text-gray-500 font-medium text-sm">{t('Analizando sintomas...', 'Analyzing symptoms...')}</p>
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
            {/* Cached result banner */}
            {initialAnalysis && (
              <div className="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-2xl px-4 py-3">
                <p className="text-xs text-violet-600 font-medium">
                  {t('Resultado guardado de tu ultima consulta', 'Saved result from your last session')}
                </p>
                <button
                  onClick={runAnalysis}
                  className="flex items-center gap-1 text-xs font-bold text-violet-600"
                >
                  <RotateCcw size={11} /> {t('Re-analizar', 'Re-analyze')}
                </button>
              </div>
            )}

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
                <button
                  onClick={onChat}
                  className="flex items-center gap-1.5 bg-violet-50 text-violet-600 text-xs font-bold px-3 py-1.5 rounded-full border border-violet-100"
                >
                  <MessageCircle size={12} /> {t('Preguntar IA', 'Ask AI')}
                </button>
              </div>

              {analysis.urgency === 'emergency' && (
                <div className="flex gap-2 mt-3">
                  <a href="tel:911" className="flex-1 bg-red-500 text-white text-xs font-bold py-2.5 rounded-xl text-center">{t('Llamar al 911', 'Call 911')}</a>
                  <a href="https://www.google.com/maps/search/emergency+room+near+me" target="_blank" rel="noopener noreferrer" className="flex-1 bg-white text-red-600 text-xs font-bold py-2.5 rounded-xl text-center border border-red-200">{t('Urgencias cercanas', 'Nearest ER')}</a>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🏥</span>
                <p className="text-sm font-bold text-gray-900">{t('Recomendacion Clinica', 'Clinical Guidance')}</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{analysis.clinicalGuidance}</p>
            </div>

            {analysis.explanation && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-sm font-bold text-gray-900 mb-2">{t('Que esta pasando?', 'What\'s Going On?')}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{analysis.explanation}</p>
              </div>
            )}

            {analysis.redFlags?.length > 0 && (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={15} className="text-red-600 flex-shrink-0" />
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                    {t('Senales de Alarma — Llame al 911 si tiene:', 'Red Flags — Call 911 if you have:')}
                  </p>
                </div>
                <div className="space-y-1.5">
                  {analysis.redFlags.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-red-800 leading-relaxed">{f}</p>
                    </div>
                  ))}
                </div>
                <a href="tel:911" className="mt-3 w-full bg-red-600 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                  📞 {t('Llamar al 911', 'Call 911')}
                </a>
              </div>
            )}

            {analysis.questions?.length > 0 && (
              <div className="bg-violet-50 rounded-2xl border border-violet-100 p-4">
                <p className="text-xs font-bold text-violet-700 mb-2">{t('Preguntas para tu doctor:', 'Questions for your doctor:')}</p>
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
          </div>
        )}
      </div>

      {!loading && (
        <div className="px-4 py-4 bg-white border-t border-gray-100 flex gap-3">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm">
            <ArrowLeft size={16} /> {t('Atras', 'Back')}
          </button>
          <button
            onClick={() => analysis && onNext(analysis)}
            disabled={!analysis}
            className="flex-1 bg-violet-600 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg shadow-violet-200"
          >
            {t('Ver Clinicas', 'See Clinics')} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
