import type {
  SpeechToTextResult,
  DetectedLanguage,
  TranslationResult,
  FullPipelineResult,
} from '@/types'
import { handleResponse, getLanguageName } from '@/lib/utils'

// =============================================================================
// ANNOTATION CONVENTION — same as types/index.ts
// "Confirmed"  → validated against the backend.
// [HYPOTHESIS] → assumed from domain knowledge; must be confirmed.
// =============================================================================

// ─── POST /api/inference/speech-to-text/ ────────────────────────────────────
//
// [HYPOTHESIS] Request: multipart/form-data
//   audio      File     — WAV or MP3 recording
//   session_id string   — active session id
//   language   string?  — optional hint (language code); omit for auto-detect
//
// [HYPOTHESIS] Response: { text, confidence?, detected_language? }
//   `confidence` and `detected_language` may be absent depending on the model.
//   They are optional in SpeechToTextResult; callers must handle undefined.
//   No normalisation is applied: the raw response is sufficient as-is.

export async function speechToText(
  audio: File,
  sessionId: string,
  language?: string,
): Promise<SpeechToTextResult> {
  const form = new FormData()
  form.append('audio', audio)
  form.append('session_id', sessionId)
  if (language) form.append('language', language)

  const res = await fetch('/api/inference/speech-to-text/', {
    method: 'POST',
    body: form,
  })
  return handleResponse<SpeechToTextResult>(res)
}

// ─── POST /api/inference/detect-language/ ───────────────────────────────────
//
// [HYPOTHESIS] Request: application/json
//   { text: string, session_id: string }
//
// [HYPOTHESIS] Response: { language_code, language_name?, confidence }
//   `language_name` is a human-readable label that may be absent.
//   Normalisation: if absent, derive it from `language_code` via getLanguageName()
//   so callers always receive a displayable string.

type RawDetectedLanguage = Omit<DetectedLanguage, 'language_name'> & {
  language_name?: string
}

export async function detectLanguage(
  text: string,
  sessionId: string,
): Promise<DetectedLanguage> {
  const res = await fetch('/api/inference/detect-language/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, session_id: sessionId }),
  })
  const raw = await handleResponse<RawDetectedLanguage>(res)

  return {
    language_code: raw.language_code,
    confidence: raw.confidence,
    language_name: raw.language_name ?? getLanguageName(raw.language_code),
  }
}

// ─── POST /api/inference/translate/ ─────────────────────────────────────────
//
// [HYPOTHESIS] Request: application/json
//   {
//     text:            string  — source text
//     source_language: string  — language code of the source
//     target_language: string  — language code of the target
//     session_id:      string
//   }
//
// [HYPOTHESIS] Response: { translated_text, source_language, target_language }
//   All three fields are expected to be present when the call succeeds.
//   No normalisation needed.

export async function translate(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  sessionId: string,
): Promise<TranslationResult> {
  const res = await fetch('/api/inference/translate/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      session_id: sessionId,
    }),
  })
  return handleResponse<TranslationResult>(res)
}

// ─── POST /api/inference/full-pipeline/ ─────────────────────────────────────
//
// [HYPOTHESIS] Request: multipart/form-data
//   audio           File    — patient audio recording
//   doctor_language string  — language code chosen by the doctor
//   session_id      string
//
// [HYPOTHESIS] Response:
//   {
//     transcription:        string   — ASR output in patient's language
//     detected_language:    string   — language code identified by LID
//     detected_language_name?: string — human-readable label (may be absent)
//     translation?:         string   — MT output in doctor's language; absent
//                                      when detected_language === doctor_language
//     confidence:           number   — ASR quality score 0–1
//   }
//
// Normalisation:
//   - `detected_language_name` is filled from getLanguageName() if absent.
//   - `translation` is kept as undefined when absent (no silent empty string).

type RawFullPipelineResponse = Omit<FullPipelineResult, 'detected_language_name'> & {
  detected_language_name?: string
}

export async function fullPipeline(
  audio: File,
  doctorLanguage: string,
  sessionId: string,
): Promise<FullPipelineResult> {
  const form = new FormData()
  form.append('audio', audio)
  form.append('doctor_language', doctorLanguage)
  form.append('session_id', sessionId)

  const res = await fetch('/api/inference/full-pipeline/', {
    method: 'POST',
    body: form,
  })
  const raw = await handleResponse<RawFullPipelineResponse>(res)

  return {
    transcription: raw.transcription,
    detected_language: raw.detected_language,
    detected_language_name:
      raw.detected_language_name ?? getLanguageName(raw.detected_language),
    translation: raw.translation,
    confidence: raw.confidence,
  }
}
