import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const product = await queryOne(
    `SELECT p.*,
       CASE WHEN c.id IS NOT NULL THEN row_to_json(c) END AS category
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.slug = $1`,
    [slug],
  )
  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const [documents, accessories] = await Promise.all([
    query('SELECT * FROM product_documents WHERE product_id = $1', [product.id]),
    query(
      `SELECT acc.*,
         CASE WHEN c.id IS NOT NULL THEN row_to_json(c) END AS category
       FROM product_accessories pa
       JOIN products acc ON acc.id = pa.accessory_id
       LEFT JOIN categories c ON c.id = acc.category_id
       WHERE pa.product_id = $1`,
      [product.id],
    ),
  ])

  return NextResponse.json({ ...product, documents, accessories })
}
