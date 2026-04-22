import { Input } from '@/components/ui/Input'
import type { VitalSigns } from '@/types'

interface VitalSignsSectionProps {
  data: VitalSigns
  onChange: (data: VitalSigns) => void
}

export function VitalSignsSection({ data, onChange }: VitalSignsSectionProps) {
  const set = (field: keyof VitalSigns, value: string) =>
    onChange({ ...data, [field]: value })

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Constantes vitales
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Input
          label="Tension artérielle"
          placeholder="ex : 120/80 mmHg"
          value={data.arterial_pressure}
          onChange={(e) => set('arterial_pressure', e.target.value)}
        />
        <Input
          label="Pouls (bpm)"
          type="number"
          value={data.pulse}
          onChange={(e) => set('pulse', e.target.value)}
        />
        <Input
          label="Température (°C)"
          type="number"
          step="0.1"
          value={data.temperature}
          onChange={(e) => set('temperature', e.target.value)}
        />
        <Input
          label="Fréq. cardiaque"
          value={data.heart_rate}
          onChange={(e) => set('heart_rate', e.target.value)}
        />
        <Input
          label="Fréq. respiratoire"
          value={data.respiratory_rate}
          onChange={(e) => set('respiratory_rate', e.target.value)}
        />
        <Input
          label="Poids (kg)"
          type="number"
          value={data.weight}
          onChange={(e) => set('weight', e.target.value)}
        />
        <Input
          label="Taille (cm)"
          type="number"
          value={data.height}
          onChange={(e) => set('height', e.target.value)}
        />
      </div>
    </section>
  )
}
