'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingCart, Trash2, Plus, Minus, FileText, Download,
  Loader2, CheckCircle, Package, ChevronRight, X
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { getProductBySlug } from '@/lib/supabase'
import type { Product } from '@/types'

interface Form {
  name: string
  company: string
  phone: string
  email: string
  note: string
}

interface AccessorySuggestion {
  forProductId: string
  forProductName: string
  accessory: Product
}

export default function KPCartPage() {
  const { items, removeItem, updateQty, addItem, isInCart, clear } = useCart()
  const [form, setForm] = useState<Form>({ name: '', company: '', phone: '', email: '', note: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [suggestions, setSuggestions] = useState<AccessorySuggestion[]>([])

  // Стабильный ключ — только S-товары, чтобы не дёргать API при изменении кол-ва/добавлении аксессуаров
  const mainProductKey = items
    .filter(i => i.product.product_type === 'S')
    .map(i => i.product.slug)
    .sort()
    .join(',')

  const set = (field: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  // Загружаем аксессуары для каждого основного оборудования (тип S)
  useEffect(() => {
    const mainProducts = items.filter(i => i.product.product_type === 'S')
    if (mainProducts.length === 0) { setSuggestions([]); return }

    let cancelled = false
    Promise.all(
      mainProducts.map(async ({ product }) => {
        const full = await getProductBySlug(product.slug)
        if (!full?.accessories?.length) return []
        return full.accessories.map(acc => ({
          forProductId: product.id,
          forProductName: product.name_ru,
          accessory: acc,
        }))
      })
    ).then(results => {
      if (cancelled) return
      const all = results.flat()
      const seen = new Set<string>()
      setSuggestions(all.filter(s => {
        if (seen.has(s.accessory.id)) return false
        seen.add(s.accessory.id)
        return true
      }))
    })
    return () => { cancelled = true }
  }, [mainProductKey])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return
    setStatus('loading')

    try {
      const res = await fetch('/api/generate-kp-basket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ product, quantity }) => ({
            id: product.id,
            name_ru: product.name_ru,
            model: product.model,
            specs: product.specs,
            price: product.price,
            slug: product.slug,
            quantity,
          })),
          clientInfo: {
            name: form.name.trim() || 'Не указано',
            company: form.company.trim() || undefined,
            phone: form.phone.trim() || undefined,
            email: form.email.trim() || undefined,
            note: form.note.trim() || undefined,
          },
          lang: 'ru',
        }),
      })

      if (!res.ok) throw new Error(await res.text())

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `КП_BesS_${new Date().toISOString().slice(0, 10)}.pdf`
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

  const total = items.reduce((s, i) => s + (i.product.price ?? 0) * i.quantity, 0)
  const hasAllPrices = items.every(i => i.product.price)

  if (items.length === 0 && status !== 'done') {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <ShoppingCart size={64} className="mx-auto mb-6" style={{ color: '#CBD5E1' }} />
          <h1 className="text-2xl font-black mb-3" style={{ color: '#0F172A' }}>Корзина КП пуста</h1>
          <p className="text-sm mb-8" style={{ color: '#64748B' }}>
            Добавьте товары из каталога, чтобы сформировать коммерческое предложение
          </p>
          <Link href="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm"
            style={{ background: '#1565C0', color: 'white' }}>
            Перейти в каталог
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6"
            style={{ background: '#F0FDF4' }}>
            <CheckCircle size={40} style={{ color: '#16A34A' }} />
          </div>
          <h1 className="text-2xl font-black mb-3" style={{ color: '#0F172A' }}>КП сформировано!</h1>
          <p className="text-sm mb-8" style={{ color: '#64748B' }}>PDF загружен на ваш компьютер</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => { clear(); setStatus('idle') }}
              className="px-6 py-3 rounded-lg font-semibold text-sm"
              style={{ background: '#1565C0', color: 'white' }}>
              Очистить и начать заново
            </button>
            <Link href="/catalog"
              className="px-6 py-3 rounded-lg font-semibold text-sm"
              style={{ border: '1.5px solid #E2E8F0', color: '#475569', background: 'white' }}>
              Продолжить выбор
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Заголовок */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-mono text-[9px] tracking-[0.25em] uppercase mb-1" style={{ color: '#1565C0', fontWeight: 700 }}>
              КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ
            </p>
            <h1 className="text-2xl font-black" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
              Корзина КП
            </h1>
          </div>
          <Link href="/catalog"
            className="flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: '#1565C0' }}>
            + Добавить товары
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Левая колонка: товары + аксессуары ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Таблица товаров */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #E2E8F0', background: 'white' }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #F1F5F9' }}>
                <span className="font-semibold text-sm" style={{ color: '#0F172A' }}>
                  Товары ({items.length})
                </span>
                <button onClick={clear} className="text-xs flex items-center gap-1"
                  style={{ color: '#94A3B8' }}>
                  <X size={11} /> Очистить всё
                </button>
              </div>

              {/* Шапка таблицы */}
              <div className="hidden sm:grid grid-cols-12 px-4 py-2 text-[10px] font-mono font-bold tracking-wider uppercase"
                style={{ borderBottom: '1px solid #F1F5F9', color: '#94A3B8' }}>
                <span className="col-span-5">Наименование</span>
                <span className="col-span-3 text-center">Кол-во</span>
                <span className="col-span-2 text-right">Цена</span>
                <span className="col-span-2 text-right">Сумма</span>
              </div>

              {items.map(({ product, quantity }, idx) => {
                const img = product.images?.[0]
                const subtotal = (product.price ?? 0) * quantity
                return (
                  <div key={product.id}
                    className="sm:grid sm:grid-cols-12 flex flex-col gap-3 px-4 py-3 items-center"
                    style={{ borderBottom: idx < items.length - 1 ? '1px solid #F8FAFC' : 'none' }}>

                    {/* Товар */}
                    <div className="col-span-5 flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                        style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        {img
                          ? <Image src={img} alt={product.name_ru} width={48} height={48} className="object-contain p-1" />
                          : <Package size={20} style={{ color: '#CBD5E1' }} />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-semibold mb-0.5" style={{ color: '#0284C7' }}>
                          {product.model ?? '—'}
                        </p>
                        <p className="text-xs font-medium leading-snug line-clamp-2" style={{ color: '#0F172A' }}>
                          {product.name_ru}
                        </p>
                      </div>
                    </div>

                    {/* Кол-во */}
                    <div className="col-span-3 flex items-center justify-center gap-1">
                      <button onClick={() => updateQty(product.id, quantity - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                        style={{ border: '1px solid #E2E8F0', color: '#64748B' }}
                        disabled={quantity <= 1}>
                        <Minus size={10} />
                      </button>
                      <input
                        type="number" min={1} value={quantity}
                        onChange={e => updateQty(product.id, parseInt(e.target.value) || 1)}
                        className="w-10 text-center text-sm font-semibold rounded outline-none"
                        style={{ border: '1px solid #E2E8F0', color: '#0F172A', padding: '2px 0' }}
                      />
                      <button onClick={() => updateQty(product.id, quantity + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                        style={{ border: '1px solid #E2E8F0', color: '#64748B' }}>
                        <Plus size={10} />
                      </button>
                    </div>

                    {/* Цена */}
                    <div className="col-span-2 text-right">
                      <span className="text-xs font-semibold" style={{ color: product.price ? '#0F172A' : '#94A3B8' }}>
                        {product.price ? `${product.price.toLocaleString('ru-RU')} ₸` : 'По запросу'}
                      </span>
                    </div>

                    {/* Сумма + удалить */}
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span className="text-xs font-bold" style={{ color: '#1565C0' }}>
                        {subtotal > 0 ? `${subtotal.toLocaleString('ru-RU')} ₸` : '—'}
                      </span>
                      <button onClick={() => removeItem(product.id)}
                        className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:bg-red-50"
                        style={{ color: '#CBD5E1' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* Итого */}
              {total > 0 && (
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ borderTop: '2px solid #E2E8F0', background: '#F8FAFC' }}>
                  <span className="font-semibold text-sm" style={{ color: '#64748B' }}>Итого:</span>
                  <span className="font-black text-base" style={{ color: '#1565C0' }}>
                    {total.toLocaleString('ru-RU')} ₸
                    {!hasAllPrices && <span className="text-xs font-normal ml-1" style={{ color: '#94A3B8' }}>+ по запросу</span>}
                  </span>
                </div>
              )}
            </div>

            {/* Рекомендуемые аксессуары и запасные части */}
            {suggestions.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #E2E8F0', background: 'white' }}>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <p className="font-semibold text-sm" style={{ color: '#0F172A' }}>
                    Подходящие комплектующие и расходники
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
                    Автоматически подобраны к выбранному оборудованию
                  </p>
                </div>

                <div className="divide-y" style={{ borderColor: '#F8FAFC' }}>
                  {suggestions.map(({ accessory, forProductName }) => {
                    const img = accessory.images?.[0]
                    const inC = isInCart(accessory.id)
                    return (
                      <div key={accessory.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                          style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          {img
                            ? <Image src={img} alt={accessory.name_ru} width={40} height={40} className="object-contain p-1" />
                            : <Package size={16} style={{ color: '#CBD5E1' }} />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-mono" style={{ color: '#94A3B8' }}>
                            к {forProductName.slice(0, 30)}…
                          </p>
                          <p className="text-xs font-medium line-clamp-1" style={{ color: '#0F172A' }}>
                            {accessory.name_ru}
                          </p>
                          {accessory.model && (
                            <p className="text-[10px] font-mono" style={{ color: '#0284C7' }}>
                              {accessory.model}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {accessory.price && (
                            <span className="text-xs font-semibold" style={{ color: '#64748B' }}>
                              {accessory.price.toLocaleString('ru-RU')} ₸
                            </span>
                          )}
                          <button
                            onClick={() => inC ? null : addItem(accessory)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{
                              background: inC ? '#F0FDF4' : '#EFF6FF',
                              border: `1.5px solid ${inC ? '#BBF7D0' : '#BFDBFE'}`,
                              color: inC ? '#16A34A' : '#1565C0',
                            }}>
                            {inC ? '✓ В корзине' : '+ Добавить'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Правая колонка: форма КП ── */}
          <div className="lg:col-span-1">
            <div className="rounded-xl overflow-hidden sticky top-24"
              style={{ border: '1.5px solid #E2E8F0', background: 'white' }}>

              <div className="px-5 py-4 flex items-center gap-3"
                style={{ borderBottom: '1px solid #F1F5F9' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#EFF6FF' }}>
                  <FileText size={15} style={{ color: '#1565C0' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#0F172A' }}>
                    Оформить КП
                  </p>
                  <p className="text-[10px]" style={{ color: '#94A3B8' }}>
                    PDF с реквизитами и печатью
                  </p>
                </div>
              </div>

              <form onSubmit={handleGenerate} className="px-5 py-4 flex flex-col gap-3.5">

                <p className="text-[11px] leading-relaxed" style={{ color: '#94A3B8' }}>
                  Данные покупателя необязательны — укажите для персонализации КП.
                </p>

                {[
                  { field: 'name',    label: 'Ваше имя',        type: 'text',  placeholder: 'Иван Иванов' },
                  { field: 'company', label: 'Организация',      type: 'text',  placeholder: 'ТОО «Компания»' },
                  { field: 'phone',   label: 'Телефон',          type: 'tel',   placeholder: '+7 (7xx) xxx-xx-xx' },
                  { field: 'email',   label: 'Email',            type: 'email', placeholder: 'email@company.kz' },
                ].map(({ field, label, type, placeholder }) => (
                  <div key={field}>
                    <label className="block text-[11px] mb-1 font-medium" style={{ color: '#64748B' }}>
                      {label}
                    </label>
                    <input type={type} value={form[field as keyof Form]}
                      onChange={set(field as keyof Form)}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-all"
                      style={{ border: '1.5px solid #E2E8F0', color: '#0F172A', background: '#FAFAFA' }}
                      onFocus={e => { e.target.style.borderColor = '#1565C0'; e.target.style.background = 'white' }}
                      onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#FAFAFA' }}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-[11px] mb-1 font-medium" style={{ color: '#64748B' }}>
                    Примечание
                  </label>
                  <textarea value={form.note} onChange={set('note')} rows={2}
                    placeholder="Особые условия, конфигурация..."
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-all resize-none"
                    style={{ border: '1.5px solid #E2E8F0', color: '#0F172A', background: '#FAFAFA' }}
                    onFocus={e => { e.target.style.borderColor = '#1565C0'; e.target.style.background = 'white' }}
                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#FAFAFA' }}
                  />
                </div>

                {status === 'error' && (
                  <p className="text-xs px-3 py-2 rounded-lg"
                    style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                    Ошибка генерации PDF. Попробуйте ещё раз.
                  </p>
                )}

                <button type="submit" disabled={status === 'loading' || items.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all"
                  style={{
                    background: items.length > 0 ? '#1565C0' : '#E2E8F0',
                    color: items.length > 0 ? 'white' : '#94A3B8',
                    boxShadow: items.length > 0 ? '0 4px 14px rgba(21,101,192,0.25)' : 'none',
                  }}>
                  {status === 'loading'
                    ? <><Loader2 size={14} className="animate-spin" /> Генерируем PDF...</>
                    : <><Download size={14} /> Скачать КП (PDF)</>
                  }
                </button>

                <p className="text-[10px] text-center" style={{ color: '#CBD5E1' }}>
                  Включает реквизиты, печать и подпись директора
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
