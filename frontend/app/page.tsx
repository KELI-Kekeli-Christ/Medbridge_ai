'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from '@/hooks/useSession'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Header } from '@/components/layout/Header'

export default function HomePage() {
  const { startSession, loading, error, getLastSessionId } = useSession()
  const [lastSessionId, setLastSessionId] = useState<string | null>(null)

  // Read localStorage only on the client to avoid SSR mismatch.
  useEffect(() => {
    setLastSessionId(getLastSessionId())
  }, [getLastSessionId])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl space-y-10 text-center">

          {/* ── Hero ── */}
          <div className="space-y-3">
            <span className="inline-block rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              Prototype académique — POC
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              MedBridge <span className="text-brand-600">AI</span>
            </h1>
            <p className="mx-auto max-w-md text-base text-slate-600">
              Consultation médicale assistée par IA — transcription et traduction automatiques
              pour lever les barrières linguistiques entre médecins et patients multilingues.
            </p>
          </div>

          {/* ── CTA principal ── */}
          <div className="space-y-3">
            <Button
              size="lg"
              onClick={startSession}
              loading={loading}
              className="w-full sm:w-auto px-10"
            >
              Essayer maintenant
            </Button>

            {lastSessionId && !loading && (
              <p className="text-sm text-slate-500">
                ou{' '}
                <Link
                  href={`/session/${lastSessionId}`}
                  className="font-medium text-brand-600 underline-offset-2 hover:underline"
                >
                  reprendre la dernière session
                </Link>
              </p>
            )}

            {error && <ErrorMessage error={error} />}
          </div>

          {/* ── Disclaimer données temporaires ── */}
          <div className="rounded-md border border-amber-200 bg-amber-50 px-5 py-4 text-left">
            <p className="text-sm font-semibold text-amber-800">Session temporaire</p>
            <p className="mt-1 text-sm text-amber-700">
              Ce POC crée une session anonyme sans compte utilisateur. Toutes les données saisies
              sont <strong>automatiquement supprimées après 24 heures</strong>.
              Ne saisissez pas de données médicales réelles de patients.
            </p>
          </div>

          {/* ── Fonctionnalités en bref ── */}
          <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
            {[
              {
                label: 'Transcription',
                desc: 'Audio patient → texte (Ewe, Wolof, Hausa, Bambara, Fongbe, Arabe égyptien…)',
              },
              {
                label: 'Détection de langue',
                desc: 'Identification automatique de la langue du patient, corrigeable manuellement.',
              },
              {
                label: 'Traduction médicale',
                desc: 'Résultat éditable et validation humaine obligatoire avant usage.',
              },
            ].map((f) => (
              <div
                key={f.label}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="mb-1 text-xs font-semibold text-slate-700">{f.label}</p>
                <p className="text-xs text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </main>

      <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-400">
        MedBridge AI — Prototype académique · Université d'Avignon · M1 APS 2025-2026
      </footer>
    </div>
  )
}
