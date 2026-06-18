'use client'

import { useState } from 'react'
import { X, FileText, Loader2, CheckCircle, Download } from 'lucide-react'
import type { Product } from '@/types'
import { useLang } from '@/context/LanguageContext'

interface Props {
  product: Product
  onClose: () => void
}

interface Form {
  name: string
  company: string
  phone: string
  email: string
  quantity: number
  note: string
}

export default function KPModal({ product, onClose }: Props) {
  const { lang } = useLang()
  const [form, setForm] = useState<Form>({ name: '', company: '', phone: '', email: '', quantity: 1, note: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const set = (field: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: field === 'quantity' ? Number(e.target.value) || 1 : e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const productName = (lang === 'kk' ? product.name_kk : lang === 'en' ? product.name_en : null) || product.name_ru

      const res = await fetch('/api/generate-kp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: {
            id: product.id,
            name_ru: product.name_ru,
            name_kk: product.name_kk,
            name_en: product.name_en,
            model: product.model,
            specs: product.specs,
            price: product.price,
            slug: product.slug,
            availability: product.availability,
          },
          clientInfo: {
            name: form.name.trim() || 'Не указано',
            company: form.company.trim() || undefined,
            phone: form.phone.trim() || undefined,
            email: form.email.trim() || undefined,
            quantity: form.quantity,
            note: form.note.trim() || undefined,
          },
          lang,
        }),
      })

      if (!res.ok) throw new Error(await res.text())

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `КП_BesS_${product.model || product.slug}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setStatus('done')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#0C1424', border: '1px solid rgba(26,74,138,0.35)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(26,74,138,0.25)' }}>
              <FileText size={15} style={{ color: '#4A90D9' }} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Коммерческое предложение</p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{product.model || product.name_ru}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/5">
            <X size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>

        {/* Success state */}
        {status === 'done' ? (
          <div className="px-6 py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <CheckCircle size={32} style={{ color: '#34d399' }} />
            </div>
            <p className="text-white font-semibold text-lg">КП сформировано!</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>PDF загружен на ваш компьютер</p>
            <button onClick={onClose} className="btn-primary mt-4">Закрыть</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              КП с реквизитами Bes Saiman Group скачается в PDF. Данные компании — необязательно.
            </p>

            {/* Name */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Ваше имя <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>(необязательно)</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="Иван Иванов"
                className="steel-input w-full"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Организация</label>
              <input
                type="text"
                value={form.company}
                onChange={set('company')}
                placeholder="ТОО «Название компании»"
                className="steel-input w-full"
              />
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Телефон</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+7 (7xx) xxx-xx-xx"
                  className="steel-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="email@company.kz"
                  className="steel-input w-full"
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Количество (шт.)</label>
              <input
                type="number"
                min={1}
                max={999}
                value={form.quantity}
                onChange={set('quantity')}
                className="steel-input w-full"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Примечание (необязательно)</label>
              <textarea
                value={form.note}
                onChange={set('note')}
                placeholder="Особые условия, вопросы..."
                rows={2}
                className="steel-input w-full resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                Ошибка генерации PDF. Попробуйте ещё раз.
              </p>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <><Loader2 size={15} className="animate-spin" /> Генерируем PDF...</>
                ) : (
                  <><Download size={15} /> Скачать КП (PDF)</>
                )}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary px-4">
                Отмена
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
