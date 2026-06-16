import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''
  if (!q.trim()) return NextResponse.json([])

  const like = `%${q}%`
  const products = await query(
    `SELECT p.*,
       CASE WHEN c.id IS NOT NULL THEN row_to_json(c) END AS category
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.name_ru ILIKE $1 OR p.name_kk ILIKE $1 OR p.name_en ILIKE $1 OR p.model ILIKE $1
     LIMIT 20`,
    [like],
  )
  return NextResponse.json(products)
}
