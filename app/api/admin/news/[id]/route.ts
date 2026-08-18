import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'
import { logAction } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_ALIGN = ['left', 'center', 'justify']

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'content', 'update')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { id } = await params
    const { title_ru, title_kk, title_en, content_ru, content_kk, content_en,
            image_url, instagram_url, type, is_published, text_align } = await request.json()
    const align = ALLOWED_ALIGN.includes(text_align) ? text_align : 'left'

    const existing = await queryOne('SELECT published_at,is_published FROM news_posts WHERE id=$1', [id])
    const publishedAt = is_published && !existing?.is_published
      ? new Date().toISOString()
      : (existing?.published_at ?? null)

    const post = await queryOne(
      `UPDATE news_posts SET title_ru=$1,title_kk=$2,title_en=$3,content_ru=$4,content_kk=$5,content_en=$6,
         image_url=$7,instagram_url=$8,type=$9,is_published=$10,published_at=$11,text_align=$12
       WHERE id=$13 RETURNING *`,
      [title_ru, title_kk || null, title_en || null, content_ru || null, content_kk || null, content_en || null,
       image_url || null, instagram_url || null, type || 'news', is_published ?? false, publishedAt, align, id],
    )
    if (!post) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'update',
      entityType: 'news', entityId: post.id, entityLabel: post.title_ru,
    })

    return NextResponse.json(post)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'content', 'delete')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const { id } = await params
    const post = await queryOne('SELECT id,title_ru FROM news_posts WHERE id=$1', [id])
    if (!post) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    await queryOne('DELETE FROM news_posts WHERE id=$1', [id])
    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'delete',
      entityType: 'news', entityId: post.id, entityLabel: post.title_ru,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
