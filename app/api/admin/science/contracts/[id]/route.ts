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
    const { title, customer, year, description, text_align } = await request.json()
    if (!title?.trim()) return NextResponse.json({ error: 'Укажите тему договора' }, { status: 400 })
    const align = ALLOWED_ALIGN.includes(text_align) ? text_align : 'left'

    const row = await queryOne(
      `UPDATE science_contracts SET title=$1, customer=$2, year=$3, description=$4, text_align=$5
       WHERE id=$6 RETURNING *`,
      [title.trim(), customer || null, year ? Number(year) : null, description || null, align, id],
    )
    if (!row) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'update',
      entityType: 'science_contract', entityId: row.id, entityLabel: row.title,
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
    const row = await queryOne('SELECT id, title FROM science_contracts WHERE id=$1', [id])
    if (!row) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    await queryOne('DELETE FROM science_contracts WHERE id=$1', [id])

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'delete',
      entityType: 'science_contract', entityId: row.id, entityLabel: row.title,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
