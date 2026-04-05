import { useState, useEffect } from 'react'
import { Bell, Trash2, Calendar, Clock, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { getReminders } from './ReminderCard.jsx'

const CHECKLIST = [
  { id: 'visitcard', emoji: '📄', es: 'Tarjeta de Visita de MiSalud (PDF)', en: 'MiSalud Visit Card (PDF)' },
  { id: 'id', emoji: '🪪', es: 'Identificación (ID, pasaporte, matrícula)', en: 'ID (passport, driver\'s license)' },
  { id: 'insurance', emoji: '💳', es: 'Tarjeta de seguro (si tienes)', en: 'Insurance card (if you have one)' },
  { id: 'cash', emoji: '💵', es: 'Efectivo para copago ($20–$40)', en: 'Cash for copay ($20–$40)' },
  { id: 'meds', emoji: '💊', es: 'Lista de medicamentos que tomas', en: 'List of current medications' },
  { id: 'symptoms', emoji: '📝', es: 'Notas de tus síntomas (fechas, severidad)', en: 'Symptom notes (dates, severity)' },
  { id: 'questions', emoji: '❓', es: 'Preguntas para el doctor', en: 'Questions for the doctor' },
]

function ReminderItem({ reminder, lang, onDelete }) {
  const [showChecklist, setShowChecklist] = useState(false)
  const [checkedItems, setCheckedItems] = useState({})
  const t = (es, en) => lang === 'es' ? es : en

  const date = new Date(`${reminder.date}T${reminder.time}`)
  const isPast = date < new Date()
  const isToday = date.toDateString() === new Date().toDateString()

  const urgencyColors = {
    emergency: 'bg-red-500/20 border-red-500/30 text-red-400',
    urgent: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    routine: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    selfcare: 'bg-green-500/20 border-green-500/30 text-green-400',
  }

  const checkedCount = Object.values(checkedItems).filter(Boolean).length

  return (
    <div className={`rounded-2xl border overflow-hidden ${isPast ? 'opacity-50' : 'opacity-100'} bg-white/5 border-white/10`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {reminder.type === 'book' ? '📞' : '🏥'}
            </span>
            <div>
              <p className="text-white font-semibold text-sm">
                {reminder.type === 'book'
                  ? t('Agendar cita médica', 'Book medical appointment')
                  : t('Cita médica', 'Medical appointment')}
              </p>
              {isToday && (
                <span className="text-[10px] font-bold bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full">
                  {t('HOY', 'TODAY')}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onDelete(reminder.id)}
            className="text-white/20 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Date and time */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 text-white/60 text-xs">
            <Calendar size={12} />
            <span>
              {date.toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', {
                weekday: 'long', month: 'long', day: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-white/60 text-xs">
            <Clock size={12} />
            <span>{reminder.time}</span>
          </div>
        </div>

        {/* Urgency badge */}
        {reminder.urgency && (
          <div className="mt-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyColors[reminder.urgency]}`}>
              {reminder.urgency.toUpperCase()}
            </span>
          </div>
        )}

        {/* Symptoms */}
        {reminder.symptoms && (
          <div className="mt-2 bg-white/5 rounded-xl px-3 py-2">
            <p className="text-[10px] text-white/40 mb-0.5">{t('Síntomas', 'Symptoms')}</p>
            <p className="text-xs text-white/70 leading-relaxed">{reminder.symptoms}</p>
          </div>
        )}
      </div>

      {/* Checklist toggle */}
      <button
        onClick={() => setShowChecklist(s => !s)}
        className="w-full flex items-center justify-between px-4 py-3 border-t border-white/10"
      >
        <div className="flex items-center gap-2">
          <span>🎒</span>
          <p className="text-white/70 text-xs font-semibold">
            {t('Qué llevar', 'What to bring')}
          </p>
          {checkedCount > 0 && (
            <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              {checkedCount}/{CHECKLIST.length}
            </span>
          )}
        </div>
        {showChecklist
          ? <ChevronUp size={14} className="text-white/30" />
          : <ChevronDown size={14} className="text-white/30" />}
      </button>

      {showChecklist && (
        <div className="px-4 pb-4 space-y-2">
          {CHECKLIST.map(item => (
            <button
              key={item.id}
              onClick={() => setCheckedItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
              className="w-full flex items-center gap-3 text-left min-h-[36px]"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                checkedItems[item.id]
                  ? 'bg-green-500 border-green-500'
                  : 'border-white/20'
              }`}>
                {checkedItems[item.id] && <Check size={10} className="text-white" />}
              </div>
              <span className={`text-sm ${checkedItems[item.id] ? 'text-white/30 line-through' : 'text-white/70'}`}>
                {item.emoji} {lang === 'es' ? item.es : item.en}
              </span>
            </button>
          ))}

          {checkedCount === CHECKLIST.length && (
            <div className="mt-2 bg-green-500/20 rounded-xl p-3 text-center">
              <p className="text-green-400 text-xs font-semibold">
                ✅ {t('¡Todo listo para tu cita!', 'All ready for your appointment!')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function RemindersScreen({ lang }) {
  const [reminders, setReminders] = useState([])
  const t = (es, en) => lang === 'es' ? es : en

  useEffect(() => {
    const saved = getReminders()
    // Sort by date, upcoming first
    saved.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
    setReminders(saved)
  }, [])

  const handleDelete = (id) => {
    const updated = reminders.filter(r => r.id !== id)
    setReminders(updated)
    localStorage.setItem('misalud_reminders', JSON.stringify(updated))
  }

  const upcoming = reminders.filter(r => new Date(`${r.date}T${r.time}`) >= new Date())
  const past = reminders.filter(r => new Date(`${r.date}T${r.time}`) < new Date())

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-5"
      style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-white">
          {t('Mis Recordatorios', 'My Reminders')} 🗓️
        </h2>
        <p className="text-white/40 text-sm mt-1">
          {t('Tus citas y qué llevar', 'Your appointments and what to bring')}
        </p>
      </div>

      {/* Empty state */}
      {reminders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-4">
            <Bell size={28} className="text-white/30" />
          </div>
          <p className="text-white/50 font-semibold mb-2">
            {t('No tienes recordatorios', 'No reminders yet')}
          </p>
          <p className="text-white/30 text-sm max-w-[200px] leading-relaxed">
            {t(
              'Describe tus síntomas en el Chat Bot para crear uno',
              'Describe your symptoms in Chat Bot to create one'
            )}
          </p>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="mb-6">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">
            {t('Próximas', 'Upcoming')}
          </p>
          <div className="space-y-3">
            {upcoming.map(r => (
              <ReminderItem key={r.id} reminder={r} lang={lang} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">
            {t('Pasadas', 'Past')}
          </p>
          <div className="space-y-3">
            {past.map(r => (
              <ReminderItem key={r.id} reminder={r} lang={lang} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}