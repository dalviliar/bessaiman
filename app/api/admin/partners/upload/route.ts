import { NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import sharp from 'sharp'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
const MAX_SIZE = 4 * 1024 * 1024
const MAX_DIMENSION = 800

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
    const dir = path.join(process.cwd(), 'uploads', 'partners')
    await mkdir(dir, { recursive: true })

    const inputBuffer = Buffer.from(await file.arrayBuffer())
    let outputBuffer = inputBuffer
    if (file.type !== 'image/svg+xml') {
      let pipeline = sharp(inputBuffer)
        .rotate()
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
      if (file.type === 'image/jpeg') pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true })
      else if (file.type === 'image/png') pipeline = pipeline.png({ compressionLevel: 9 })
      else if (file.type === 'image/webp') pipeline = pipeline.webp({ quality: 85 })
      else pipeline = pipeline.avif({ quality: 65 })
      outputBuffer = await pipeline.toBuffer()
    }
    await writeFile(path.join(dir, fileName), outputBuffer)

    return NextResponse.json({ url: `/uploads/partners/${fileName}` })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
