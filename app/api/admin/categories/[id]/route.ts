import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'
import { logAction } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'categories', 'update')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { id } = await params
    const { name_ru, name_kk, name_en, description_ru, classification_code, image_url } = await request.json()
    const category = await queryOne(
      `UPDATE categories SET name_ru=$1,name_kk=$2,name_en=$3,description_ru=$4,classification_code=$5,image_url=$6
       WHERE id=$7 RETURNING *`,
      [name_ru, name_kk || name_ru, name_en || name_ru, description_ru || null, classification_code || null, image_url || null, id],
    )
    if (!category) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'update',
      entityType: 'category', entityId: category.id, entityLabel: category.name_ru,
    })

    return NextResponse.json(category)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'categories', 'delete')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { id } = await params
    const category = await queryOne('SELECT id, name_ru FROM categories WHERE id = $1', [id])
    if (!category) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })

    await query('DELETE FROM categories WHERE id = $1', [id])

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'delete',
      entityType: 'category', entityId: category.id, entityLabel: category.name_ru,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
