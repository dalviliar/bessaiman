'use client'

import { useEffect, useState } from 'react'
import { Loader2, Pencil, Check, X, Tag } from 'lucide-react'
import type { Category } from '@/types'

const CLASS_HINT: Record<string, string> = {
  SFM: 'Серийные муфельные печи',
  SFTH: 'Горизонтальные трубчатые печи',
  SFTV: 'Вертикальные трубчатые печи',
  SFTM: 'Мультипозиционные трубчатые печи',
  SM: 'Серийные измельчители',
  SS: 'Серийные установки синтеза',
  PA: 'Расходники / аксессуары',
  LF: 'Лабораторная мебель',
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCode, setEditCode] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => { setCategories(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditCode(cat.classification_code ?? '')
  }

  const saveEdit = async (cat: Category) => {
    setSaving(true)
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...cat, classification_code: editCode.toUpperCase().trim() || null }),
    })
    if (res.ok) {
      const updated = await res.json()
      setCategories(prev => prev.map(c => c.id === cat.id ? updated : c))
      setEditingId(null)
    }
    setSaving(false)
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-black text-white mb-0.5">Категории и классификаторы</h1>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Код классификации привязан к категории и подставляется автоматически при добавлении товара.
          Иерархия: SF → SFT → SFTH/SFTV/SFTM. Лист дерева — это и есть код.
        </p>
      </div>

      {/* Иерархия-шпаргалка */}
      <div className="rounded-xl p-4 mb-5" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
        <p className="text-xs font-bold mb-2" style={{ color: '#60A5FA' }}>Иерархия кодов по документу</p>
        <div className="text-[11px] font-mono space-y-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <p>S → SF (Печи) → SFM (Муфельные) / SFT → SFTH / SFTV / SFTM</p>
          <p>S → SM (Измельчители)  ·  SS (Синтез)  ·  PA (Аксессуары)  ·  LF (Мебель)</p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#0D1421', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Категория</th>
              <th className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Код классификации</th>
              <th className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Расшифровка</th>
              <th className="px-5 py-3 w-16" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center">
                <Loader2 size={20} className="animate-spin mx-auto" style={{ color: '#3B82F6' }} />
              </td></tr>
            ) : categories.map((cat, i) => (
              <tr key={cat.id} style={{ background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td className="px-5 py-3 text-white text-xs font-medium">{cat.name_ru}</td>
                <td className="px-5 py-3">
                  {editingId === cat.id ? (
                    <input
                      autoFocus
                      className="steel-input w-28 text-xs font-mono"
                      value={editCode}
                      onChange={e => setEditCode(e.target.value.toUpperCase())}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat); if (e.key === 'Escape') setEditingId(null) }}
                      placeholder="напр. SFTV"
                    />
                  ) : (
                    cat.classification_code ? (
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded"
                        style={{ background: 'rgba(14,165,233,0.1)', color: '#0EA5E9' }}>
                        {cat.classification_code}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>не задан</span>
                    )
                  )}
                </td>
                <td className="px-5 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {CLASS_HINT[editingId === cat.id ? editCode : (cat.classification_code ?? '')] ?? '—'}
                </td>
                <td className="px-5 py-3 text-center">
                  {editingId === cat.id ? (
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => saveEdit(cat)} disabled={saving}
                        className="p-1.5 rounded" style={{ color: '#34D399', background: 'rgba(52,211,153,0.1)' }}>
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="p-1.5 rounded" style={{ color: '#F87171', background: 'rgba(239,68,68,0.1)' }}>
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(cat)}
                      className="p-1.5 rounded" style={{ color: '#60A5FA', background: 'rgba(59,130,246,0.1)' }}>
                      <Pencil size={12} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
          <Tag size={11} /> Как работает
        </p>
        <ul className="text-[11px] space-y-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <li>• При добавлении товара выберите категорию — код классификации подставится автоматически</li>
          <li>• Код можно вручную изменить в форме товара, если нужен уточнённый вариант (напр. SFTH вместо SFT)</li>
          <li>• По коду работает поиск совместимых аксессуаров и группировка в каталоге</li>
          <li>• Нажмите карандаш чтобы отредактировать код для конкретной категории</li>
        </ul>
      </div>
    </div>
  )
}
