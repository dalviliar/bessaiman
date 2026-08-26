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
    const { title, patent_number, badge_label, image_url, description } = await request.json()
    if (!title?.trim()) return NextResponse.json({ error: 'Укажите название патента' }, { status: 400 })

    const row = await queryOne(
      `INSERT INTO science_patents (title, patent_number, badge_label, image_url, description, sort_order)
       VALUES ($1,$2,$3,$4,$5, (SELECT COALESCE(MAX(sort_order),0)+10 FROM science_patents)) RETURNING *`,
      [title.trim(), patent_number || null, badge_label?.trim() || 'Патент', image_url || null, description || null],
    )

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'create',
      entityType: 'science_patent', entityId: row.id, entityLabel: row.title,
    })

    return NextResponse.json(row)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
