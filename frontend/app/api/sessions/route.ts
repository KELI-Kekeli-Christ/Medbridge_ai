import { NextResponse } from 'next/server'
import { createSession, delay } from '../_mock/store'

export async function POST() {
  await delay(400)
  const session = createSession()
  return NextResponse.json(session, { status: 201 })
}
