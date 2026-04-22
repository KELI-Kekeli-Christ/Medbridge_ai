import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { PatientInfo } from '@/types'

interface PatientInfoSectionProps {
  data: PatientInfo
  onChange: (data: PatientInfo) => void
}

const SEX_OPTIONS = [
  { value: '', label: '—' },
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
]

export function PatientInfoSection({ data, onChange }: PatientInfoSectionProps) {
  const set = (field: keyof PatientInfo, value: string | number) =>
    onChange({ ...data, [field]: value })

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Identité patient
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Prénom"
          value={data.first_name}
          onChange={(e) => set('first_name', e.target.value)}
        />
        <Input
          label="Nom"
          value={data.last_name}
          onChange={(e) => set('last_name', e.target.value)}
        />
        <Select
          label="Sexe"
          value={data.sex}
          onChange={(e) => set('sex', e.target.value)}
          options={SEX_OPTIONS}
        />
        <Input
          label="Âge"
          type="number"
          min={0}
          value={data.age === '' ? '' : String(data.age)}
          onChange={(e) =>
            set('age', e.target.value === '' ? '' : Number(e.target.value))
          }
        />
        <Input
          label="Téléphone"
          value={data.telephone}
          onChange={(e) => set('telephone', e.target.value)}
        />
        <Input
          label="Adresse"
          value={data.address}
          onChange={(e) => set('address', e.target.value)}
        />
      </div>
    </section>
  )
}
