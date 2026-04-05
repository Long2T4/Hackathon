const BASE_URL = '/api'

export async function sendMessage(message, history, lang, fileData = null) {
  const body = { message, history, lang }

  if (fileData) {
    body.file = {
      base64: fileData.base64,
      mediaType: fileData.mediaType,
      fileName: fileData.fileName,
    }
  }

  const response = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${response.status}`)
  }

  return response.json()
}

export async function fetchClinics(lat, lng, radius = 8000) {
  const response = await fetch(
    `${BASE_URL}/clinics?lat=${lat}&lng=${lng}&radius=${radius}`
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${response.status}`)
  }

  return response.json()
}

export async function generateVisitCardData(chatSummary, lang) {
  const response = await fetch(`${BASE_URL}/visit-card`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatSummary, lang }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${response.status}`)
  }

  return response.json()
}