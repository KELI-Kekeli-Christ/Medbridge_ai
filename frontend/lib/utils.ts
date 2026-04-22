import type { ApiError, Language } from '@/types'
import { ALL_LANGUAGES } from '@/lib/constants'

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatExpiry(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isSessionExpired(expires_at: string): boolean {
  return new Date(expires_at) < new Date()
}

export function getLanguageName(code: string): string {
  return ALL_LANGUAGES.find((l: Language) => l.code === code)?.name ?? code
}

export function buildApiError(status: number, body: unknown): ApiError {
  if (typeof body === 'object' && body !== null && 'detail' in body) {
    return { message: String((body as Record<string, unknown>).detail), status, detail: String((body as Record<string, unknown>).detail) }
  }
  return { message: `Erreur ${status}`, status }
}

export async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: unknown
    try { body = await res.json() } catch { body = null }
    throw buildApiError(res.status, body)
  }
  return res.json() as Promise<T>
}
