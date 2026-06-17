import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'
import { logAction } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'content', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  const posts = await query('SELECT * FROM news_posts ORDER BY created_at DESC')
  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'content', 'create')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { title_ru, title_kk, title_en, content_ru, content_kk, content_en,
            image_url, instagram_url, type, is_published } = await request.json()
    if (!title_ru) return NextResponse.json({ error: 'Заполните заголовок' }, { status: 400 })

    const post = await queryOne(
      `INSERT INTO news_posts (title_ru,title_kk,title_en,content_ru,content_kk,content_en,
         image_url,instagram_url,type,is_published,published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [title_ru, title_kk || null, title_en || null, content_ru || null, content_kk || null, content_en || null,
       image_url || null, instagram_url || null, type || 'news', is_published ?? false,
       is_published ? new Date().toISOString() : null],
    )

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'create',
      entityType: 'news' as 'role', entityId: post.id, entityLabel: post.title_ru,
    })

    return NextResponse.json(post)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
