import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const partners = await query(
      `SELECT * FROM partners ORDER BY sort_order ASC, created_at ASC`,
    )
    return NextResponse.json(partners)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
