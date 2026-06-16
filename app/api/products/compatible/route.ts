import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  if (!code) return NextResponse.json([], { status: 200 })

  const products = await query(
    `SELECT p.*,
       CASE WHEN c.id IS NOT NULL THEN row_to_json(c) END AS category
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.product_type = 'PA' AND $1 = ANY(p.compatible_with)
     ORDER BY p.name_ru`,
    [code],
  )
  return NextResponse.json(products)
}
