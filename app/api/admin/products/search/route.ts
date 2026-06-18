import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'products', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json([])

  const results = await query(
    `SELECT id, name_ru, name_kk, name_en, model, images, product_type
     FROM products
     WHERE name_ru ILIKE $1 OR name_kk ILIKE $1 OR model ILIKE $1
     ORDER BY name_ru
     LIMIT 15`,
    [`%${q}%`],
  )
  return NextResponse.json(results)
}
