'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Boxes, Search, ArrowDown, ArrowUp, BarChart3, AlertTriangle,
  PackagePlus, X, Loader2, ChevronRight, User,
} from 'lucide-react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import type { WarehouseItem, WarehouseTransaction } from '@/types'

type View = 'all' | 'low' | 'out'

function RestockModal({ item, onClose, onDone }: {
  item: WarehouseItem; onClose: () => void; onDone: () => void
}) {
  const { user } = useAdminAuth()
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const name = (item.product as { name_ru?: string } | undefined)?.name_ru || '—'

  const submit = async () => {
    setLoading(true)
    await fetch('/api/warehouse/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: item.product_id,
        barcode: item.barcode,
        type: 'in',
        quantity: qty,
        note: note || null,
        performed_by_name: user?.full_name || user?.email || null,
      }),
    })
    setLoading(false)
    onDone()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">Пополнить запас</h2>
            <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{name}</p>
          </div>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)' }}><X size={16} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Добавить количество (сейчас: <span style={{ color: '#34d399' }}>{item.quantity}</span>)
            </label>
            <div className="flex items-center gap-0">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ width: 40, height: 40, borderRadius: '8px 0 0 8px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>
                −
              </button>
              <div style={{ flex: 1, height: 40, border: '1px solid rgba(255,255,255,0.1)', borderLeft: 'none', borderRight: 'none', background: '#0d1421', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-white font-bold text-lg">{qty}</span>
              </div>
              <button onClick={() => setQty(q => q + 1)}
                style={{ width: 40, height: 40, borderRadius: '0 8px 8px 0', background: '#1565C0', border: '1px solid #1565C0', color: 'white', cursor: 'pointer' }}>
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Примечание</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              placeholder="Поставка, возврат..."
              className="steel-input w-full text-sm" />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={submit} disabled={loading}
              style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <PackagePlus size={14} />}
              Добавить +{qty} шт.
            </button>
            <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: 13 }}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminWarehousePage() {
  const [items, setItems] = useState<WarehouseItem[]>([])
  const [transactions, setTransactions] = useState<WarehouseTransaction[]>([])
  const [search, setSearch] = useState('')
  const [view, setView] = useState<View>('all')
  const [loading, setLoading] = useState(true)
  const [restockItem, setRestockItem] = useState<WarehouseItem | null>(null)

  const load = () => {
    Promise.all([
      fetch('/api/warehouse/items').then(r => r.json()),
      fetch('/api/warehouse/transactions?limit=50').then(r => r.json()),
    ]).then(([w, t]) => {
      setItems(w ?? [])
      setTransactions(t ?? [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const totalStock = items.reduce((s, i) => s + i.quantity, 0)
  const lowStock   = items.filter(i => i.quantity > 0 && i.quantity < 3)
  const outStock   = items.filter(i => i.quantity === 0)

  const filtered = items.filter(i => {
    if (view === 'low') return i.quantity > 0 && i.quantity < 3
    if (view === 'out') return i.quantity === 0
    const q = search.toLowerCase()
    if (!q) return true
    const p = i.product as { name_ru?: string; model?: string } | undefined
    return p?.name_ru?.toLowerCase().includes(q) || p?.model?.toLowerCase().includes(q) || i.barcode?.includes(q)
  }).filter(i => {
    if (view !== 'all') return true
    const q = search.toLowerCase()
    if (!q) return true
    const p = i.product as { name_ru?: string; model?: string } | undefined
    return p?.name_ru?.toLowerCase().includes(q) || p?.model?.toLowerCase().includes(q) || i.barcode?.includes(q)
  })

  const kpiCards = [
    { label: 'Позиций (SKU)', value: items.length,      color: '#3B82F6', icon: Boxes,         view: 'all' as View, active: view === 'all' },
    { label: 'Единиц всего',  value: totalStock,         color: '#10B981', icon: BarChart3,     view: 'all' as View, active: false },
    { label: 'Мало (<3 шт.)', value: lowStock.length,   color: '#F59E0B', icon: AlertTriangle, view: 'low' as View, active: view === 'low' },
    { label: 'Нет в наличии', value: outStock.length,   color: '#EF4444', icon: AlertTriangle, view: 'out' as View, active: view === 'out' },
  ]

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white mb-0.5">Обзор склада</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {view === 'low' ? 'Показаны товары с остатком <3 шт.' :
             view === 'out' ? 'Показаны товары с нулевым остатком' :
             'Все позиции склада'}
          </p>
        </div>
        <Link href="/warehouse" target="_blank"
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
          Приложение склада <ChevronRight size={12} />
        </Link>
      </div>

      {/* KPI cards — clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map(({ label, value, color, icon: Icon, view: cardView, active }) => (
          <button key={label}
            onClick={() => { setView(cardView); setSearch('') }}
            className="rounded-xl p-4 text-left transition-all"
            style={{
              background: active ? `${color}18` : '#111827',
              border: `1.5px solid ${active ? color : `${color}20`}`,
              boxShadow: active ? `0 4px 20px ${color}20` : 'none',
              cursor: 'pointer',
              transform: active ? 'translateY(-2px)' : 'none',
            }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} style={{ color }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
            </div>
            <p className="text-2xl font-black font-mono text-white">{value}</p>
            {(cardView === 'low' || cardView === 'out') && (
              <p className="text-[10px] mt-1" style={{ color: active ? color : 'rgba(255,255,255,0.25)' }}>
                {active ? 'Фильтр активен — нажмите для сброса' : 'Нажмите для фильтра →'}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Alert banner when filtered */}
      {(view === 'low' || view === 'out') && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl"
          style={{ background: view === 'out' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${view === 'out' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
          <AlertTriangle size={14} style={{ color: view === 'out' ? '#f87171' : '#fbbf24', flexShrink: 0 }} />
          <p className="text-xs font-medium flex-1" style={{ color: view === 'out' ? '#f87171' : '#fbbf24' }}>
            {view === 'out'
              ? `${outStock.length} позиций с нулевым остатком — требуется пополнение`
              : `${lowStock.length} позиций с критически малым остатком (<3 шт.)`}
          </p>
          <button onClick={() => setView('all')} className="text-[10px] font-semibold underline"
            style={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            Показать все
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Stock table */}
        <div className="lg:col-span-3">
          {view === 'all' && (
            <div className="relative mb-4">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input type="text" placeholder="Поиск по названию, артикулу..." value={search} onChange={e => setSearch(e.target.value)}
                className="steel-input w-full pl-10" />
            </div>
          )}

          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#0D1421', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Товар</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Остаток</th>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Место</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center">
                    <Loader2 size={20} className="animate-spin mx-auto" style={{ color: '#3B82F6' }} />
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Позиций не найдено
                  </td></tr>
                ) : filtered.map((item, i) => {
                  const isOut = item.quantity === 0
                  const isLow = item.quantity > 0 && item.quantity < 3
                  return (
                    <tr key={item.id} style={{ background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-white">{(item.product as { name_ru?: string } | undefined)?.name_ru || '—'}</p>
                        <p className="font-mono text-[10px]" style={{ color: '#0EA5E9' }}>{(item.product as { model?: string } | undefined)?.model}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-black font-mono text-lg"
                          style={{ color: isOut ? '#f87171' : isLow ? '#fbbf24' : '#34d399' }}>
                          {item.quantity}
                        </span>
                        {isOut && <p className="text-[9px] font-bold" style={{ color: '#f87171' }}>НЕТ</p>}
                        {isLow && <p className="text-[9px] font-bold" style={{ color: '#fbbf24' }}>МАЛО</p>}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.location || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        {(isOut || isLow) && (
                          <button onClick={() => setRestockItem(item)}
                            className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg ml-auto"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer' }}>
                            <PackagePlus size={11} /> Пополнить
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction log */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-bold text-white mb-3">Журнал движений</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {transactions.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Нет данных</p>
            ) : transactions.map(tx => {
              const isIn = tx.type === 'in'
              const pName = (tx.product as { name_ru?: string } | undefined)?.name_ru
              const dt = new Date(tx.created_at)
              const dateStr = dt.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
              const timeStr = dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
              return (
                <div key={tx.id} className="rounded-xl px-3 py-2.5"
                  style={{ background: '#111827', border: `1px solid ${isIn ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}` }}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: isIn ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
                      {isIn ? <ArrowDown size={12} style={{ color: '#34d399' }} /> : <ArrowUp size={12} style={{ color: '#f87171' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate">{pName || '—'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {tx.performed_by_name && (
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: '#60A5FA' }}>
                            <User size={9} /> {tx.performed_by_name}
                          </span>
                        )}
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {dateStr}, {timeStr}
                        </span>
                      </div>
                      {tx.note && (
                        <p className="text-[10px] mt-0.5 italic line-clamp-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {tx.note}
                        </p>
                      )}
                    </div>
                    <span className="font-black font-mono text-sm flex-shrink-0"
                      style={{ color: isIn ? '#34d399' : '#f87171' }}>
                      {isIn ? '+' : '−'}{tx.quantity}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {restockItem && (
        <RestockModal
          item={restockItem}
          onClose={() => setRestockItem(null)}
          onDone={() => { setLoading(true); load() }}
        />
      )}
    </div>
  )
}
