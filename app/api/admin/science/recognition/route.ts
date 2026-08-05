import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_KINDS = ['company_achievement', 'accreditation']

export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'content', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  const rows = await query(`SELECT kind, image_url FROM science_recognition`)
  return NextResponse.json(rows)
}

export async function PUT(request: Request) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'content', 'update')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { kind, image_url } = await request.json()
    if (!ALLOWED_KINDS.includes(kind)) {
      return NextResponse.json({ error: 'Некорректный тип' }, { status: 400 })
    }
    const row = await queryOne(
      `INSERT INTO science_recognition (kind, image_url, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (kind) DO UPDATE SET image_url = $2, updated_at = NOW()
       RETURNING kind, image_url`,
      [kind, image_url || null],
    )
    return NextResponse.json(row)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
