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
    const { full_name, award_name_ru, award_name_kk, award_name_en, year, organization, certificate_url, description_ru, description_kk, description_en, text_align } = await request.json()
    if (!full_name?.trim() || !award_name_ru?.trim()) {
      return NextResponse.json({ error: 'Укажите ФИО и название награды' }, { status: 400 })
    }

    const row = await queryOne(
      `UPDATE science_achievements SET full_name=$1, award_name_ru=$2, award_name_kk=$3, award_name_en=$4, year=$5, organization=$6, certificate_url=$7,
         description_ru=$8, description_kk=$9, description_en=$10, text_align=$11
       WHERE id=$12 RETURNING *`,
      [full_name.trim(), award_name_ru.trim(), award_name_kk || null, award_name_en || null, year ? Number(year) : null, organization || null, certificate_url || null,
        description_ru || null, description_kk || null, description_en || null, text_align || 'left', id],
    )
    if (!row) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'update',
      entityType: 'science_achievement', entityId: row.id, entityLabel: row.full_name,
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
    const row = await queryOne('SELECT id, full_name FROM science_achievements WHERE id=$1', [id])
    if (!row) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    await queryOne('DELETE FROM science_achievements WHERE id=$1', [id])

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'delete',
      entityType: 'science_achievement', entityId: row.id, entityLabel: row.full_name,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
