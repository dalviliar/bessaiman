'use client'

import { useEffect, useState } from 'react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { Package, Search, ExternalLink, Loader2, CheckCircle, Plus, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Product } from '@/types'

const TYPE_COLORS: Record<string, { label: string; color: string }> = {
  S:  { label: 'Серийный',      color: '#10B981' },
  PA: { label: 'Комплектующие', color: '#F59E0B' },
  PP: { label: 'Для сборки',    color: '#6B7280' },
  I:  { label: 'Под заказ',     color: '#8B5CF6' },
}

export default function AdminProductsPage() {
  const { can } = useAdminAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = () => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (p: Product) => {
    if (!confirm(`Удалить товар «${p.name_ru}»? Это действие нельзя отменить.`)) return
    setDeletingId(p.id)
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' })
      const isJson = res.headers.get('content-type')?.includes('application/json')
      const data = isJson ? await res.json() : null
      if (!res.ok) throw new Error(data?.error || 'Не удалось удалить товар')
      setProducts(prev => prev.filter(x => x.id !== p.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка удаления')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = products.filter(p => {
    const matchType = typeFilter === 'all' || p.product_type === typeFilter
    const matchSearch = !search ||
      p.name_ru.toLowerCase().includes(search.toLowerCase()) ||
      (p.model?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (p.classification_code?.toLowerCase().includes(search.toLowerCase()) ?? false)
    return matchType && matchSearch
  })

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-black text-white mb-0.5">Каталог товаров</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {products.length} позиций в базе
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/catalog" target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <ExternalLink size={14} /> Открыть каталог
          </Link>
          {can('products', 'create') && (
            <Link href="/admin/products/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
              <Plus size={14} /> Добавить товар
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-4">
        {[
          { key: 'all', label: 'Все' },
          { key: 'S',   label: 'Серийные (S)' },
          { key: 'PA',  label: 'Комплектующие (PA)' },
          { key: 'PP',  label: 'Для сборки (PP)' },
          { key: 'I',   label: 'Под заказ (I)' },
        ].map(t => (
          <button key={t.key} onClick={() => setTypeFilter(t.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: typeFilter === t.key ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${typeFilter === t.key ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: typeFilter === t.key ? '#60A5FA' : 'rgba(255,255,255,0.45)',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative mb-5">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
        <input type="text" placeholder="Поиск по названию, модели, коду..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="steel-input w-full pl-10" />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr style={{ background: '#0D1421', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Код / Модель</th>
                <th className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Название</th>
                <th className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Категория</th>
                <th className="px-5 py-3 text-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Тип</th>
                <th className="px-5 py-3 text-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Наличие</th>
                <th className="px-5 py-3 text-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Остаток</th>
                <th className="px-5 py-3 text-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Фото</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center">
                  <Loader2 size={20} className="animate-spin mx-auto" style={{ color: '#3B82F6' }} />
                </td></tr>
              ) : filtered.map((p, i) => {
                const typeMeta = TYPE_COLORS[p.product_type ?? 'S'] ?? TYPE_COLORS.S
                return (
                  <tr key={p.id} style={{ background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-5 py-3">
                      {p.classification_code && (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded mr-2"
                          style={{ background: 'rgba(14,165,233,0.1)', color: '#0EA5E9' }}>
                          {p.classification_code}
                        </span>
                      )}
                      <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{p.model}</span>
                    </td>
                    <td className="px-5 py-3 text-white text-xs font-medium max-w-xs truncate">{p.name_ru}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {(p.category as { name_ru?: string } | undefined)?.name_ru || '—'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${typeMeta.color}15`, color: typeMeta.color }}>
                        {typeMeta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-xs" style={{ color: p.availability === 'in_stock' ? '#34d399' : p.availability === 'on_order' ? '#fbbf24' : '#f87171' }}>
                      {p.availability === 'in_stock' ? 'В наличии' : p.availability === 'on_order' ? 'Под заказ' : 'Нет'}
                    </td>
                    <td className="px-5 py-3 text-center text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {p.stock_quantity ?? 0} {p.unit ?? 'шт'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {p.images?.length ? (
                        <CheckCircle size={14} style={{ color: '#34d399', margin: '0 auto' }} />
                      ) : (
                        <Package size={14} style={{ color: 'rgba(255,255,255,0.2)', margin: '0 auto' }} />
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link href={`/catalog/${p.slug}`} target="_blank"
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)' }}>
                          <ExternalLink size={12} />
                        </Link>
                        {can('products', 'update') && (
                          <button onClick={() => router.push(`/admin/products/${p.id}/edit`)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: '#60A5FA', background: 'rgba(59,130,246,0.1)' }}>
                            <Pencil size={12} />
                          </button>
                        )}
                        {can('products', 'delete') && (
                          <button onClick={() => handleDelete(p)} disabled={deletingId === p.id}
                            className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
                            style={{ color: '#F87171', background: 'rgba(239,68,68,0.1)' }}>
                            {deletingId === p.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
