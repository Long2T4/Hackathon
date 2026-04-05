import { jsPDF } from 'jspdf'

export function generateVisitCardPDF(data) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 15
  const colW = (pageW - margin * 3) / 2
  const leftCol = margin
  const rightCol = margin * 2 + colW

  // ── Header ──────────────────────────────────────────────────────────────────
  doc.setFillColor(124, 58, 237)
  doc.rect(0, 0, pageW, 36, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('MiSalud', margin, 15)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Tarjeta de Visita Médica  |  Medical Visit Card', margin, 23)

  const now = new Date()
  const dateStr = now.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(`Assessment time: ${dateStr} at ${timeStr}`, pageW - margin, 23, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('(Verify with patient if >2 hours old)', pageW - margin, 28, { align: 'right' })

  // ── Patient Info ─────────────────────────────────────────────────────────
  let y = 44

  if (data.patientName || data.patientDOB) {
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(margin, y, pageW - margin * 2, 22, 2, 2, 'F')
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.3)
    doc.roundedRect(margin, y, pageW - margin * 2, 22, 2, 2, 'S')

    doc.setTextColor(75, 85, 99)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text('Paciente / Patient:', margin + 3, y + 7)

    doc.setFont('helvetica', 'normal')
    doc.text(data.patientName || '—', margin + 38, y + 7)

    if (data.patientDOB) {
      doc.setFont('helvetica', 'bold')
      doc.text('DOB:', margin + 3, y + 14)
      doc.setFont('helvetica', 'normal')
      doc.text(data.patientDOB, margin + 14, y + 14)
    }

    if (data.insuranceProvider && data.insuranceProvider !== 'Sin seguro / Uninsured') {
      doc.setFont('helvetica', 'bold')
      doc.text('Seguro / Insurance:', pageW / 2 + 3, y + 7)
      doc.setFont('helvetica', 'normal')
      doc.text(data.insuranceProvider, pageW / 2 + 38, y + 7)
      if (data.insuranceId) {
        doc.setFont('helvetica', 'bold')
        doc.text('ID:', pageW / 2 + 3, y + 14)
        doc.setFont('helvetica', 'normal')
        doc.text(data.insuranceId, pageW / 2 + 10, y + 14)
      }
    }

    if (data.allergies) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(185, 28, 28)
      doc.text('ALERGIAS / ALLERGIES:', margin + 3, y + 14)
      doc.setFont('helvetica', 'normal')
      doc.text(data.allergies, margin + 43, y + 14)
      doc.setTextColor(75, 85, 99)
    }

    y += 28
  }

  // ── Medications ───────────────────────────────────────────────────────────
  if (data.medications) {
    doc.setFillColor(254, 252, 232)
    doc.roundedRect(margin, y, pageW - margin * 2, 14, 2, 2, 'F')
    doc.setTextColor(133, 77, 14)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text('Medicamentos actuales / Current Medications:', margin + 3, y + 6)
    doc.setFont('helvetica', 'normal')
    const medLines = doc.splitTextToSize(data.medications, pageW - margin * 2 - 6)
    doc.text(medLines, margin + 3, y + 12)
    y += 8 + medLines.length * 4 + 6
  }

  // ── Clinician Summary ────────────────────────────────────────────────────
  if (data.clinicianSummary) {
    doc.setFillColor(239, 246, 255)
    doc.roundedRect(margin, y, pageW - margin * 2, 22, 2, 2, 'F')
    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(0.5)
    doc.roundedRect(margin, y, pageW - margin * 2, 22, 2, 2, 'S')

    doc.setTextColor(30, 64, 175)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text('CLINICIAN SUMMARY (English)', margin + 3, y + 6)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(30, 58, 138)

    const summaryLines = doc.splitTextToSize(data.clinicianSummary, pageW - margin * 2 - 6)
    doc.text(summaryLines, margin + 3, y + 13)
    y += 28
  }

  // ── Urgency Banner ───────────────────────────────────────────────────────
  const urgencyColors = {
    emergency: [239, 68, 68],
    urgent: [249, 115, 22],
    routine: [59, 130, 246],
    selfcare: [34, 197, 94],
  }
  const urgencyLabels = {
    emergency: ['EMERGENCIA — Ir a urgencias ahora', 'EMERGENCY — Go to ER immediately'],
    urgent: ['URGENTE — Atencion hoy', 'URGENT — Seek care today'],
    routine: ['RUTINA — Agendar cita', 'ROUTINE — Schedule appointment'],
    selfcare: ['AUTOCUIDADO — Monitorear en casa', 'SELF-CARE — Monitor at home'],
  }

  if (data.urgency && urgencyLabels[data.urgency]) {
    const [r, g, b] = urgencyColors[data.urgency] || [124, 58, 237]
    doc.setFillColor(r, g, b)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.roundedRect(margin, y, pageW - margin * 2, 12, 2, 2, 'F')
    const [esLabel, enLabel] = urgencyLabels[data.urgency]
    doc.text(esLabel, margin + 3, y + 8)
    doc.text(enLabel, pageW / 2 + 3, y + 8)
    y += 17
  }

  // ── Column Headers ───────────────────────────────────────────────────────
  doc.setTextColor(124, 58, 237)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Espanol', leftCol, y)
  doc.text('English', rightCol, y)

  y += 4
  doc.setDrawColor(124, 58, 237)
  doc.setLineWidth(0.4)
  doc.line(margin, y, pageW - margin, y)

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(pageW / 2, y - 4, pageW / 2, 270)

  // ── Section Helper ────────────────────────────────────────────────────────
  function addSection(titleES, titleEN, contentES, contentEN, currentY) {
    let y = currentY + 8

    doc.setTextColor(31, 41, 55)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(titleES, leftCol, y)
    doc.text(titleEN, rightCol, y)

    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(75, 85, 99)

    const esLines = doc.splitTextToSize(contentES || '—', colW - 2)
    const enLines = doc.splitTextToSize(contentEN || '—', colW - 2)

    doc.text(esLines, leftCol, y)
    doc.text(enLines, rightCol, y)

    const maxLines = Math.max(esLines.length, enLines.length)
    y += maxLines * 5 + 2

    doc.setDrawColor(229, 231, 235)
    doc.line(margin, y, pageW - margin, y)

    return y
  }

  // ── Sections ──────────────────────────────────────────────────────────────
  y = addSection(
    'Síntomas del Paciente',
    'Patient Symptoms',
    data.symptomsES || data.symptoms,
    data.symptomsEN || data.symptoms,
    y
  )

  y = addSection(
    'Evaluación de MiSalud',
    'MiSalud Assessment',
    data.assessmentES || data.assessment,
    data.assessmentEN || data.assessment,
    y
  )

  y = addSection(
    'Preguntas para el Doctor',
    'Questions for the Doctor',
    Array.isArray(data.questionsES)
      ? data.questionsES.map((q, i) => `${i + 1}. ${q}`).join('\n')
      : data.questions || '—',
    Array.isArray(data.questionsEN)
      ? data.questionsEN.map((q, i) => `${i + 1}. ${q}`).join('\n')
      : data.questions || '—',
    y
  )

  // ── Disclaimer ────────────────────────────────────────────────────────────
  y += 8
  doc.setFillColor(254, 243, 199)
  doc.roundedRect(margin, y - 4, pageW - margin * 2, 16, 2, 2, 'F')
  doc.setTextColor(146, 64, 14)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text(
    'Esto no es un diagnostico medico. Consulte a un profesional de la salud.',
    pageW / 2, y + 1, { align: 'center' }
  )
  doc.setFont('helvetica', 'normal')
  doc.text(
    'This is not a medical diagnosis. Please consult a healthcare professional.',
    pageW / 2, y + 7, { align: 'center' }
  )

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setFillColor(249, 250, 251)
  doc.rect(0, 274, pageW, 22, 'F')
  doc.setTextColor(156, 163, 175)
  doc.setFontSize(7)
  doc.text(
    `misalud.app  |  Generated by MiSalud AI  |  ${dateStr} ${timeStr}`,
    pageW / 2, 282, { align: 'center' }
  )

  doc.save('MiSalud_Tarjeta_de_Visita.pdf')
}