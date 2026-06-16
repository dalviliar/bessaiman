import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { Category } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const categories = await query<Category>(
    'SELECT * FROM categories ORDER BY name_ru'
  )
  return NextResponse.json(categories)
}
