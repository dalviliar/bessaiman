import { NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
const MAX_SIZE = 4 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me?.role, 'content', 'create')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Файл не передан' }, { status: 400 })
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Разрешены JPEG, PNG, WEBP, SVG' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Файл больше 4 МБ' }, { status: 400 })
    }

    const ext = file.type === 'image/svg+xml' ? 'svg' : file.type.split('/')[1]
    const fileName = `${randomUUID()}.${ext}`
    const dir = path.join(process.cwd(), 'public', 'uploads', 'partners')
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()))

    return NextResponse.json({ url: `/uploads/partners/${fileName}` })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
