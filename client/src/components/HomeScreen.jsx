import { Bell } from 'lucide-react'

const QUICK_ACTIONS = [
  {
    id: 'chat',
    emoji: '🩺',
    labelES: 'Síntomas',
    labelEN: 'Symptoms',
    bg: 'bg-violet-50',
    text: 'text-violet-600',
  },
  {
    id: 'clinics',
    emoji: '🏥',
    labelES: 'Clínicas',
    labelEN: 'Clinics',
    bg: 'bg-teal-50',
    text: 'text-teal-600',
  },
  {
    id: 'insurance',
    emoji: '📋',
    labelES: 'Seguros',
    labelEN: 'Insurance',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
  },
  {
    id: 'chat',
    emoji: '📄',
    labelES: 'Tarjeta',
    labelEN: 'Visit Card',
    bg: 'bg-pink-50',
    text: 'text-pink-600',
  },
]

const RECENT_TOPICS = [
  { emoji: '🤒', topicES: 'Fiebre y dolor de cabeza', topicEN: 'Fever and headache', urgency: 'routine', timeES: 'Ayer', timeEN: 'Yesterday' },
  { emoji: '💊', topicES: 'Opciones sin seguro', topicEN: 'Options without insurance', urgency: 'info', timeES: 'Hace 3 días', timeEN: '3 days ago' },
  { emoji: '🦷', topicES: 'Dolor de muela', topicEN: 'Tooth pain', urgency: 'urgent', timeES: 'La semana pasada', timeEN: 'Last week' },
]

const URGENCY_BADGE = {
  emergency: { bg: 'bg-red-100', text: 'text-red-600', labelES: 'Emergencia', labelEN: 'Emergency' },
  urgent: { bg: 'bg-orange-100', text: 'text-orange-600', labelES: 'Urgente', labelEN: 'Urgent' },
  routine: { bg: 'bg-blue-100', text: 'text-blue-600', labelES: 'Rutina', labelEN: 'Routine' },
  selfcare: { bg: 'bg-green-100', text: 'text-green-600', labelES: 'Autocuidado', labelEN: 'Self-care' },
  info: { bg: 'bg-gray-100', text: 'text-gray-600', labelES: 'Info', labelEN: 'Info' },
}

export default function HomeScreen({ lang, setLang, onNavigate }) {
  const t = (es, en) => lang === 'es' ? es : en

  const hour = new Date().getHours()
  const greeting = hour < 12
    ? t('Buenos días', 'Good morning')
    : hour < 18
    ? t('Buenas tardes', 'Good afternoon')
    : t('Buenas noches', 'Good evening')

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{greeting} 👋</p>
          <h1 className="font-display text-2xl font-semibold text-gray-900 mt-0.5">
            {t('¿Cómo te sientes hoy?', 'How are you feeling?')}
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => setLang(l => l === 'es' ? 'en' : 'es')}
            className="text-xs font-bold bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 shadow-sm"
          >
            {lang === 'es' ? 'EN' : 'ES'}
          </button>
          <button className="w-9 h-9 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm">
            <Bell size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Hero orb card */}
      <div className="mx-4 mb-4">
        <button
          onClick={() => onNavigate('chat')}
          className="w-full rounded-3xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 40%, #EC4899 70%, #F97316 100%)',
            minHeight: 180,
          }}
        >
          {/* Orb */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div
              className="w-28 h-28 rounded-full"
              style={{
                background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4), rgba(255,255,255,0.05))',
                boxShadow: 'inset -4px -4px 20px rgba(0,0,0,0.2), 0 0 40px rgba(168,85,247,0.4)',
              }}
            >
              <div className="flex gap-3 justify-center pt-9">
                <div className="w-3 h-3 bg-white rounded-full opacity-90" />
                <div className="w-3 h-3 bg-white rounded-full opacity-90" />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="px-6 py-6 pr-36 text-left">
            <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-2">MiSalud AI</p>
            <h2 className="text-white font-display font-semibold text-xl leading-tight mb-3">
              {t('Tu asistente de salud bilingüe', 'Your bilingual health assistant')}
            </h2>
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5">
              <span className="text-white text-sm font-semibold">
                {t('Hablar ahora', 'Talk now')} →
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Quick actions */}
      <div className="px-4 mb-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">{t('Acciones rápidas', 'Quick actions')}</h3>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={i}
              onClick={() => onNavigate(action.id)}
              className="flex flex-col items-center gap-2 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm active:scale-95 transition-transform"
            >
              <div className={`w-10 h-10 ${action.bg} rounded-xl flex items-center justify-center text-lg`}>
                {action.emoji}
              </div>
              <span className={`text-[10px] font-semibold ${action.text} text-center leading-tight`}>
                {lang === 'es' ? action.labelES : action.labelEN}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent history */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 text-sm">{t('Consultas recientes', 'Recent consultations')}</h3>
          <button onClick={() => onNavigate('chat')} className="text-xs text-violet-500 font-semibold">
            {t('Ver todas', 'View all')}
          </button>
        </div>

        <div className="space-y-2">
          {RECENT_TOPICS.map((item, i) => {
            const badge = URGENCY_BADGE[item.urgency]
            return (
              <button
                key={i}
                onClick={() => onNavigate('chat')}
                className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
              >
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {lang === 'es' ? item.topicES : item.topicEN}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {lang === 'es' ? item.timeES : item.timeEN}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${badge.bg} ${badge.text}`}>
                  {lang === 'es' ? badge.labelES : badge.labelEN}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center pb-4 px-8">
        {t(
          'MiSalud no es un sustituto de atención médica. En emergencias llame al 911.',
          'MiSalud is not a substitute for medical care. In emergencies call 911.'
        )}
      </p>
    </div>
  )
}