import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'
import { logAction } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'content', 'update')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { id } = await params
    const { title_ru, title_kk, title_en, patent_number, badge_label, image_url, description_ru, description_kk, description_en, text_align } = await request.json()
    if (!title_ru?.trim()) return NextResponse.json({ error: 'Укажите название патента' }, { status: 400 })

    const row = await queryOne(
      `UPDATE science_patents SET title_ru=$1, title_kk=$2, title_en=$3, patent_number=$4, badge_label=$5, image_url=$6,
         description_ru=$7, description_kk=$8, description_en=$9, text_align=$10
       WHERE id=$11 RETURNING *`,
      [title_ru.trim(), title_kk || null, title_en || null, patent_number || null, badge_label?.trim() || 'Патент', image_url || null,
        description_ru || null, description_kk || null, description_en || null, text_align || 'left', id],
    )
    if (!row) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'update',
      entityType: 'science_patent', entityId: row.id, entityLabel: row.title_ru,
    })

    return NextResponse.json(row)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'content', 'delete')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { id } = await params
    const row = await queryOne('SELECT id, title_ru FROM science_patents WHERE id=$1', [id])
    if (!row) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    await queryOne('DELETE FROM science_patents WHERE id=$1', [id])

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'delete',
      entityType: 'science_patent', entityId: row.id, entityLabel: row.title_ru,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
