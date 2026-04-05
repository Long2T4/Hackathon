import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'

const INSURANCE_OPTIONS = [
  {
    id: 'medicaid',
    icon: '🏛️',
    nameES: 'Medicaid',
    nameEN: 'Medicaid',
    descES: 'Seguro médico GRATIS o de bajo costo del gobierno para familias con bajos ingresos. Cubre visitas al médico, hospitales, recetas y más.',
    descEN: 'FREE or low-cost government health insurance for low-income families. Covers doctor visits, hospitals, prescriptions, and more.',
    eligibleES: '¿Quién califica? Familias de bajos ingresos, embarazadas, niños, adultos mayores, personas con discapacidad.',
    eligibleEN: 'Who qualifies? Low-income families, pregnant women, children, seniors, people with disabilities.',
    color: 'teal',
  },
  {
    id: 'chip',
    icon: '👶',
    nameES: 'CHIP (Seguro para Niños)',
    nameEN: 'CHIP (Children\'s Health Insurance)',
    descES: 'Seguro de salud de bajo costo para niños menores de 19 años cuyas familias ganan demasiado para Medicaid pero no pueden pagar un seguro privado.',
    descEN: 'Low-cost health coverage for children under 19 whose families earn too much for Medicaid but can\'t afford private insurance.',
    eligibleES: '¿Quién califica? Niños y adolescentes hasta 18 años. Incluye visitas, vacunas, dental y visión.',
    eligibleEN: 'Who qualifies? Children and teenagers up to 18. Includes checkups, vaccines, dental, and vision.',
    color: 'blue',
  },
  {
    id: 'aca',
    icon: '📋',
    nameES: 'Mercado de Seguros (ACA)',
    nameEN: 'ACA Marketplace Insurance',
    descES: 'Planes de salud privados con ayuda financiera del gobierno. Puedes inscribirte aunque seas inmigrante con documentos.',
    descEN: 'Private health plans with government financial help. You can enroll even if you\'re a documented immigrant.',
    eligibleES: '¿Quién califica? Personas que no califican para Medicaid y tienen ingresos entre 100%–400% del nivel de pobreza federal.',
    eligibleEN: 'Who qualifies? People who don\'t qualify for Medicaid with income between 100%–400% of the federal poverty level.',
    color: 'purple',
  },
  {
    id: 'sliding',
    icon: '🏥',
    nameES: 'Clínicas de Escala Móvil',
    nameEN: 'Sliding-Scale Clinics (FQHCs)',
    descES: 'Centros de salud comunitarios que cobran según tus ingresos. Atienden a TODOS, con o sin seguro, con o sin documentos.',
    descEN: 'Community health centers that charge based on your income. They serve EVERYONE, with or without insurance, with or without documents.',
    eligibleES: '¿Quién califica? TODOS. No preguntan sobre estatus migratorio. Busca tu clínica en findahealthcenter.hrsa.gov',
    eligibleEN: 'Who qualifies? EVERYONE. They don\'t ask about immigration status. Find your clinic at findahealthcenter.hrsa.gov',
    color: 'green',
  },
  {
    id: 'emergency',
    icon: '🚑',
    nameES: 'Medicaid de Emergencia',
    nameEN: 'Emergency Medicaid',
    descES: 'Cubre tratamiento de emergencias médicas graves para personas que no califican para Medicaid regular por su estatus migratorio.',
    descEN: 'Covers treatment for serious medical emergencies for people who don\'t qualify for regular Medicaid due to immigration status.',
    eligibleES: '¿Quién califica? Personas sin documentos que tienen una emergencia médica que pone en riesgo su vida.',
    eligibleEN: 'Who qualifies? Undocumented individuals experiencing a life-threatening medical emergency.',
    color: 'red',
  },
]

const QUIZ_QUESTIONS = [
  {
    id: 'age',
    questionES: '¿Cuántos años tienes?',
    questionEN: 'How old are you?',
    options: [
      { value: 'child', labelES: 'Menor de 19 años', labelEN: 'Under 19 years old' },
      { value: 'adult', labelES: '19–64 años', labelEN: '19–64 years old' },
      { value: 'senior', labelES: '65 años o más', labelEN: '65 or older' },
    ],
  },
  {
    id: 'income',
    questionES: '¿Cuál es tu situación de ingresos?',
    questionEN: 'What is your income situation?',
    options: [
      { value: 'very_low', labelES: 'Ingresos muy bajos / sin ingresos', labelEN: 'Very low / no income' },
      { value: 'low', labelES: 'Ingresos bajos a moderados', labelEN: 'Low to moderate income' },
      { value: 'moderate', labelES: 'Ingresos moderados a altos', labelEN: 'Moderate to high income' },
    ],
  },
  {
    id: 'status',
    questionES: '¿Cuál es tu estatus en EE.UU.?',
    questionEN: 'What is your U.S. status?',
    options: [
      { value: 'citizen', labelES: 'Ciudadano/a o Residente Permanente', labelEN: 'U.S. Citizen or Permanent Resident' },
      { value: 'documented', labelES: 'Con visa o permiso de trabajo', labelEN: 'With visa or work permit' },
      { value: 'undocumented', labelES: 'Sin documentos', labelEN: 'Undocumented' },
    ],
  },
]

function getRecommendation(answers) {
  const { age, income, status } = answers
  if (age === 'child') return ['chip', 'medicaid', 'sliding']
  if (age === 'senior') return ['medicaid', 'sliding']
  if (status === 'undocumented') return ['sliding', 'emergency']
  if (income === 'very_low') return ['medicaid', 'sliding']
  if (income === 'low') return ['medicaid', 'aca', 'sliding']
  return ['aca', 'sliding']
}

function InsuranceCard({ option, lang }) {
  const [expanded, setExpanded] = useState(false)
  const colorMap = {
    teal: 'border-teal-200 bg-teal-50',
    blue: 'border-blue-200 bg-blue-50',
    purple: 'border-purple-200 bg-purple-50',
    green: 'border-green-200 bg-green-50',
    red: 'border-red-200 bg-red-50',
  }
  const iconBg = {
    teal: 'bg-teal-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
  }

  return (
    <div className={`border rounded-2xl overflow-hidden ${colorMap[option.color]}`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-4 text-left"
        aria-expanded={expanded}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${iconBg[option.color]}`}>
          {option.icon}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">
            {lang === 'es' ? option.nameES : option.nameEN}
          </p>
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 animate-fade-in">
          <p className="text-sm text-gray-700 leading-relaxed">
            {lang === 'es' ? option.descES : option.descEN}
          </p>
          <div className="bg-white/60 rounded-xl p-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              {lang === 'es' ? option.eligibleES : option.eligibleEN}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function InsuranceGuide({ lang }) {
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizDone, setQuizDone] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const t = (es, en) => lang === 'es' ? es : en

  const answeredCount = Object.keys(quizAnswers).length
  const currentQ = QUIZ_QUESTIONS[answeredCount]

  const handleAnswer = (questionId, value) => {
    const newAnswers = { ...quizAnswers, [questionId]: value }
    setQuizAnswers(newAnswers)
    if (Object.keys(newAnswers).length === QUIZ_QUESTIONS.length) {
      setRecommendations(getRecommendation(newAnswers))
      setQuizDone(true)
    }
  }

  const resetQuiz = () => {
    setQuizAnswers({})
    setQuizDone(false)
    setRecommendations([])
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-gray-900">
          {t('Entendiendo Sus Opciones', 'Understanding Your Options')}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {t('Información sobre seguros médicos en EE.UU.', 'Health insurance information in the U.S.')}
        </p>
      </div>

      {/* Eligibility Quiz */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">
            {t('¿Cuál opción me conviene?', 'Which option is right for me?')}
          </h3>
        </div>

        {!quizDone && currentQ && (
          <div className="animate-fade-in">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>
                  {t(
                    `Pregunta ${answeredCount + 1} de ${QUIZ_QUESTIONS.length}`,
                    `Question ${answeredCount + 1} of ${QUIZ_QUESTIONS.length}`
                  )}
                </span>
                <span>{Math.round((answeredCount / QUIZ_QUESTIONS.length) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${(answeredCount / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-sm font-medium text-gray-800 mb-3">
              {lang === 'es' ? currentQ.questionES : currentQ.questionEN}
            </p>
            <div className="space-y-2">
              {currentQ.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(currentQ.id, opt.value)}
                  className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm font-medium text-gray-700 hover:border-violet-300 hover:bg-violet-50 transition-all min-h-[48px]"
                >
                  {lang === 'es' ? opt.labelES : opt.labelEN}
                </button>
              ))}
            </div>
          </div>
        )}

        {quizDone && (
          <div className="animate-fade-in">
            {/* Completed progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>{t('Completado', 'Completed')}</span>
                <span>100%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full w-full" />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3 text-teal-700">
              <CheckCircle size={18} />
              <p className="text-sm font-semibold">
                {t('Opciones recomendadas para ti:', 'Recommended options for you:')}
              </p>
            </div>
            <div className="space-y-2 mb-3">
              {recommendations.map(id => {
                const opt = INSURANCE_OPTIONS.find(o => o.id === id)
                return (
                  <div key={id} className="flex items-center gap-2 text-sm text-gray-700">
                    <span>{opt?.icon}</span>
                    <span className="font-medium">{lang === 'es' ? opt?.nameES : opt?.nameEN}</span>
                  </div>
                )
              })}
            </div>
            <button onClick={resetQuiz} className="text-xs text-violet-600 font-medium underline">
              {t('Volver a tomar el cuestionario', 'Retake the quiz')}
            </button>
          </div>
        )}
      </div>

      {/* All options */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          {t('Todas las Opciones', 'All Options')}
        </h3>
        <div className="space-y-2">
          {INSURANCE_OPTIONS.map(option => (
            <InsuranceCard key={option.id} option={option} lang={lang} />
          ))}
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center pb-2">
        {t(
          'Esta información es general. Consulta con un navegador de salud certificado para asesoría personalizada.',
          'This information is general. Consult a certified health navigator for personalized advice.'
        )}
      </p>
    </div>
  )
}