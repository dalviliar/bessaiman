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

  const classificationCode = (product.category as { classification_code?: string } | null)?.classification_code

  const [documents, accForward, accReverse, accByCode, accByCodeReverse] = await Promise.all([
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
    query(
      `SELECT acc.*,
         CASE WHEN c.id IS NOT NULL THEN row_to_json(c) END AS category
       FROM product_accessories pa
       JOIN products acc ON acc.id = pa.product_id
       LEFT JOIN categories c ON c.id = acc.category_id
       WHERE pa.accessory_id = $1`,
      [product.id],
    ),
    // Accessories auto-linked by category code (set on the accessory itself,
    // under "Совместимость"), rather than picked one by one on this product.
    // Direction: this product is the "main" item, we're looking for PA
    // accessories whose code list contains this product's own category code.
    classificationCode
      ? query(
          `SELECT acc.*,
             CASE WHEN c.id IS NOT NULL THEN row_to_json(c) END AS category
           FROM products acc
           LEFT JOIN categories c ON c.id = acc.category_id
           WHERE acc.product_type = 'PA' AND $1 = ANY(acc.compatible_with) AND acc.id != $2`,
          [classificationCode, product.id],
        )
      : Promise.resolve([]),
    // Reverse direction: this product IS the accessory (has its own code
    // list under "Совместимость"), so on its own page show which main
    // products it declares itself compatible with — otherwise the link
    // only ever showed up on the main product's page, never on the
    // accessory's own page.
    product.compatible_with?.length
      ? query(
          `SELECT acc.*,
             CASE WHEN c.id IS NOT NULL THEN row_to_json(c) END AS category
           FROM products acc
           JOIN categories c ON c.id = acc.category_id
           WHERE c.classification_code = ANY($1) AND acc.id != $2`,
          [product.compatible_with, product.id],
        )
      : Promise.resolve([]),
  ])

  const seen = new Set<string>()
  const accessories = [...accForward, ...accReverse, ...accByCode, ...accByCodeReverse].filter(a => {
    if (seen.has(a.id)) return false
    seen.add(a.id)
    return true
  })

  return NextResponse.json({ ...product, documents, accessories })
}
