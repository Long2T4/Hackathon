import { useState } from 'react'
import WelcomeScreen from './components/WelcomeScreen.jsx'
import SymptomsForm from './components/SymptomsForm.jsx'
import AnalysisScreen from './components/AnalysisScreen.jsx'
import ResultsScreen from './components/ResultsScreen.jsx'
import AIChatScreen from './components/AIChatScreen.jsx'
import LiveTranslator from './components/LiveTranslator.jsx'
import RemindersScreen from './components/RemindersScreen.jsx'
import HistoryScreen from './components/HistoryScreen.jsx'
import { saveSession } from './utils/sessionHistory.js'
import { Home, MessageCircle, Languages, Bell, Clock } from 'lucide-react'

export const STEPS = {
  WELCOME: 'welcome',
  SYMPTOMS: 'symptoms',
  ANALYSIS: 'analysis',
  RESULTS: 'results',
  CHAT: 'chat',
  TRANSLATOR: 'translator',
  REMINDERS: 'reminders',
  HISTORY: 'history',
}

export default function App() {
  const [lang, setLang] = useState('es')
  const [step, setStep] = useState(STEPS.WELCOME)
  const [symptomsData, setSymptomsData] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)
  const [showDisclaimer, setShowDisclaimer] = useState(
    () => !localStorage.getItem('misalud_disclaimer_seen')
  )

  const t = (es, en) => lang === 'es' ? es : en

  const goHome = () => {
    setSymptomsData(null)
    setAnalysisData(null)
    setStep(STEPS.WELCOME)
  }

  const handleAnalysisDone = (data) => {
    setAnalysisData(data)
  }

  const handleResultsReached = (data) => {
    setAnalysisData(data)
    // Save session when user reaches results
    saveSession({ symptomsData, analysisData: data })
    setStep(STEPS.RESULTS)
  }

  const handleRestore = (session) => {
    // Restore a past session into the flow
    setSymptomsData({ text: session.symptoms, severity: session.severity, duration: session.duration })
    setAnalysisData({
      likelyConcern: session.likelyConcern,
      urgency: session.urgency,
      summary: session.summary,
      questions: session.questions,
      redFlags: session.redFlags,
      clinicalGuidance: session.clinicalGuidance,
    })
    setStep(STEPS.RESULTS)
  }

  const isMainFlow = [STEPS.WELCOME, STEPS.SYMPTOMS, STEPS.ANALYSIS, STEPS.RESULTS].includes(step)
  const showNav = step === STEPS.WELCOME || !isMainFlow

  const tabs = [
    { id: STEPS.WELCOME, icon: Home, label: t('Inicio', 'Home') },
    { id: STEPS.CHAT, icon: MessageCircle, label: t('Chat', 'Chat') },
    { id: STEPS.TRANSLATOR, icon: Languages, label: t('Traductor', 'Translator') },
    { id: STEPS.REMINDERS, icon: Bell, label: t('Recordatorios', 'Reminders') },
    { id: STEPS.HISTORY, icon: Clock, label: t('Historial', 'History') },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] max-w-lg mx-auto relative">
      {/* First-launch disclaimer */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[99999] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl px-6 py-8">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">⚕️</span>
            </div>
            <h2 className="font-bold text-gray-900 text-xl text-center mb-3">
              {t('Aviso Importante', 'Important Notice')}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed text-center mb-2">
              {t(
                'MiSalud es una herramienta de orientacion de salud, NO un sustituto de atencion medica profesional.',
                'MiSalud is a health guidance tool, NOT a substitute for professional medical care.'
              )}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed text-center mb-6">
              {t(
                'La informacion proporcionada no constituye un diagnostico medico. En caso de emergencia, llame al 911.',
                'Information provided does not constitute a medical diagnosis. In case of emergency, call 911.'
              )}
            </p>
            <button
              onClick={() => {
                localStorage.setItem('misalud_disclaimer_seen', '1')
                setShowDisclaimer(false)
              }}
              className="w-full bg-violet-600 text-white font-bold py-4 rounded-2xl text-sm"
            >
              {t('Entendido, continuar', 'Understood, continue')}
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden" style={{ paddingBottom: showNav ? '80px' : 0 }}>
        {step === STEPS.WELCOME && (
          <WelcomeScreen lang={lang} setLang={setLang} onStart={() => setStep(STEPS.SYMPTOMS)} onTab={setStep} />
        )}
        {step === STEPS.SYMPTOMS && (
          <SymptomsForm
            lang={lang}
            onBack={goHome}
            onHome={goHome}
            onNext={(data) => { setSymptomsData(data); setStep(STEPS.ANALYSIS) }}
          />
        )}
        {step === STEPS.ANALYSIS && (
          <AnalysisScreen
            lang={lang}
            symptomsData={symptomsData}
            initialAnalysis={analysisData}
            onAnalysisDone={handleAnalysisDone}
            onBack={() => setStep(STEPS.SYMPTOMS)}
            onHome={goHome}
            onNext={handleResultsReached}
            onChat={() => setStep(STEPS.CHAT)}
          />
        )}
        {step === STEPS.RESULTS && (
          <ResultsScreen
            lang={lang}
            symptomsData={symptomsData}
            analysisData={analysisData}
            onBack={() => setStep(STEPS.ANALYSIS)}
            onHome={goHome}
            onChat={() => setStep(STEPS.CHAT)}
            onRestart={goHome}
          />
        )}
        {step === STEPS.CHAT && (
          <AIChatScreen
            lang={lang}
            setLang={setLang}
            symptomsData={symptomsData}
            analysisData={analysisData}
            onBack={() => setStep(analysisData ? STEPS.RESULTS : STEPS.WELCOME)}
            onHome={goHome}
          />
        )}
        {step === STEPS.TRANSLATOR && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-white border-b border-gray-100">
              <h1 className="font-semibold text-gray-900">{t('Traductor en Vivo', 'Live Translator')}</h1>
            </div>
            <LiveTranslator lang={lang} />
          </div>
        )}
        {step === STEPS.REMINDERS && <RemindersScreen lang={lang} />}
        {step === STEPS.HISTORY && <HistoryScreen lang={lang} onRestore={handleRestore} />}
      </main>

      {showNav && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40">
          <div className="mx-3 mb-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/10 border border-gray-100">
            <div className="grid grid-cols-5 h-16 px-1">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setStep(tab.id)} className={`flex flex-col items-center justify-center gap-0.5 text-[9px] font-semibold transition-all duration-200 ${step === tab.id ? 'text-violet-600' : 'text-gray-400'}`}>
                  <div className={`p-1.5 rounded-xl transition-all duration-200 ${step === tab.id ? 'bg-violet-100' : ''}`}>
                    <tab.icon size={17} strokeWidth={step === tab.id ? 2.5 : 1.8} />
                  </div>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}
    </div>
  )
}
