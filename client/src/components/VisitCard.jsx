import { useState } from 'react'
import { FileText, Loader2, X, ChevronDown } from 'lucide-react'
import { generateVisitCardData } from '../utils/api.js'
import { generateVisitCardPDF } from '../utils/pdfGenerator.js'

const INSURANCE_OPTIONS = [
  'Uninsured / Sin seguro',
  'Medicaid',
  'Medicare',
  'ACA Marketplace',
  'Employer Insurance',
  'Blue Cross Blue Shield',
  'Aetna',
  'UnitedHealthcare',
  'Cigna',
  'Humana',
  'Molina Healthcare',
  'Centene',
  'Kaiser Permanente',
  'Oscar Health',
  'Other',
]

export default function VisitCard({ lang, triageResult, messages }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [otherInsurance, setOtherInsurance] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    dob: '',
    allergies: '',
    medications: '',
    insuranceProvider: 'Uninsured / Sin seguro',
    insuranceId: '',
  })

  const t = (es, en) => lang === 'es' ? es : en
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  // Extract symptoms from actual user messages
  const getUserSymptoms = () => {
    const userMsgs = messages.filter(m => m.role === 'user' && m.id !== 'welcome')
    if (userMsgs.length === 0) return triageResult?.content || ''
    return userMsgs.map(m => m.content).join(' | ').slice(0, 500)
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const symptoms = getUserSymptoms()
      const chatSummary = {
        symptoms,
        assessment: triageResult?.content || '',
        urgency: triageResult?.urgency || 'routine',
        questions: triageResult?.questions || [],
        messages: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
      }
      const data = await generateVisitCardData(chatSummary, lang)
      generateVisitCardPDF({
        ...data,
        urgency: triageResult?.urgency,
        patientName: form.fullName,
        patientDOB: form.dob,
        allergies: form.allergies,
        medications: form.medications,
        insuranceProvider: form.insuranceProvider === 'Other' ? otherInsurance : form.insuranceProvider,
        insuranceId: form.insuranceId,
      })
      setShowForm(false)
    } catch (err) {
      // Fallback: generate PDF directly from triageResult without API translation
      try {
        const symptoms = getUserSymptoms()
        const questions = triageResult?.questions || []
        generateVisitCardPDF({
          symptomsES: symptoms || '—',
          symptomsEN: symptoms || '—',
          assessmentES: triageResult?.content || '—',
          assessmentEN: triageResult?.content || '—',
          urgency: triageResult?.urgency || 'routine',
          questionsES: questions,
          questionsEN: questions,
          patientName: form.fullName,
          patientDOB: form.dob,
          allergies: form.allergies,
          medications: form.medications,
          insuranceProvider: form.insuranceProvider === 'Other' ? otherInsurance : form.insuranceProvider,
          insuranceId: form.insuranceId,
        })
        setShowForm(false)
      } catch {
        setError(t('No se pudo generar el PDF.', 'Could not generate PDF.'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold py-3 rounded-2xl shadow-md shadow-orange-200"
      >
        <FileText size={18} />
        {t('Generar Tarjeta de Visita', 'Generate Visit Card')}
      </button>

      {error && <p className="mt-2 text-xs text-red-400 text-center">{error}</p>}

      {showForm && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl flex flex-col"
            style={{ maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {t('Información del Paciente', 'Patient Information')}
                </h3>
                <p className="text-xs text-gray-400">
                  {t('Para tu tarjeta de visita bilingüe', 'For your bilingual visit card')}
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

              {/* Full name */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  {t('Nombre Completo', 'Full Name')} <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none border border-gray-100 focus:border-violet-300"
                  placeholder={t('Maria García López', 'Maria Garcia Lopez')}
                />
              </div>

              {/* DOB */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  {t('Fecha de Nacimiento', 'Date of Birth')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={e => set('dob', e.target.value)}
                  className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none border border-gray-100 focus:border-violet-300"
                />
              </div>

              {/* Allergies */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  {t('Alergias', 'Allergies')}
                  <span className="text-gray-400 font-normal ml-1">({t('opcional', 'optional')})</span>
                </label>
                <input
                  value={form.allergies}
                  onChange={e => set('allergies', e.target.value)}
                  className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none border border-gray-100 focus:border-violet-300"
                  placeholder={t('Ej: Penicilina, mariscos, látex', 'e.g. Penicillin, shellfish, latex')}
                />
              </div>

              {/* Medications */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  {t('Medicamentos actuales', 'Current Medications')}
                  <span className="text-gray-400 font-normal ml-1">({t('opcional', 'optional')})</span>
                </label>
                <textarea
                  value={form.medications}
                  onChange={e => set('medications', e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none border border-gray-100 resize-none focus:border-violet-300"
                  placeholder={t('Ej: Metformina 500mg, Lisinopril 10mg', 'e.g. Metformin 500mg, Lisinopril 10mg')}
                />
              </div>

              {/* Insurance provider */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  {t('Seguro Médico', 'Insurance Provider')} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.insuranceProvider}
                    onChange={e => set('insuranceProvider', e.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none border border-gray-100 appearance-none focus:border-violet-300"
                  >
                    {INSURANCE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {form.insuranceProvider === 'Other' && (
                  <input
                    value={otherInsurance}
                    onChange={e => setOtherInsurance(e.target.value)}
                    className="w-full mt-2 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none border border-gray-100 focus:border-violet-300"
                    placeholder={t('Nombre de tu seguro', 'Your insurance name')}
                  />
                )}
                {form.insuranceProvider === 'Uninsured / Sin seguro' && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-green-800 mb-1">
                      {t('Sin seguro? Hay opciones.', 'No insurance? There are options.')}
                    </p>
                    <p className="text-xs text-green-700 leading-relaxed mb-2">
                      {t(
                        'Los Centros de Salud Comunitarios (FQHC) atienden a todos sin importar su capacidad de pago. El costo se ajusta a tus ingresos.',
                        'Community Health Centers (FQHCs) serve everyone regardless of ability to pay. Cost is based on your income.'
                      )}
                    </p>
                    <a
                      href="https://findahealthcenter.hrsa.gov"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-green-700 underline"
                    >
                      {t('Buscar clinica gratuita cerca de ti', 'Find a free clinic near you')} →
                    </a>
                  </div>
                )}
              </div>

              {/* Insurance ID */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  {t('Numero de ID del Seguro', 'Insurance ID Number')}
                  <span className="text-gray-400 font-normal ml-1">({t('opcional', 'optional')})</span>
                </label>
                <input
                  value={form.insuranceId}
                  onChange={e => set('insuranceId', e.target.value)}
                  className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none border border-gray-100 focus:border-violet-300"
                  placeholder="XYZ123456789"
                />
              </div>
            </div>

            {/* Generate button */}
            <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
              {error && <p className="text-xs text-red-400 text-center mb-2">{error}</p>}
              <button
                onClick={handleGenerate}
                disabled={loading || !form.fullName || !form.dob || (form.insuranceProvider === 'Other' && !otherInsurance)}
                className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg shadow-orange-200"
              >
                {loading
                  ? <Loader2 size={18} className="animate-spin" />
                  : <FileText size={18} />}
                {loading
                  ? t('Generando PDF...', 'Generating PDF...')
                  : t('Descargar Tarjeta de Visita', 'Download Visit Card')}
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                {t(
                  'Se requiere nombre, fecha de nacimiento y seguro',
                  'Name, date of birth and insurance are required'
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
