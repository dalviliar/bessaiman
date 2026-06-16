import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'products', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  const products = await query(
    `SELECT p.*,
       CASE WHEN c.id IS NOT NULL THEN json_build_object('name_ru', c.name_ru, 'slug', c.slug) END AS category
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ORDER BY p.classification_code ASC, p.name_ru ASC`,
  )
  return NextResponse.json(products)
}
