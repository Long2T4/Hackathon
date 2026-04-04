const URGENCY_CONFIG = {
  emergency: {
    badge: 'badge-emergency',
    box: 'urgency-emergency border',
    icon: '🚨',
    labelES: 'EMERGENCIA',
    labelEN: 'EMERGENCY',
    descES: 'Ir a urgencias inmediatamente',
    descEN: 'Go to the ER immediately',
  },
  urgent: {
    badge: 'badge-urgent',
    box: 'urgency-urgent border',
    icon: '⚡',
    labelES: 'URGENTE',
    labelEN: 'URGENT',
    descES: 'Busca atención médica hoy',
    descEN: 'Seek medical care today',
  },
  routine: {
    badge: 'badge-routine',
    box: 'urgency-routine border',
    icon: '📅',
    labelES: 'RUTINA',
    labelEN: 'ROUTINE',
    descES: 'Agenda una cita con tu médico',
    descEN: 'Schedule a doctor appointment',
  },
  selfcare: {
    badge: 'badge-selfcare',
    box: 'urgency-selfcare border',
    icon: '🌿',
    labelES: 'AUTOCUIDADO',
    labelEN: 'SELF-CARE',
    descES: 'Manejo en casa con monitoreo',
    descEN: 'Home management with monitoring',
  },
}

function formatContent(text) {
  // Convert *text* to bold, handle newlines
  const parts = text.split(/(\*[^*]+\*|\n)/g)
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-gray-600 not-italic font-medium">{part.slice(1, -1)}</em>
    }
    if (part === '\n') return <br key={i} />
    return part
  })
}

export default function MessageBubble({ message, lang }) {
  const isUser = message.role === 'user'
  const urgency = message.urgency ? URGENCY_CONFIG[message.urgency] : null

  return (
    <div className={`message-bubble flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-2 mt-auto flex-shrink-0">
          <span className="text-sm">🏥</span>
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        {/* Urgency badge */}
        {urgency && (
          <div className={`w-full rounded-2xl p-3 ${urgency.box}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${urgency.badge}`}>
                {urgency.icon} {lang === 'es' ? urgency.labelES : urgency.labelEN}
              </span>
            </div>
            <p className="text-xs font-medium">
              {lang === 'es' ? urgency.descES : urgency.descEN}
            </p>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-3xl text-sm leading-relaxed ${
            isUser
              ? 'bg-teal-600 text-white rounded-br-lg'
              : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-lg'
          }`}
        >
          {formatContent(message.content)}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-gray-400 px-1">
          {message.timestamp?.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  )
}
