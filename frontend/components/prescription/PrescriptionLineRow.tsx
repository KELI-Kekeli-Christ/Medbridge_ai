'use client'

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { PrescriptionLine } from '@/types'

interface PrescriptionLineRowProps {
  line: PrescriptionLine
  index: number
  onChange: (field: keyof Omit<PrescriptionLine, '_uiId'>, value: string) => void
  onRemove: () => void
  canRemove: boolean
}

export function PrescriptionLineRow({
  line,
  index,
  onChange,
  onRemove,
  canRemove,
}: PrescriptionLineRowProps) {
  return (
    <div className="relative rounded-md border border-slate-200 bg-white p-3">
      {canRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="absolute right-1 top-1 h-5 w-5 p-0 text-slate-400 hover:text-red-500"
          aria-label="Supprimer ce médicament"
        >
          ×
        </Button>
      )}
      <div className="grid grid-cols-1 gap-2">
        <Input
          label="Nom du médicament"
          labelClassName="text-xs"
          placeholder="ex : Amoxicilline"
          value={line.medication}
          onChange={(e) => onChange('medication', e.target.value)}
          inputClassName="py-1.5"
        />
        <div className="grid grid-cols-3 gap-2">
          <Input
            label="Dosage"
            labelClassName="text-xs"
            placeholder="ex : 500 mg"
            value={line.dosage}
            onChange={(e) => onChange('dosage', e.target.value)}
            inputClassName="py-1.5"
          />
          <Input
            label="Posologie"
            labelClassName="text-xs"
            placeholder="ex : 3×/jour"
            value={line.posology}
            onChange={(e) => onChange('posology', e.target.value)}
            inputClassName="py-1.5"
          />
          <Input
            label="Durée"
            labelClassName="text-xs"
            placeholder="ex : 7 jours"
            value={line.duration}
            onChange={(e) => onChange('duration', e.target.value)}
            inputClassName="py-1.5"
          />
        </div>
      </div>
    </div>
  )
}
