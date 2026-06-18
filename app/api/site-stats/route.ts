import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [products, categories, clients] = await Promise.all([
      query<{ c: string }>('SELECT COUNT(*)::text AS c FROM products'),
      query<{ c: string }>('SELECT COUNT(*)::text AS c FROM categories'),
      query<{ c: string }>(
        `SELECT COUNT(DISTINCT client_company)::text AS c
         FROM kp_requests
         WHERE client_company IS NOT NULL AND client_company != ''`
      ),
    ])

    const founded = 2021
    const years = new Date().getFullYear() - founded

    return NextResponse.json({
      products: Number(products[0]?.c ?? 0),
      categories: Number(categories[0]?.c ?? 0),
      clients: Number(clients[0]?.c ?? 0),
      years,
    })
  } catch {
    return NextResponse.json({ products: 0, categories: 0, clients: 0, years: 5 })
  }
}
