import type { Session, SessionDetails, NormalisedSession } from '@/types'
import { handleResponse } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Shape of the raw JSON returned by GET /api/sessions/{id}/.
// Only the base Session fields are confirmed; the rest are optional because
// the backend may not yet return embedded history.
type RawSessionResponse = Session & Partial<Pick<SessionDetails, 'consultations' | 'prescriptions'>>

// ─── API calls ───────────────────────────────────────────────────────────────

// Confirmed: POST /api/sessions/ → Session
export async function createSession(): Promise<Session> {
  const res = await fetch('/api/sessions/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  return handleResponse<Session>(res)
}

// [HYPOTHESIS] GET /api/sessions/{id}/ is expected to return the base Session
// fields plus optional embedded `consultations` and `prescriptions` arrays.
//
// This function always returns a NormalisedSession:
// - Base fields (id, created_at, expires_at) come from the response.
// - `consultations` and `prescriptions` default to [] if absent, so callers
//   never need to handle undefined.
//
// Errors:
//   404 → session was purged or never existed (treated as "expired" by useSession)
//   other → network or server error (surfaced as ApiError)
export async function getSession(id: string): Promise<NormalisedSession> {
  const res = await fetch(`/api/sessions/${id}/`)
  const raw = await handleResponse<RawSessionResponse>(res)

  return {
    id: raw.id,
    created_at: raw.created_at,
    expires_at: raw.expires_at,
    consultations: raw.consultations ?? [],
    prescriptions: raw.prescriptions ?? [],
  }
}
