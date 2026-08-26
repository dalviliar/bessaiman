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
    const { full_name, award_name_ru, award_name_kk, award_name_en, year, organization, certificate_url, description_ru, description_kk, description_en, text_align } = await request.json()
    if (!full_name?.trim() || !award_name_ru?.trim()) {
      return NextResponse.json({ error: 'Укажите ФИО и название награды' }, { status: 400 })
    }

    const row = await queryOne(
      `INSERT INTO science_achievements (full_name, award_name_ru, award_name_kk, award_name_en, year, organization, certificate_url, description_ru, description_kk, description_en, text_align, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, (SELECT COALESCE(MAX(sort_order),0)+10 FROM science_achievements)) RETURNING *`,
      [full_name.trim(), award_name_ru.trim(), award_name_kk || null, award_name_en || null, year ? Number(year) : null, organization || null, certificate_url || null,
        description_ru || null, description_kk || null, description_en || null, text_align || 'left'],
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
