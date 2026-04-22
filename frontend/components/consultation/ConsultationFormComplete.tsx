'use client'

import { Textarea } from '@/components/ui/Textarea'
import { PatientInfoSection } from './PatientInfoSection'
import { VitalSignsSection } from './VitalSignsSection'
import type { CompleteConsultationData } from '@/types'

interface Props {
  data: CompleteConsultationData
  onChange: (data: CompleteConsultationData) => void
}

export function ConsultationFormComplete({ data, onChange }: Props) {
  const set = <K extends keyof CompleteConsultationData>(
    key: K,
    value: CompleteConsultationData[K],
  ) => onChange({ ...data, [key]: value })

  return (
    <div className="space-y-6">
      <PatientInfoSection
        data={data.patient}
        onChange={(patient) => onChange({ ...data, patient })}
      />

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Anamnèse
        </h3>
        <Textarea label="Motifs de consultation" rows={2} value={data.consultation_reason} onChange={(e) => set('consultation_reason', e.target.value)} />
        <Textarea label="Histoire de la maladie" rows={4} value={data.disease_history} onChange={(e) => set('disease_history', e.target.value)} />
        <Textarea label="Antécédents" rows={3} value={data.antecedents} onChange={(e) => set('antecedents', e.target.value)} />
        <Textarea label="Mode de vie" rows={2} value={data.lifestyle} onChange={(e) => set('lifestyle', e.target.value)} />
      </section>

      <VitalSignsSection
        data={data.vitals}
        onChange={(vitals) => onChange({ ...data, vitals })}
      />

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Examen clinique
        </h3>
        <Textarea label="Examen physique" rows={4} value={data.physical_exam} onChange={(e) => set('physical_exam', e.target.value)} />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Conclusion
        </h3>
        <Textarea label="Résumé syndromique" rows={3} value={data.syndromic_summary} onChange={(e) => set('syndromic_summary', e.target.value)} />
        <Textarea label="Hypothèses diagnostiques" rows={3} value={data.diagnostic_hypotheses} onChange={(e) => set('diagnostic_hypotheses', e.target.value)} />
        <Textarea label="Diagnostic positif" rows={2} value={data.positive_diagnostic} onChange={(e) => set('positive_diagnostic', e.target.value)} />
        <Textarea label="Diagnostic" rows={2} value={data.diagnostic} onChange={(e) => set('diagnostic', e.target.value)} />
        <Textarea label="Observations" rows={2} value={data.observations} onChange={(e) => set('observations', e.target.value)} />
      </section>
    </div>
  )
}
