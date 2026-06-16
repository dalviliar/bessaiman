import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can, canManageRole } from '@/lib/admin'
import { logAction } from '@/lib/audit'

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
  const updated = await queryOne<{ id: string; is_active: boolean; email: string }>(
    'UPDATE admin_users SET is_active = $1 WHERE id = $2 RETURNING id, is_active, email',
    [is_active, id],
  )

  if (updated) {
    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'update',
      entityType: 'user', entityId: updated.id, entityLabel: updated.email,
      details: { is_active },
    })
  }

  return NextResponse.json(updated)
}
