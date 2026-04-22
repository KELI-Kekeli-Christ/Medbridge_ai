'use client'

import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { PrescriptionLineRow } from './PrescriptionLineRow'
import { getLanguageName } from '@/lib/utils'
import type { PrescriptionLine, ApiError } from '@/types'

interface PrescriptionFormProps {
  lines: PrescriptionLine[]
  onAddLine: () => void
  onUpdateLine: (uiId: string, field: keyof Omit<PrescriptionLine, '_uiId'>, value: string) => void
  onRemoveLine: (uiId: string) => void
  onSubmit: () => void
  loading?: boolean
  error?: ApiError | null
  prescriptionId?: string | null
  onDownloadPdf?: () => void
  doctorLanguage: string
  patientLanguage: string
}

export function PrescriptionForm({
  lines,
  onAddLine,
  onUpdateLine,
  onRemoveLine,
  onSubmit,
  loading,
  error,
  prescriptionId,
  onDownloadPdf,
  doctorLanguage,
  patientLanguage,
}: PrescriptionFormProps) {
  const needsTranslation = doctorLanguage !== patientLanguage
  // Submit requires at least one line with a medication name filled in.
  const canSubmit = lines.length > 0 && lines.every((l) => l.medication.trim().length > 0)

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {lines.map((line, i) => (
          <PrescriptionLineRow
            key={line._uiId}
            line={line}
            index={i}
            onChange={(field, value) => onUpdateLine(line._uiId, field, value)}
            onRemove={() => onRemoveLine(line._uiId)}
            canRemove={lines.length > 1}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onAddLine}
        disabled={!!prescriptionId}
        className="text-brand-600"
      >
        + Ajouter un médicament
      </Button>

      {error && <ErrorMessage error={error} />}

      {!prescriptionId ? (
        <div className="mt-6 space-y-1">
          <Button
            variant="primary"
            onClick={onSubmit}
            loading={loading}
            disabled={!canSubmit}
            size="lg"
            className="w-full"
          >
            Générer l'ordonnance
          </Button>
          {!canSubmit && (
            <p className="text-xs text-slate-400">
              Renseignez le nom du médicament pour chaque ligne avant de continuer.
            </p>
          )}
        </div>
      ) : (
        <Button variant="primary" onClick={onDownloadPdf} loading={loading}>
          Télécharger le PDF
        </Button>
      )}

      {/* [HYPOTHESIS] The backend receives doctor_language + patient_language in the payload.
          Whether it generates one bilingual document or two separate PDFs is determined
          server-side and not assumed here. */}
      {needsTranslation && (
        <p className="rounded border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
          L'ordonnance sera générée en{' '}
          <strong>{getLanguageName(doctorLanguage)}</strong> et{' '}
          <strong>{getLanguageName(patientLanguage)}</strong>.
        </p>
      )}
    </div>
  )
}
