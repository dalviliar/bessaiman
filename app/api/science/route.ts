import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [publications, patents, projects, achievements] = await Promise.all([
      query(`SELECT * FROM science_publications ORDER BY sort_order ASC, created_at ASC`),
      query(`SELECT * FROM science_patents ORDER BY sort_order ASC, created_at ASC`),
      query(`SELECT * FROM science_projects ORDER BY sort_order ASC, created_at ASC`),
      query(`SELECT * FROM science_achievements ORDER BY sort_order ASC, created_at ASC`),
    ])
    return NextResponse.json({ publications, patents, projects, achievements })
  } catch {
    return NextResponse.json({ publications: [], patents: [], projects: [], achievements: [] }, { status: 200 })
  }
}
