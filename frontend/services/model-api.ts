import type { ModelsResponse } from '@/types'
import { handleResponse } from '@/lib/utils'

export async function getModels(): Promise<ModelsResponse> {
  const res = await fetch('/api/models/')
  return handleResponse<ModelsResponse>(res)
}
