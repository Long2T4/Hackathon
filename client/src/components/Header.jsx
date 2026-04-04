import { Shield } from 'lucide-react'

export default function Header({ lang, setLang }) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md shadow-teal-200">
            <Shield size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display font-semibold text-lg leading-none text-gray-900">
              MiSalud
            </h1>
            <p className="text-[10px] text-teal-600 font-medium leading-none mt-0.5">
              {lang === 'es' ? 'Tu guía de salud' : 'Your health guide'}
            </p>
          </div>
        </div>

        {/* Language toggle */}
        <button
          onClick={() => setLang(l => l === 'es' ? 'en' : 'es')}
          className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors min-h-[36px]"
          aria-label={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        >
          <span className={lang === 'es' ? 'text-teal-600' : 'text-gray-400'}>ES</span>
          <span className="text-gray-300 mx-0.5">|</span>
          <span className={lang === 'en' ? 'text-teal-600' : 'text-gray-400'}>EN</span>
        </button>
      </div>
    </header>
  )
}
