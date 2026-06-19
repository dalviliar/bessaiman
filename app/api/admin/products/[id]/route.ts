import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'
import { logAction } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'products', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  const { id } = await params
  const product = await queryOne(
    `SELECT p.*, w.quantity AS stock_quantity
     FROM products p
     LEFT JOIN warehouse_items w ON w.product_id = p.id
     WHERE p.id = $1`,
    [id],
  )
  if (!product) return NextResponse.json({ error: 'Не найден' }, { status: 404 })

  const accessories = await query(
    `SELECT acc.id, acc.name_ru, acc.model, acc.images
     FROM product_accessories pa
     JOIN products acc ON acc.id = pa.accessory_id
     WHERE pa.product_id = $1
     ORDER BY acc.name_ru`,
    [id],
  )
  return NextResponse.json({ ...product, accessories })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'products', 'update')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { id } = await params
    const body = await request.json()
    const {
      name_ru, name_kk, name_en, model, category_id,
      description_ru, description_kk, description_en,
      price, price_with_discount, bulk_threshold, bulk_discount_percent,
      availability, barcode, images, video_url, specs, product_type, classification_code,
      compatible_with, weight_kg, unit, length_cm, width_cm, height_cm,
      accessory_ids,
    } = body

    if (!name_ru || !category_id) {
      return NextResponse.json({ error: 'Заполните название и категорию' }, { status: 400 })
    }

    const baseArgs = [
      category_id, name_ru, name_kk || name_ru, name_en || name_ru, model ?? null,
      description_ru ?? null, description_kk ?? null, description_en ?? null,
      price ?? null, price_with_discount ?? null, bulk_threshold ?? 3, bulk_discount_percent ?? 5,
      availability ?? 'in_stock', barcode ?? null, images ?? [],
      specs ? JSON.stringify(specs) : null,
      product_type ?? 'S', classification_code ?? null, compatible_with ?? [],
      weight_kg ?? null, unit ?? 'шт',
      length_cm ?? null, width_cm ?? null, height_cm ?? null, id,
    ]

    let product
    try {
      product = await queryOne(
        `UPDATE products SET
           category_id = $1, name_ru = $2, name_kk = $3, name_en = $4, model = $5,
           description_ru = $6, description_kk = $7, description_en = $8,
           price = $9, price_with_discount = $10, bulk_threshold = $11, bulk_discount_percent = $12,
           availability = $13, barcode = $14, images = $15, video_url = $16, specs = $17, product_type = $18,
           classification_code = $19, compatible_with = $20, weight_kg = $21, unit = $22,
           length_cm = $23, width_cm = $24, height_cm = $25
         WHERE id = $26 RETURNING *`,
        [...baseArgs.slice(0, 15), video_url ?? null, ...baseArgs.slice(15)],
      )
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('video_url')) {
        product = await queryOne(
          `UPDATE products SET
             category_id = $1, name_ru = $2, name_kk = $3, name_en = $4, model = $5,
             description_ru = $6, description_kk = $7, description_en = $8,
             price = $9, price_with_discount = $10, bulk_threshold = $11, bulk_discount_percent = $12,
             availability = $13, barcode = $14, images = $15, specs = $16, product_type = $17,
             classification_code = $18, compatible_with = $19, weight_kg = $20, unit = $21,
             length_cm = $22, width_cm = $23, height_cm = $24
           WHERE id = $25 RETURNING *`,
          baseArgs,
        )
      } else { throw e }
    }
    if (!product) return NextResponse.json({ error: 'Не найден' }, { status: 404 })

    // Sync product_accessories join table
    await query('DELETE FROM product_accessories WHERE product_id = $1', [id])
    if (Array.isArray(accessory_ids) && accessory_ids.length > 0) {
      for (const aid of accessory_ids) {
        await query(
          'INSERT INTO product_accessories (product_id, accessory_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, aid],
        )
      }
    }

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'update',
      entityType: 'product', entityId: product.id, entityLabel: product.name_ru,
    })

    return NextResponse.json(product)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'products', 'delete')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { id } = await params
    const product = await queryOne('SELECT id, name_ru FROM products WHERE id = $1', [id])
    if (!product) return NextResponse.json({ error: 'Не найден' }, { status: 404 })

    await queryOne('DELETE FROM products WHERE id = $1 RETURNING id', [id])

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'delete',
      entityType: 'product', entityId: product.id, entityLabel: product.name_ru,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
