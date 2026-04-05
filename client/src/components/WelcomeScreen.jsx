import { ArrowRight, Languages, Heart, MessageCircle } from 'lucide-react'

export default function WelcomeScreen({ lang, setLang, onStart, onTab }) {
  const t = (es, en) => lang === 'es' ? es : en

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%)', minHeight: 340 }}>
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white" style={{ width: 100 + i * 80, height: 100 + i * 80, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          ))}
        </div>
        <div className="relative px-6 pt-12 pb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <span className="text-white font-bold text-lg">MiSalud</span>
            </div>
            <button onClick={() => setLang(l => l === 'es' ? 'en' : 'es')} className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
          </div>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5), rgba(255,255,255,0.05))', boxShadow: 'inset -4px -4px 20px rgba(0,0,0,0.2), 0 0 60px rgba(168,85,247,0.5)' }}>
                <div className="flex gap-3 justify-center pt-11">
                  <div className="w-3.5 h-3.5 bg-white rounded-full" />
                  <div className="w-3.5 h-3.5 bg-white rounded-full" />
                </div>
                <div className="flex justify-center mt-3">
                  <div className="w-6 h-1.5 bg-white/60 rounded-full" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-white font-display text-3xl font-bold leading-tight mb-2">
              {t('Tu Guía de Salud', 'Your Health Guide')}
            </h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs mx-auto">
              {t('Análisis de síntomas con IA, clínicas cercanas, traductor en tiempo real y más.', 'AI symptom analysis, nearby clinics, real-time translator and more.')}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 mb-6">
        <button onClick={onStart} className="w-full bg-white rounded-2xl shadow-xl shadow-violet-100 p-5 flex items-center justify-between border border-violet-50">
          <div className="text-left">
            <p className="font-bold text-gray-900 text-lg">{t('Comenzar Análisis', 'Start Analysis')}</p>
            <p className="text-gray-400 text-sm mt-0.5">{t('4 pasos · ~3 minutos', '4 steps · ~3 minutes')}</p>
          </div>
          <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-300">
            <ArrowRight size={20} className="text-white" />
          </div>
        </button>
      </div>

      <div className="px-4 mb-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('Acceso Rápido', 'Quick Access')}</p>
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => onTab('chat')} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
              <MessageCircle size={18} className="text-violet-600" />
            </div>
            <span className="text-xs font-semibold text-gray-700 text-center">{t('Chat IA', 'AI Chat')}</span>
          </button>
          <button onClick={() => onTab('translator')} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Languages size={18} className="text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-gray-700 text-center">{t('Traductor', 'Translator')}</span>
          </button>
          <button onClick={() => onTab('insurance')} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Heart size={18} className="text-green-600" />
            </div>
            <span className="text-xs font-semibold text-gray-700 text-center">{t('Seguros', 'Insurance')}</span>
          </button>
        </div>
      </div>

      <div className="px-4 mb-8">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('Lo que puedes hacer', 'What you can do')}</p>
        <div className="space-y-2">
          {[
            { emoji: '🩺', es: 'Analiza tus síntomas con IA médica', en: 'Analyze symptoms with medical AI' },
            { emoji: '🏥', es: 'Encuentra clínicas gratuitas cerca de ti', en: 'Find free clinics near you' },
            { emoji: '🌊', es: 'Traductor en vivo con tu doctor', en: 'Live translator with your doctor' },
            { emoji: '📄', es: 'Genera una tarjeta de visita bilingüe', en: 'Generate a bilingual visit card' },
            { emoji: '💊', es: 'Entiende tus opciones de seguro', en: 'Understand your insurance options' },
            { emoji: '🗓️', es: 'Recordatorios de citas médicas', en: 'Medical appointment reminders' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
              <span className="text-lg">{f.emoji}</span>
              <span className="text-sm text-gray-700 font-medium">{lang === 'es' ? f.es : f.en}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center pb-6 px-8">
        {t('MiSalud no reemplaza la atención médica. En emergencias llame al 911.', 'MiSalud does not replace medical care. In emergencies call 911.')}
      </p>
    </div>
  )
}