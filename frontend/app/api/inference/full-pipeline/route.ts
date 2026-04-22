import { NextResponse } from 'next/server'
import { delay } from '../../_mock/store'

export async function POST(req: Request) {
  await delay(1200)
  const form = await req.formData()
  const doctorLanguage = (form.get('doctor_language') as string) ?? 'fr'

  return NextResponse.json({
    transcription: 'Ma bëgg naa jënd yaram, dama sàcc ak dafa tang.',
    detected_language: 'wo',
    detected_language_name: 'Wolof',
    translation:
      doctorLanguage !== 'wo'
        ? "J'ai mal au ventre, j'ai des nausées et de la fièvre."
        : undefined,
    confidence: 0.87,
  })
}
