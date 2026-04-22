import type { ApiError } from '@/types'

interface ErrorMessageProps {
  error: ApiError | string | null
  className?: string
}

export function ErrorMessage({ error, className }: ErrorMessageProps) {
  if (!error) return null

  const message = typeof error === 'string' ? error : error.message

  return (
    <div
      role="alert"
      className={`rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 ${className ?? ''}`}
    >
      <span className="font-medium">Erreur :</span> {message}
    </div>
  )
}
