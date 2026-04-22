'use client'

import { Select } from '@/components/ui/Select'
import type { Language } from '@/types'

interface LanguageSelectorProps {
  doctorLanguage: string
  patientLanguage: string
  doctorLanguages: Language[]
  patientLanguages: Language[]
  onDoctorChange: (code: string) => void
  onPatientChange: (code: string) => void
  detectedPatientLanguage?: string
  detectionConfidence?: number
}

export function LanguageSelector({
  doctorLanguage,
  patientLanguage,
  doctorLanguages,
  patientLanguages,
  onDoctorChange,
  onPatientChange,
  detectedPatientLanguage,
  detectionConfidence,
}: LanguageSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
      <div className="flex min-w-0 items-center gap-3">
        <span className="w-24 shrink-0 text-xs text-slate-500">Médecin</span>
        <div className="min-w-0 flex-1">
          <Select
            value={doctorLanguage}
            onChange={(e) => onDoctorChange(e.target.value)}
            options={doctorLanguages.map((l) => ({ value: l.code, label: l.name }))}
          />
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <span className="w-24 shrink-0 text-xs text-slate-500">Patient</span>
        <div className="min-w-0 flex-1">
          <Select
            value={patientLanguage}
            onChange={(e) => onPatientChange(e.target.value)}
            options={patientLanguages.map((l) => ({ value: l.code, label: l.name }))}
          />
        </div>
      </div>

      {detectedPatientLanguage && (
        <p className="col-start-2 text-xs text-slate-500">
          Détecté : <span className="font-medium text-slate-700">{detectedPatientLanguage}</span>
          {detectionConfidence !== undefined && (
            <span className="text-slate-400"> · {Math.round(detectionConfidence * 100)}%</span>
          )}
        </p>
      )}
    </div>
  )
}
