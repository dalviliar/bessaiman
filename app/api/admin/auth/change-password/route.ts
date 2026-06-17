import { NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'
import { verifyPassword, hashPassword, getSessionFromCookies } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const session = await getSessionFromCookies()
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const { current_password, new_password } = await request.json()
  if (!current_password || !new_password) {
    return NextResponse.json({ error: 'Все поля обязательны' }, { status: 400 })
  }
  if (new_password.length < 8) {
    return NextResponse.json({ error: 'Минимум 8 символов' }, { status: 400 })
  }

  const user = await queryOne<{ id: string; password_hash: string }>(
    'SELECT id, password_hash FROM admin_users WHERE id = $1 AND is_active = true',
    [session.uid],
  )
  if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })

  const ok = await verifyPassword(current_password, user.password_hash)
  if (!ok) return NextResponse.json({ error: 'Неверный текущий пароль' }, { status: 400 })

  const newHash = await hashPassword(new_password)
  await query('UPDATE admin_users SET password_hash = $1 WHERE id = $2', [newHash, user.id])

  return NextResponse.json({ ok: true })
}
