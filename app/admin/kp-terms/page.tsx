'use client'

import { useEffect, useState } from 'react'
import { Loader2, Check } from 'lucide-react'

const EMPTY = {
  delivery_in_stock: '', delivery_on_order: '', warranty: '',
  payment_in_stock: '', payment_on_order: '', validity: '',
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{children}</label>
}

export default function AdminKpTermsPage() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/kp-terms').then(r => r.json())
      .then(d => setForm({
        delivery_in_stock: d.delivery_in_stock ?? '', delivery_on_order: d.delivery_on_order ?? '',
        warranty: d.warranty ?? '',
        payment_in_stock: d.payment_in_stock ?? '', payment_on_order: d.payment_on_order ?? '',
        validity: d.validity ?? '',
      }))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch('/api/admin/kp-terms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally { setSaving(false) }
  }

  if (loading) {
    return <div className="p-8 flex justify-center py-12"><Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} /></div>
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-black text-white mb-1">Условия поставки в КП</h1>
      <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Текст блока «УСЛОВИЯ ПОСТАВКИ» на PDF коммерческого предложения — и для одного товара, и для корзины.
        Срок поставки и условия оплаты печатаются в одном из двух вариантов автоматически, в зависимости от того,
        есть ли товар в наличии на складе.
      </p>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl space-y-4" style={cardStyle}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Срок поставки — товар в наличии</FieldLabel>
            <input className="steel-input w-full" value={form.delivery_in_stock}
              onChange={e => setForm(f => ({ ...f, delivery_in_stock: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Срок поставки — под заказ</FieldLabel>
            <input className="steel-input w-full" value={form.delivery_on_order}
              onChange={e => setForm(f => ({ ...f, delivery_on_order: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Условия оплаты — товар в наличии</FieldLabel>
            <input className="steel-input w-full" value={form.payment_in_stock}
              onChange={e => setForm(f => ({ ...f, payment_in_stock: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Условия оплаты — под заказ</FieldLabel>
            <input className="steel-input w-full" value={form.payment_on_order}
              onChange={e => setForm(f => ({ ...f, payment_on_order: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Гарантия</FieldLabel>
            <input className="steel-input w-full" value={form.warranty}
              onChange={e => setForm(f => ({ ...f, warranty: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Действие КП</FieldLabel>
            <input className="steel-input w-full" value={form.validity}
              onChange={e => setForm(f => ({ ...f, validity: e.target.value }))} />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-1">
          <div className="flex-1" />
          {error && <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>}
          {saved && !error && <p className="text-xs flex items-center gap-1" style={{ color: '#34D399' }}><Check size={13} />Сохранено</p>}
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            Сохранить
          </button>
        </div>
      </form>
    </div>
  )
}
