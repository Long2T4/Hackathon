import { useState } from 'react'
import Header from './components/Header.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import Chat from './components/Chat.jsx'
import InsuranceGuide from './components/InsuranceGuide.jsx'
import ClinicFinder from './components/ClinicFinder.jsx'
import { Home, MessageCircle, Heart, MapPin } from 'lucide-react'

export default function App() {
  const [lang, setLang] = useState('es')
  const [activeTab, setActiveTab] = useState('home')

  const t = (es, en) => lang === 'es' ? es : en

  const tabs = [
    { id: 'home', icon: Home, label: t('Inicio', 'Home') },
    { id: 'chat', icon: MessageCircle, label: t('Chat', 'Chat') },
    { id: 'clinics', icon: MapPin, label: t('Clínicas', 'Clinics') },
    { id: 'insurance', icon: Heart, label: t('Opciones', 'Options') },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5FA] max-w-lg mx-auto relative">
      {activeTab !== 'home' && <Header lang={lang} setLang={setLang} onBack={() => setActiveTab('home')} />}

      <main className="flex-1 flex flex-col pb-24 overflow-hidden">
        {activeTab === 'home' && <HomeScreen lang={lang} setLang={setLang} onNavigate={setActiveTab} />}
        {activeTab === 'chat' && <Chat lang={lang} />}
        {activeTab === 'clinics' && (
          <div className="flex-1 overflow-y-auto px-4 py-5">
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-4">
              {t('Clínicas Cercanas', 'Nearby Clinics')}
            </h2>
            <ClinicFinder lang={lang} />
          </div>
        )}
        {activeTab === 'insurance' && <InsuranceGuide lang={lang} />}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40">
        <div className="mx-3 mb-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/10 border border-gray-100">
          <div className="grid grid-cols-4 h-16 px-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all duration-200 ${
                  activeTab === tab.id ? 'text-violet-600' : 'text-gray-400'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id ? 'bg-violet-100' : ''
                }`}>
                  <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 1.8} />
                </div>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}