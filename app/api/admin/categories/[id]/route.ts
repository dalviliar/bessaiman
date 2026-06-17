import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !me.role?.permissions?.all) {
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
    return NextResponse.json(category)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
