import Link from 'next/link'

interface HeaderProps {
  sessionId?: string
}

export function Header({ sessionId }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-brand-700">MedBridge</span>
          <span className="text-lg font-light text-slate-500">AI</span>
        </Link>

        <nav className="flex items-center gap-4">
          {sessionId && (
            <>
              <Link
                href={`/session/${sessionId}`}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Consultation
              </Link>
              <Link
                href={`/session/${sessionId}/history`}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Historique
              </Link>
            </>
          )}
          <Link href="/status" className="text-sm text-slate-500 hover:text-slate-700">
            Statut modèles
          </Link>
        </nav>
      </div>
    </header>
  )
}
