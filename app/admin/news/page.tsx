'use client'

import { useEffect, useState } from 'react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react'
import type { NewsPost } from '@/types'

const TYPE_LABELS = { news: 'РќРѕРІРѕСЃС‚СЊ', announcement: 'РЈРІРµРґРѕРјР»РµРЅРёРµ' }
const TYPE_COLORS = { news: '#3B82F6', announcement: '#F59E0B' }

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
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | { mode: 'create' | 'edit'; post?: NewsPost }>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = () => {
    fetch('/api/admin/news').then(r => r.json()).then(data => {
      setPosts(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal({ mode: 'create' }) }
  const openEdit = (post: NewsPost) => {
    setForm({
      title_ru: post.title_ru, title_kk: post.title_kk ?? '', title_en: post.title_en ?? '',
      content_ru: post.content_ru ?? '', content_kk: post.content_kk ?? '', content_en: post.content_en ?? '',
      image_url: post.image_url ?? '', instagram_url: post.instagram_url ?? '',
      type: post.type, is_published: post.is_published,
    })
    setError('')
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
    else setError(data?.error || 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё')
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.title_ru) { setError('Р—Р°РїРѕР»РЅРёС‚Рµ Р·Р°РіРѕР»РѕРІРѕРє'); return }
    setSaving(true); setError('')
    const url = modal?.mode === 'edit' ? `/api/admin/news/${modal.post!.id}` : '/api/admin/news'
    const res = await fetch(url, {
      method: modal?.mode === 'edit' ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const isJson = res.headers.get('content-type')?.includes('application/json')
    const data = isJson ? await res.json() : null
    if (!res.ok) { setError(data?.error || `РћС€РёР±РєР° ${res.status}`); setSaving(false); return }
    setModal(null); load()
    setSaving(false)
  }

  const handleDelete = async (post: NewsPost) => {
    if (!confirm(`РЈРґР°Р»РёС‚СЊ В«${post.title_ru}В»?`)) return
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

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white mb-0.5">РќРѕРІРѕСЃС‚Рё Рё СѓРІРµРґРѕРјР»РµРЅРёСЏ</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {posts.filter(p => p.is_published).length} РѕРїСѓР±Р»РёРєРѕРІР°РЅРѕ В· {posts.length} РІСЃРµРіРѕ
          </p>
        </div>
        {can('content', 'create') && (
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
            <Plus size={14} /> Р”РѕР±Р°РІРёС‚СЊ
          </button>
        )}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} /></div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>РџРѕСЃС‚РѕРІ РЅРµС‚ вЂ” СЃРѕР·РґР°Р№С‚Рµ РїРµСЂРІС‹Р№</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#0D1421', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Р—Р°РіРѕР»РѕРІРѕРє</th>
                <th className="px-5 py-3 text-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>РўРёРї</th>
                <th className="px-5 py-3 text-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>РЎС‚Р°С‚СѓСЃ</th>
                <th className="px-5 py-3 text-right text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Р”Р°С‚Р°</th>
                <th className="px-5 py-3 w-28" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => (
                <tr key={post.id} style={{ background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {post.image_url && (
                        <img src={post.image_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                      )}
                      <span className="text-white text-xs font-medium truncate max-w-xs">{post.title_ru}</span>
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
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: post.is_published ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.06)',
                          color: post.is_published ? '#34D399' : 'rgba(255,255,255,0.3)',
                        }}>
                        {post.is_published ? 'РћРїСѓР±Р»РёРєРѕРІР°РЅРѕ' : 'Р§РµСЂРЅРѕРІРёРє'}
                      </button>
                    ) : (
                      <span className="text-xs" style={{ color: post.is_published ? '#34D399' : 'rgba(255,255,255,0.3)' }}>
                        {post.is_published ? 'РћРїСѓР±Р»РёРєРѕРІР°РЅРѕ' : 'Р§РµСЂРЅРѕРІРёРє'}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })
                      : 'вЂ”'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {can('content', 'update') && (
                        <button onClick={() => openEdit(post)} className="p-1.5 rounded" style={{ color: '#60A5FA', background: 'rgba(59,130,246,0.1)' }}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: '#0D1421', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-black text-white">{modal.mode === 'create' ? 'РќРѕРІС‹Р№ РїРѕСЃС‚' : 'Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ'}</h2>
              <button onClick={() => setModal(null)} className="text-white/40 hover:text-white/70"><X size={18} /></button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>РўРёРї</label>
                  <select className="steel-input w-full" value={form.type} onChange={e => set('type', e.target.value as 'news' | 'announcement')}>
                    <option value="news">РќРѕРІРѕСЃС‚СЊ</option>
                    <option value="announcement">РЈРІРµРґРѕРјР»РµРЅРёРµ</option>
                  </select>
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_published}
                      onChange={e => set('is_published', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-500" />
                    <span className="text-sm font-medium" style={{ color: form.is_published ? '#34D399' : 'rgba(255,255,255,0.5)' }}>
                      {form.is_published ? 'РћРїСѓР±Р»РёРєРѕРІР°РЅРѕ' : 'Р§РµСЂРЅРѕРІРёРє'}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Р—Р°РіРѕР»РѕРІРѕРє (Р СѓСЃ) *</label>
                <input className="steel-input w-full" value={form.title_ru} onChange={e => set('title_ru', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Р—Р°РіРѕР»РѕРІРѕРє (РљР°Р·)</label>
                  <input className="steel-input w-full" value={form.title_kk} onChange={e => set('title_kk', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Р—Р°РіРѕР»РѕРІРѕРє (Eng)</label>
                  <input className="steel-input w-full" value={form.title_en} onChange={e => set('title_en', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>РўРµРєСЃС‚ (Р СѓСЃ)</label>
                <textarea className="steel-input w-full resize-none" rows={4} value={form.content_ru} onChange={e => set('content_ru', e.target.value)} />
              </div>

              {/* Р¤РѕС‚Рѕ */}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Р¤РѕС‚Рѕ</label>
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
                    Р—Р°РіСЂСѓР·РёС‚СЊ С„РѕС‚Рѕ
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files)} disabled={uploading} />
                  </label>
                )}
              </div>

              {/* Instagram URL */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  РЎСЃС‹Р»РєР° РЅР° РїРѕСЃС‚ РІ Instagram <span style={{ color: 'rgba(255,255,255,0.3)' }}>(РЅРµРѕР±СЏР·Р°С‚РµР»СЊРЅРѕ)</span>
                </label>
                <input className="steel-input w-full" value={form.instagram_url}
                  onChange={e => set('instagram_url', e.target.value)}
                  placeholder="https://www.instagram.com/p/..." />
                <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  РќР° РїСѓР±Р»РёС‡РЅРѕР№ СЃС‚СЂР°РЅРёС†Рµ РїРѕРєР°Р¶РµС‚СЃСЏ РєРЅРѕРїРєР° В«РЎРјРѕС‚СЂРµС‚СЊ РІ InstagramВ»
                </p>
              </div>

              {error && (
                <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
                  {saving ? <><Loader2 size={13} className="animate-spin" />РЎРѕС…СЂР°РЅСЏРµРј...</> : 'РЎРѕС…СЂР°РЅРёС‚СЊ'}
                </button>
                <button onClick={() => setModal(null)} className="btn-secondary px-4 text-sm">РћС‚РјРµРЅР°</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
