import { useState } from 'react'
import { MapPin, Loader2, AlertCircle } from 'lucide-react'
import { useGeolocation } from '../hooks/useGeolocation.js'
import { fetchClinics } from '../utils/api.js'
import ClinicCard from './ClinicCard.jsx'

export default function ClinicFinder({ lang }) {
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)
  const { location, locationError, locationLoading, getLocation } = useGeolocation()

  const t = (es, en) => lang === 'es' ? es : en

  const handleFind = async () => {
    setError(null)
    setLoading(true)

    try {
      let loc = location
      if (!loc) {
        await new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'))
            return
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
              resolve()
            },
            (err) => reject(err),
            { timeout: 10000 }
          )
        })
      }

      const data = await fetchClinics(loc.lat, loc.lng, 8000)
      setClinics(data.clinics || [])
      setSearched(true)
    } catch (err) {
      setError(
        t(
          'No pudimos obtener tu ubicación o los resultados. Verifique los permisos de ubicación.',
          'Could not get your location or results. Please check location permissions.'
        )
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleFind}
        disabled={loading}
        className="btn-secondary w-full"
        aria-label={t('Encontrar clínicas cercanas', 'Find nearby clinics')}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <MapPin size={18} />
        )}
        {loading
          ? t('Buscando clínicas...', 'Searching clinics...')
          : t('Clínicas Cerca de Mí', 'Find Clinics Near Me')}
      </button>

      {error && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 rounded-2xl text-red-700 text-sm">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {searched && clinics.length === 0 && !error && (
        <p className="mt-3 text-center text-sm text-gray-500">
          {t('No encontramos clínicas en tu área.', 'No clinics found near you.')}
        </p>
      )}

      {clinics.length > 0 && (
        <div className="mt-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {t(`${clinics.length} clínicas encontradas`, `${clinics.length} clinics found`)}
          </h3>
          {clinics.map((clinic, i) => (
            <ClinicCard key={clinic.place_id || i} clinic={clinic} lang={lang} />
          ))}
        </div>
      )}
    </div>
  )
}
