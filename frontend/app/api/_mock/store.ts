// In-memory store for mock sessions and prescriptions.
// Resets on dev server restart — intentional for a POC mock.
// Delete the entire app/api/ directory when the real backend is ready.

export interface MockSession {
  id: string
  created_at: string
  expires_at: string
  consultations: MockConsultation[]
  prescriptions: MockPrescription[]
}

export interface MockConsultation {
  id: string
  created_at: string
  patient_first_name: string
  patient_last_name: string
  diagnostic: string
  doctor_language: string
  patient_language: string
}

export interface MockPrescription {
  id: string
  created_at: string
  patient_last_name: string
  doctor_language: string
  patient_language: string
}

function mockDate(offsetHours = 0): string {
  return new Date(Date.now() + offsetHours * 3_600_000).toISOString()
}

export const sessions = new Map<string, MockSession>()
export const prescriptions = new Map<string, MockPrescription & { session_id: string }>()

export function createSession(): MockSession {
  const id = crypto.randomUUID()
  const session: MockSession = {
    id,
    created_at: mockDate(),
    expires_at: mockDate(24),
    consultations: [
      {
        id: crypto.randomUUID(),
        created_at: mockDate(-1),
        patient_first_name: 'Amara',
        patient_last_name: 'Diallo',
        diagnostic: 'Paludisme simple',
        doctor_language: 'fr',
        patient_language: 'wo',
      },
    ],
    prescriptions: [],
  }
  sessions.set(id, session)
  return session
}

export function delay(ms = 800): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
