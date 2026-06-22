'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, User, MessageCircle, Send, CheckCircle } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'

export default function ContactsPage() {
  const { tr } = useLang()
  const [formState, setFormState] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      })
      if (!res.ok) throw new Error()
      setSent(true)
      setFormState({ name: '', email: '', message: '' })
      setTimeout(() => setSent(false), 6000)
    } catch {
      setError('Не удалось отправить. Попробуйте позже или напишите напрямую на email.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="section-title text-3xl mb-2">{tr.contacts.title}</h1>
        <div className="h-1 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #1565C0, #00B0FF)' }} />
      </div>

      {/* Map */}
      <div className="mb-8 rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="relative" style={{ height: 320 }}>
          <iframe
            src="https://maps.google.com/maps?q=%D0%A2%D1%83%D0%BB%D0%B5%D0%B1%D0%B0%D0%B5%D0%B2%D0%B0+38%2C+%D0%90%D0%BB%D0%BC%D0%B0%D1%82%D1%8B%2C+%D0%9A%D0%B0%D0%B7%D0%B0%D1%85%D1%81%D1%82%D0%B0%D0%BD&z=16&output=embed&hl=ru"
            width="100%"
            height="100%"
            style={{ border: 'none', display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Bes Saiman Group на карте"
          />
        </div>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: '#1565C0' }} />
            <span className="text-sm font-medium" style={{ color: '#0F172A' }}>ул. Тулебаева 38, Алматы</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://2gis.kz/almaty/search/%D1%83%D0%BB.%20%D0%A2%D1%83%D0%BB%D0%B5%D0%B1%D0%B0%D0%B5%D0%B2%D0%B0%2038"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: '#1BA557', color: 'white', boxShadow: '0 2px 8px rgba(27,165,87,0.25)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              2ГИС
            </a>
            <a
              href="https://www.google.com/maps/search/Тулебаева+38+Алматы+Казахстан"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: '#1565C0', color: 'white', boxShadow: '0 2px 8px rgba(21,101,192,0.25)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              Google Maps
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Contact info */}
        <div className="space-y-6">
          <div className="steel-card p-6 space-y-5">
            <h2 className="text-[#0F172A] font-bold text-lg">{tr.contacts.company}</h2>

            {[
              { icon: <MapPin size={18} className="text-steel-accent" />, value: tr.contacts.address },
              { icon: <Phone size={18} className="text-steel-accent" />, value: tr.contacts.phone, href: `tel:${tr.contacts.phone}` },
              { icon: <Mail size={18} className="text-steel-accent" />, value: tr.contacts.email, href: `mailto:${tr.contacts.email}` },
              { icon: <User size={18} className="text-steel-accent" />, value: tr.contacts.contactPerson },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-steel-blue/10 border border-steel-blue/20 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                {item.href ? (
                  <a href={item.href}
                    className="text-steel-silver-light hover:text-steel-accent transition-colors text-sm mt-2">
                    {item.value}
                  </a>
                ) : (
                  <span className="text-steel-silver-light text-sm mt-2">{item.value}</span>
                )}
              </div>
            ))}
          </div>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/77011013433`}
            target="_blank"
            rel="noopener noreferrer"
            className="steel-card p-5 flex items-center gap-4 hover:border-emerald-400 transition-all group block"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl group-hover:border-emerald-400 transition-colors">
              💬
            </div>
            <div>
              <div className="text-[#0F172A] font-semibold">WhatsApp</div>
              <div className="text-emerald-600 text-sm">{tr.contacts.phone}</div>
            </div>
          </a>
        </div>

        {/* Contact form */}
        <div className="steel-card p-6">
          <div className="flex items-center gap-2 text-[#0F172A] font-semibold mb-6">
            <MessageCircle size={18} className="text-steel-accent" />
            {tr.contacts.sendMessage}
          </div>

          {sent ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <CheckCircle size={48} className="text-emerald-400" />
              <div>
                <div className="text-[#0F172A] font-semibold text-lg">Сообщение отправлено!</div>
                <div className="text-steel-silver text-sm mt-1">Мы свяжемся с вами в ближайшее время</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-steel-silver text-sm block mb-1.5">{tr.contacts.name}</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="steel-input"
                />
              </div>
              <div>
                <label className="text-steel-silver text-sm block mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="steel-input"
                />
              </div>
              <div>
                <label className="text-steel-silver text-sm block mb-1.5">{tr.contacts.message}</label>
                <textarea
                  required
                  rows={5}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="steel-input resize-none"
                />
              </div>
              {error && (
                <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
                  {error}
                </p>
              )}
              <button type="submit" disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                <Send size={16} />
                {sending ? 'Отправка...' : tr.contacts.send}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
