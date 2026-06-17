'use client'

import { useEffect, useState } from 'react'
import { Loader2, Pencil, Check, X, Tag, Plus } from 'lucide-react'
import { useAdminAuth } from '@/context/AdminAuthContext'
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

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function CreateCategoryModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Category) => void }) {
  const [nameRu, setNameRu] = useState('')
  const [nameKk, setNameKk] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [slug, setSlug]     = useState('')
  const [code, setCode]     = useState('')
  const [descRu, setDescRu] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]    = useState('')

  const handleNameRu = (v: string) => {
    setNameRu(v)
    if (!slug || slug === slugify(nameRu)) setSlug(slugify(v))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slug) { setError('Slug обязателен'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        name_ru: nameRu,
        name_kk: nameKk || nameRu,
        name_en: nameEn || nameRu,
        description_ru: descRu || null,
        classification_code: code.toUpperCase().trim() || null,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Ошибка'); return }
    onCreated(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Tag size={14} style={{ color: '#60A5FA' }} /> Новая категория
          </h2>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)' }}><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Название (рус) *</label>
            <input type="text" value={nameRu} onChange={e => handleNameRu(e.target.value)}
              className="steel-input w-full" placeholder="Муфельные печи" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Название (каз)</label>
              <input type="text" value={nameKk} onChange={e => setNameKk(e.target.value)}
                className="steel-input w-full" placeholder="Муфельді пештер" />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Название (eng)</label>
              <input type="text" value={nameEn} onChange={e => setNameEn(e.target.value)}
                className="steel-input w-full" placeholder="Muffle Furnaces" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Slug (URL) *</label>
              <input type="text" value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="steel-input w-full font-mono text-xs" placeholder="muffle-furnaces" required />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Код классификации</label>
              <input type="text" value={code}
                onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                className="steel-input w-full font-mono text-xs" placeholder="SFM" maxLength={10} />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Описание (рус)</label>
            <textarea value={descRu} onChange={e => setDescRu(e.target.value)}
              className="steel-input w-full text-xs resize-none" rows={2} placeholder="Краткое описание..." />
          </div>
          {error && (
            <p className="text-xs px-3 py-2 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171' }}>{error}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
              {loading ? <><Loader2 size={13} className="animate-spin" /> Создаём...</> : 'Создать'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary px-4 text-sm">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCategoriesPage() {
  const { can } = useAdminAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editCode, setEditCode]     = useState('')
  const [saving, setSaving]         = useState(false)
  const [showCreate, setShowCreate] = useState(false)

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
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-black text-white mb-0.5">Категории и классификаторы</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Код классификации привязан к категории и подставляется автоматически при добавлении товара.
          </p>
        </div>
        {can('categories', 'create') && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
            <Plus size={14} /> Добавить
          </button>
        )}
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr style={{ background: '#0D1421', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Категория</th>
                <th className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Код</th>
                <th className="px-5 py-3 text-left text-xs font-medium hidden sm:table-cell" style={{ color: 'rgba(255,255,255,0.4)' }}>Расшифровка</th>
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
                        className="steel-input w-24 text-xs font-mono"
                        value={editCode}
                        onChange={e => setEditCode(e.target.value.toUpperCase())}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat); if (e.key === 'Escape') setEditingId(null) }}
                        placeholder="SFTV"
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
                  <td className="px-5 py-3 text-xs hidden sm:table-cell" style={{ color: 'rgba(255,255,255,0.4)' }}>
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

      {showCreate && (
        <CreateCategoryModal
          onClose={() => setShowCreate(false)}
          onCreated={cat => setCategories(prev => [...prev, cat].sort((a, b) => a.name_ru.localeCompare(b.name_ru, 'ru')))}
        />
      )}
    </div>
  )
}
