import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'
import { logAction } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_ALIGN = ['left', 'center', 'justify']

export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'content', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  const rows = await query(`SELECT * FROM science_projects ORDER BY sort_order ASC, created_at ASC`)
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'content', 'create')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { title_ru, title_kk, title_en, description_ru, description_kk, description_en, period, tags, images, kind, text_align } = await request.json()
    if (!title_ru?.trim()) return NextResponse.json({ error: 'Укажите название проекта' }, { status: 400 })
    const align = ALLOWED_ALIGN.includes(text_align) ? text_align : 'left'

    const row = await queryOne(
      `INSERT INTO science_projects (title_ru, title_kk, title_en, description_ru, description_kk, description_en, period, tags, images, kind, text_align, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, (SELECT COALESCE(MAX(sort_order),0)+10 FROM science_projects)) RETURNING *`,
      [title_ru.trim(), title_kk || null, title_en || null, description_ru || null, description_kk || null, description_en || null, period || null, tags || null, Array.isArray(images) ? images.filter(Boolean) : [], kind === 'project' ? 'project' : 'individual', align],
    )

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'create',
      entityType: 'science_project', entityId: row.id, entityLabel: row.title_ru,
    })

    return NextResponse.json(row)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
