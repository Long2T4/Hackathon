const KEY = 'misalud_sessions'
const MAX_SESSIONS = 20

export function saveSession({ symptomsData, analysisData }) {
  if (!symptomsData || !analysisData) return
  const sessions = getSessions()
  const session = {
    id: Date.now(),
    date: new Date().toISOString(),
    symptoms: symptomsData.text || '',
    severity: symptomsData.severity || '',
    duration: symptomsData.duration || '',
    likelyConcern: analysisData.likelyConcern || '',
    urgency: analysisData.urgency || 'routine',
    summary: analysisData.summary || '',
    questions: analysisData.questions || [],
    redFlags: analysisData.redFlags || [],
    clinicalGuidance: analysisData.clinicalGuidance || '',
  }
  const updated = [session, ...sessions].slice(0, MAX_SESSIONS)
  localStorage.setItem(KEY, JSON.stringify(updated))
  return session
}

export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function deleteSession(id) {
  const updated = getSessions().filter(s => s.id !== id)
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function clearSessions() {
  localStorage.removeItem(KEY)
}
