import { NextResponse } from 'next/server'
import { sessions, delay } from '../../_mock/store'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await delay(300)
  const { id } = await params
  const session = sessions.get(id)
  if (!session) {
    return NextResponse.json({ detail: 'Session introuvable ou expirée.' }, { status: 404 })
  }
  return NextResponse.json(session)
}
