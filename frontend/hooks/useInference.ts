'use client'

import { useState, useCallback } from 'react'
import type { FullPipelineResult, DetectedLanguage, TranslationResult, ApiError } from '@/types'
import { fullPipeline, detectLanguage, translate, speechToText } from '@/services/inference-api'

interface InferenceState {
  pipeline: FullPipelineResult | null
  detection: DetectedLanguage | null
  translation: TranslationResult | null
  loading: boolean
  error: ApiError | null
}

interface UseInferenceReturn extends InferenceState {
  // Returns the result directly so callers can read it without relying on stale state.
  runFullPipeline: (audio: File, doctorLang: string, sessionId: string) => Promise<FullPipelineResult | null>
  runSpeechToText: (audio: File, sessionId: string, lang?: string) => Promise<string | null>
  runDetectLanguage: (text: string, sessionId: string) => Promise<DetectedLanguage | null>
  runTranslate: (text: string, src: string, tgt: string, sessionId: string) => Promise<TranslationResult | null>
  reset: () => void
}

const initial: InferenceState = {
  pipeline: null,
  detection: null,
  translation: null,
  loading: false,
  error: null,
}

export function useInference(): UseInferenceReturn {
  const [state, setState] = useState<InferenceState>(initial)

  const setLoading = useCallback(
    () => setState((s) => ({ ...s, loading: true, error: null })),
    [],
  )
  const setError = useCallback(
    (error: ApiError) => setState((s) => ({ ...s, loading: false, error })),
    [],
  )

  const runFullPipeline = useCallback(async (
    audio: File,
    doctorLang: string,
    sessionId: string,
  ): Promise<FullPipelineResult | null> => {
    setLoading()
    try {
      const result = await fullPipeline(audio, doctorLang, sessionId)
      setState((s) => ({ ...s, pipeline: result, loading: false }))
      return result
    } catch (e) {
      setError(e as ApiError)
      return null
    }
  }, [setLoading, setError])

  const runSpeechToText = useCallback(async (
    audio: File,
    sessionId: string,
    lang?: string,
  ): Promise<string | null> => {
    setLoading()
    try {
      const result = await speechToText(audio, sessionId, lang)
      setState((s) => ({ ...s, loading: false }))
      return result.text
    } catch (e) {
      setError(e as ApiError)
      return null
    }
  }, [setLoading, setError])

  const runDetectLanguage = useCallback(async (
    text: string,
    sessionId: string,
  ): Promise<DetectedLanguage | null> => {
    setLoading()
    try {
      const result = await detectLanguage(text, sessionId)
      setState((s) => ({ ...s, detection: result, loading: false }))
      return result
    } catch (e) {
      setError(e as ApiError)
      return null
    }
  }, [setLoading, setError])

  const runTranslate = useCallback(async (
    text: string,
    src: string,
    tgt: string,
    sessionId: string,
  ): Promise<TranslationResult | null> => {
    setLoading()
    try {
      const result = await translate(text, src, tgt, sessionId)
      setState((s) => ({ ...s, translation: result, loading: false }))
      return result
    } catch (e) {
      setError(e as ApiError)
      return null
    }
  }, [setLoading, setError])

  const reset = useCallback(() => setState(initial), [])

  return { ...state, runFullPipeline, runSpeechToText, runDetectLanguage, runTranslate, reset }
}
