import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !me.role?.permissions?.all) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  const logs = await query(
    `SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 300`,
  )
  return NextResponse.json(logs)
}
