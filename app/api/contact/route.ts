import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })
    }

    await query(
      `INSERT INTO contact_requests (name, email, message) VALUES ($1, $2, $3)`,
      [name.trim(), email.trim(), message.trim()],
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('contact insert error:', err)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
