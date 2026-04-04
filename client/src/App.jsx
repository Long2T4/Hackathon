import { useState } from 'react'
import Header from './components/Header.jsx'
import Chat from './components/Chat.jsx'
import InsuranceGuide from './components/InsuranceGuide.jsx'
import { MessageCircle, Heart } from 'lucide-react'

export default function App() {
  const [lang, setLang] = useState('es')
  const [activeTab, setActiveTab] = useState('chat')

  const t = (es, en) => lang === 'es' ? es : en

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 max-w-lg mx-auto relative">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-1 flex flex-col pb-20 overflow-hidden">
        {activeTab === 'chat' && <Chat lang={lang} />}
        {activeTab === 'insurance' && <InsuranceGuide lang={lang} />}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-100 shadow-2xl z-40">
        <div className="grid grid-cols-2 h-16">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors ${
              activeTab === 'chat' ? 'text-teal-600' : 'text-gray-400'
            }`}
            aria-label={t('Síntomas / Chat', 'Symptoms / Chat')}
          >
            <MessageCircle size={22} strokeWidth={activeTab === 'chat' ? 2.5 : 1.8} />
            <span>{t('Síntomas', 'Symptoms')}</span>
            {activeTab === 'chat' && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-teal-600 rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('insurance')}
            className={`flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors relative ${
              activeTab === 'insurance' ? 'text-teal-600' : 'text-gray-400'
            }`}
            aria-label={t('Opciones de Seguro', 'Insurance Options')}
          >
            <Heart size={22} strokeWidth={activeTab === 'insurance' ? 2.5 : 1.8} />
            <span>{t('Opciones', 'Options')}</span>
            {activeTab === 'insurance' && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-teal-600 rounded-t-full" />
            )}
          </button>
        </div>
      </nav>
    </div>
  )
}
