'use client'

import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { getLanguageName } from '@/lib/utils'

interface TranslationPanelProps {
  rawTranslation: string
  sourceLanguage: string
  targetLanguage: string
  onValidate: (text: string) => void
  validated?: boolean
}

export function TranslationPanel({
  rawTranslation,
  sourceLanguage,
  targetLanguage,
  onValidate,
  validated: externalValidated,
}: TranslationPanelProps) {
  const [editedText, setEditedText] = useState(rawTranslation)
  const [validated, setValidated] = useState(false)

  useEffect(() => {
    setEditedText(rawTranslation)
    setValidated(false)
  }, [rawTranslation])

  const handleValidate = () => {
    onValidate(editedText)
    setValidated(true)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Traduction</h3>
        <div className="flex items-center gap-2">
          <Badge variant="info">
            {getLanguageName(sourceLanguage)} → {getLanguageName(targetLanguage)}
          </Badge>
          {(validated || externalValidated) && (
            <Badge variant="success">Validée</Badge>
          )}
        </div>
      </div>

      <Textarea
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        rows={4}
        hint="Modifiable avant validation"
        placeholder="Traduction IA…"
      />

      <Button
        onClick={handleValidate}
        variant={validated ? 'secondary' : 'primary'}
        size="sm"
        disabled={!editedText.trim()}
      >
        {validated ? '✓ Validée' : 'Valider la traduction'}
      </Button>
    </div>
  )
}
