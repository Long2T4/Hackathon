import { ArrowLeft } from 'lucide-react'

export default function Header({ lang, setLang, onBack }) {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center"
              aria-label="Volver"
            >
              <ArrowLeft size={16} className="text-gray-600" />
            </button>
          )}
          <h1 className="font-display font-semibold text-lg text-gray-900">MiSalud</h1>
        </div>

        <button
          onClick={() => setLang(l => l === 'es' ? 'en' : 'es')}
          className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1.5 text-sm font-semibold text-gray-700 min-h-[36px]"
          aria-label={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        >
          <span className={lang === 'es' ? 'text-violet-600' : 'text-gray-400'}>ES</span>
          <span className="text-gray-300 mx-0.5">|</span>
          <span className={lang === 'en' ? 'text-violet-600' : 'text-gray-400'}>EN</span>
        </button>
      </div>
    </header>
  )
}