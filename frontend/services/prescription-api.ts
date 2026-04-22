import type { PrescriptionPayload, PrescriptionResponse } from '@/types'
import { handleResponse, buildApiError } from '@/lib/utils'

// =============================================================================
// ANNOTATION CONVENTION — same as types/index.ts
// "Confirmed"  → validated against the backend.
// [HYPOTHESIS] → assumed; must be confirmed before going beyond POC.
// =============================================================================

// ─── POST /api/prescriptions/ ────────────────────────────────────────────────
//
// [HYPOTHESIS] Request: application/json — PrescriptionPayload
//   session_id, patient_info, doctor_language, patient_language, lines[],
//   consultation_notes?, diagnostic?
//
// [HYPOTHESIS] Response: { id, session_id?, created_at? }
//   Only `id` is treated as confirmed — it is required to call the PDF endpoint.
//   `session_id` and `created_at` are optional extras that we store if present.
//
// Normalisation: throw if `id` is missing (would make the PDF download impossible).

type RawPrescriptionResponse = {
  id?: string           // treated as required; throw if absent
  session_id?: string   // [HYPOTHESIS]
  created_at?: string   // [HYPOTHESIS]
}

export async function createPrescription(
  payload: PrescriptionPayload,
): Promise<PrescriptionResponse> {
  const res = await fetch('/api/prescriptions/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const raw = await handleResponse<RawPrescriptionResponse>(res)

  if (!raw.id) {
    // The response was 2xx but did not include an id — we cannot proceed.
    throw buildApiError(res.status, {
      detail: 'La réponse du serveur ne contient pas d\'identifiant de prescription.',
    })
  }

  return {
    id: raw.id,
    session_id: raw.session_id,
    created_at: raw.created_at,
  }
}

// ─── GET /api/prescriptions/{id}/pdf/ ────────────────────────────────────────
//
// Confirmed endpoint path.
// [HYPOTHESIS] Response: application/pdf binary blob.
//   The backend may return a non-PDF content type or an error body;
//   we do not attempt to parse the error as JSON (PDF endpoints rarely return
//   JSON errors) — we build an ApiError from the status code alone.

export async function downloadPrescriptionPdf(prescriptionId: string): Promise<Blob> {
  const res = await fetch(`/api/prescriptions/${prescriptionId}/pdf/`)

  if (!res.ok) {
    // Use buildApiError so callers receive a consistent ApiError, not a bare Error.
    // We do not call res.json() here: a PDF endpoint failing will not return JSON.
    throw buildApiError(res.status, {
      detail: `Impossible de télécharger l'ordonnance PDF (${res.status}).`,
    })
  }

  return res.blob()
}

// ─── Browser download helper ─────────────────────────────────────────────────
//
// Pure DOM utility — no network call, no error state.
// Creates a temporary object URL, triggers the download, then revokes the URL.

export function triggerPdfDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
