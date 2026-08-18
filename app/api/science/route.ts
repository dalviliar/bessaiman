import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [publications, patents, projects, achievements, contracts, accreditation] = await Promise.all([
      query(`SELECT * FROM science_publications ORDER BY sort_order ASC, created_at ASC`),
      query(`SELECT * FROM science_patents ORDER BY sort_order ASC, created_at ASC`),
      query(`SELECT * FROM science_projects ORDER BY sort_order ASC, created_at ASC`),
      query(`SELECT * FROM science_achievements ORDER BY sort_order ASC, created_at ASC`),
      query(`SELECT * FROM science_contracts ORDER BY sort_order ASC, created_at ASC`),
      queryOne(`SELECT * FROM science_accreditation WHERE id = 'main'`),
    ])
    return NextResponse.json({ publications, patents, projects, achievements, contracts, accreditation })
  } catch {
    return NextResponse.json({ publications: [], patents: [], projects: [], achievements: [], contracts: [], accreditation: null }, { status: 200 })
  }
}
