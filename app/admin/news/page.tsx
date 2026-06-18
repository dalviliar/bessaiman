'use client'

import { useEffect, useState } from 'react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { Loader2, Plus, Pencil, Trash2, Upload, X, Check } from 'lucide-react'
import type { NewsPost } from '@/types'

const TYPE_LABELS = { news: 'Новость', announcement: 'Уведомление' }
const TYPE_COLORS = { news: '#3B82F6', announcement: '#6366F1' }

type LangKey = 'ru' | 'kk' | 'en'

const LANGS: { key: LangKey; label: string; hint: string }[] = [
  { key: 'ru', label: 'RU', hint: 'Русский' },
  { key: 'kk', label: 'KK', hint: 'Қазақша' },
  { key: 'en', label: 'EN', hint: 'English' },
]

const EMPTY_FORM = {
  title_ru: '', title_kk: '', title_en: '',
  content_ru: '', content_kk: '', content_en: '',
  image_url: '', instagram_url: '',
  type: 'news' as 'news' | 'announcement',
  is_published: false,
}

type FormState = typeof EMPTY_FORM

export default function AdminNewsPage() {
  const { can } = useAdminAuth()
  const [posts, setPosts]           = useState<NewsPost[]>([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState<null | { mode: 'create' | 'edit'; post?: NewsPost }>(null)
  const [form, setForm]             = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [error, setError]           = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [activeLang, setActiveLang] = useState<LangKey>('ru')

  const load = () => {
    fetch('/api/admin/news').then(r => r.json()).then(data => {
      setPosts(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm(EMPTY_FORM); setError(''); setActiveLang('ru')
    setModal({ mode: 'create' })
  }
  const openEdit = (post: NewsPost) => {
    setForm({
      title_ru: post.title_ru, title_kk: post.title_kk ?? '', title_en: post.title_en ?? '',
      content_ru: post.content_ru ?? '', content_kk: post.content_kk ?? '', content_en: post.content_en ?? '',
      image_url: post.image_url ?? '', instagram_url: post.instagram_url ?? '',
      type: post.type, is_published: post.is_published,
    })
    setError(''); setActiveLang('ru')
    setModal({ mode: 'edit', post })
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleUpload = async (files: FileList | null) => {
    if (!files?.[0]) return
    setUploading(true)
    const fd = new FormData(); fd.append('file', files[0])
    const res = await fetch('/api/admin/products/upload', { method: 'POST', body: fd })
    const isJson = res.headers.get('content-type')?.includes('application/json')
    const data = isJson ? await res.json() : null
    if (res.ok) set('image_url', data.url)
    else setError(data?.error || 'Ошибка загрузки')
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.title_ru) { setError('Заполните заголовок на русском'); return }
    setSaving(true); setError('')
    const url = modal?.mode === 'edit' ? `/api/admin/news/${modal.post!.id}` : '/api/admin/news'
    const res = await fetch(url, {
      method: modal?.mode === 'edit' ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const isJson = res.headers.get('content-type')?.includes('application/json')
    const data = isJson ? await res.json() : null
    if (!res.ok) { setError(data?.error || `Ошибка ${res.status}`); setSaving(false); return }
    setModal(null); load()
    setSaving(false)
  }

  const handleDelete = async (post: NewsPost) => {
    if (!confirm(`Удалить «${post.title_ru}»?`)) return
    setDeletingId(post.id)
    await fetch(`/api/admin/news/${post.id}`, { method: 'DELETE' })
    setPosts(prev => prev.filter(p => p.id !== post.id))
    setDeletingId(null)
  }

  const togglePublish = async (post: NewsPost) => {
    const res = await fetch(`/api/admin/news/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...post, is_published: !post.is_published }),
    })
    if (res.ok) {
      const updated = await res.json()
      setPosts(prev => prev.map(p => p.id === post.id ? updated : p))
    }
  }

  // Check if a language has at least a title filled
  const langHasContent = (lang: LangKey) =>
    !!form[`title_${lang}`] || !!form[`content_${lang}`]

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white mb-0.5">Новости и уведомления</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {posts.filter(p => p.is_published).length} опубликовано · {posts.length} всего
          </p>
        </div>
        {can('content', 'create') && (
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
            <Plus size={14} /> Добавить
          </button>
        )}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Постов нет — создайте первый
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#0D1421', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Заголовок</th>
                <th className="px-5 py-3 text-center text-xs font-medium hidden sm:table-cell" style={{ color: 'rgba(255,255,255,0.4)' }}>Языки</th>
                <th className="px-5 py-3 text-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Тип</th>
                <th className="px-5 py-3 text-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Статус</th>
                <th className="px-5 py-3 text-right text-xs font-medium hidden sm:table-cell" style={{ color: 'rgba(255,255,255,0.4)' }}>Дата</th>
                <th className="px-5 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => (
                <tr key={post.id} style={{
                  background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {post.image_url && (
                        <img src={post.image_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0"
                          style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                      )}
                      <span className="text-white text-xs font-medium truncate max-w-[200px]">{post.title_ru}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {(['ru','kk','en'] as LangKey[]).map(lang => {
                        const hasIt = !!(lang === 'ru' ? post.title_ru : lang === 'kk' ? post.title_kk : post.title_en)
                        return (
                          <span key={lang}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              background: hasIt ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)',
                              color: hasIt ? '#34D399' : 'rgba(255,255,255,0.2)',
                            }}>
                            {lang.toUpperCase()}
                          </span>
                        )
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${TYPE_COLORS[post.type]}15`, color: TYPE_COLORS[post.type] }}>
                      {TYPE_LABELS[post.type]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {can('content', 'update') ? (
                      <button onClick={() => togglePublish(post)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors"
                        style={{
                          background: post.is_published ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.06)',
                          color: post.is_published ? '#34D399' : 'rgba(255,255,255,0.3)',
                        }}>
                        {post.is_published ? 'Опубликовано' : 'Черновик'}
                      </button>
                    ) : (
                      <span className="text-xs" style={{ color: post.is_published ? '#34D399' : 'rgba(255,255,255,0.3)' }}>
                        {post.is_published ? 'Опубликовано' : 'Черновик'}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-xs hidden sm:table-cell" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })
                      : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {can('content', 'update') && (
                        <button onClick={() => openEdit(post)} className="p-1.5 rounded"
                          style={{ color: '#60A5FA', background: 'rgba(59,130,246,0.1)' }}>
                          <Pencil size={12} />
                        </button>
                      )}
                      {can('content', 'delete') && (
                        <button onClick={() => handleDelete(post)} disabled={deletingId === post.id}
                          className="p-1.5 rounded" style={{ color: '#F87171', background: 'rgba(239,68,68,0.1)' }}>
                          {deletingId === post.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          onMouseDown={e => { if (e.target === e.currentTarget) setModal(null) }}>
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl"
            style={{ background: '#0D1421', border: '1px solid rgba(255,255,255,0.08)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-base font-black text-white">
                {modal.mode === 'create' ? 'Новый пост' : 'Редактировать пост'}
              </h2>
              <button onClick={() => setModal(null)} className="text-white/40 hover:text-white/70">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* Type + Published */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Тип</label>
                  <select className="steel-input w-full" value={form.type}
                    onChange={e => set('type', e.target.value as 'news' | 'announcement')}>
                    <option value="news">Новость</option>
                    <option value="announcement">Уведомление</option>
                  </select>
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      onClick={() => set('is_published', !form.is_published)}
                      className="w-10 h-5 rounded-full transition-colors flex-shrink-0 relative cursor-pointer"
                      style={{ background: form.is_published ? '#3B82F6' : 'rgba(255,255,255,0.1)' }}>
                      <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
                        style={{ left: form.is_published ? '22px' : '2px' }} />
                    </div>
                    <span className="text-sm font-medium"
                      style={{ color: form.is_published ? '#34D399' : 'rgba(255,255,255,0.4)' }}>
                      {form.is_published ? 'Опубликовано' : 'Черновик'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Language tabs */}
              <div>
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-xs font-medium mr-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Язык:</span>
                  {LANGS.map(lang => {
                    const active = activeLang === lang.key
                    const filled = langHasContent(lang.key)
                    return (
                      <button key={lang.key} type="button"
                        onClick={() => setActiveLang(lang.key)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: active ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                          color: active ? '#93C5FD' : 'rgba(255,255,255,0.4)',
                          border: `1px solid ${active ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.07)'}`,
                        }}>
                        {lang.label}
                        {filled && (
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: active ? '#60A5FA' : '#34D399' }} />
                        )}
                      </button>
                    )
                  })}
                  <span className="text-[10px] ml-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {LANGS.find(l => l.key === activeLang)?.hint}
                  </span>
                </div>

                {/* Title for active language */}
                <div className="mb-3">
                  <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Заголовок
                    {activeLang === 'ru' && <span style={{ color: '#f87171' }}> *</span>}
                  </label>
                  <input
                    className="steel-input w-full"
                    value={form[`title_${activeLang}`]}
                    onChange={e => set(`title_${activeLang}`, e.target.value)}
                    placeholder={activeLang === 'ru' ? 'Введите заголовок...' : activeLang === 'kk' ? 'Тақырыбын енгізіңіз...' : 'Enter title...'}
                  />
                </div>

                {/* Content for active language */}
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Текст</label>
                  <textarea
                    className="steel-input w-full resize-none"
                    rows={5}
                    value={form[`content_${activeLang}`]}
                    onChange={e => set(`content_${activeLang}`, e.target.value)}
                    placeholder={activeLang === 'ru' ? 'Введите текст поста...' : activeLang === 'kk' ? 'Пост мәтінін енгізіңіз...' : 'Enter post text...'}
                  />
                </div>

                {/* Fill indicator */}
                <div className="flex items-center gap-2 mt-2">
                  {LANGS.map(lang => (
                    <div key={lang.key} className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full"
                        style={{ background: langHasContent(lang.key) ? '#34D399' : 'rgba(255,255,255,0.15)' }} />
                      <span className="text-[10px]"
                        style={{ color: langHasContent(lang.key) ? 'rgba(52,211,153,0.7)' : 'rgba(255,255,255,0.2)' }}>
                        {lang.label}
                      </span>
                    </div>
                  ))}
                  <span className="text-[10px] ml-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    — заполненные языки
                  </span>
                </div>
              </div>

              {/* Photo */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Фото</label>
                {form.image_url ? (
                  <div className="relative inline-block">
                    <img src={form.image_url} alt="" className="h-28 w-auto rounded-lg object-cover" />
                    <button type="button" onClick={() => set('image_url', '')}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(239,68,68,0.8)', color: 'white' }}>
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer w-fit text-xs font-medium"
                    style={{ border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)' }}>
                    {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    Загрузить фото
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => handleUpload(e.target.files)} disabled={uploading} />
                  </label>
                )}
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Ссылка на Instagram{' '}
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>(необязательно)</span>
                </label>
                <input className="steel-input w-full" value={form.instagram_url}
                  onChange={e => set('instagram_url', e.target.value)}
                  placeholder="https://www.instagram.com/p/..." />
                <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  На публичной странице появится кнопка «Смотреть в Instagram»
                </p>
              </div>

              {error && (
                <p className="text-xs px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
                  {saving ? <><Loader2 size={13} className="animate-spin" />Сохраняем...</> : <><Check size={13} />Сохранить</>}
                </button>
                <button onClick={() => setModal(null)} className="btn-secondary px-5 text-sm">Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
