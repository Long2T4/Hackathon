import { useState } from 'react'
import ClinicFinder from './ClinicFinder.jsx'
import InsuranceGuide from './InsuranceGuide.jsx'
import { MapPin, Heart } from 'lucide-react'

export default function ClinicsAndOptions({ lang }) {
  const [tab, setTab] = useState('clinics')
  const t = (es, en) => lang === 'es' ? es : en

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sub-tabs */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-gray-100 rounded-2xl p-1 flex gap-1">
          <button
            onClick={() => setTab('clinics')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'clinics' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-400'
            }`}
          >
            <MapPin size={15} />
            {t('Clínicas', 'Clinics')}
          </button>
          <button
            onClick={() => setTab('insurance')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'insurance' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-400'
            }`}
          >
            <Heart size={15} />
            {t('Opciones', 'Options')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {tab === 'clinics' && <ClinicFinder lang={lang} />}
        {tab === 'insurance' && <InsuranceGuide lang={lang} />}
      </div>
    </div>
  )
}