import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'
import { logAction } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'content', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  const rows = await query(`SELECT * FROM science_achievements ORDER BY sort_order ASC, created_at ASC`)
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'content', 'create')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { full_name, award_name, year, organization, certificate_url } = await request.json()
    if (!full_name?.trim() || !award_name?.trim()) {
      return NextResponse.json({ error: 'Укажите ФИО и название награды' }, { status: 400 })
    }

    const row = await queryOne(
      `INSERT INTO science_achievements (full_name, award_name, year, organization, certificate_url, sort_order)
       VALUES ($1,$2,$3,$4,$5, (SELECT COALESCE(MAX(sort_order),0)+10 FROM science_achievements)) RETURNING *`,
      [full_name.trim(), award_name.trim(), year ? Number(year) : null, organization || null, certificate_url || null],
    )

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'create',
      entityType: 'science_achievement', entityId: row.id, entityLabel: row.full_name,
    })

    return NextResponse.json(row)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
