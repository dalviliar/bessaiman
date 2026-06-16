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

  const requests = await query(
    'SELECT * FROM kp_requests ORDER BY created_at DESC',
  )
  return NextResponse.json(requests)
}
