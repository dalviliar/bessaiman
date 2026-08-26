'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Plus, Trash2, Upload, Edit2, X, Loader2, ExternalLink, ChevronUp, ChevronDown,
  BookOpen, ShieldCheck, FlaskConical, Trophy, FileSignature, Award,
} from 'lucide-react'
import { AlignPicker, type TextAlign } from '@/components/admin/AlignPicker'

// ────────────────────────────────────────────────────────────────
// Shared bits
// ────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'publications', label: 'Публикации',                        icon: BookOpen },
  { key: 'patents',      label: 'Патенты и авторские свидетельства', icon: ShieldCheck },
  { key: 'projects',     label: 'Проекты и разработки',              icon: FlaskConical },
  { key: 'contracts',    label: 'Хоздоговоры',                       icon: FileSignature },
  { key: 'achievements', label: 'Достижения сотрудников',            icon: Trophy },
  { key: 'accreditation', label: 'Аккредитация',                     icon: Award },
] as const

type TabKey = typeof TABS[number]['key']

const cardStyle = { background: '#1A2332', border: '1px solid rgba(255,255,255,0.08)' }
const rowStyle  = { background: '#1A2332', border: '1px solid rgba(255,255,255,0.06)' }
const labelStyle = { color: 'rgba(255,255,255,0.5)' }

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs mb-1.5" style={labelStyle}>{children}</label>
}

// Swaps an item with its neighbour, persists the new order via the given
// reorder endpoint. Mirrors the categories/products up/down reordering pattern.
async function moveItem<T extends { id: string }>(
  items: T[], index: number, direction: -1 | 1, endpoint: string, setItems: (items: T[]) => void,
) {
  const target = index + direction
  if (target < 0 || target >= items.length) return
  const reordered = [...items]
  ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
  setItems(reordered)
  await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds: reordered.map(i => i.id) }),
  })
}

function MoveButtons({ index, count, onMove }: { index: number; count: number; onMove: (dir: -1 | 1) => void }) {
  return (
    <div className="flex flex-col gap-0.5 shrink-0">
      <button type="button" onClick={() => onMove(-1)} disabled={index === 0}
        className="disabled:opacity-20" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <ChevronUp size={14} />
      </button>
      <button type="button" onClick={() => onMove(1)} disabled={index === count - 1}
        className="disabled:opacity-20" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <ChevronDown size={14} />
      </button>
    </div>
  )
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
  const [open, setOpen] = useState(false)
  useEffect(() => { if (editing) setOpen(true) }, [editing])

  // Collapsed by default so the records stay in view — the form grew tall
  // enough to push the whole list below the fold.
  if (!editing && !open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="mb-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors"
        style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px dashed rgba(59,130,246,0.35)' }}>
        <Plus size={15} />{title}
      </button>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mb-8 p-5 rounded-xl space-y-4" style={cardStyle}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        <button type="button" onClick={() => { onCancel(); setOpen(false) }} style={{ color: 'rgba(255,255,255,0.4)' }}>
          <X size={16} />
        </button>
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
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true); setError('')
    try {
      const fd = new FormData()
      fd.append('file', files[0])
      const res = await fetch(uploadUrl, { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
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
      {error && <p className="text-xs mt-1.5" style={{ color: '#F87171' }}>{error}</p>}
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => handleUpload(e.target.files)} />
    </div>
  )
}

function GalleryPicker({
  urls, onChange, uploadUrl, label,
}: {
  urls: string[]
  onChange: (urls: string[]) => void
  uploadUrl: string
  label: string
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true); setError('')
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch(uploadUrl, { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        uploaded.push(data.url)
      }
      onChange([...urls, ...uploaded])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= urls.length) return
    const next = [...urls]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {urls.map((u, i) => (
            <div key={u + i} className="relative w-24">
              <div className="w-24 h-24 rounded-lg flex items-center justify-center overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.05)', border: i === 0 ? '1px solid rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.1)' }}>
                <img src={u} alt="" className="max-w-full max-h-full object-contain" />
              </div>
              {i === 0 && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold"
                  style={{ background: 'rgba(59,130,246,0.9)', color: 'white' }}>обложка</span>
              )}
              <div className="flex items-center justify-between mt-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                  className="px-1.5 text-xs disabled:opacity-25" style={{ color: '#93C5FD' }}>←</button>
                <button type="button" onClick={() => onChange(urls.filter((_, k) => k !== i))}
                  className="text-[11px]" style={{ color: '#F87171' }}>убрать</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === urls.length - 1}
                  className="px-1.5 text-xs disabled:opacity-25" style={{ color: '#93C5FD' }}>→</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button type="button"
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
        style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
        {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
        {uploading ? 'Загрузка...' : urls.length ? 'Добавить ещё' : 'Загрузить фото'}
      </button>
      <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Можно выбрать сразу несколько файлов. Первое фото — обложка карточки, порядок меняется стрелками.
      </p>
      {error && <p className="text-xs mt-1.5" style={{ color: '#F87171' }}>{error}</p>}
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
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
const EMPTY_PUB = { title: '', authors: '', journal: '', year: '', doi: '' }

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
    setForm({ title: p.title, authors: p.authors ?? '', journal: p.journal ?? '', year: p.year ? String(p.year) : '', doi: p.doi ?? '' })
    setError('')
  }
  const cancelEdit = () => { setEditing(null); setForm(EMPTY_PUB); setError('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Введите название публикации'); return }
    setSaving(true); setError('')
    try {
      const payload = { title: form.title.trim(), authors: form.authors || null, journal: form.journal || null, year: form.year || null, doi: form.doi || null }
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
        <div>
          <FieldLabel>DOI</FieldLabel>
          <input className="steel-input w-full" value={form.doi} onChange={e => setForm(f => ({ ...f, doi: e.target.value }))} placeholder="10.1016/j.elecom.2022.107373" />
        </div>
      </FormShell>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}><p className="text-sm">Публикации ещё не добавлены</p></div>
      ) : (
        <div className="space-y-2">
          {items.map((p, i) => (
            <div key={p.id} className="flex items-start gap-4 px-4 py-3 rounded-xl" style={rowStyle}>
              <MoveButtons index={i} count={items.length} onMove={dir => moveItem(items, i, dir, '/api/admin/science/publications/reorder', setItems)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{p.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {p.year && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>{p.year}</span>}
                  {p.journal && <span className="text-[11px]" style={{ color: '#60A5FA' }}>{p.journal}</span>}
                </div>
                {p.authors && <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{p.authors}</p>}
              </div>
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

interface Patent { id: string; title: string; patent_number: string | null; badge_label: string; image_url: string | null; description: string | null; sort_order: number }
const EMPTY_PATENT = { title: '', patent_number: '', badge_label: 'Патент', image_url: '', description: '' }

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
    setForm({ title: p.title, patent_number: p.patent_number ?? '', badge_label: p.badge_label, image_url: p.image_url ?? '', description: p.description ?? '' })
    setError('')
  }
  const cancelEdit = () => { setEditing(null); setForm(EMPTY_PATENT); setError('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Введите название патента'); return }
    setSaving(true); setError('')
    try {
      const payload = { title: form.title.trim(), patent_number: form.patent_number || null, badge_label: form.badge_label || 'Патент', image_url: form.image_url || null, description: form.description || null }
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Номер</FieldLabel>
            <input className="steel-input w-full" value={form.patent_number} onChange={e => setForm(f => ({ ...f, patent_number: e.target.value }))} placeholder="№ 378990" />
          </div>
          <div>
            <FieldLabel>Тип</FieldLabel>
            <select className="steel-input w-full" value={form.badge_label} onChange={e => setForm(f => ({ ...f, badge_label: e.target.value }))}>
              <option value="Патент">Патент</option>
              <option value="Авторское свидетельство">Авторское свидетельство</option>
            </select>
          </div>
        </div>
        <div>
          <FieldLabel>Описание — показывается по клику на карточку</FieldLabel>
          <textarea className="steel-input w-full" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Что это за патент, что он покрывает, где применяется..." />
        </div>
        <ImagePicker url={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))} uploadUrl="/api/admin/science/upload" label="Фото патента / свидетельства" />
      </FormShell>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}><p className="text-sm">Патенты ещё не добавлены</p></div>
      ) : (
        <div className="space-y-2">
          {items.map((p, i) => (
            <div key={p.id} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={rowStyle}>
              <MoveButtons index={i} count={items.length} onMove={dir => moveItem(items, i, dir, '/api/admin/science/patents/reorder', setItems)} />
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <ShieldCheck size={16} style={{ color: 'rgba(255,255,255,0.2)' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                {p.patent_number && <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{p.patent_number}</p>}
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0" style={{ background: 'rgba(16,185,129,0.12)', color: '#34D399' }}>{p.badge_label}</span>
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
  description_ru: string | null; description_kk: string | null; description_en: string | null
  period: string | null; tags: string | null; images: string[] | null; kind: string; sort_order: number
  text_align: TextAlign
}
const EMPTY_PROJECT = {
  title_ru: '', title_kk: '', title_en: '', description_ru: '', description_kk: '', description_en: '',
  period: '', tags: '', images: [] as string[], text_align: 'left' as TextAlign,
}
const PROJECT_KINDS = [
  { key: 'individual', label: 'Индивидуальные разработки' },
  { key: 'project',    label: 'Проекты' },
] as const

function ProjectsTab() {
  const [items, setItems] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'individual' | 'project'>('individual')
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
    setForm({
      title_ru: p.title_ru, title_kk: p.title_kk ?? '', title_en: p.title_en ?? '',
      description_ru: p.description_ru ?? '', description_kk: p.description_kk ?? '', description_en: p.description_en ?? '',
      period: p.period ?? '', tags: p.tags ?? '', images: p.images ?? [],
      text_align: p.text_align ?? 'left',
    })
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
        description_ru: form.description_ru || null, description_kk: form.description_kk || null, description_en: form.description_en || null,
        period: form.period || null, tags: form.tags || null, images: form.images,
        kind: editing ? editing.kind : filter, text_align: form.text_align,
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

  const filtered = items.filter(p => (p.kind === 'project' ? 'project' : 'individual') === filter)

  return (
    <>
      <div className="flex gap-2 mb-5">
        {PROJECT_KINDS.map(k => (
          <button key={k.key} onClick={() => { setFilter(k.key); cancelEdit() }}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold transition-all"
            style={filter === k.key
              ? { background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.3)' }
              : { background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {k.label}
          </button>
        ))}
      </div>

      <FormShell title={editing ? 'Редактирование записи' : `Добавить: ${PROJECT_KINDS.find(k => k.key === filter)?.label}`} editing={!!editing} onCancel={cancelEdit} error={error} saving={saving} onSubmit={handleSubmit}>
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
        <div>
          <FieldLabel>Полное описание (рус) — показывается по клику на карточку</FieldLabel>
          <textarea className="steel-input w-full" rows={4} value={form.description_ru} onChange={e => setForm(f => ({ ...f, description_ru: e.target.value }))} placeholder="Подробности разработки: задача, решение, характеристики..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Полное описание (қаз)</FieldLabel>
            <textarea className="steel-input w-full" rows={3} value={form.description_kk} onChange={e => setForm(f => ({ ...f, description_kk: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Полное описание (eng)</FieldLabel>
            <textarea className="steel-input w-full" rows={3} value={form.description_en} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} />
          </div>
        </div>
        <AlignPicker value={form.text_align} onChange={v => setForm(f => ({ ...f, text_align: v }))} />
        <GalleryPicker urls={form.images} onChange={images => setForm(f => ({ ...f, images }))} uploadUrl="/api/admin/science/upload" label="Фото и схемы разработки" />
      </FormShell>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}><p className="text-sm">Записей ещё нет</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p, i) => (
            <div key={p.id} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={rowStyle}>
              <MoveButtons index={i} count={filtered.length} onMove={dir => moveItem(filtered, i, dir, '/api/admin/science/projects/reorder', reordered => {
                setItems(prev => {
                  const others = prev.filter(x => !filtered.some(f => f.id === x.id))
                  return [...others, ...reordered]
                })
              })} />
              <div className="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden shrink-0" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <FlaskConical size={18} style={{ color: 'rgba(255,255,255,0.2)' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{p.title_ru}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {p.period && <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{p.period}</span>}
                  {p.tags && <span className="text-[11px]" style={{ color: '#60A5FA' }}>{p.tags}</span>}
                </div>
              </div>
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
// Contracts (Хоздоговоры)
// ────────────────────────────────────────────────────────────────

interface Contract {
  id: string; title: string; customer: string | null; year: number | null; description: string | null
  sort_order: number; text_align: TextAlign
}
const EMPTY_CONTRACT = { title: '', customer: '', year: '', description: '', text_align: 'left' as TextAlign }

function ContractsTab() {
  const [items, setItems] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_CONTRACT)
  const [editing, setEditing] = useState<Contract | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/science/contracts').then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const startEdit = (c: Contract) => {
    setEditing(c)
    setForm({ title: c.title, customer: c.customer ?? '', year: c.year ? String(c.year) : '', description: c.description ?? '', text_align: c.text_align ?? 'left' })
    setError('')
  }
  const cancelEdit = () => { setEditing(null); setForm(EMPTY_CONTRACT); setError('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Введите тему договора'); return }
    setSaving(true); setError('')
    try {
      const payload = { title: form.title.trim(), customer: form.customer || null, year: form.year || null, description: form.description || null, text_align: form.text_align }
      const res = await fetch(editing ? `/api/admin/science/contracts/${editing.id}` : '/api/admin/science/contracts', {
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
    if (!confirm('Удалить договор?')) return
    await fetch(`/api/admin/science/contracts/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <>
      <FormShell title={editing ? 'Редактирование договора' : 'Добавить хоздоговор'} editing={!!editing} onCancel={cancelEdit} error={error} saving={saving} onSubmit={handleSubmit}>
        <div>
          <FieldLabel>Тема договора *</FieldLabel>
          <input className="steel-input w-full" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Разработка установки для синтеза наноматериалов" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Заказчик</FieldLabel>
            <input className="steel-input w-full" value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} placeholder="КазНИТУ им. К.И. Сатпаева" />
          </div>
          <div>
            <FieldLabel>Год</FieldLabel>
            <input type="number" className="steel-input w-full" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="2025" />
          </div>
        </div>
        <div>
          <FieldLabel>Краткое описание</FieldLabel>
          <textarea className="steel-input w-full" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <AlignPicker value={form.text_align} onChange={v => setForm(f => ({ ...f, text_align: v }))} />
      </FormShell>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}><p className="text-sm">Договоры ещё не добавлены</p></div>
      ) : (
        <div className="space-y-2">
          {items.map((c, i) => (
            <div key={c.id} className="flex items-start gap-4 px-4 py-3 rounded-xl" style={rowStyle}>
              <MoveButtons index={i} count={items.length} onMove={dir => moveItem(items, i, dir, '/api/admin/science/contracts/reorder', setItems)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{c.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {c.year && <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.year}</span>}
                  {c.customer && <span className="text-[11px]" style={{ color: '#60A5FA' }}>{c.customer}</span>}
                </div>
              </div>
              <button onClick={() => startEdit(c)} style={{ color: '#60A5FA' }} className="shrink-0"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(c.id)} style={{ color: '#F87171' }} className="shrink-0"><Trash2 size={14} /></button>
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
  organization: string | null; certificate_url: string | null; description: string | null; sort_order: number
}
const EMPTY_ACH = { full_name: '', award_name: '', year: '', organization: '', certificate_url: '', description: '' }

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
    setForm({ full_name: a.full_name, award_name: a.award_name, year: a.year ? String(a.year) : '', organization: a.organization ?? '', certificate_url: a.certificate_url ?? '', description: a.description ?? '' })
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
        organization: form.organization || null, certificate_url: form.certificate_url || null, description: form.description || null,
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
        <div>
          <FieldLabel>Описание — показывается по клику на карточку</FieldLabel>
          <textarea className="steel-input w-full" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="За что получена награда, детали..." />
        </div>
        <ImagePicker url={form.certificate_url} onChange={url => setForm(f => ({ ...f, certificate_url: url }))} uploadUrl="/api/admin/science/upload" label="Скан диплома / награды" />
      </FormShell>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}><p className="text-sm">Достижения ещё не добавлены</p></div>
      ) : (
        <div className="space-y-2">
          {items.map((a, i) => (
            <div key={a.id} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={rowStyle}>
              <MoveButtons index={i} count={items.length} onMove={dir => moveItem(items, i, dir, '/api/admin/science/achievements/reorder', setItems)} />
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
// Accreditation — a single editable record, not a list
// ────────────────────────────────────────────────────────────────

function FilePicker({
  url, onChange, uploadUrl, accept, label,
}: {
  url: string
  onChange: (url: string) => void
  uploadUrl: string
  accept: string
  label: string
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true); setError('')
    try {
      const fd = new FormData()
      fd.append('file', files[0])
      const res = await fetch(uploadUrl, { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-3">
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#93C5FD' }}>
            <ExternalLink size={12} />Открыть файл
          </a>
        )}
        <button type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {uploading ? 'Загрузка...' : url ? 'Заменить' : 'Загрузить'}
        </button>
        {url && (
          <button type="button" onClick={() => onChange('')} className="text-xs" style={{ color: '#F87171' }}>
            Убрать
          </button>
        )}
      </div>
      {error && <p className="text-xs mt-1.5" style={{ color: '#F87171' }}>{error}</p>}
      <input ref={fileRef} type="file" accept={accept} className="hidden"
        onChange={e => handleUpload(e.target.files)} />
    </div>
  )
}

const EMPTY_ACCREDITATION = {
  title_ru: '', title_kk: '', title_en: '',
  description_ru: '', description_kk: '', description_en: '',
  issuer: '', valid_until: '', image_url: '', pdf_url: '', text_align: 'left' as TextAlign,
}

function AccreditationTab() {
  const [form, setForm] = useState(EMPTY_ACCREDITATION)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/science/accreditation').then(r => r.json())
      .then(d => setForm({
        title_ru: d.title_ru ?? '', title_kk: d.title_kk ?? '', title_en: d.title_en ?? '',
        description_ru: d.description_ru ?? '', description_kk: d.description_kk ?? '', description_en: d.description_en ?? '',
        issuer: d.issuer ?? '', valid_until: d.valid_until ?? '',
        image_url: d.image_url ?? '', pdf_url: d.pdf_url ?? '', text_align: d.text_align ?? 'left',
      }))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title_ru.trim()) { setError('Введите заголовок'); return }
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch('/api/admin/science/accreditation', {
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
    return <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} /></div>
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 rounded-xl space-y-4" style={cardStyle}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-bold text-white">Аккредитация научной деятельности</h2>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <FieldLabel>Заголовок (рус) *</FieldLabel>
          <input className="steel-input w-full" value={form.title_ru} onChange={e => setForm(f => ({ ...f, title_ru: e.target.value }))} />
        </div>
        <div>
          <FieldLabel>Заголовок (қаз)</FieldLabel>
          <input className="steel-input w-full" value={form.title_kk} onChange={e => setForm(f => ({ ...f, title_kk: e.target.value }))} />
        </div>
        <div>
          <FieldLabel>Заголовок (eng)</FieldLabel>
          <input className="steel-input w-full" value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Кем выдано</FieldLabel>
          <input className="steel-input w-full" value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} placeholder="МОН РК" />
        </div>
        <div>
          <FieldLabel>Срок действия</FieldLabel>
          <input className="steel-input w-full" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} placeholder="до 09.02.2029" />
        </div>
      </div>
      <div>
        <FieldLabel>Описание (рус)</FieldLabel>
        <textarea className="steel-input w-full" rows={5} value={form.description_ru} onChange={e => setForm(f => ({ ...f, description_ru: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Описание (қаз)</FieldLabel>
          <textarea className="steel-input w-full" rows={4} value={form.description_kk} onChange={e => setForm(f => ({ ...f, description_kk: e.target.value }))} />
        </div>
        <div>
          <FieldLabel>Описание (eng)</FieldLabel>
          <textarea className="steel-input w-full" rows={4} value={form.description_en} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} />
        </div>
      </div>
      <AlignPicker value={form.text_align} onChange={v => setForm(f => ({ ...f, text_align: v }))} />
      <div className="grid grid-cols-2 gap-4">
        <ImagePicker url={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))} uploadUrl="/api/admin/science/upload" label="Превью свидетельства (фото)" />
        <FilePicker url={form.pdf_url} onChange={url => setForm(f => ({ ...f, pdf_url: url }))} uploadUrl="/api/admin/science/upload-pdf" accept="application/pdf" label="Свидетельство (PDF)" />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1" />
        {error && <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>}
        {saved && !error && <p className="text-xs" style={{ color: '#34D399' }}>Сохранено</p>}
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          Сохранить
        </button>
      </div>
    </form>
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
      {tab === 'contracts' && <ContractsTab />}
      {tab === 'achievements' && <AchievementsTab />}
      {tab === 'accreditation' && <AccreditationTab />}
    </div>
  )
}
