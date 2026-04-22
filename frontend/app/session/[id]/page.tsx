'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useSession } from '@/hooks/useSession'
import { useInference } from '@/hooks/useInference'
import { Header } from '@/components/layout/Header'
import { SessionBanner } from '@/components/layout/SessionBanner'
import { LanguageSelector } from '@/components/consultation/LanguageSelector'
import { AudioTab } from '@/components/consultation/AudioTab'
import { TextTab } from '@/components/consultation/TextTab'
import { TranscriptionPanel } from '@/components/consultation/TranscriptionPanel'
import { TranslationPanel } from '@/components/consultation/TranslationPanel'
import { ConsultationFormSimple } from '@/components/consultation/ConsultationFormSimple'
import { ConsultationFormComplete } from '@/components/consultation/ConsultationFormComplete'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Spinner } from '@/components/ui/Spinner'
import { DOCTOR_LANGUAGES, PATIENT_LANGUAGES } from '@/lib/constants'
import type {
  ConsultationMode,
  SimpleConsultationData,
  CompleteConsultationData,
  PatientInfo,
  VitalSigns,
} from '@/types'

// ─── Initial state ────────────────────────────────────────────────────────────

const EMPTY_PATIENT: PatientInfo = {
  first_name: '', last_name: '', sex: '', age: '', address: '', telephone: '',
}
const EMPTY_VITALS: VitalSigns = {
  arterial_pressure: '', pulse: '', temperature: '',
  heart_rate: '', respiratory_rate: '', weight: '', height: '',
}
const INITIAL_SIMPLE: SimpleConsultationData = {
  mode: 'simple', patient: EMPTY_PATIENT, vitals: EMPTY_VITALS,
  symptoms: '', tdr: '', diagnostic: '', observations: '',
}
const INITIAL_COMPLETE: CompleteConsultationData = {
  mode: 'complete', patient: EMPTY_PATIENT, vitals: EMPTY_VITALS,
  consultation_reason: '', disease_history: '', antecedents: '', lifestyle: '',
  physical_exam: '', syndromic_summary: '', diagnostic_hypotheses: '',
  positive_diagnostic: '', diagnostic: '', observations: '',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConsultationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const { session, loading: sessionLoading, error: sessionError, loadSession, expired } =
    useSession()
  const inference = useInference()

  const [doctorLanguage, setDoctorLanguage] = useState('fr')
  const [patientLanguage, setPatientLanguage] = useState('fr')
  const [activeTab, setActiveTab] = useState<'audio' | 'text'>('audio')
  const [pendingAudio, setPendingAudio] = useState<File | null>(null)
  const [analysisKey, setAnalysisKey] = useState(0)
  const [detectedText, setDetectedText] = useState<string | null>(null)
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>('simple')
  const [simpleData, setSimpleData] = useState<SimpleConsultationData>(INITIAL_SIMPLE)
  const [completeData, setCompleteData] = useState<CompleteConsultationData>(INITIAL_COMPLETE)
  const [validatedTranscription, setValidatedTranscription] = useState<string | null>(null)
  const [validatedTranslation, setValidatedTranslation] = useState<string | null>(null)

  useEffect(() => { loadSession(id) }, [id, loadSession])

  const handleResetAnalysis = () => {
    inference.reset()
    setValidatedTranscription(null)
    setValidatedTranslation(null)
    setPendingAudio(null)
    setDetectedText(null)
    setAnalysisKey((k) => k + 1)
  }

  const handleAudioReady = (file: File) => {
    inference.reset()
    setValidatedTranscription(null)
    setValidatedTranslation(null)
    setDetectedText(null)
    setPendingAudio(file)
  }

  const handleRunPipeline = async () => {
    if (!pendingAudio) return
    const result = await inference.runFullPipeline(pendingAudio, doctorLanguage, id)
    if (result?.detected_language) setPatientLanguage(result.detected_language)
  }

  const handleTextDetect = async (text: string) => {
    inference.reset()
    setDetectedText(null)
    const detected = await inference.runDetectLanguage(text, id)
    if (!detected) return
    setPatientLanguage(detected.language_code)
    setDetectedText(text)
  }

  const handleTranslate = async () => {
    if (!detectedText || patientLanguage === doctorLanguage) return
    await inference.runTranslate(detectedText, patientLanguage, doctorLanguage, id)
  }

  // ─── Guards ───────────────────────────────────────────────────────────────

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (expired) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-md space-y-4 text-center">
            <h1 className="text-xl font-semibold text-slate-800">Session expirée</h1>
            <p className="text-slate-500">
              Les données de cette session ont été supprimées automatiquement.
            </p>
            <Link href="/"><Button>Créer une nouvelle session</Button></Link>
          </div>
        </main>
      </div>
    )
  }

  if (sessionError) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-md w-full space-y-4">
            <ErrorMessage error={sessionError} />
            <Link href="/"><Button variant="secondary">Retour à l'accueil</Button></Link>
          </div>
        </main>
      </div>
    )
  }

  // ─── Derived values ───────────────────────────────────────────────────────

  const pipeline = inference.pipeline
  const hasResults = !!(pipeline || inference.translation || inference.detection)
  const translationText = pipeline?.translation ?? inference.translation?.translated_text ?? null
  const detectionConfidence = pipeline?.confidence ?? inference.detection?.confidence
  const detectedLanguageName = pipeline?.detected_language_name ?? inference.detection?.language_name
  const showTranslateButton =
    activeTab === 'text' && detectedText !== null && !inference.loading &&
    patientLanguage !== doctorLanguage && !inference.translation

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header sessionId={id} />
      <SessionBanner sessionId={id} session={session ?? undefined} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">

        {/* ── En-tête ── */}
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">Consultation</h1>
          <div className="flex items-center gap-2">
            <Link href={`/session/${id}/history`}>
              <Button variant="ghost" size="sm">Historique</Button>
            </Link>
            <Link href={`/session/${id}/prescription`}>
              <Button variant="primary" size="sm">Rédiger l'ordonnance</Button>
            </Link>
          </div>
        </div>

        <div className="space-y-5">

          {/* ── Bloc 1 : Langues (pleine largeur) ── */}
          <Card padding="sm">
            <div className="flex items-center justify-between gap-4">
              <LanguageSelector
                doctorLanguage={doctorLanguage}
                patientLanguage={patientLanguage}
                doctorLanguages={DOCTOR_LANGUAGES}
                patientLanguages={PATIENT_LANGUAGES}
                onDoctorChange={setDoctorLanguage}
                onPatientChange={setPatientLanguage}
                detectedPatientLanguage={detectedLanguageName}
                detectionConfidence={detectionConfidence}
              />
            </div>
          </Card>

          {/* ── Bloc 2 : Saisie patient + Résultats IA (côte à côte) ── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {/* Saisie patient */}
            <Card padding="sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">Saisie patient</h2>
                <div className="flex items-center gap-2">
                  {hasResults && (
                    <button
                      onClick={handleResetAnalysis}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Réinitialiser
                    </button>
                  )}
                  <TabToggle active={activeTab} onChange={setActiveTab} />
                </div>
              </div>

              {activeTab === 'audio' ? (
                <div className="space-y-3">
                  <AudioTab
                    key={analysisKey}
                    onAudioReady={handleAudioReady}
                    loading={inference.loading}
                    error={inference.error}
                  />
                  {pendingAudio && !pipeline && (
                    <Button onClick={handleRunPipeline} loading={inference.loading} size="sm" className="w-full">
                      Analyser l'audio
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <TextTab
                    onSubmit={handleTextDetect}
                    loading={inference.loading}
                    error={inference.error}
                  />
                  {showTranslateButton && (
                    <Button variant="secondary" size="sm" onClick={handleTranslate} loading={inference.loading} className="w-full">
                      Traduire en {doctorLanguage.toUpperCase()}
                    </Button>
                  )}
                  {detectedText && patientLanguage === doctorLanguage && !inference.loading && (
                    <p className="text-xs text-slate-400">
                      Même langue que le médecin, traduction non nécessaire.
                    </p>
                  )}
                </div>
              )}
            </Card>

            {/* Résultats IA */}
            <Card padding="sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">Résultats IA</h2>
                {hasResults && (
                  <span className="text-xs text-slate-400">Validez avant usage</span>
                )}
              </div>

              {!hasResults ? (
                <div className="flex h-32 items-center justify-center">
                  <p className="text-sm text-slate-300">
                    Les résultats apparaîtront ici après l'analyse.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pipeline?.transcription && (
                    <TranscriptionPanel
                      rawText={pipeline.transcription}
                      confidence={pipeline.confidence}
                      onValidate={setValidatedTranscription}
                      validated={!!validatedTranscription}
                    />
                  )}
                  {translationText && (
                    <TranslationPanel
                      rawTranslation={translationText}
                      sourceLanguage={patientLanguage}
                      targetLanguage={doctorLanguage}
                      onValidate={setValidatedTranslation}
                      validated={!!validatedTranslation}
                    />
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* ── Bloc 2b : Validations confirmées (pleine largeur, conditionnel) ── */}
          {(validatedTranscription || validatedTranslation) && (
            <Card padding="sm" className="border-green-200 bg-green-50">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-green-700">
                Validé par le médecin
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {validatedTranscription && (
                  <div>
                    <Badge variant="success" className="mb-1">Transcription</Badge>
                    <p className="rounded border border-green-200 bg-white px-3 py-2 text-sm text-slate-800">
                      {validatedTranscription}
                    </p>
                  </div>
                )}
                {validatedTranslation && (
                  <div>
                    <Badge variant="success" className="mb-1">Traduction</Badge>
                    <p className="rounded border border-green-200 bg-white px-3 py-2 text-sm text-slate-800">
                      {validatedTranslation}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ── Bloc 3 : Formulaire médical (pleine largeur) ── */}
          <Card padding="sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Fiche de consultation</h2>
              <div className="flex gap-1 rounded-md border border-slate-200 bg-slate-50 p-0.5">
                {(['simple', 'complete'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setConsultationMode(mode)}
                    className={[
                      'rounded px-4 py-1 text-xs font-medium transition-colors',
                      consultationMode === mode
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700',
                    ].join(' ')}
                  >
                    {mode === 'simple' ? 'Simple' : 'Complète'}
                  </button>
                ))}
              </div>
            </div>

            {consultationMode === 'simple' ? (
              <ConsultationFormSimple data={simpleData} onChange={setSimpleData} />
            ) : (
              <ConsultationFormComplete data={completeData} onChange={setCompleteData} />
            )}
          </Card>

        </div>
      </main>
    </div>
  )
}

// ─── TabToggle ────────────────────────────────────────────────────────────────

function TabToggle({
  active,
  onChange,
}: {
  active: 'audio' | 'text'
  onChange: (tab: 'audio' | 'text') => void
}) {
  return (
    <div className="flex gap-0.5 rounded-md border border-slate-200 bg-slate-50 p-0.5">
      {(['audio', 'text'] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={[
            'rounded px-3 py-1 text-xs font-medium transition-colors',
            active === tab
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          ].join(' ')}
        >
          {tab === 'audio' ? 'Audio' : 'Texte'}
        </button>
      ))}
    </div>
  )
}
