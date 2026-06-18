import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'kp_requests', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  const rows = await query<{
    id: string
    name: string
    email: string
    message: string
    is_read: boolean
    created_at: string
  }>(`SELECT id, name, email, message, is_read, created_at
      FROM contact_requests
      ORDER BY created_at DESC`)

  return NextResponse.json(rows)
}

export async function PATCH(request: Request) {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'kp_requests', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  const { id } = await request.json()
  await query(`UPDATE contact_requests SET is_read = true WHERE id = $1`, [id])
  return NextResponse.json({ ok: true })
}
