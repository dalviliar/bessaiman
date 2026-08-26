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
    const { title, patent_number, badge_label, image_url, description } = await request.json()
    if (!title?.trim()) return NextResponse.json({ error: 'Укажите название патента' }, { status: 400 })

    const row = await queryOne(
      `UPDATE science_patents SET title=$1, patent_number=$2, badge_label=$3, image_url=$4, description=$5
       WHERE id=$6 RETURNING *`,
      [title.trim(), patent_number || null, badge_label?.trim() || 'Патент', image_url || null, description || null, id],
    )
    if (!row) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'update',
      entityType: 'science_patent', entityId: row.id, entityLabel: row.title,
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
    const row = await queryOne('SELECT id, title FROM science_patents WHERE id=$1', [id])
    if (!row) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    await queryOne('DELETE FROM science_patents WHERE id=$1', [id])

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'delete',
      entityType: 'science_patent', entityId: row.id, entityLabel: row.title,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
