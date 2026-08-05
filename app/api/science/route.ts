import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [publications, patents, projects, achievements, contracts, recognitionRows] = await Promise.all([
      query(`SELECT * FROM science_publications ORDER BY sort_order ASC, created_at ASC`),
      query(`SELECT * FROM science_patents ORDER BY sort_order ASC, created_at ASC`),
      query(`SELECT * FROM science_projects ORDER BY sort_order ASC, created_at ASC`),
      query(`SELECT * FROM science_achievements ORDER BY sort_order ASC, created_at ASC`),
      query(`SELECT * FROM science_contracts ORDER BY sort_order ASC, created_at ASC`),
      query(`SELECT kind, image_url FROM science_recognition`),
    ])
    const recognition: Record<string, string | null> = {}
    for (const row of recognitionRows as { kind: string; image_url: string | null }[]) {
      recognition[row.kind] = row.image_url
    }
    return NextResponse.json({ publications, patents, projects, achievements, contracts, recognition })
  } catch {
    return NextResponse.json({ publications: [], patents: [], projects: [], achievements: [], contracts: [], recognition: {} }, { status: 200 })
  }
}
