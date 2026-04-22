'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import type { ApiError } from '@/types'

interface TextTabProps {
  onSubmit: (text: string) => void
  loading?: boolean
  error?: ApiError | null
}

export function TextTab({ onSubmit, loading, error }: TextTabProps) {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    if (text.trim()) onSubmit(text.trim())
  }

  return (
    <div className="space-y-4">
      <Textarea
        label="Texte du patient"
        placeholder="Saisissez ou collez le texte du patient ici…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        hint="Texte brut — la langue sera détectée automatiquement"
      />
      <Button onClick={handleSubmit} loading={loading} disabled={!text.trim()}>
        Analyser le texte
      </Button>
      {error && <ErrorMessage error={error} />}
    </div>
  )
}
