import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'
import { logAction } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PAGES = ['nauka', 'catalog', 'about']

export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'settings', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  const rows = await query('SELECT page, image_url FROM page_images ORDER BY page')
  return NextResponse.json(rows)
}

export async function PUT(request: Request) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'settings', 'update')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { page, image_url } = await request.json()
    if (!PAGES.includes(page)) return NextResponse.json({ error: 'Неизвестная страница' }, { status: 400 })
    if (!image_url?.trim()) return NextResponse.json({ error: 'Не передано изображение' }, { status: 400 })

    const row = await queryOne(
      `INSERT INTO page_images (page, image_url, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (page) DO UPDATE SET image_url = EXCLUDED.image_url, updated_at = NOW()
       RETURNING *`,
      [page, image_url.trim()],
    )

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'update',
      entityType: 'page_image', entityId: page, entityLabel: page,
    })

    return NextResponse.json(row)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
