import { useState } from 'react'
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react'

const INSURANCE_OPTIONS = ['Sin seguro / Uninsured', 'Medicaid', 'Medicare', 'ACA Marketplace', 'Employer Insurance', 'Self-pay']

function StepBar({ lang }) {
  const t = (es, en) => lang === 'es' ? es : en
  return (
    <div className="px-4 py-3 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 font-medium">{t('Paso 1 de 4', 'Step 1 of 4')}: {t('Información Personal', 'Personal Information')}</p>
        <p className="text-xs font-bold text-violet-600">25%</p>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-violet-500 rounded-full" style={{ width: '25%' }} />
      </div>
    </div>
  )
}

export default function IntakeForm({ lang, onBack, onNext }) {
  const t = (es, en) => lang === 'es' ? es : en
  const [form, setForm] = useState({ firstName: '', lastName: '', age: '', zip: '', insurance: 'Sin seguro / Uninsured', planName: '' })
  const [locating, setLocating] = useState(false)
  const [locationFound, setLocationFound] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const useLocation = () => {
    setLocating(true)
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
        const d = await r.json()
        set('zip', d.address?.postcode || '')
        setLocationFound(true)
      } catch { setLocationFound(false) }
      setLocating(false)
    }, () => setLocating(false))
  }

  const valid = form.firstName && form.lastName && form.age && form.zip

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <StepBar lang={lang} />
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">{t('Información del Paciente', 'Patient Information')}</h2>
        <p className="text-sm text-gray-400 mb-6">{t('Tu información nos ayuda a personalizar los resultados', 'Your info helps us personalize results')}</p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{t('Nombre', 'First Name')}</label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)} className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none border border-gray-100 focus:border-violet-300" placeholder="Maria" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{t('Apellido', 'Last Name')}</label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)} className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none border border-gray-100 focus:border-violet-300" placeholder="García" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{t('Edad', 'Age')}</label>
              <input type="number" value={form.age} onChange={e => set('age', e.target.value)} className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none border border-gray-100 focus:border-violet-300" placeholder="35" min="1" max="120" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{t('Código ZIP', 'ZIP Code')}</label>
              <div className="relative">
                <input value={form.zip} onChange={e => set('zip', e.target.value)} className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none border border-gray-100 focus:border-violet-300 pr-10" placeholder="30316" maxLength={5} />
                <button onClick={useLocation} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <MapPin size={14} className={locationFound ? 'text-green-500' : 'text-gray-300'} />
                </button>
              </div>
              {locationFound && <p className="text-[10px] text-green-500 mt-1">✓ {t('Ubicación detectada', 'Location detected')}</p>}
              {locating && <p className="text-[10px] text-gray-400 mt-1">{t('Detectando...', 'Detecting...')}</p>}
            </div>
          </div>
          <button onClick={useLocation} disabled={locating} className="flex items-center gap-1.5 text-xs font-semibold text-violet-500">
            <MapPin size={12} /> {t('Usar mi ubicación', 'Use my location')}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🛡️</span>
            <h3 className="font-semibold text-gray-900 text-sm">{t('Cobertura de Seguro', 'Insurance Coverage')}</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{t('Proveedor de Seguro', 'Insurance Provider')}</label>
              <select value={form.insurance} onChange={e => set('insurance', e.target.value)} className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none border border-gray-100">
                {INSURANCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            {form.insurance !== 'Sin seguro / Uninsured' && (
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">{t('Nombre del Plan', 'Plan Name')}</label>
                <input value={form.planName} onChange={e => set('planName', e.target.value)} className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none border border-gray-100" placeholder="e.g. Choice POS II" />
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 mb-6">
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">ℹ️</span>
            <div>
              <p className="text-xs font-semibold text-blue-700 mb-1">{t('¿Por qué necesitamos esto?', 'Why do we need this?')}</p>
              <p className="text-xs text-blue-600 leading-relaxed">{t('Tu ubicación y seguro nos ayudan a encontrar clínicas en tu red y darte opciones de costo apropiadas.', 'Your location and insurance help us find clinics in your network and give you appropriate cost options.')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 bg-white border-t border-gray-100 flex gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm">
          <ArrowLeft size={16} /> {t('Atrás', 'Back')}
        </button>
        <button onClick={() => valid && onNext({ ...form, age: parseInt(form.age) })} disabled={!valid} className="flex-1 bg-violet-600 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg shadow-violet-200">
          {t('Continuar', 'Continue')} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}