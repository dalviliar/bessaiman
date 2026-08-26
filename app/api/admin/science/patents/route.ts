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
  const rows = await query(`SELECT * FROM science_patents ORDER BY sort_order ASC, created_at ASC`)
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'content', 'create')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { title_ru, title_kk, title_en, patent_number, badge_label, image_url, description_ru, description_kk, description_en, text_align } = await request.json()
    if (!title_ru?.trim()) return NextResponse.json({ error: 'Укажите название патента' }, { status: 400 })

    const row = await queryOne(
      `INSERT INTO science_patents (title_ru, title_kk, title_en, patent_number, badge_label, image_url, description_ru, description_kk, description_en, text_align, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, (SELECT COALESCE(MAX(sort_order),0)+10 FROM science_patents)) RETURNING *`,
      [title_ru.trim(), title_kk || null, title_en || null, patent_number || null, badge_label?.trim() || 'Патент', image_url || null,
        description_ru || null, description_kk || null, description_en || null, text_align || 'left'],
    )

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'create',
      entityType: 'science_patent', entityId: row.id, entityLabel: row.title_ru,
    })

    return NextResponse.json(row)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
