import { NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import nodemailer from 'nodemailer'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/jpeg': 'jpg',
  'image/png': 'png',
}
const MAX_SIZE = 15 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const full_name = String(formData.get('full_name') ?? '').trim()
    const company = String(formData.get('company') ?? '').trim()
    const position = String(formData.get('position') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const product_id = String(formData.get('product_id') ?? '') || null
    const product_name = String(formData.get('product_name') ?? '').trim() || 'Товар не указан'
    const file = formData.get('file') as File | null

    if (!full_name || !email) {
      return NextResponse.json({ error: 'Заполните ФИО и email' }, { status: 400 })
    }
    if (!file) {
      return NextResponse.json({ error: 'Приложите заполненный опросный лист' }, { status: 400 })
    }
    const ext = ALLOWED[file.type]
    if (!ext) {
      return NextResponse.json({ error: 'Разрешены только PDF, DOC, DOCX, JPG, PNG' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Файл больше 15 МБ' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `${randomUUID()}.${ext}`
    const dir = path.join(process.cwd(), 'uploads', 'questionnaire-submissions')
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, fileName), buffer)
    const fileUrl = `/uploads/questionnaire-submissions/${fileName}`

    await query(
      `INSERT INTO questionnaire_submissions (product_id, product_name, full_name, company, position, phone, email, file_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [product_id, product_name, full_name, company || null, position || null, phone || null, email, fileUrl],
    )

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        })
        await transporter.sendMail({
          from: `"Bes Saiman Website" <${process.env.SMTP_USER}>`,
          to: 'bessaimangroup1@gmail.com',
          replyTo: email,
          subject: `Опросный лист заполнен: ${product_name} — ${full_name}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#1565C0;padding:20px 24px;border-radius:8px 8px 0 0;">
                <h2 style="color:#fff;margin:0;font-size:18px;">Заполненный опросный лист</h2>
                <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">bes-saiman.kz</p>
              </div>
              <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:6px 0;font-size:13px;color:#64748b;width:140px;">Товар:</td><td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:600;">${product_name}</td></tr>
                  <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">ФИО:</td><td style="padding:6px 0;font-size:14px;color:#0f172a;">${full_name}</td></tr>
                  ${company ? `<tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Организация:</td><td style="padding:6px 0;font-size:14px;color:#0f172a;">${company}</td></tr>` : ''}
                  ${position ? `<tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Должность:</td><td style="padding:6px 0;font-size:14px;color:#0f172a;">${position}</td></tr>` : ''}
                  ${phone ? `<tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Телефон:</td><td style="padding:6px 0;font-size:14px;color:#0f172a;">${phone}</td></tr>` : ''}
                  <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Email:</td><td style="padding:6px 0;font-size:14px;"><a href="mailto:${email}" style="color:#1565C0;">${email}</a></td></tr>
                </table>
                <p style="margin-top:16px;font-size:13px;color:#64748b;">Заполненный опросный лист во вложении.</p>
              </div>
            </div>
          `,
          attachments: [{ filename: file.name || `Опросный_лист.${ext}`, content: buffer }],
        })
      } catch (emailErr) {
        console.error('questionnaire email send error:', emailErr)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('questionnaire-submit error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка сервера' }, { status: 500 })
  }
}
