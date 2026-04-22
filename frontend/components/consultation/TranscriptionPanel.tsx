'use client'

import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CONFIDENCE_THRESHOLD } from '@/lib/constants'

interface TranscriptionPanelProps {
  rawText: string
  confidence?: number
  onValidate: (text: string) => void
  validated?: boolean
}

export function TranscriptionPanel({
  rawText,
  confidence,
  onValidate,
  validated: externalValidated,
}: TranscriptionPanelProps) {
  const [editedText, setEditedText] = useState(rawText)
  const [validated, setValidated] = useState(false)

  useEffect(() => {
    setEditedText(rawText)
    setValidated(false)
  }, [rawText])

  const handleValidate = () => {
    onValidate(editedText)
    setValidated(true)
  }

  const isLowConfidence = confidence !== undefined && confidence < CONFIDENCE_THRESHOLD

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Transcription</h3>
        <div className="flex items-center gap-2">
          {confidence !== undefined && (
            <Badge variant={isLowConfidence ? 'warning' : 'success'}>
              Confiance : {Math.round(confidence * 100)}%
            </Badge>
          )}
          {(validated || externalValidated) && (
            <Badge variant="success">Validée</Badge>
          )}
        </div>
      </div>

      {isLowConfidence && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          Confiance faible — vérifiez la transcription avant de valider.
        </p>
      )}

      <Textarea
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        rows={4}
        hint="Modifiable avant validation"
        placeholder="Transcription IA…"
      />

      <Button
        onClick={handleValidate}
        variant={validated ? 'secondary' : 'primary'}
        size="sm"
        disabled={!editedText.trim()}
      >
        {validated ? '✓ Validée' : 'Valider la transcription'}
      </Button>
    </div>
  )
}
