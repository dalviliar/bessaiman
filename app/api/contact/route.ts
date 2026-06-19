import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })
    }

    await query(
      `INSERT INTO contact_requests (name, email, message) VALUES ($1, $2, $3)`,
      [name.trim(), email.trim(), message.trim()],
    )

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: `"Bes Saiman Website" <${process.env.SMTP_USER}>`,
        to: 'dalviliar09@gmail.com',
        subject: `Новое обращение с сайта от ${name.trim()}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#1565C0;padding:20px 24px;border-radius:8px 8px 0 0;">
              <h2 style="color:#fff;margin:0;font-size:18px;">Новое обращение с сайта</h2>
              <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">bes-saiman.kz</p>
            </div>
            <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:#64748b;width:120px;">Имя:</td>
                  <td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:600;">${name.trim()}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:#64748b;">Email:</td>
                  <td style="padding:8px 0;font-size:14px;color:#0f172a;">
                    <a href="mailto:${email.trim()}" style="color:#1565C0;">${email.trim()}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:#64748b;vertical-align:top;">Сообщение:</td>
                  <td style="padding:8px 0;font-size:14px;color:#0f172a;line-height:1.6;">
                    ${message.trim().replace(/\n/g, '<br/>')}
                  </td>
                </tr>
              </table>
              <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;">
                <a href="mailto:${email.trim()}" style="display:inline-block;background:#1565C0;color:#fff;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;">
                  Ответить клиенту
                </a>
              </div>
            </div>
          </div>
        `,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('contact error:', err)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
