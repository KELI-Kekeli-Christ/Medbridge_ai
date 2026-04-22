'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { usePrescription } from '@/hooks/usePrescription'
import { useSession } from '@/hooks/useSession'
import { Header } from '@/components/layout/Header'
import { SessionBanner } from '@/components/layout/SessionBanner'
import { PrescriptionForm } from '@/components/prescription/PrescriptionForm'
import { PatientInfoSection } from '@/components/consultation/PatientInfoSection'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { DOCTOR_LANGUAGES, PATIENT_LANGUAGES } from '@/lib/constants'
import { getLanguageName } from '@/lib/utils'
import type { PatientInfo } from '@/types'

const EMPTY_PATIENT: PatientInfo = {
  first_name: '', last_name: '', sex: '', age: '', address: '', telephone: '',
}

export default function PrescriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { session, loadSession } = useSession()
  const { lines, prescriptionId, loading, error, addLine, updateLine, removeLine, submit, downloadPdf } =
    usePrescription()

  const [doctorLanguage, setDoctorLanguage] = useState('fr')
  const [patientLanguage, setPatientLanguage] = useState('fr')
  const [patient, setPatient] = useState<PatientInfo>(EMPTY_PATIENT)
  const [notes, setNotes] = useState('')
  const [diagnostic, setDiagnostic] = useState('')

  useEffect(() => { loadSession(id) }, [id, loadSession])

  // Pre-fill patient identity from the most recent consultation summary if available.
  // [HYPOTHESIS] ConsultationSummary exposes patient_first_name / patient_last_name.
  useEffect(() => {
    const last = session?.consultations?.[0]
    if (!last) return
    setPatient((prev) => ({
      ...prev,
      first_name: last.patient_first_name || prev.first_name,
      last_name: last.patient_last_name || prev.last_name,
    }))
  }, [session])

  const handleSubmit = async () => {
    await submit({
      session_id: id,
      patient_info: patient,
      doctor_language: doctorLanguage,
      patient_language: patientLanguage,
      consultation_notes: notes || undefined,
      diagnostic: diagnostic || undefined,
    })
  }

  const handleDownload = async () => {
    if (!prescriptionId) return
    await downloadPdf(prescriptionId, `ordonnance-${patient.last_name || 'patient'}.pdf`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header sessionId={id} />
      <SessionBanner sessionId={id} session={session ?? undefined} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">

        {/* ── En-tête ── */}
        <div className="mb-5 flex items-center gap-3">
          <Link href={`/session/${id}`} className="text-sm text-slate-400 hover:text-slate-600">
            ← Retour
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-lg font-semibold text-slate-800">Ordonnance médicale</h1>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* ══ Colonne principale (2/3) ══ */}
          <div className="space-y-5 lg:col-span-2">

            {/* Patient */}
            <Card padding="sm">
              <CardHeader>
                <CardTitle>Informations patient</CardTitle>
              </CardHeader>
              <PatientInfoSection data={patient} onChange={setPatient} />
            </Card>

            {/* Données cliniques */}
            <Card padding="sm">
              <CardHeader>
                <CardTitle>Données cliniques</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <Textarea
                  label="Diagnostic"
                  rows={2}
                  value={diagnostic}
                  onChange={(e) => setDiagnostic(e.target.value)}
                />
                <Textarea
                  label="Notes et observations"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </Card>

            {/* Prescription */}
            <Card padding="sm">
              <CardHeader>
                <CardTitle>Prescription médicamenteuse</CardTitle>
              </CardHeader>
              <PrescriptionForm
                lines={lines}
                onAddLine={addLine}
                onUpdateLine={updateLine}
                onRemoveLine={removeLine}
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                prescriptionId={prescriptionId}
                onDownloadPdf={handleDownload}
                doctorLanguage={doctorLanguage}
                patientLanguage={patientLanguage}
              />
            </Card>

          </div>

          {/* ══ Sidebar (1/3) ══ */}
          <div className="space-y-4">

            {/* CTA principal — visible en premier */}
            {prescriptionId ? (
              <Card padding="sm" className="border-green-300 bg-green-50 shadow-sm">
                <p className="mb-1 text-xs font-semibold text-green-700">Ordonnance enregistrée</p>
                <p className="mb-4 font-mono text-xs text-green-600 break-all">{prescriptionId}</p>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleDownload}
                  loading={loading}
                  disabled={loading}
                >
                  Télécharger le PDF
                </Button>
                {error && <div className="mt-3"><ErrorMessage error={error} /></div>}
              </Card>
            ) : (
              <Card padding="sm" className="border-brand-200 bg-brand-50">
                <p className="text-xs font-medium text-brand-700">
                  Remplissez la prescription, puis cliquez sur{' '}
                  <span className="font-semibold">"Générer l'ordonnance"</span>.
                </p>
              </Card>
            )}

            {/* Langues — bloc secondaire */}
            <Card padding="sm" className="bg-slate-50 border-slate-200">
              <p className="mb-3 text-xs font-medium text-slate-400 uppercase tracking-wide">
                Langues
              </p>
              <div className="space-y-3">
                <Select
                  label="Médecin"
                  value={doctorLanguage}
                  onChange={(e) => setDoctorLanguage(e.target.value)}
                  options={DOCTOR_LANGUAGES.map((l) => ({ value: l.code, label: l.name }))}
                />
                <Select
                  label="Patient"
                  value={patientLanguage}
                  onChange={(e) => setPatientLanguage(e.target.value)}
                  options={PATIENT_LANGUAGES.map((l) => ({ value: l.code, label: l.name }))}
                />
                {doctorLanguage !== patientLanguage && (
                  <p className="text-xs text-slate-400">
                    Ordonnance en {getLanguageName(doctorLanguage)} et {getLanguageName(patientLanguage)}.
                  </p>
                )}
              </div>
            </Card>

          </div>
        </div>
      </main>
    </div>
  )
}
