import { NextResponse } from 'next/server'
import { pool, query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 200)

  const transactions = await query(
    `SELECT t.*, row_to_json(d) AS product
     FROM warehouse_transactions t
     JOIN products p ON p.id = t.product_id
     JOIN LATERAL (SELECT p.id, p.name_ru, p.name_kk, p.name_en, p.model) d ON true
     ORDER BY t.created_at DESC
     LIMIT $1`,
    [limit],
  )
  return NextResponse.json(transactions)
}

export async function POST(request: Request) {
  const tx = await request.json()
  const { product_id, barcode, type, quantity, note, performed_by_name } = tx

  if (!product_id || !type || !quantity) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(
      `INSERT INTO warehouse_transactions (product_id, barcode, type, quantity, note, performed_by_name)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [product_id, barcode ?? null, type, quantity, note ?? null, performed_by_name ?? null],
    )

    const delta = type === 'in' ? quantity : -quantity
    const existing = await client.query(
      'SELECT id, quantity FROM warehouse_items WHERE product_id = $1',
      [product_id],
    )

    if (existing.rows[0]) {
      await client.query(
        'UPDATE warehouse_items SET quantity = $1, last_updated = now() WHERE id = $2',
        [existing.rows[0].quantity + delta, existing.rows[0].id],
      )
    } else {
      await client.query(
        'INSERT INTO warehouse_items (product_id, barcode, quantity) VALUES ($1, $2, $3)',
        [product_id, barcode ?? null, Math.max(0, delta)],
      )
    }

    await client.query('COMMIT')
    return NextResponse.json({ ok: true })
  } catch (err) {
    await client.query('ROLLBACK')
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  } finally {
    client.release()
  }
}
