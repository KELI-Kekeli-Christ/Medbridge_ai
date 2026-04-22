import { NextResponse } from 'next/server'
import { delay } from '../../_mock/store'

export async function POST() {
  await delay(1000)
  return NextResponse.json({
    text: 'Ma bëgg naa jënd yaram, dama sàcc ak dafa tang.',
    confidence: 0.84,
    detected_language: 'wo',
  })
}
