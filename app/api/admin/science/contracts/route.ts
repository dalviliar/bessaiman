import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'
import { logAction } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_ALIGN = ['left', 'center', 'justify']

export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'content', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  const rows = await query(`SELECT * FROM science_contracts ORDER BY sort_order ASC, created_at ASC`)
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'content', 'create')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { title, customer, year, description, text_align } = await request.json()
    if (!title?.trim()) return NextResponse.json({ error: 'Укажите тему договора' }, { status: 400 })
    const align = ALLOWED_ALIGN.includes(text_align) ? text_align : 'left'

    const row = await queryOne(
      `INSERT INTO science_contracts (title, customer, year, description, text_align, sort_order)
       VALUES ($1,$2,$3,$4,$5, (SELECT COALESCE(MAX(sort_order),0)+10 FROM science_contracts)) RETURNING *`,
      [title.trim(), customer || null, year ? Number(year) : null, description || null, align],
    )

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'create',
      entityType: 'science_contract', entityId: row.id, entityLabel: row.title,
    })

    return NextResponse.json(row)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
