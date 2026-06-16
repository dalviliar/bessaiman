import { NextResponse } from 'next/server'
import { query, queryOne, pool } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'
import { logAction } from '@/lib/audit'
import { slugify } from '@/lib/slugify'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'products', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  const products = await query(
    `SELECT p.*, w.quantity AS stock_quantity,
       CASE WHEN c.id IS NOT NULL THEN json_build_object('name_ru', c.name_ru, 'slug', c.slug) END AS category
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN warehouse_items w ON w.product_id = p.id
     ORDER BY p.classification_code ASC, p.name_ru ASC`,
  )
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'products', 'create')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name_ru, name_kk, name_en, model, category_id,
      description_ru, description_kk, description_en,
      price, price_with_discount, bulk_threshold, bulk_discount_percent,
      availability, barcode, images, specs, product_type, classification_code,
      compatible_with, weight_kg, unit, quantity,
    } = body

    if (!name_ru || !category_id) {
      return NextResponse.json({ error: 'Заполните название и категорию' }, { status: 400 })
    }

    const slugBase = slugify(model || name_en || name_ru)
    let slug = slugBase
    let n = 1
    while (await queryOne('SELECT id FROM products WHERE slug = $1', [slug])) {
      slug = `${slugBase}-${++n}`
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const result = await client.query(
        `INSERT INTO products (
           slug, category_id, name_ru, name_kk, name_en, model,
           description_ru, description_kk, description_en,
           price, price_with_discount, bulk_threshold, bulk_discount_percent,
           availability, barcode, images, specs, product_type, classification_code,
           compatible_with, weight_kg, unit
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
         ) RETURNING *`,
        [
          slug, category_id, name_ru, name_kk || name_ru, name_en || name_ru, model ?? null,
          description_ru ?? null, description_kk ?? null, description_en ?? null,
          price ?? null, price_with_discount ?? null, bulk_threshold ?? 3, bulk_discount_percent ?? 5,
          availability ?? 'in_stock', barcode ?? null, images ?? [], specs ? JSON.stringify(specs) : null,
          product_type ?? 'S', classification_code ?? null,
          compatible_with ?? [], weight_kg ?? null, unit ?? 'шт',
        ],
      )
      const product = result.rows[0]

      const qty = Number(quantity) || 0
      if (qty > 0) {
        await client.query(
          `INSERT INTO warehouse_items (product_id, barcode, quantity) VALUES ($1, $2, $3)`,
          [product.id, barcode ?? null, qty],
        )
        await client.query(
          `INSERT INTO warehouse_transactions (product_id, barcode, type, quantity, note)
           VALUES ($1, $2, 'in', $3, 'Начальный остаток при создании товара')`,
          [product.id, barcode ?? null, qty],
        )
      }

      await client.query('COMMIT')

      await logAction({
        adminId: me.id, adminEmail: me.email, action: 'create',
        entityType: 'product', entityId: product.id, entityLabel: product.name_ru,
      })

      return NextResponse.json(product)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
