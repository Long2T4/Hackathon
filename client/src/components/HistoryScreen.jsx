import { useState, useEffect } from 'react'
import { Trash2, ChevronDown, ChevronUp, Clock, AlertTriangle } from 'lucide-react'
import { getSessions, deleteSession, clearSessions } from '../utils/sessionHistory.js'

const URGENCY_COLORS = {
  emergency: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  urgent: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  routine: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  selfcare: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
}

function SessionCard({ session, lang, onDelete, onRestore }) {
  const [expanded, setExpanded] = useState(false)
  const t = (es, en) => lang === 'es' ? es : en
  const colors = URGENCY_COLORS[session.urgency] || URGENCY_COLORS.routine
  const date = new Date(session.date)
  const dateStr = date.toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  return (
    <div className={`rounded-2xl border ${colors.bg} ${colors.border} overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${colors.dot}`} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{session.likelyConcern}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock size={10} className="text-gray-400" />
                <span className="text-[11px] text-gray-400">{dateStr} · {timeStr}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{session.symptoms}</p>
            </div>
          </div>
          <button onClick={() => onDelete(session.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1 flex-shrink-0">
            <Trash2 size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${colors.badge}`}>
            {session.urgency}
          </span>
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-[11px] text-gray-400 font-medium"
          >
            {expanded ? t('Menos', 'Less') : t('Ver detalles', 'See details')}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-black/5">
          {session.summary && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('Evaluacion', 'Assessment')}</p>
              <p className="text-xs text-gray-700 leading-relaxed">{session.summary}</p>
            </div>
          )}

          {session.redFlags?.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle size={11} className="text-red-500" />
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{t('Senales de alarma', 'Red Flags')}</p>
              </div>
              <div className="space-y-0.5">
                {session.redFlags.map((f, i) => (
                  <p key={i} className="text-xs text-red-700">• {f}</p>
                ))}
              </div>
            </div>
          )}

          {session.questions?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('Preguntas para el doctor', 'Questions for doctor')}</p>
              <div className="space-y-0.5">
                {session.questions.map((q, i) => (
                  <p key={i} className="text-xs text-gray-600">{i + 1}. {q}</p>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => onRestore(session)}
            className="w-full bg-violet-600 text-white text-xs font-bold py-2.5 rounded-xl mt-1"
          >
            {t('Restaurar esta consulta', 'Restore this consultation')}
          </button>
        </div>
      )}
    </div>
  )
}

export default function HistoryScreen({ lang, onRestore }) {
  const [sessions, setSessions] = useState([])
  const [confirmClear, setConfirmClear] = useState(false)
  const t = (es, en) => lang === 'es' ? es : en

  useEffect(() => { setSessions(getSessions()) }, [])

  const handleDelete = (id) => {
    deleteSession(id)
    setSessions(getSessions())
  }

  const handleClear = () => {
    if (confirmClear) {
      clearSessions()
      setSessions([])
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F7FA]">
      <div className="px-4 pt-5 pb-3 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">{t('Historial de Consultas', 'Consultation History')}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{sessions.length} {t('consultas guardadas', 'saved consultations')}</p>
        </div>
        {sessions.length > 0 && (
          <button onClick={handleClear} className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${confirmClear ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
            {confirmClear ? t('Confirmar borrar', 'Confirm delete') : t('Borrar todo', 'Clear all')}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
              <Clock size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold mb-1">{t('Sin historial aun', 'No history yet')}</p>
            <p className="text-gray-400 text-sm max-w-[200px]">
              {t('Tus consultas apareceran aqui despues de completar un analisis', 'Your consultations will appear here after completing an analysis')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                lang={lang}
                onDelete={handleDelete}
                onRestore={onRestore}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
