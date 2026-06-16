'use client'

import { useEffect, useState } from 'react'
import { Boxes, Search, ArrowDown, ArrowUp, BarChart3, AlertTriangle } from 'lucide-react'
import type { WarehouseItem, WarehouseTransaction } from '@/types'

export default function AdminWarehousePage() {
  const [items, setItems] = useState<WarehouseItem[]>([])
  const [transactions, setTransactions] = useState<WarehouseTransaction[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/warehouse/items').then(r => r.json()),
      fetch('/api/warehouse/transactions?limit=30').then(r => r.json()),
    ]).then(([w, t]) => {
      setItems(w ?? [])
      setTransactions(t ?? [])
      setLoading(false)
    })
  }, [])

  const totalStock = items.reduce((s, i) => s + i.quantity, 0)
  const lowStock = items.filter(i => i.quantity > 0 && i.quantity < 3).length
  const outOfStock = items.filter(i => i.quantity === 0).length

  const filtered = items.filter(i =>
    !search ||
    (i.product as { name_ru?: string } | undefined)?.name_ru?.toLowerCase().includes(search.toLowerCase()) ||
    (i.product as { model?: string } | undefined)?.model?.includes(search) ||
    i.barcode?.includes(search)
  )

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-xl font-black text-white mb-6">Обзор склада</h1>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Позиций (SKU)', value: items.length, color: '#3B82F6', icon: Boxes },
          { label: 'Единиц всего', value: totalStock, color: '#10B981', icon: BarChart3 },
          { label: 'Мало (<3 шт.)', value: lowStock, color: '#F59E0B', icon: AlertTriangle },
          { label: 'Нет в наличии', value: outOfStock, color: '#EF4444', icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: '#111827', border: `1px solid ${color}20` }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} style={{ color }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
            </div>
            <p className="text-2xl font-black font-mono text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock table */}
        <div className="lg:col-span-2">
          <div className="relative mb-4">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input type="text" placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)}
              className="steel-input w-full pl-10" />
          </div>

          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#0D1421', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Товар</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Остаток</th>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Место</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Загрузка...</td></tr>
                ) : filtered.map((item, i) => (
                  <tr key={item.id} style={{ background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-white">{(item.product as { name_ru?: string } | undefined)?.name_ru || '—'}</p>
                      <p className="font-mono text-[10px]" style={{ color: '#0EA5E9' }}>{(item.product as { model?: string } | undefined)?.model}</p>
                    </td>
                    <td className="px-4 py-3 text-center font-bold font-mono text-lg"
                      style={{ color: item.quantity === 0 ? '#f87171' : item.quantity < 3 ? '#fbbf24' : '#34d399' }}>
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.location || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent transactions */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Последние движения</h2>
          <div className="space-y-2">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: tx.type === 'in' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: tx.type === 'in' ? '#34d399' : '#f87171' }}>
                  {tx.type === 'in' ? <ArrowDown size={11} /> : <ArrowUp size={11} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white truncate">{(tx.product as { name_ru?: string } | undefined)?.name_ru}</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {new Date(tx.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="font-bold font-mono text-sm flex-shrink-0"
                  style={{ color: tx.type === 'in' ? '#34d399' : '#f87171' }}>
                  {tx.type === 'in' ? '+' : '−'}{tx.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
