import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rows = await query<{ page: string; image_url: string }>('SELECT page, image_url FROM page_images')
    const map: Record<string, string> = {}
    for (const r of rows) map[r.page] = r.image_url
    return NextResponse.json(map)
  } catch {
    // before the migration runs the pages fall back to their bundled photo
    return NextResponse.json({})
  }
}
