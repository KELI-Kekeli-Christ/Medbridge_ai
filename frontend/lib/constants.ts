import type { Language } from '@/types'

export const SESSION_STORAGE_KEY = 'medbridge_session_id'

export const SESSION_TTL_HOURS = 24

export const DOCTOR_LANGUAGES: Language[] = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
]

export const PATIENT_LANGUAGES: Language[] = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'ee', name: 'Ewe' },
  { code: 'arz', name: 'Arabe égyptien' },
]

export const ALL_LANGUAGES: Language[] = [
  ...DOCTOR_LANGUAGES,
  ...PATIENT_LANGUAGES.filter((l) => !DOCTOR_LANGUAGES.find((d) => d.code === l.code)),
]

export const CONFIDENCE_THRESHOLD = 0.7
