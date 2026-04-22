import { NextResponse } from 'next/server'
import { prescriptions, delay } from '../../../_mock/store'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await delay(400)
  const { id } = await params
  const prescription = prescriptions.get(id)

  const patientName = prescription?.patient_last_name || 'Patient'
  const doctorLang = prescription?.doctor_language ?? 'fr'
  const patientLang = prescription?.patient_language ?? 'fr'

  const content = [
    '=== ORDONNANCE MÉDICALE (MOCK) ===',
    '',
    `Patient : ${patientName}`,
    `Médecin (langue) : ${doctorLang.toUpperCase()}`,
    `Patient (langue) : ${patientLang.toUpperCase()}`,
    `Prescription ID : ${id}`,
    `Générée le : ${new Date().toLocaleString('fr-FR')}`,
    '',
    '--- Ceci est un document de démonstration. ---',
    '--- Remplacer par le vrai PDF du backend.  ---',
  ].join('\n')

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ordonnance-mock-${id.slice(0, 8)}.pdf"`,
    },
  })
}
