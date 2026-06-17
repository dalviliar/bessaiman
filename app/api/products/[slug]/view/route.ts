import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { headers } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const product = await query<{ id: string }>(
      'SELECT id FROM products WHERE slug = $1',
      [params.slug],
    )
    if (!product.length) return NextResponse.json({ ok: false })

    const headersList = headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'

    await query(
      `INSERT INTO product_views (product_id, ip_hash)
       VALUES ($1, md5($2))`,
      [product[0].id, ip],
    )
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
