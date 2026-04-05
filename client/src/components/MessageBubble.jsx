const URGENCY_CONFIG = {
  emergency: {
    badge: 'badge-emergency',
    box: 'urgency-emergency border',
    icon: '🚨',
    labelES: 'EMERGENCIA',
    labelEN: 'EMERGENCY',
    descES: 'Ir a urgencias inmediatamente',
    descEN: 'Go to the ER immediately',
    emergency: true,
  },
  urgent: {
    badge: 'badge-urgent',
    box: 'urgency-urgent border',
    icon: '⚡',
    labelES: 'URGENTE',
    labelEN: 'URGENT',
    descES: 'Busca atención médica hoy',
    descEN: 'Seek medical care today',
    emergency: false,
  },
  routine: {
    badge: 'badge-routine',
    box: 'urgency-routine border',
    icon: '📅',
    labelES: 'RUTINA',
    labelEN: 'ROUTINE',
    descES: 'Agenda una cita con tu médico',
    descEN: 'Schedule a doctor appointment',
    emergency: false,
  },
  selfcare: {
    badge: 'badge-selfcare',
    box: 'urgency-selfcare border',
    icon: '🌿',
    labelES: 'AUTOCUIDADO',
    labelEN: 'SELF-CARE',
    descES: 'Manejo en casa con monitoreo',
    descEN: 'Home management with monitoring',
    emergency: false,
  },
}

function renderMarkdown(text, dark) {
  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()

    // Skip empty lines but add spacing
    if (!line) {
      elements.push(<div key={i} className="h-2" />)
      i++
      continue
    }

    // ## Heading
    if (line.startsWith('## ')) {
      elements.push(
        <p key={i} className={`font-bold text-sm mt-2 mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>
          {line.replace('## ', '')}
        </p>
      )
      i++
      continue
    }

    // # Heading
    if (line.startsWith('# ')) {
      elements.push(
        <p key={i} className={`font-bold text-base mt-2 mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>
          {line.replace('# ', '')}
        </p>
      )
      i++
      continue
    }

    // --- divider
    if (line === '---') {
      elements.push(
        <div key={i} className={`my-2 h-px ${dark ? 'bg-white/10' : 'bg-gray-100'}`} />
      )
      i++
      continue
    }

    // Bullet point - or *
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const bulletText = line.replace(/^[-*] /, '')
      elements.push(
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dark ? 'bg-yellow-400' : 'bg-violet-500'}`} />
          <span className={`text-sm leading-relaxed ${dark ? 'text-white/90' : 'text-gray-700'}`}>
            {renderInline(bulletText, dark)}
          </span>
        </div>
      )
      i++
      continue
    }

    // Red flag bullet 🚩
    if (line.startsWith('🚩')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span className="text-sm flex-shrink-0">🚩</span>
          <span className={`text-sm leading-relaxed font-medium ${dark ? 'text-red-300' : 'text-red-700'}`}>
            {line.replace('🚩', '').trim()}
          </span>
        </div>
      )
      i++
      continue
    }

    // Regular paragraph
    elements.push(
      <p key={i} className={`text-sm leading-relaxed ${dark ? 'text-white/80' : 'text-gray-700'}`}>
        {renderInline(line, dark)}
      </p>
    )
    i++
  }

  return elements
}

function renderInline(text, dark) {
  // Handle **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

export default function MessageBubble({ message, lang, dark }) {
  const isUser = message.role === 'user'
  const urgency = message.urgency ? URGENCY_CONFIG[message.urgency] : null

  return (
    <div className={`message-bubble flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 mt-auto flex-shrink-0 ${dark ? 'bg-white/10' : 'bg-violet-100'}`}>
          <span className="text-sm">🤖</span>
        </div>
      )}

      <div className={`max-w-[88%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>

        {/* Urgency box */}
        {urgency && (
          <div className={`w-full rounded-2xl p-3 ${urgency.box}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${urgency.badge}`}>
                {urgency.icon} {lang === 'es' ? urgency.labelES : urgency.labelEN}
              </span>
            </div>
            <p className="text-xs font-medium mb-2">
              {lang === 'es' ? urgency.descES : urgency.descEN}
            </p>
            {urgency.emergency && (
              <div className="flex gap-2">
                <a href="tel:911" className="flex-1 bg-red-500 text-white text-xs font-bold py-2.5 rounded-xl text-center">📞 {lang === 'es' ? 'Llamar al 911' : 'Call 911'}</a>
                <a href="https://www.google.com/maps/search/emergency+room+near+me" target="_blank" rel="noopener noreferrer" className="flex-1 bg-white text-red-600 text-xs font-bold py-2.5 rounded-xl text-center border border-red-200">🏥 {lang === 'es' ? 'Urgencias cercanas' : 'Nearest ER'}</a>
              </div>
            )}
          </div>
        )}

        {/* Message bubble */}
        {isUser ? (
          <div className={`px-4 py-3 rounded-3xl rounded-br-lg text-sm leading-relaxed font-medium ${dark ? 'bg-yellow-400 text-gray-900' : 'bg-violet-600 text-white'}`}>
            {message.content}
          </div>
        ) : (
          <div className={`px-4 py-3 rounded-3xl rounded-bl-lg ${dark ? 'bg-white/10 backdrop-blur' : 'bg-white border border-gray-100 shadow-sm'}`}>
            {renderMarkdown(message.content, dark)}
          </div>
        )}

        {/* Timestamp */}
        <span className={`text-[10px] px-1 ${dark ? 'text-white/30' : 'text-gray-400'}`}>
          {message.timestamp?.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  )
}