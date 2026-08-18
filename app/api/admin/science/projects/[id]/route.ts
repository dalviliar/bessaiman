import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'
import { logAction } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_ALIGN = ['left', 'center', 'justify']

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'content', 'update')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { id } = await params
    const { title_ru, title_kk, title_en, description_ru, description_kk, description_en, period, tags, images, kind, text_align } = await request.json()
    if (!title_ru?.trim()) return NextResponse.json({ error: 'Укажите название проекта' }, { status: 400 })
    const align = ALLOWED_ALIGN.includes(text_align) ? text_align : 'left'

    const row = await queryOne(
      `UPDATE science_projects SET title_ru=$1, title_kk=$2, title_en=$3, description_ru=$4, description_kk=$5, description_en=$6, period=$7, tags=$8, images=$9, kind=$10, text_align=$11
       WHERE id=$12 RETURNING *`,
      [title_ru.trim(), title_kk || null, title_en || null, description_ru || null, description_kk || null, description_en || null, period || null, tags || null, Array.isArray(images) ? images.filter(Boolean) : [], kind === 'project' ? 'project' : 'individual', align, id],
    )
    if (!row) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'update',
      entityType: 'science_project', entityId: row.id, entityLabel: row.title_ru,
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
    const row = await queryOne('SELECT id, title_ru FROM science_projects WHERE id=$1', [id])
    if (!row) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    await queryOne('DELETE FROM science_projects WHERE id=$1', [id])

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'delete',
      entityType: 'science_project', entityId: row.id, entityLabel: row.title_ru,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
