import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can, canManageRole } from '@/lib/admin'
import { hashPassword } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'users', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  const users = await query(
    `SELECT u.id, u.email, u.full_name, u.role_id, u.is_active, u.created_by, u.last_seen, u.created_at,
       row_to_json(r) AS role
     FROM admin_users u
     LEFT JOIN admin_roles r ON r.id = u.role_id
     ORDER BY u.created_at DESC`,
  )
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'users', 'create')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  const { email, password, full_name, role_id } = await request.json()
  if (!email || !password || !role_id) {
    return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Пароль минимум 8 символов' }, { status: 400 })
  }

  const targetRole = await queryOne<{ level: number }>(
    'SELECT level FROM admin_roles WHERE id = $1',
    [role_id],
  )
  if (!targetRole) return NextResponse.json({ error: 'Роль не найдена' }, { status: 404 })
  if (!canManageRole(me.role?.level ?? 999, targetRole.level)) {
    return NextResponse.json({ error: 'Нельзя назначить роль выше или равную своей' }, { status: 403 })
  }

  const existing = await queryOne('SELECT id FROM admin_users WHERE email = $1', [email])
  if (existing) {
    return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)
  const user = await queryOne(
    `INSERT INTO admin_users (email, password_hash, full_name, role_id, is_active, created_by)
     VALUES ($1, $2, $3, $4, true, $5) RETURNING id, email, full_name, role_id, is_active, created_at`,
    [email, passwordHash, full_name ?? null, role_id, me.id],
  )
  return NextResponse.json({ ok: true, ...user })
}
