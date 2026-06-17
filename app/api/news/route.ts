import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? 12), 50)
  const type = searchParams.get('type') // 'news' | 'announcement' | null

  const posts = await query(
    `SELECT * FROM news_posts WHERE is_published = true ${type ? 'AND type = $2' : ''}
     ORDER BY published_at DESC LIMIT $1`,
    type ? [limit, type] : [limit],
  )
  return NextResponse.json(posts)
}
