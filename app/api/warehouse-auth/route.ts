import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const { password } = await request.json()
  const correct = process.env.WAREHOUSE_PASSWORD ?? 'bessaiman2025'
  if (password === correct) {
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ ok: false }, { status: 401 })
}
