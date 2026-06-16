import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ barcode: string }> }) {
  const { barcode } = await params
  const item = await queryOne(
    `SELECT w.*, row_to_json(p) AS product
     FROM warehouse_items w
     JOIN products p ON p.id = w.product_id
     WHERE w.barcode = $1`,
    [barcode],
  )
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}
