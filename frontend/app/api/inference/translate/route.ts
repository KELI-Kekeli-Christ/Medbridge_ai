import { NextResponse } from 'next/server'
import { delay } from '../../_mock/store'

export async function POST(req: Request) {
  await delay(700)
  const body = await req.json()
  return NextResponse.json({
    translated_text: `[Traduction simulée] ${body.text ?? ''}`,
    source_language: body.source_language ?? 'wo',
    target_language: body.target_language ?? 'fr',
  })
}
