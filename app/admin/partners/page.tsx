'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Upload, Edit2, X, Loader2, GripVertical, ExternalLink } from 'lucide-react'

interface Partner {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
  sort_order: number
  created_at: string
}

const EMPTY = { name: '', logo_url: '', website_url: '', sort_order: 0 }

export default function PartnersAdminPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState<Partner | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/partners')
      .then(r => r.json())
      .then(d => setPartners(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const startEdit = (p: Partner) => {
    setEditing(p)
    setForm({ name: p.name, logo_url: p.logo_url ?? '', website_url: p.website_url ?? '', sort_order: p.sort_order })
    setError('')
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm(EMPTY)
    setError('')
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', files[0])
      const res = await fetch('/api/admin/partners/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm(f => ({ ...f, logo_url: data.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Введите название'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        ...(editing ? { id: editing.id } : {}),
        name: form.name.trim(),
        logo_url: form.logo_url || null,
        website_url: form.website_url || null,
        sort_order: Number(form.sort_order) || 0,
      }
      const res = await fetch('/api/admin/partners', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      load()
      cancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить партнёра?')) return
    await fetch('/api/admin/partners', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-black text-white mb-0.5">Партнёры</h1>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Логотипы партнёров отображаются на главной странице сайта
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-5 rounded-xl space-y-4"
        style={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-bold text-white">
            {editing ? `Редактирование: ${editing.name}` : 'Добавить партнёра'}
          </h2>
          {editing && (
            <button type="button" onClick={cancelEdit} style={{ color: 'rgba(255,255,255,0.4)' }}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Название *</label>
            <input
              className="steel-input w-full"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Satbayev University"
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Сайт (URL)</label>
            <input
              className="steel-input w-full"
              value={form.website_url}
              onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))}
              placeholder="https://satbayev.university"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Логотип</label>
          <div className="flex items-center gap-3">
            {form.logo_url && (
              <div className="w-16 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src={form.logo_url} alt="" className="max-w-full max-h-full object-contain p-1" />
              </div>
            )}
            <button type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {uploading ? 'Загрузка...' : 'Загрузить логотип'}
            </button>
            {form.logo_url && (
              <button type="button" onClick={() => setForm(f => ({ ...f, logo_url: '' }))}
                className="text-xs" style={{ color: '#F87171' }}>
                Убрать
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => handleUpload(e.target.files)} />
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Порядок сортировки</label>
            <input type="number" className="steel-input w-24"
              value={form.sort_order}
              onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
          </div>
          <div className="flex-1" />
          {error && <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>}
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {editing ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} />
        </div>
      ) : partners.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <p className="text-sm">Партнёры ещё не добавлены</p>
        </div>
      ) : (
        <div className="space-y-2">
          {partners.map(p => (
            <div key={p.id} className="flex items-center gap-4 px-4 py-3 rounded-xl"
              style={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.06)' }}>
              <GripVertical size={14} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />

              <div className="w-16 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {p.logo_url
                  ? <img src={p.logo_url} alt={p.name} className="max-w-full max-h-full object-contain p-1" />
                  : <span className="text-[9px] font-bold text-center leading-tight px-1"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>{p.name.slice(0, 3).toUpperCase()}</span>
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                {p.website_url && (
                  <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {p.website_url}
                  </p>
                )}
              </div>

              <span className="text-[11px] font-mono px-2 py-0.5 rounded"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                #{p.sort_order}
              </span>

              {p.website_url && (
                <a href={p.website_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <ExternalLink size={14} />
                </a>
              )}

              <button onClick={() => startEdit(p)} style={{ color: '#60A5FA' }}>
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(p.id)} style={{ color: '#F87171' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
