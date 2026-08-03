'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Plus, Trash2, Upload, Edit2, X, Loader2, ExternalLink,
  BookOpen, ShieldCheck, FlaskConical, Trophy,
} from 'lucide-react'

// ────────────────────────────────────────────────────────────────
// Shared bits
// ────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'publications', label: 'Публикации',            icon: BookOpen },
  { key: 'patents',      label: 'Патенты',                icon: ShieldCheck },
  { key: 'projects',     label: 'Проекты и разработки',   icon: FlaskConical },
  { key: 'achievements', label: 'Достижения сотрудников', icon: Trophy },
] as const

type TabKey = typeof TABS[number]['key']

const cardStyle = { background: '#1A2332', border: '1px solid rgba(255,255,255,0.08)' }
const rowStyle  = { background: '#1A2332', border: '1px solid rgba(255,255,255,0.06)' }
const labelStyle = { color: 'rgba(255,255,255,0.5)' }

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs mb-1.5" style={labelStyle}>{children}</label>
}

function FormShell({
  title, editing, onCancel, error, saving, onSubmit, children,
}: {
  title: string
  editing: boolean
  onCancel: () => void
  error: string
  saving: boolean
  onSubmit: (e: React.FormEvent) => void
  children: React.ReactNode
}) {
  return (
    <form onSubmit={onSubmit} className="mb-8 p-5 rounded-xl space-y-4" style={cardStyle}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {editing && (
          <button type="button" onClick={onCancel} style={{ color: 'rgba(255,255,255,0.4)' }}>
            <X size={16} />
          </button>
        )}
      </div>
      {children}
      <div className="flex items-center gap-4">
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
  )
}

function ImagePicker({
  url, onChange, uploadUrl, label,
}: {
  url: string
  onChange: (url: string) => void
  uploadUrl: string
  label: string
}) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', files[0])
      const res = await fetch(uploadUrl, { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onChange(data.url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-3">
        {url && (
          <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <img src={url} alt="" className="max-w-full max-h-full object-contain" />
          </div>
        )}
        <button type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {uploading ? 'Загрузка...' : 'Загрузить фото'}
        </button>
        {url && (
          <button type="button" onClick={() => onChange('')} className="text-xs" style={{ color: '#F87171' }}>
            Убрать
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => handleUpload(e.target.files)} />
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Publications
// ────────────────────────────────────────────────────────────────

interface Publication {
  id: string; title: string; authors: string | null; journal: string | null
  year: number | null; doi: string | null; sort_order: number
}
const EMPTY_PUB = { title: '', authors: '', journal: '', year: '', doi: '', sort_order: 0 }

function PublicationsTab() {
  const [items, setItems] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_PUB)
  const [editing, setEditing] = useState<Publication | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/science/publications').then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const startEdit = (p: Publication) => {
    setEditing(p)
    setForm({ title: p.title, authors: p.authors ?? '', journal: p.journal ?? '', year: p.year ? String(p.year) : '', doi: p.doi ?? '', sort_order: p.sort_order })
    setError('')
  }
  const cancelEdit = () => { setEditing(null); setForm(EMPTY_PUB); setError('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Введите название публикации'); return }
    setSaving(true); setError('')
    try {
      const payload = { title: form.title.trim(), authors: form.authors || null, journal: form.journal || null, year: form.year || null, doi: form.doi || null, sort_order: Number(form.sort_order) || 0 }
      const res = await fetch(editing ? `/api/admin/science/publications/${editing.id}` : '/api/admin/science/publications', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      load(); cancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить публикацию?')) return
    await fetch(`/api/admin/science/publications/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <>
      <FormShell title={editing ? `Редактирование публикации` : 'Добавить публикацию'} editing={!!editing} onCancel={cancelEdit} error={error} saving={saving} onSubmit={handleSubmit}>
        <div>
          <FieldLabel>Название публикации *</FieldLabel>
          <input className="steel-input w-full" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Recent advances and challenges of..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Журнал</FieldLabel>
            <input className="steel-input w-full" value={form.journal} onChange={e => setForm(f => ({ ...f, journal: e.target.value }))} placeholder="Journal of Energy Storage" />
          </div>
          <div>
            <FieldLabel>Год</FieldLabel>
            <input type="number" className="steel-input w-full" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="2024" />
          </div>
        </div>
        <div>
          <FieldLabel>Авторы</FieldLabel>
          <input className="steel-input w-full" value={form.authors} onChange={e => setForm(f => ({ ...f, authors: e.target.value }))} placeholder="Abdisattar A., Yeleuov M., ..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>DOI</FieldLabel>
            <input className="steel-input w-full" value={form.doi} onChange={e => setForm(f => ({ ...f, doi: e.target.value }))} placeholder="10.1016/j.elecom.2022.107373" />
          </div>
          <div>
            <FieldLabel>Порядок сортировки</FieldLabel>
            <input type="number" className="steel-input w-full" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
          </div>
        </div>
      </FormShell>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}><p className="text-sm">Публикации ещё не добавлены</p></div>
      ) : (
        <div className="space-y-2">
          {items.map(p => (
            <div key={p.id} className="flex items-start gap-4 px-4 py-3 rounded-xl" style={rowStyle}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{p.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {p.year && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>{p.year}</span>}
                  {p.journal && <span className="text-[11px]" style={{ color: '#60A5FA' }}>{p.journal}</span>}
                </div>
                {p.authors && <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{p.authors}</p>}
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded shrink-0" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>#{p.sort_order}</span>
              {p.doi && (
                <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.3)' }} className="shrink-0"><ExternalLink size={14} /></a>
              )}
              <button onClick={() => startEdit(p)} style={{ color: '#60A5FA' }} className="shrink-0"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(p.id)} style={{ color: '#F87171' }} className="shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ────────────────────────────────────────────────────────────────
// Patents
// ────────────────────────────────────────────────────────────────

interface Patent { id: string; title: string; patent_number: string | null; badge_label: string; sort_order: number }
const EMPTY_PATENT = { title: '', patent_number: '', badge_label: 'Патент', sort_order: 0 }

function PatentsTab() {
  const [items, setItems] = useState<Patent[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_PATENT)
  const [editing, setEditing] = useState<Patent | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/science/patents').then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const startEdit = (p: Patent) => {
    setEditing(p)
    setForm({ title: p.title, patent_number: p.patent_number ?? '', badge_label: p.badge_label, sort_order: p.sort_order })
    setError('')
  }
  const cancelEdit = () => { setEditing(null); setForm(EMPTY_PATENT); setError('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Введите название патента'); return }
    setSaving(true); setError('')
    try {
      const payload = { title: form.title.trim(), patent_number: form.patent_number || null, badge_label: form.badge_label || 'Патент', sort_order: Number(form.sort_order) || 0 }
      const res = await fetch(editing ? `/api/admin/science/patents/${editing.id}` : '/api/admin/science/patents', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      load(); cancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить патент?')) return
    await fetch(`/api/admin/science/patents/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <>
      <FormShell title={editing ? 'Редактирование патента' : 'Добавить патент'} editing={!!editing} onCancel={cancelEdit} error={error} saving={saving} onSubmit={handleSubmit}>
        <div>
          <FieldLabel>Название *</FieldLabel>
          <input className="steel-input w-full" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Способ получения керамического анодного материала" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <FieldLabel>Номер патента</FieldLabel>
            <input className="steel-input w-full" value={form.patent_number} onChange={e => setForm(f => ({ ...f, patent_number: e.target.value }))} placeholder="Патент РФ № 378990" />
          </div>
          <div>
            <FieldLabel>Метка</FieldLabel>
            <input className="steel-input w-full" value={form.badge_label} onChange={e => setForm(f => ({ ...f, badge_label: e.target.value }))} placeholder="Патент" />
          </div>
          <div>
            <FieldLabel>Порядок сортировки</FieldLabel>
            <input type="number" className="steel-input w-full" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
          </div>
        </div>
      </FormShell>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}><p className="text-sm">Патенты ещё не добавлены</p></div>
      ) : (
        <div className="space-y-2">
          {items.map(p => (
            <div key={p.id} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={rowStyle}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                {p.patent_number && <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{p.patent_number}</p>}
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0" style={{ background: 'rgba(16,185,129,0.12)', color: '#34D399' }}>{p.badge_label}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded shrink-0" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>#{p.sort_order}</span>
              <button onClick={() => startEdit(p)} style={{ color: '#60A5FA' }} className="shrink-0"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(p.id)} style={{ color: '#F87171' }} className="shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ────────────────────────────────────────────────────────────────
// Projects
// ────────────────────────────────────────────────────────────────

interface Project {
  id: string; title_ru: string; title_kk: string | null; title_en: string | null
  period: string | null; tags: string | null; image_url: string | null; sort_order: number
}
const EMPTY_PROJECT = { title_ru: '', title_kk: '', title_en: '', period: '', tags: '', image_url: '', sort_order: 0 }

function ProjectsTab() {
  const [items, setItems] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_PROJECT)
  const [editing, setEditing] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/science/projects').then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const startEdit = (p: Project) => {
    setEditing(p)
    setForm({ title_ru: p.title_ru, title_kk: p.title_kk ?? '', title_en: p.title_en ?? '', period: p.period ?? '', tags: p.tags ?? '', image_url: p.image_url ?? '', sort_order: p.sort_order })
    setError('')
  }
  const cancelEdit = () => { setEditing(null); setForm(EMPTY_PROJECT); setError('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title_ru.trim()) { setError('Введите название проекта'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        title_ru: form.title_ru.trim(), title_kk: form.title_kk || null, title_en: form.title_en || null,
        period: form.period || null, tags: form.tags || null, image_url: form.image_url || null,
        sort_order: Number(form.sort_order) || 0,
      }
      const res = await fetch(editing ? `/api/admin/science/projects/${editing.id}` : '/api/admin/science/projects', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      load(); cancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить проект?')) return
    await fetch(`/api/admin/science/projects/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <>
      <FormShell title={editing ? 'Редактирование проекта' : 'Добавить проект'} editing={!!editing} onCancel={cancelEdit} error={error} saving={saving} onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <FieldLabel>Название (рус) *</FieldLabel>
            <input className="steel-input w-full" value={form.title_ru} onChange={e => setForm(f => ({ ...f, title_ru: e.target.value }))} placeholder="Разработка анодных материалов для Li-ion аккумуляторов" />
          </div>
          <div>
            <FieldLabel>Название (қаз)</FieldLabel>
            <input className="steel-input w-full" value={form.title_kk} onChange={e => setForm(f => ({ ...f, title_kk: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Название (eng)</FieldLabel>
            <input className="steel-input w-full" value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Период</FieldLabel>
            <input className="steel-input w-full" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} placeholder="2023 – 2025" />
          </div>
          <div>
            <FieldLabel>Теги (через запятую)</FieldLabel>
            <input className="steel-input w-full" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Материалы, Энергия" />
          </div>
        </div>
        <ImagePicker url={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))} uploadUrl="/api/admin/science/upload" label="Фото проекта" />
        <div>
          <FieldLabel>Порядок сортировки</FieldLabel>
          <input type="number" className="steel-input w-24" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
        </div>
      </FormShell>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}><p className="text-sm">Проекты ещё не добавлены</p></div>
      ) : (
        <div className="space-y-2">
          {items.map(p => (
            <div key={p.id} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={rowStyle}>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden shrink-0" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <FlaskConical size={18} style={{ color: 'rgba(255,255,255,0.2)' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{p.title_ru}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {p.period && <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{p.period}</span>}
                  {p.tags && <span className="text-[11px]" style={{ color: '#60A5FA' }}>{p.tags}</span>}
                </div>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded shrink-0" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>#{p.sort_order}</span>
              <button onClick={() => startEdit(p)} style={{ color: '#60A5FA' }} className="shrink-0"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(p.id)} style={{ color: '#F87171' }} className="shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ────────────────────────────────────────────────────────────────
// Achievements
// ────────────────────────────────────────────────────────────────

interface Achievement {
  id: string; full_name: string; award_name: string; year: number | null
  organization: string | null; certificate_url: string | null; sort_order: number
}
const EMPTY_ACH = { full_name: '', award_name: '', year: '', organization: '', certificate_url: '', sort_order: 0 }

function AchievementsTab() {
  const [items, setItems] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_ACH)
  const [editing, setEditing] = useState<Achievement | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/science/achievements').then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const startEdit = (a: Achievement) => {
    setEditing(a)
    setForm({ full_name: a.full_name, award_name: a.award_name, year: a.year ? String(a.year) : '', organization: a.organization ?? '', certificate_url: a.certificate_url ?? '', sort_order: a.sort_order })
    setError('')
  }
  const cancelEdit = () => { setEditing(null); setForm(EMPTY_ACH); setError('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim() || !form.award_name.trim()) { setError('Введите ФИО и название награды'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        full_name: form.full_name.trim(), award_name: form.award_name.trim(), year: form.year || null,
        organization: form.organization || null, certificate_url: form.certificate_url || null,
        sort_order: Number(form.sort_order) || 0,
      }
      const res = await fetch(editing ? `/api/admin/science/achievements/${editing.id}` : '/api/admin/science/achievements', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      load(); cancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить достижение?')) return
    await fetch(`/api/admin/science/achievements/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <>
      <FormShell title={editing ? 'Редактирование достижения' : 'Добавить достижение'} editing={!!editing} onCancel={cancelEdit} error={error} saving={saving} onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>ФИО сотрудника *</FieldLabel>
            <input className="steel-input w-full" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Елеуов М.А." />
          </div>
          <div>
            <FieldLabel>Название награды / диплома *</FieldLabel>
            <input className="steel-input w-full" value={form.award_name} onChange={e => setForm(f => ({ ...f, award_name: e.target.value }))} placeholder="Лучший инженер года" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Год</FieldLabel>
            <input type="number" className="steel-input w-full" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="2025" />
          </div>
          <div>
            <FieldLabel>Организация</FieldLabel>
            <input className="steel-input w-full" value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} placeholder="НИНЖ РК" />
          </div>
        </div>
        <ImagePicker url={form.certificate_url} onChange={url => setForm(f => ({ ...f, certificate_url: url }))} uploadUrl="/api/admin/science/upload" label="Скан диплома / награды" />
        <div>
          <FieldLabel>Порядок сортировки</FieldLabel>
          <input type="number" className="steel-input w-24" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
        </div>
      </FormShell>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}><p className="text-sm">Достижения ещё не добавлены</p></div>
      ) : (
        <div className="space-y-2">
          {items.map(a => (
            <div key={a.id} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={rowStyle}>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden shrink-0" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {a.certificate_url ? <img src={a.certificate_url} alt="" className="w-full h-full object-cover" /> : <Trophy size={18} style={{ color: 'rgba(255,255,255,0.2)' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{a.full_name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{a.award_name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {a.year && <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{a.year}</span>}
                  {a.organization && <span className="text-[11px]" style={{ color: '#60A5FA' }}>{a.organization}</span>}
                </div>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded shrink-0" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>#{a.sort_order}</span>
              <button onClick={() => startEdit(a)} style={{ color: '#60A5FA' }} className="shrink-0"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(a.id)} style={{ color: '#F87171' }} className="shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────

export default function ScienceAdminPage() {
  const [tab, setTab] = useState<TabKey>('publications')

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-black text-white mb-0.5">Наука</h1>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Публикации, патенты, научные проекты и достижения сотрудников — отображаются на странице «Наука» сайта
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.key
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={active
                ? { background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }
                : { background: '#1A2332', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Icon size={14} />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'publications' && <PublicationsTab />}
      {tab === 'patents' && <PatentsTab />}
      {tab === 'projects' && <ProjectsTab />}
      {tab === 'achievements' && <AchievementsTab />}
    </div>
  )
}
