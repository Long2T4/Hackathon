import { useState, useEffect } from 'react'
import { Bell, Trash2, Calendar, Clock, ChevronDown, ChevronUp, Check, Plus, X } from 'lucide-react'
import { getReminders } from './ReminderCard.jsx'

const CHECKLIST = [
  { id: 'visitcard', emoji: '📄', es: 'Tarjeta de Visita de MiSalud (PDF)', en: 'MiSalud Visit Card (PDF)' },
  { id: 'id', emoji: '🪪', es: 'Identificacion (ID, pasaporte)', en: 'ID (passport, driver\'s license)' },
  { id: 'insurance', emoji: '💳', es: 'Tarjeta de seguro (si tienes)', en: 'Insurance card (if you have one)' },
  { id: 'cash', emoji: '💵', es: 'Efectivo para copago ($20-$40)', en: 'Cash for copay ($20-$40)' },
  { id: 'meds', emoji: '💊', es: 'Lista de medicamentos que tomas', en: 'List of current medications' },
  { id: 'symptoms', emoji: '📝', es: 'Notas de tus sintomas (fechas, severidad)', en: 'Symptom notes (dates, severity)' },
  { id: 'questions', emoji: '❓', es: 'Preguntas para el doctor', en: 'Questions for the doctor' },
]

function saveReminder(reminder) {
  const existing = JSON.parse(localStorage.getItem('misalud_reminders') || '[]')
  existing.push(reminder)
  localStorage.setItem('misalud_reminders', JSON.stringify(existing))
}

function ReminderItem({ reminder, lang, onDelete }) {
  const [showChecklist, setShowChecklist] = useState(false)
  const [checkedItems, setCheckedItems] = useState({})
  const t = (es, en) => lang === 'es' ? es : en

  const date = new Date(`${reminder.date}T${reminder.time}`)
  const isPast = date < new Date()
  const isToday = date.toDateString() === new Date().toDateString()

  const checkedCount = Object.values(checkedItems).filter(Boolean).length

  return (
    <div className={`rounded-2xl border overflow-hidden ${isPast ? 'opacity-50' : 'opacity-100'} bg-white/5 border-white/10`}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {reminder.type === 'book' ? '📞' : '🏥'}
            </span>
            <div>
              <p className="text-white font-semibold text-sm">
                {reminder.type === 'book'
                  ? t('Agendar cita medica', 'Book medical appointment')
                  : t('Cita medica', 'Medical appointment')}
              </p>
              {reminder.note ? (
                <p className="text-white/50 text-xs mt-0.5">{reminder.note}</p>
              ) : null}
              {isToday && (
                <span className="inline-block text-[10px] font-bold bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full mt-1">
                  {t('HOY', 'TODAY')}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => onDelete(reminder.id)} className="text-white/20 hover:text-red-400 transition-colors p-1">
            <Trash2 size={14} />
          </button>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 text-white/60 text-xs">
            <Calendar size={12} />
            <span>
              {date.toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-white/60 text-xs">
            <Clock size={12} />
            <span>
              {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowChecklist(s => !s)}
        className="w-full flex items-center justify-between px-4 py-3 border-t border-white/10"
      >
        <div className="flex items-center gap-2">
          <span>🎒</span>
          <p className="text-white/70 text-xs font-semibold">
            {t('Que llevar', 'What to bring')}
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
                checkedItems[item.id] ? 'bg-green-500 border-green-500' : 'border-white/20'
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
                {t('Todo listo para tu cita!', 'All ready for your appointment!')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AddReminderModal({ lang, onClose, onSave }) {
  const t = (es, en) => lang === 'es' ? es : en

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [type, setType] = useState('book')
  const [date, setDate] = useState(tomorrow.toISOString().split('T')[0])
  const [time, setTime] = useState('09:00')
  const [note, setNote] = useState('')

  const handleSave = () => {
    if (!date || !time) return
    onSave({ type, date, time, note: note.trim() })
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#16213e] w-full max-w-lg rounded-t-3xl border-t border-white/10" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h3 className="font-bold text-white text-lg">
              {t('Nuevo Recordatorio', 'New Reminder')}
            </h3>
            <p className="text-xs text-white/40">
              {t('Elige el tipo y la fecha', 'Choose type and date')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
          >
            <X size={16} className="text-white/60" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 space-y-5">
          {/* Type */}
          <div>
            <p className="text-xs font-semibold text-white/50 mb-2 uppercase tracking-widest">
              {t('Tipo de recordatorio', 'Reminder type')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setType('book')}
                className={`rounded-2xl p-4 text-left border transition-all ${
                  type === 'book'
                    ? 'bg-violet-600 border-violet-500'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <span className="text-2xl block mb-1">📞</span>
                <p className={`text-sm font-semibold ${type === 'book' ? 'text-white' : 'text-white/70'}`}>
                  {t('Agendar cita', 'Book appointment')}
                </p>
                <p className={`text-xs mt-0.5 ${type === 'book' ? 'text-white/70' : 'text-white/30'}`}>
                  {t('Recordatorio para llamar', 'Reminder to call')}
                </p>
              </button>
              <button
                onClick={() => setType('appointment')}
                className={`rounded-2xl p-4 text-left border transition-all ${
                  type === 'appointment'
                    ? 'bg-violet-600 border-violet-500'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <span className="text-2xl block mb-1">🏥</span>
                <p className={`text-sm font-semibold ${type === 'appointment' ? 'text-white' : 'text-white/70'}`}>
                  {t('Ya tengo cita', 'I have appointment')}
                </p>
                <p className={`text-xs mt-0.5 ${type === 'appointment' ? 'text-white/70' : 'text-white/30'}`}>
                  {t('Recordatorio del dia', 'Day-of reminder')}
                </p>
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-widest">
              <Calendar size={11} className="inline mr-1" />
              {t('Fecha', 'Date')} <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-violet-400"
            />
          </div>

          {/* Time */}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-widest">
              <Clock size={11} className="inline mr-1" />
              {t('Hora', 'Time')} <span className="text-red-400">*</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full bg-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-violet-400"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-widest">
              {t('Nota', 'Note')}
              <span className="text-white/30 font-normal ml-1 normal-case tracking-normal">({t('opcional', 'optional')})</span>
            </label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full bg-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-violet-400 placeholder-white/20"
              placeholder={t('Ej: Dr. Garcia, Clinica del Valle', 'e.g. Dr. Garcia, Valley Clinic')}
            />
          </div>
        </div>

        {/* Save button */}
        <div className="px-5 py-4 border-t border-white/10">
          <button
            onClick={handleSave}
            disabled={!date || !time}
            className="w-full bg-violet-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Bell size={16} />
            {t('Guardar Recordatorio', 'Save Reminder')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RemindersScreen({ lang }) {
  const [reminders, setReminders] = useState([])
  const [showModal, setShowModal] = useState(false)
  const t = (es, en) => lang === 'es' ? es : en

  const loadReminders = () => {
    const saved = getReminders()
    saved.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
    setReminders(saved)
  }

  useEffect(() => { loadReminders() }, [])

  const handleDelete = (id) => {
    const updated = reminders.filter(r => r.id !== id)
    setReminders(updated)
    localStorage.setItem('misalud_reminders', JSON.stringify(updated))
  }

  const handleSave = ({ type, date, time, note }) => {
    saveReminder({
      id: Date.now(),
      type,
      date,
      time,
      note,
      createdAt: new Date().toISOString(),
    })
    setShowModal(false)
    loadReminders()
  }

  const upcoming = reminders.filter(r => new Date(`${r.date}T${r.time}`) >= new Date())
  const past = reminders.filter(r => new Date(`${r.date}T${r.time}`) < new Date())

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4 flex-shrink-0">
        <div>
          <h2 className="font-display text-2xl font-semibold text-white">
            {t('Mis Recordatorios', 'My Reminders')}
          </h2>
          <p className="text-white/40 text-sm mt-0.5">
            {t('Tus citas y que llevar', 'Your appointments and what to bring')}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-11 h-11 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-900/50"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* Empty state */}
        {reminders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-4">
              <Bell size={28} className="text-white/30" />
            </div>
            <p className="text-white/50 font-semibold mb-2">
              {t('No tienes recordatorios', 'No reminders yet')}
            </p>
            <p className="text-white/30 text-sm max-w-[220px] leading-relaxed mb-6">
              {t(
                'Crea un recordatorio para agendar o asistir a tu cita medica',
                'Create a reminder to book or attend your medical appointment'
              )}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-violet-600 text-white font-semibold px-5 py-3 rounded-2xl shadow-lg"
            >
              <Plus size={16} />
              {t('Crear Recordatorio', 'Create Reminder')}
            </button>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div className="mb-6">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">
              {t('Proximas', 'Upcoming')}
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

      {showModal && (
        <AddReminderModal
          lang={lang}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
