import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'content', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  const partners = await query(`SELECT * FROM partners ORDER BY sort_order ASC, created_at ASC`)
  return NextResponse.json(partners)
}

export async function POST(request: Request) {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'content', 'create')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  const { name, logo_url, website_url, sort_order } = await request.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Укажите название партнёра' }, { status: 400 })
  }
  const partner = await queryOne(
    `INSERT INTO partners (name, logo_url, website_url, sort_order) VALUES ($1, $2, $3, $4) RETURNING *`,
    [name.trim(), logo_url ?? null, website_url ?? null, sort_order ?? 0],
  )
  return NextResponse.json(partner)
}

export async function PUT(request: Request) {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'content', 'update')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  const { id, name, logo_url, website_url, sort_order } = await request.json()
  if (!id || !name?.trim()) {
    return NextResponse.json({ error: 'Укажите id и название' }, { status: 400 })
  }
  const partner = await queryOne(
    `UPDATE partners SET name=$1, logo_url=$2, website_url=$3, sort_order=$4 WHERE id=$5 RETURNING *`,
    [name.trim(), logo_url ?? null, website_url ?? null, sort_order ?? 0, id],
  )
  if (!partner) return NextResponse.json({ error: 'Не найден' }, { status: 404 })
  return NextResponse.json(partner)
}

export async function DELETE(request: Request) {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'content', 'delete')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  const { id } = await request.json()
  await query(`DELETE FROM partners WHERE id=$1`, [id])
  return NextResponse.json({ ok: true })
}
