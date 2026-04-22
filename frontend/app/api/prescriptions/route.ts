import { NextResponse } from 'next/server'
import { sessions, prescriptions, delay } from '../_mock/store'

export async function POST(req: Request) {
  await delay(500)
  const body = await req.json()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const prescription = {
    id,
    session_id: body.session_id,
    created_at: now,
    patient_last_name: body.patient_info?.last_name ?? '',
    doctor_language: body.doctor_language ?? 'fr',
    patient_language: body.patient_language ?? 'fr',
  }

  prescriptions.set(id, prescription)

  // Attach to session history so the history page reflects it.
  const session = sessions.get(body.session_id)
  if (session) {
    session.prescriptions.push(prescription)
  }

  return NextResponse.json({ id, session_id: body.session_id, created_at: now }, { status: 201 })
}
