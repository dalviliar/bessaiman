import { NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import sharp from 'sharp'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_SIZE = 8 * 1024 * 1024
// Product photos are shown full-size on catalog pages and embedded in
// generated KP PDFs (which skip anything over 2MB) - camera-straight-out
// uploads can be 5-10MB, so resize/recompress on the way in instead of
// serving whatever the customer's phone produced.
const MAX_DIMENSION = 1920

export async function POST(request: Request) {
  try {
    const me = await getCurrentAdminUser()
    const allowed =
      can(me?.role, 'products', 'create') ||
      can(me?.role, 'products', 'update') ||
      can(me?.role, 'content',  'create') ||
      can(me?.role, 'content',  'update')
    if (!me || !allowed) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Файл не передан' }, { status: 400 })
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Разрешены только JPEG, PNG, WEBP, AVIF' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Файл больше 8 МБ' }, { status: 400 })
    }

    const ext = file.type.split('/')[1]
    const fileName = `${randomUUID()}.${ext}`
    const dir = path.join(process.cwd(), 'uploads', 'products')
    await mkdir(dir, { recursive: true })

    const inputBuffer = Buffer.from(await file.arrayBuffer())
    let pipeline = sharp(inputBuffer)
      .rotate() // apply EXIF orientation, then the metadata is dropped
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
    if (file.type === 'image/jpeg') pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true })
    else if (file.type === 'image/png') pipeline = pipeline.png({ compressionLevel: 9 })
    else if (file.type === 'image/webp') pipeline = pipeline.webp({ quality: 82 })
    else pipeline = pipeline.avif({ quality: 60 })
    const outputBuffer = await pipeline.toBuffer()

    await writeFile(path.join(dir, fileName), outputBuffer)

    return NextResponse.json({ url: `/uploads/products/${fileName}` })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
