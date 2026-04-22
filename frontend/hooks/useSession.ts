'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { NormalisedSession, ApiError } from '@/types'
import { createSession, getSession } from '@/services/session-api'
import { SESSION_STORAGE_KEY } from '@/lib/constants'
import { isSessionExpired } from '@/lib/utils'

// ─── Contract ─────────────────────────────────────────────────────────────────
//
// Source of truth for the session id: the URL route parameter [id].
// localStorage is used only as a "last visited session" hint so the homepage
// can offer a resume link. It is never read to determine the active session.
//
// Session lifecycle in this hook:
//   startSession()   → POST /api/sessions/ → store hint → router.push(/session/id)
//   loadSession(id)  → GET /api/sessions/id/ → set session state | set expired
//   getLastSessionId → read localStorage hint (homepage only)
//
// ─────────────────────────────────────────────────────────────────────────────

export interface UseSessionReturn {
  session: NormalisedSession | null
  loading: boolean
  error: ApiError | null
  expired: boolean
  startSession: () => Promise<void>
  loadSession: (id: string) => Promise<void>
  getLastSessionId: () => string | null
}

export function useSession(): UseSessionReturn {
  const router = useRouter()
  const [session, setSession] = useState<NormalisedSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [expired, setExpired] = useState(false)

  // ─── startSession ───────────────────────────────────────────────────────────

  const startSession = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const s = await createSession()
      // Write the hint before navigating so the homepage can offer a resume link
      // if the user returns to "/" later.
      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_STORAGE_KEY, s.id)
      }
      // Navigation unmounts this component; do NOT call setLoading(false) on the
      // success path — it would trigger a state update on an unmounted component.
      router.push(`/session/${s.id}`)
    } catch (e) {
      setError(e as ApiError)
      setLoading(false)
    }
  }, [router])

  // ─── loadSession ────────────────────────────────────────────────────────────

  const loadSession = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    setExpired(false)
    try {
      const s = await getSession(id)

      // isSessionExpired returns false for an invalid/empty date string,
      // so a missing expires_at is treated as "not yet expired" — acceptable for POC.
      if (isSessionExpired(s.expires_at)) {
        setExpired(true)
        return
      }

      setSession(s)
    } catch (e) {
      const err = e as ApiError
      // 404 → the session was purged (24h TTL) or the id is invalid.
      // Treat it as "expired" so the UI shows a consistent message.
      if (err.status === 404) {
        setExpired(true)
      } else {
        setError(err)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── getLastSessionId ────────────────────────────────────────────────────────

  const getLastSessionId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(SESSION_STORAGE_KEY)
  }, [])

  return { session, loading, error, expired, startSession, loadSession, getLastSessionId }
}
