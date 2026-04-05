import { useState, useEffect } from 'react'
import { Bell, Calendar, Check, X, ChevronDown, ChevronUp } from 'lucide-react'

const CHECKLIST = [
  { id: 'visitcard', emoji: '📄', es: 'Tarjeta de Visita de MiSalud (PDF)', en: 'MiSalud Visit Card (PDF)' },
  { id: 'id', emoji: '🪪', es: 'Identificación (ID, pasaporte, matrícula)', en: 'ID (passport, driver\'s license)' },
  { id: 'insurance', emoji: '💳', es: 'Tarjeta de seguro (si tienes)', en: 'Insurance card (if you have one)' },
  { id: 'cash', emoji: '💵', es: 'Efectivo para copago (clínicas cobran $20–$40)', en: 'Cash for copay ($20–$40 at clinics)' },
  { id: 'meds', emoji: '💊', es: 'Lista de medicamentos que tomas', en: 'List of current medications' },
  { id: 'symptoms', emoji: '📝', es: 'Notas de tus síntomas (fechas, severidad)', en: 'Symptom notes (dates, severity)' },
  { id: 'questions', emoji: '❓', es: 'Preguntas para el doctor', en: 'Questions for the doctor' },
]

function requestNotificationPermission() {
  if (!('Notification' in window)) return Promise.resolve('denied')
  if (Notification.permission === 'granted') return Promise.resolve('granted')
  return Notification.requestPermission()
}

function scheduleNotification(title, body, date) {
  const delay = date.getTime() - Date.now()
  if (delay <= 0) return

  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
      })
    }
  }, delay)
}

function saveReminder(reminder) {
  const existing = JSON.parse(localStorage.getItem('misalud_reminders') || '[]')
  existing.push(reminder)
  localStorage.setItem('misalud_reminders', JSON.stringify(existing))
}

export function getReminders() {
  return JSON.parse(localStorage.getItem('misalud_reminders') || '[]')
}

export default function ReminderCard({ lang, urgency, symptoms }) {
  const [step, setStep] = useState('prompt') // prompt | form | confirmed
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [reminderType, setReminderType] = useState('book') // book | appointment
  const [checkedItems, setCheckedItems] = useState({})
  const [showChecklist, setShowChecklist] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const t = (es, en) => lang === 'es' ? es : en

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setDate(tomorrow.toISOString().split('T')[0])
  }, [])

  const handleSetReminder = async () => {
    const permission = await requestNotificationPermission()
    if (permission !== 'granted') {
      setPermissionDenied(true)
      return
    }

    const reminderDate = new Date(`${date}T${time}`)

    const title = reminderType === 'book'
      ? t('📅 MiSalud — Agenda tu cita', '📅 MiSalud — Book your appointment')
      : t('🏥 MiSalud — Tu cita es hoy', '🏥 MiSalud — Your appointment is today')

    const body = reminderType === 'book'
      ? t(
          `Recuerda agendar tu cita médica. Síntomas: ${symptoms || 'ver tarjeta de visita'}`,
          `Remember to book your medical appointment. Symptoms: ${symptoms || 'see visit card'}`
        )
      : t(
          'No olvides llevar tu ID, tarjeta de visita, lista de medicamentos y preguntas para el doctor.',
          'Don\'t forget your ID, visit card, medication list, and questions for the doctor.'
        )

    scheduleNotification(title, body, reminderDate)

    // Also schedule a "bring your documents" reminder 1 hour before appointment
    if (reminderType === 'appointment') {
      const oneHourBefore = new Date(reminderDate.getTime() - 60 * 60 * 1000)
      scheduleNotification(
        t('🎒 MiSalud — Prepara tus documentos', '🎒 MiSalud — Prepare your documents'),
        t(
          'Tu cita es en 1 hora. Lleva: ID, tarjeta de visita, medicamentos, efectivo.',
          'Your appointment is in 1 hour. Bring: ID, visit card, medications, cash.'
        ),
        oneHourBefore
      )
    }

    saveReminder({
      id: Date.now(),
      type: reminderType,
      date,
      time,
      symptoms,
      urgency,
      createdAt: new Date().toISOString(),
    })

    setStep('confirmed')
  }

  if (step === 'prompt') {
    return (
      <div className="mt-3 bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🗓️</span>
          <div>
            <p className="text-white font-semibold text-sm">
              {t('¿Quieres un recordatorio?', 'Want a reminder?')}
            </p>
            <p className="text-white/50 text-xs">
              {t('Te avisamos cuándo agendar tu cita', 'We\'ll remind you when to book')}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setReminderType('book')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              reminderType === 'book'
                ? 'bg-violet-500 text-white'
                : 'bg-white/10 text-white/60'
            }`}
          >
            {t('📞 Recordar agendar', '📞 Remind to book')}
          </button>
          <button
            onClick={() => setReminderType('appointment')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              reminderType === 'appointment'
                ? 'bg-violet-500 text-white'
                : 'bg-white/10 text-white/60'
            }`}
          >
            {t('🏥 Tengo cita', '🏥 I have appointment')}
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <p className="text-white/40 text-[10px] mb-1">{t('Fecha', 'Date')}</p>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-white/10 text-white text-xs rounded-xl px-3 py-2 outline-none border border-white/10"
            />
          </div>
          <div className="flex-1">
            <p className="text-white/40 text-[10px] mb-1">{t('Hora', 'Time')}</p>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full bg-white/10 text-white text-xs rounded-xl px-3 py-2 outline-none border border-white/10"
            />
          </div>
        </div>

        {permissionDenied && (
          <p className="text-red-400 text-xs mb-2 text-center">
            {t(
              'Activa las notificaciones en tu navegador para recibir recordatorios.',
              'Enable notifications in your browser to receive reminders.'
            )}
          </p>
        )}

        <button
          onClick={handleSetReminder}
          className="w-full bg-violet-500 text-white font-semibold py-2.5 rounded-xl text-sm"
        >
          <Bell size={14} className="inline mr-1" />
          {t('Activar Recordatorio', 'Set Reminder')}
        </button>
      </div>
    )
  }

  if (step === 'confirmed') {
    const appointmentDate = new Date(`${date}T${time}`)
    return (
      <div className="mt-3 space-y-3">
        {/* Confirmed card */}
        <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
            <p className="text-green-300 font-semibold text-sm">
              {t('¡Recordatorio activado!', 'Reminder set!')}
            </p>
          </div>
          <p className="text-white/60 text-xs ml-8">
            {appointmentDate.toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })} — {time}
          </p>
          {reminderType === 'appointment' && (
            <p className="text-white/40 text-[10px] ml-8 mt-1">
              {t(
                '+ Recordatorio 1 hora antes con lista de documentos',
                '+ Reminder 1 hour before with document checklist'
              )}
            </p>
          )}
        </div>

        {/* What to bring checklist */}
        <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/10 overflow-hidden">
          <button
            onClick={() => setShowChecklist(s => !s)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <span>🎒</span>
              <p className="text-white font-semibold text-sm">
                {t('¿Qué llevar a la cita?', 'What to bring?')}
              </p>
            </div>
            {showChecklist
              ? <ChevronUp size={16} className="text-white/40" />
              : <ChevronDown size={16} className="text-white/40" />}
          </button>

          {showChecklist && (
            <div className="px-4 pb-4 space-y-2">
              {CHECKLIST.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCheckedItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    checkedItems[item.id]
                      ? 'bg-green-500 border-green-500'
                      : 'border-white/30'
                  }`}>
                    {checkedItems[item.id] && <Check size={10} className="text-white" />}
                  </div>
                  <span className="text-sm">
                    {item.emoji}{' '}
                    <span className={checkedItems[item.id] ? 'text-white/30 line-through' : 'text-white/80'}>
                      {lang === 'es' ? item.es : item.en}
                    </span>
                  </span>
                </button>
              ))}

              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-white/30 text-[10px] text-center">
                  {Object.values(checkedItems).filter(Boolean).length}/{CHECKLIST.length} {t('preparado', 'ready')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}