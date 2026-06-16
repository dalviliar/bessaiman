import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categorySlug = searchParams.get('category')
  const productType = searchParams.get('type')

  const conditions: string[] = [`p.product_type != 'PP'`]
  const params: unknown[] = []

  if (categorySlug) {
    params.push(categorySlug)
    conditions.push(`c.slug = $${params.length}`)
  }
  if (productType && productType !== 'all') {
    params.push(productType)
    conditions.push(`p.product_type = $${params.length}`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const products = await query(
    `SELECT p.*,
       CASE WHEN c.id IS NOT NULL THEN row_to_json(c) END AS category
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ${where}
     ORDER BY p.classification_code ASC, p.name_ru ASC`,
    params,
  )
  return NextResponse.json(products)
}
