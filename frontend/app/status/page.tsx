'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getModels } from '@/services/model-api'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import type { ModelInfo, ApiError } from '@/types'

const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  loaded: 'success',
  loading: 'warning',
  error: 'error',
  unavailable: 'default',
}

const typeLabel: Record<string, string> = {
  asr: 'ASR',
  translation: 'Traduction',
  lid: 'Détection de langue',
}

export default function StatusPage() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const fetchModels = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getModels()
      setModels(res.models)
    } catch (e) {
      setError(e as ApiError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  const groupedByType = models.reduce<Record<string, ModelInfo[]>>((acc, m) => {
    acc[m.type] = [...(acc[m.type] ?? []), m]
    return acc
  }, {})

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Statut des modèles IA</h1>
          <Button variant="secondary" size="sm" onClick={fetchModels} loading={loading}>
            Actualiser
          </Button>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {error && <ErrorMessage error={error} />}

        {!loading && !error && models.length === 0 && (
          <Card className="py-8 text-center text-slate-400 text-sm">
            Aucun modèle détecté — le backend est peut-être injoignable.
          </Card>
        )}

        {!loading && models.length > 0 && (
          <div className="space-y-6">
            {Object.entries(groupedByType).map(([type, group]) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle>{typeLabel[type] ?? type}</CardTitle>
                </CardHeader>
                <div className="divide-y divide-slate-100">
                  {group.map((m) => (
                    <div key={m.name} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{m.name}</p>
                        <p className="text-xs text-slate-500">{m.language}</p>
                      </div>
                      <Badge variant={statusVariant[m.status] ?? 'default'}>
                        {m.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="ghost" size="sm">← Retour à l'accueil</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
