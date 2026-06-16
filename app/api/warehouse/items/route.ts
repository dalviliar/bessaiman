import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const items = await query(
    `SELECT w.*,
       row_to_json(d) AS product
     FROM warehouse_items w
     JOIN products p ON p.id = w.product_id
     JOIN LATERAL (
       SELECT p.id, p.name_ru, p.name_kk, p.name_en, p.model, p.images, p.classification_code
     ) d ON true
     ORDER BY w.last_updated DESC`,
  )
  return NextResponse.json(items)
}
