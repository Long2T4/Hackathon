import { MapPin, Star, Clock, Navigation } from 'lucide-react'

export default function ClinicCard({ clinic, lang }) {
  const t = (es, en) => lang === 'es' ? es : en

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    clinic.address
  )}&destination_place_id=${clinic.place_id || ''}`

  const starRating = Math.round(clinic.rating || 0)

  return (
    <div className="card p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight flex-1">
          {clinic.name}
        </h3>
        {clinic.open_now !== undefined && (
          <span
            className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
              clinic.open_now
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {clinic.open_now
              ? t('Abierto', 'Open')
              : t('Cerrado', 'Closed')}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            className={i < starRating ? 'text-orange-400 fill-orange-400' : 'text-gray-200 fill-gray-200'}
          />
        ))}
        {clinic.rating && (
          <span className="text-xs text-gray-500 ml-1">{clinic.rating.toFixed(1)}</span>
        )}
      </div>

      <div className="flex items-start gap-1.5 mb-1 text-xs text-gray-500">
        <MapPin size={12} className="mt-0.5 flex-shrink-0 text-teal-500" />
        <span>{clinic.address}</span>
      </div>

      {clinic.distance && (
        <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-400">
          <Navigation size={11} className="text-teal-400" />
          <span>{(clinic.distance / 1000).toFixed(1)} km</span>
        </div>
      )}

      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary w-full text-sm py-2 min-h-[40px]"
        aria-label={t(`Obtener direcciones a ${clinic.name}`, `Get directions to ${clinic.name}`)}
      >
        <Navigation size={14} />
        {t('Cómo llegar', 'Get Directions')}
      </a>
    </div>
  )
}
