import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'
import { logAction } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'products', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  const categories = await query('SELECT * FROM categories ORDER BY sort_order, name_ru')
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'categories', 'create')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { slug, name_ru, name_kk, name_en, description_ru, classification_code } = await request.json()
    if (!slug || !name_ru) {
      return NextResponse.json({ error: 'Заполните slug и название' }, { status: 400 })
    }
    const category = await queryOne(
      `INSERT INTO categories (slug, name_ru, name_kk, name_en, description_ru, description_kk, description_en, classification_code, sort_order)
       VALUES ($1,$2,$3,$4,$5,$5,$5,$6, (SELECT COALESCE(MAX(sort_order),0)+10 FROM categories)) RETURNING *`,
      [slug, name_ru, name_kk || name_ru, name_en || name_ru, description_ru || null, classification_code || null],
    )

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'create',
      entityType: 'category', entityId: category.id, entityLabel: category.name_ru,
    })

    return NextResponse.json(category)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
