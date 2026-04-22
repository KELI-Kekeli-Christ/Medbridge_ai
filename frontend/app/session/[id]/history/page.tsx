'use client'

// This page derives all its data from GET /api/sessions/{id}/.
// [HYPOTHESIS] The response is expected to include embedded `consultations` and
// `prescriptions` arrays. If the backend does not return these fields, both arrays
// will be empty (see session-api.ts normalisation) and the page renders empty states.
// No separate history endpoint is called.

import { useEffect, use } from 'react'
import Link from 'next/link'
import { useSession } from '@/hooks/useSession'
import { Header } from '@/components/layout/Header'
import { SessionBanner } from '@/components/layout/SessionBanner'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { formatDate, getLanguageName } from '@/lib/utils'

export default function HistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { session, loading, error, expired, loadSession } = useSession()

  useEffect(() => {
    loadSession(id)
  }, [id, loadSession])

  // ─── Guards ──────────────────────────────────────────────────────────────

  if (loading) {
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
            <p className="text-4xl">⏱</p>
            <h1 className="text-xl font-semibold text-slate-800">Session expirée</h1>
            <p className="text-slate-600">
              Les données de cette session ont été supprimées automatiquement.
            </p>
            <Link href="/"><Button>Nouvelle session</Button></Link>
          </div>
        </main>
      </div>
    )
  }

  // ─── Data ─────────────────────────────────────────────────────────────────

  const consultations = session?.consultations ?? []
  const prescriptions = session?.prescriptions ?? []
  const isEmpty = consultations.length === 0 && prescriptions.length === 0

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col">
      <Header sessionId={id} />
      <SessionBanner sessionId={id} session={session ?? undefined} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Historique de session</h1>
            <p className="mt-0.5 text-sm text-slate-500 font-mono">{id}</p>
          </div>
          <Link href={`/session/${id}`}>
            <Button variant="secondary">Nouvelle consultation</Button>
          </Link>
        </div>

        {/* Session info block */}
        {session && (
          <Card padding="sm" className="mb-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-3">
              <div>
                <span className="text-slate-400">ID session</span>
                <p className="font-mono font-medium text-slate-700">{session.id.slice(0, 8)}…</p>
              </div>
              <div>
                <span className="text-slate-400">Créée le</span>
                <p className="font-medium text-slate-700">{formatDate(session.created_at)}</p>
              </div>
              <div>
                <span className="text-slate-400">Expire le</span>
                <p className="font-medium text-slate-700">{formatDate(session.expires_at)}</p>
              </div>
            </div>
          </Card>
        )}

        {error && <ErrorMessage error={error} className="mb-4" />}

        {/* [HYPOTHESIS] If the backend does not yet return embedded arrays,
            this note informs the user rather than silently showing nothing. */}
        {session && isEmpty && (
          <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
            Aucune donnée historique disponible pour cette session. L'historique est alimenté
            par <code>GET /api/sessions/{'{id}'}/</code> — vérifiez que le backend retourne bien
            les champs <code>consultations</code> et <code>prescriptions</code>.
          </div>
        )}

        <div className="space-y-8">

          {/* Consultations */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Consultations ({consultations.length})
            </h2>
            {consultations.length === 0 ? (
              <Card className="py-6 text-center">
                <p className="text-sm text-slate-400">Aucune consultation enregistrée.</p>
              </Card>
            ) : (
              consultations.map((c) => (
                <Card key={c.id} padding="sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">
                          {c.patient_first_name} {c.patient_last_name}
                        </p>
                        <Badge variant="info">
                          {getLanguageName(c.doctor_language)} → {getLanguageName(c.patient_language)}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        {c.diagnostic || <span className="italic text-slate-400">Diagnostic non renseigné</span>}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(c.created_at)}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </section>

          {/* Prescriptions */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Ordonnances ({prescriptions.length})
            </h2>
            {prescriptions.length === 0 ? (
              <Card className="py-6 text-center">
                <p className="text-sm text-slate-400">Aucune ordonnance générée.</p>
                <Link href={`/session/${id}/prescription`} className="mt-3 inline-block">
                  <Button variant="secondary" size="sm">Créer une ordonnance</Button>
                </Link>
              </Card>
            ) : (
              prescriptions.map((p) => (
                <Card key={p.id} padding="sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">
                          {p.patient_last_name || 'Patient inconnu'}
                        </p>
                        <Badge variant="default">
                          {getLanguageName(p.doctor_language)} / {getLanguageName(p.patient_language)}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{formatDate(p.created_at)}</p>
                    </div>
                    {/* `download` suggests a filename to the browser, but the actual
                        download behaviour depends on the backend's Content-Disposition header.
                        If the header is absent or set to inline, the browser may open the PDF
                        in a new tab instead of saving it. */}
                    <a
                      href={`/api/prescriptions/${p.id}/pdf/`}
                      download={`ordonnance-${p.patient_last_name || p.id.slice(0, 8)}.pdf`}
                    >
                      <Button variant="secondary" size="sm">Télécharger PDF</Button>
                    </a>
                  </div>
                </Card>
              ))
            )}
          </section>

        </div>
      </main>
    </div>
  )
}
