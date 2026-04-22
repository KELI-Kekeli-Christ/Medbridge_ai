import type { NormalisedSession } from '@/types'
import { formatExpiry } from '@/lib/utils'

interface SessionBannerProps {
  // The session id from the URL param — always available immediately.
  sessionId?: string
  // The loaded session object — available only after GET /api/sessions/{id}/ resolves.
  // Used to show the expiry date once known.
  session?: NormalisedSession | null
}

export function SessionBanner({ sessionId, session }: SessionBannerProps) {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-6 py-2.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-sm text-amber-800">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400 mr-2 align-middle" aria-hidden="true" />
            <span className="font-semibold">Session temporaire</span>
            {session?.expires_at && (
              <span className="font-normal text-amber-700">
                {' · '}Expire le{' '}
                <span className="font-medium">{formatExpiry(session.expires_at)}</span>
              </span>
            )}
          </p>
          <p className="text-xs text-amber-600">
            Prototype académique · Données effacées dans 24h · Ne pas utiliser avec des données réelles.
          </p>
        </div>

        {sessionId && (
          <span className="shrink-0 font-mono text-xs text-amber-500">
            {sessionId.slice(0, 8)}…
          </span>
        )}
      </div>
    </div>
  )
}
