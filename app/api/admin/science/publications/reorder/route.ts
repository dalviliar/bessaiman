import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'content', 'update')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  const { orderedIds } = await request.json()
  if (!Array.isArray(orderedIds) || orderedIds.some(id => typeof id !== 'string')) {
    return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 })
  }

  for (let i = 0; i < orderedIds.length; i++) {
    await query('UPDATE science_publications SET sort_order = $1 WHERE id = $2', [(i + 1) * 10, orderedIds[i]])
  }

  return NextResponse.json({ ok: true })
}
