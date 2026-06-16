import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can, canManageRole } from '@/lib/admin'
import { logAction } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'roles', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  const roles = await query('SELECT * FROM admin_roles ORDER BY level')
  return NextResponse.json(roles)
}

export async function POST(request: Request) {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'roles', 'create')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  const { name, display_name_ru, level, permissions } = await request.json()
  if (!name?.match(/^[a-z_]+$/)) {
    return NextResponse.json({ error: 'Имя-код: только строчные буквы и _' }, { status: 400 })
  }
  if (!canManageRole(me.role?.level ?? 999, level)) {
    return NextResponse.json({ error: 'Нельзя создать роль выше или равную своей' }, { status: 403 })
  }

  const existing = await queryOne('SELECT id FROM admin_roles WHERE name = $1', [name])
  if (existing) {
    return NextResponse.json({ error: 'Роль с таким кодом уже существует' }, { status: 409 })
  }

  const role = await queryOne(
    `INSERT INTO admin_roles (name, display_name_ru, level, permissions, is_system)
     VALUES ($1, $2, $3, $4, false) RETURNING *`,
    [name, display_name_ru, level, JSON.stringify(permissions ?? {})],
  )

  await logAction({
    adminId: me.id, adminEmail: me.email, action: 'create',
    entityType: 'role', entityId: role.id, entityLabel: role.display_name_ru,
  })

  return NextResponse.json(role)
}
