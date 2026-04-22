'use client'

import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { PatientInfoSection } from './PatientInfoSection'
import { VitalSignsSection } from './VitalSignsSection'
import type { SimpleConsultationData } from '@/types'

interface Props {
  data: SimpleConsultationData
  onChange: (data: SimpleConsultationData) => void
}

export function ConsultationFormSimple({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <PatientInfoSection
        data={data.patient}
        onChange={(patient) => onChange({ ...data, patient })}
      />

      <VitalSignsSection
        data={data.vitals}
        onChange={(vitals) => onChange({ ...data, vitals })}
      />

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Données cliniques
        </h3>
        <Textarea
          label="Symptômes"
          rows={3}
          value={data.symptoms}
          onChange={(e) => onChange({ ...data, symptoms: e.target.value })}
        />
        <Input
          label="TDR"
          placeholder="ex : Paludisme +"
          value={data.tdr}
          onChange={(e) => onChange({ ...data, tdr: e.target.value })}
        />
        <Textarea
          label="Diagnostic"
          rows={2}
          value={data.diagnostic}
          onChange={(e) => onChange({ ...data, diagnostic: e.target.value })}
        />
        <Textarea
          label="Observations"
          rows={3}
          value={data.observations}
          onChange={(e) => onChange({ ...data, observations: e.target.value })}
        />
      </section>
    </div>
  )
}
