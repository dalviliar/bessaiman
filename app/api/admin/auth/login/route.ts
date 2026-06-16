import { NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'
import { verifyPassword, signSession, setSessionCookie } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 })
  }

  const user = await queryOne<{ id: string; password_hash: string; is_active: boolean }>(
    'SELECT id, password_hash, is_active FROM admin_users WHERE email = $1',
    [email],
  )

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
  }
  if (!user.is_active) {
    return NextResponse.json({ error: 'Доступ запрещён. Обратитесь к администратору.' }, { status: 403 })
  }

  const token = await signSession({ uid: user.id })
  await setSessionCookie(token)
  await query('UPDATE admin_users SET last_seen = now() WHERE id = $1', [user.id])

  return NextResponse.json({ ok: true })
}
