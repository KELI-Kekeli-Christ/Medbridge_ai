'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import type { ApiError } from '@/types'

interface AudioTabProps {
  onAudioReady: (file: File) => void
  loading?: boolean
  error?: ApiError | null
}

export function AudioTab({ onAudioReady, loading, error }: AudioTabProps) {
  const [recording, setRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const [permissionError, setPermissionError] = useState<string | null>(null)

  const startRecording = useCallback(async () => {
    setPermissionError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setHasRecording(true)
        const file = new File([blob], 'recording.wav', { type: 'audio/wav' })
        onAudioReady(file)
        stream.getTracks().forEach((t) => t.stop())
      }

      mediaRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch {
      setPermissionError("Accès au microphone refusé. Autorisez l'accès dans les paramètres du navigateur.")
    }
  }, [onAudioReady])

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop()
    setRecording(false)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {!recording ? (
          <Button
            onClick={startRecording}
            variant="primary"
            className="gap-2"
            disabled={loading}
          >
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Démarrer l'enregistrement
          </Button>
        ) : (
          <Button onClick={stopRecording} variant="danger" className="gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            Arrêter l'enregistrement
          </Button>
        )}

        {recording && (
          <span className="text-sm font-medium text-red-600 animate-pulse">
            Enregistrement en cours…
          </span>
        )}
      </div>

      {audioUrl && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">Aperçu de l'enregistrement :</p>
          <audio src={audioUrl} controls className="w-full" />
        </div>
      )}

      {hasRecording && !loading && (
        <p className="text-xs text-green-600 font-medium">
          ✓ Audio prêt — cliquez sur "Analyser" pour lancer le pipeline IA.
        </p>
      )}

      {permissionError && <ErrorMessage error={permissionError} />}
      {error && <ErrorMessage error={error} />}
    </div>
  )
}
