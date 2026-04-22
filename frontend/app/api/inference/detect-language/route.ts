import { NextResponse } from 'next/server'
import { delay } from '../../_mock/store'

export async function POST() {
  await delay(600)
  return NextResponse.json({
    language_code: 'wo',
    language_name: 'Wolof',
    confidence: 0.92,
  })
}
