import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getCurrentAdminUser, hashPassword } from '@/lib/auth'
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

  const target = await queryOne<{ level: number; role_id: string; is_system: boolean }>(
    `SELECT r.level, u.role_id, r.is_system
     FROM admin_users u LEFT JOIN admin_roles r ON r.id = u.role_id WHERE u.id = $1`,
    [id],
  )
  if (!target) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })

  const t = target as unknown as { level: number; role_id: string; is_system: boolean }
  if (!canManageRole(me.role?.level ?? 999, t.level ?? 999)) {
    return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
  }

  const body = await request.json()
  const { full_name, email, password, is_active, permissions } = body

  // Build dynamic UPDATE
  const setClauses: string[] = []
  const values: unknown[] = []

  if (full_name !== undefined) { values.push(full_name || null); setClauses.push(`full_name = $${values.length}`) }
  if (email !== undefined)     { values.push(email);            setClauses.push(`email = $${values.length}`) }
  if (is_active !== undefined) { values.push(is_active);        setClauses.push(`is_active = $${values.length}`) }
  if (password) {
    const hash = await hashPassword(password)
    values.push(hash)
    setClauses.push(`password_hash = $${values.length}`)
  }

  let updated: Record<string, unknown> = {}
  if (setClauses.length > 0) {
    values.push(id)
    const row = await queryOne<Record<string, unknown>>(
      `UPDATE admin_users SET ${setClauses.join(', ')} WHERE id = $${values.length}
       RETURNING id, email, full_name, is_active`,
      values,
    )
    if (row) updated = row
  }

  // Update permissions for custom (non-system) roles only
  if (permissions !== undefined && t.role_id && !t.is_system) {
    await query(
      `UPDATE admin_roles SET permissions = $1 WHERE id = $2 AND is_system = false`,
      [JSON.stringify(permissions), t.role_id],
    )
  }

  await logAction({
    adminId: me.id, adminEmail: me.email, action: 'update',
    entityType: 'user', entityId: id, entityLabel: (email as string) || id,
    details: { full_name, email, is_active },
  })

  return NextResponse.json({ ok: true, ...updated })
}
