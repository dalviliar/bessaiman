import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'
import { logAction } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_ALIGN = ['left', 'center', 'justify']

// A single editable record rather than a list — created on first read if the
// migration's seed row is somehow missing.
export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'content', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  const row = await queryOne(`SELECT * FROM science_accreditation WHERE id = 'main'`)
  if (row) return NextResponse.json(row)
  const created = await queryOne(
    `INSERT INTO science_accreditation (id, title_ru) VALUES ('main', '') RETURNING *`,
  )
  return NextResponse.json(created)
}

export async function PUT(request: Request) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'content', 'update')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const {
      title_ru, title_kk, title_en, description_ru, description_kk, description_en,
      issuer, valid_until, image_url, pdf_url, text_align,
    } = await request.json()
    if (!title_ru?.trim()) return NextResponse.json({ error: 'Укажите заголовок' }, { status: 400 })
    const align = ALLOWED_ALIGN.includes(text_align) ? text_align : 'left'

    const row = await queryOne(
      `INSERT INTO science_accreditation (
         id, title_ru, title_kk, title_en, description_ru, description_kk, description_en,
         issuer, valid_until, image_url, pdf_url, text_align, updated_at
       ) VALUES ('main',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, NOW())
       ON CONFLICT (id) DO UPDATE SET
         title_ru=$1, title_kk=$2, title_en=$3, description_ru=$4, description_kk=$5, description_en=$6,
         issuer=$7, valid_until=$8, image_url=$9, pdf_url=$10, text_align=$11, updated_at=NOW()
       RETURNING *`,
      [
        title_ru.trim(), title_kk || null, title_en || null,
        description_ru || null, description_kk || null, description_en || null,
        issuer || null, valid_until || null, image_url || null, pdf_url || null, align,
      ],
    )

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'update',
      entityType: 'science_accreditation', entityId: 'main', entityLabel: row.title_ru,
    })

    return NextResponse.json(row)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
