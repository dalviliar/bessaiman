import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can, canManageRole } from '@/lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'users', 'update')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  const { id } = await params
  if (id === me.id) {
    return NextResponse.json({ error: 'Нельзя изменить себя' }, { status: 400 })
  }

  const target = await queryOne<{ role_id: string | null }>(
    `SELECT r.level FROM admin_users u LEFT JOIN admin_roles r ON r.id = u.role_id WHERE u.id = $1`,
    [id],
  )
  if (!target) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
  if (!canManageRole(me.role?.level ?? 999, (target as unknown as { level: number }).level ?? 999)) {
    return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
  }

  const { is_active } = await request.json()
  const updated = await queryOne(
    'UPDATE admin_users SET is_active = $1 WHERE id = $2 RETURNING id, is_active',
    [is_active, id],
  )
  return NextResponse.json(updated)
}
