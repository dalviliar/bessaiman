import { NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads')

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params
  if (segments.some(s => s.includes('..'))) {
    return NextResponse.json({ error: 'Некорректный путь' }, { status: 400 })
  }

  const filePath = path.join(UPLOADS_ROOT, ...segments)
  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  const contentType = CONTENT_TYPES[ext]
  if (!contentType) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })

  try {
    await stat(filePath)
    const data = await readFile(filePath)
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
  }
}
