// =============================================================================
// ANNOTATION CONVENTION
// "Confirmed"  → field/shape validated against the actual backend contract.
// [HYPOTHESIS] → field/shape assumed from domain knowledge or prototype code.
//               Must be confirmed before this goes beyond POC.
// =============================================================================

// ─── Session ─────────────────────────────────────────────────────────────────

// Confirmed: POST /api/sessions/ → { id, created_at, expires_at }
export interface Session {
  id: string
  created_at: string
  expires_at: string
}

// [HYPOTHESIS] Shape of one consultation entry embedded in session history.
// All fields beyond `id` and `created_at` are hypothetical.
// To confirm: exact field names returned by GET /api/sessions/{id}/.
export interface ConsultationSummary {
  id: string
  created_at: string
  patient_first_name: string  // [HYPOTHESIS]
  patient_last_name: string   // [HYPOTHESIS]
  diagnostic: string          // [HYPOTHESIS]
  doctor_language: string     // [HYPOTHESIS]
  patient_language: string    // [HYPOTHESIS]
}

// [HYPOTHESIS] Shape of one prescription entry embedded in session history.
// To confirm: whether GET /api/sessions/{id}/ returns prescriptions at all,
// and what fields each entry contains.
export interface PrescriptionSummary {
  id: string
  created_at: string
  patient_last_name: string   // [HYPOTHESIS]
  doctor_language: string     // [HYPOTHESIS]
  patient_language: string    // [HYPOTHESIS]
}

// [HYPOTHESIS] Extended session shape expected from GET /api/sessions/{id}/.
// The `consultations` and `prescriptions` arrays are optional because the
// backend may return only the base Session fields.
// The service layer (session-api.ts) normalises the response and always fills
// these arrays (defaulting to []), so consumers never need to handle undefined.
export interface SessionDetails extends Session {
  consultations?: ConsultationSummary[]  // [HYPOTHESIS]
  prescriptions?: PrescriptionSummary[]  // [HYPOTHESIS]
}

// Post-normalisation type: guaranteed by session-api.getSession().
// The rest of the app works exclusively with this shape.
export type NormalisedSession = Session & {
  consultations: ConsultationSummary[]
  prescriptions: PrescriptionSummary[]
}

// ─── Languages ───────────────────────────────────────────────────────────────

export interface Language {
  code: string
  name: string
}

// ─── Models ──────────────────────────────────────────────────────────────────

// [HYPOTHESIS] GET /api/models/ response.
// To confirm: exact field names, status values, and type values.
export type ModelType = 'asr' | 'translation' | 'lid'  // [HYPOTHESIS]
export type ModelStatusValue =
  | 'loaded'
  | 'loading'
  | 'error'
  | 'unavailable'              // [HYPOTHESIS]

export interface ModelInfo {
  name: string
  language: string             // [HYPOTHESIS] language code or display name
  status: ModelStatusValue
  type: ModelType              // [HYPOTHESIS]
}

export interface ModelsResponse {
  models: ModelInfo[]
}

// ─── Inference ───────────────────────────────────────────────────────────────

// [HYPOTHESIS] POST /api/inference/speech-to-text/
// Request: FormData → audio (File), session_id (string), language? (string)
// All response fields beyond `text` are hypothetical.
export interface SpeechToTextResult {
  text: string
  confidence?: number          // [HYPOTHESIS] 0–1 float; may be absent
  detected_language?: string   // [HYPOTHESIS] language code; may be absent
}

// [HYPOTHESIS] POST /api/inference/detect-language/
// Request: JSON → { text: string, session_id: string }
export interface DetectedLanguage {
  language_code: string
  language_name: string        // [HYPOTHESIS] human-readable label
  confidence: number           // [HYPOTHESIS] 0–1 float
}

// [HYPOTHESIS] POST /api/inference/translate/
// Request: JSON → { text, source_language, target_language, session_id }
export interface TranslationResult {
  translated_text: string
  source_language: string
  target_language: string
}

// [HYPOTHESIS] POST /api/inference/full-pipeline/
// Request: FormData → audio (File), doctor_language (string), session_id (string)
// The pipeline is expected to run STT → LID → MT in one call.
// `confidence` reflects ASR quality. `translation` is absent when doctor_language
// equals detected_language (no translation needed).
export interface FullPipelineResult {
  transcription: string
  detected_language: string       // [HYPOTHESIS] language code
  detected_language_name: string  // [HYPOTHESIS] human-readable label
  translation?: string            // [HYPOTHESIS] absent when languages match
  confidence: number              // [HYPOTHESIS] 0–1 ASR confidence
}

// ─── Consultation form ────────────────────────────────────────────────────────

export type ConsultationMode = 'simple' | 'complete'

export interface PatientInfo {
  first_name: string
  last_name: string
  sex: string
  age: number | ''  // '' = not filled; number when set
  address: string
  telephone: string
}

export interface VitalSigns {
  arterial_pressure: string
  pulse: string
  temperature: string
  heart_rate: string
  respiratory_rate: string
  weight: string
  height: string
}

// Fields present in both consultation modes.
export interface BaseConsultationData {
  patient: PatientInfo
  vitals: VitalSigns
  diagnostic: string
  observations: string
}

// Simple mode: adds chief complaint fields on top of the base.
export interface SimpleConsultationData extends BaseConsultationData {
  mode: 'simple'
  symptoms: string
  tdr: string
}

// Complete mode: adds full anamnesis and clinical reasoning on top of the base.
export interface CompleteConsultationData extends BaseConsultationData {
  mode: 'complete'
  consultation_reason: string
  disease_history: string
  antecedents: string
  lifestyle: string
  physical_exam: string
  syndromic_summary: string
  diagnostic_hypotheses: string
  positive_diagnostic: string
}

export type ConsultationFormData = SimpleConsultationData | CompleteConsultationData

// ─── Prescription ─────────────────────────────────────────────────────────────

// `_uiId` is a frontend-only stable key for list rendering.
// It is stripped via Omit<PrescriptionLine, '_uiId'> before sending to the backend.
export interface PrescriptionLine {
  _uiId: string
  medication: string
  dosage: string
  posology: string
  duration: string
}

// [HYPOTHESIS] POST /api/prescriptions/ request body.
// `doctor_language` and `patient_language` are both sent so the backend can
// decide how to handle source/translation logic. We make no assumption about
// whether that produces one or two PDFs.
export interface PrescriptionPayload {
  session_id: string
  patient_info: PatientInfo
  doctor_language: string
  patient_language: string
  lines: Omit<PrescriptionLine, '_uiId'>[]
  consultation_notes?: string
  diagnostic?: string
}

// [HYPOTHESIS] POST /api/prescriptions/ response.
// The PDF is retrieved separately via GET /api/prescriptions/{id}/pdf/.
export interface PrescriptionResponse {
  id: string
  session_id?: string     // [HYPOTHESIS]
  created_at?: string     // [HYPOTHESIS]
}

// ─── Errors ───────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string
  status: number
  detail?: string  // Django REST Framework often returns { detail: "..." }
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
