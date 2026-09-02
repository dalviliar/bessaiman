import { NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}
const MAX_SIZE = 15 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const me = await getCurrentAdminUser()
    const allowed = can(me?.role, 'products', 'create') || can(me?.role, 'products', 'update')
    if (!me || !allowed) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Файл не передан' }, { status: 400 })
    const ext = ALLOWED[file.type]
    if (!ext) {
      return NextResponse.json({ error: 'Разрешены только PDF, DOC, DOCX' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Файл больше 15 МБ' }, { status: 400 })
    }

    const fileName = `${randomUUID()}.${ext}`
    const dir = path.join(process.cwd(), 'uploads', 'questionnaires')
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()))

    return NextResponse.json({ url: `/uploads/questionnaires/${fileName}` })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
