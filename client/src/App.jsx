import { useState } from 'react'
import WelcomeScreen from './components/WelcomeScreen.jsx'
import IntakeForm from './components/IntakeForm.jsx'
import SymptomsForm from './components/SymptomsForm.jsx'
import AnalysisScreen from './components/AnalysisScreen.jsx'
import ResultsScreen from './components/ResultsScreen.jsx'
import AIChatScreen from './components/AIChatScreen.jsx'
import LiveTranslator from './components/LiveTranslator.jsx'
import InsuranceGuide from './components/InsuranceGuide.jsx'
import { Home, MessageCircle, Languages, Heart } from 'lucide-react'

export const STEPS = {
  WELCOME: 'welcome',
  INTAKE: 'intake',
  SYMPTOMS: 'symptoms',
  ANALYSIS: 'analysis',
  RESULTS: 'results',
  CHAT: 'chat',
  TRANSLATOR: 'translator',
  INSURANCE: 'insurance',
}

export default function App() {
  const [lang, setLang] = useState('es')
  const [step, setStep] = useState(STEPS.WELCOME)
  const [patientData, setPatientData] = useState(null)
  const [symptomsData, setSymptomsData] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)

  const t = (es, en) => lang === 'es' ? es : en

  const isMainFlow = [STEPS.WELCOME, STEPS.INTAKE, STEPS.SYMPTOMS, STEPS.ANALYSIS, STEPS.RESULTS].includes(step)
  const showNav = step === STEPS.WELCOME || !isMainFlow

  const tabs = [
    { id: STEPS.WELCOME, icon: Home, label: t('Inicio', 'Home') },
    { id: STEPS.CHAT, icon: MessageCircle, label: t('Chat', 'Chat') },
    { id: STEPS.TRANSLATOR, icon: Languages, label: t('Traductor', 'Translator') },
    { id: STEPS.INSURANCE, icon: Heart, label: t('Opciones', 'Options') },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] max-w-lg mx-auto relative">
      <main className="flex-1 flex flex-col overflow-hidden" style={{ paddingBottom: showNav ? '80px' : 0 }}>
        {step === STEPS.WELCOME && (
          <WelcomeScreen lang={lang} setLang={setLang} onStart={() => setStep(STEPS.INTAKE)} onTab={setStep} />
        )}
        {step === STEPS.INTAKE && (
          <IntakeForm lang={lang} onBack={() => setStep(STEPS.WELCOME)} onNext={(data) => { setPatientData(data); setStep(STEPS.SYMPTOMS) }} />
        )}
        {step === STEPS.SYMPTOMS && (
          <SymptomsForm lang={lang} onBack={() => setStep(STEPS.INTAKE)} onNext={(data) => { setSymptomsData(data); setStep(STEPS.ANALYSIS) }} />
        )}
        {step === STEPS.ANALYSIS && (
          <AnalysisScreen lang={lang} patientData={patientData} symptomsData={symptomsData} onBack={() => setStep(STEPS.SYMPTOMS)} onNext={(data) => { setAnalysisData(data); setStep(STEPS.RESULTS) }} onChat={() => setStep(STEPS.CHAT)} />
        )}
        {step === STEPS.RESULTS && (
          <ResultsScreen lang={lang} patientData={patientData} symptomsData={symptomsData} analysisData={analysisData} onBack={() => setStep(STEPS.ANALYSIS)} onChat={() => setStep(STEPS.CHAT)} onRestart={() => setStep(STEPS.WELCOME)} />
        )}
        {step === STEPS.CHAT && (
          <AIChatScreen lang={lang} setLang={setLang} patientData={patientData} symptomsData={symptomsData} analysisData={analysisData} onBack={() => setStep(analysisData ? STEPS.RESULTS : STEPS.WELCOME)} />
        )}
        {step === STEPS.TRANSLATOR && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-white border-b border-gray-100">
              <h1 className="font-semibold text-gray-900">🌊 {t('Traductor en Vivo', 'Live Translator')}</h1>
            </div>
            <LiveTranslator lang={lang} />
          </div>
        )}
        {step === STEPS.INSURANCE && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-white border-b border-gray-100">
              <h1 className="font-semibold text-gray-900">💊 {t('Opciones de Seguro', 'Insurance Options')}</h1>
            </div>
            <InsuranceGuide lang={lang} />
          </div>
        )}
      </main>

      {showNav && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40">
          <div className="mx-3 mb-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/10 border border-gray-100">
            <div className="grid grid-cols-4 h-16 px-2">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setStep(tab.id)} className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all duration-200 ${step === tab.id ? 'text-violet-600' : 'text-gray-400'}`}>
                  <div className={`p-1.5 rounded-xl transition-all duration-200 ${step === tab.id ? 'bg-violet-100' : ''}`}>
                    <tab.icon size={18} strokeWidth={step === tab.id ? 2.5 : 1.8} />
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