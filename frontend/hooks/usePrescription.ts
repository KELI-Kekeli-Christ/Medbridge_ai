'use client'

import { useState, useCallback } from 'react'
import type { PrescriptionLine, PrescriptionPayload, PrescriptionResponse, ApiError } from '@/types'
import { createPrescription, downloadPrescriptionPdf, triggerPdfDownload } from '@/services/prescription-api'

function newUiId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2)
}

function emptyLine(): PrescriptionLine {
  return { _uiId: newUiId(), medication: '', dosage: '', posology: '', duration: '' }
}

interface UsePrescriptionReturn {
  lines: PrescriptionLine[]
  prescriptionId: string | null
  loading: boolean
  error: ApiError | null
  addLine: () => void
  updateLine: (uiId: string, field: keyof Omit<PrescriptionLine, '_uiId'>, value: string) => void
  removeLine: (uiId: string) => void
  submit: (base: Omit<PrescriptionPayload, 'lines'>) => Promise<PrescriptionResponse | null>
  downloadPdf: (id: string, filename?: string) => Promise<void>
}

export function usePrescription(): UsePrescriptionReturn {
  const [lines, setLines] = useState<PrescriptionLine[]>([emptyLine()])
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const addLine = useCallback(() => {
    setLines((prev) => [...prev, emptyLine()])
  }, [])

  const updateLine = useCallback((
    uiId: string,
    field: keyof Omit<PrescriptionLine, '_uiId'>,
    value: string,
  ) => {
    setLines((prev) => prev.map((l) => (l._uiId === uiId ? { ...l, [field]: value } : l)))
  }, [])

  const removeLine = useCallback((uiId: string) => {
    setLines((prev) => prev.filter((l) => l._uiId !== uiId))
  }, [])

  const submit = useCallback(async (
    base: Omit<PrescriptionPayload, 'lines'>,
  ): Promise<PrescriptionResponse | null> => {
    setLoading(true)
    setError(null)
    try {
      const payload: PrescriptionPayload = {
        ...base,
        // Strip the UI-only _uiId before sending to the backend.
        lines: lines.map(({ _uiId: _, ...rest }) => rest),
      }
      const res = await createPrescription(payload)
      setPrescriptionId(res.id)
      return res
    } catch (e) {
      setError(e as ApiError)
      return null
    } finally {
      setLoading(false)
    }
  }, [lines])

  const downloadPdf = useCallback(async (id: string, filename = 'ordonnance.pdf') => {
    setLoading(true)
    setError(null)
    try {
      const blob = await downloadPrescriptionPdf(id)
      triggerPdfDownload(blob, filename)
    } catch (e) {
      setError(e as ApiError)
    } finally {
      setLoading(false)
    }
  }, [])

  return { lines, prescriptionId, loading, error, addLine, updateLine, removeLine, submit, downloadPdf }
}
