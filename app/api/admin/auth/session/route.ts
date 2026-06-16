import { NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSessionFromCookies()
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const user = await queryOne(
    `SELECT u.id, u.email, u.full_name, u.role_id, u.is_active, u.created_by, u.last_seen, u.created_at,
       row_to_json(r) AS role
     FROM admin_users u
     LEFT JOIN admin_roles r ON r.id = u.role_id
     WHERE u.id = $1 AND u.is_active = true`,
    [session.uid],
  )

  if (!user) return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })

  await query('UPDATE admin_users SET last_seen = now() WHERE id = $1', [session.uid])

  return NextResponse.json(user)
}
