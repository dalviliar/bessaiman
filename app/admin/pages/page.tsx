'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, Check } from 'lucide-react'

interface PageImage { page: string; image_url: string }

const PAGES: { key: string; title: string; hint: string }[] = [
  { key: 'catalog', title: 'Продукция', hint: 'Фон шапки страницы каталога' },
  { key: 'nauka',   title: 'Наука',     hint: 'Фон шапки страницы «Наука и инновации»' },
  { key: 'about',   title: 'О нас',     hint: 'Фон шапки страницы «О компании»' },
]

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
}

function PageRow({ page, title, hint, url, onSaved }: {
  page: string
  title: string
  hint: string
  url: string | null
  onSaved: (url: string) => void
}) {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true); setError(''); setDone(false)
    try {
      const fd = new FormData()
      fd.append('file', files[0])
      const up = await fetch('/api/admin/page-images/upload', { method: 'POST', body: fd })
      const upData = await up.json()
      if (!up.ok) throw new Error(upData.error)

      const res = await fetch('/api/admin/page-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, image_url: upData.url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      onSaved(upData.url)
      setDone(true)
      setTimeout(() => setDone(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="rounded-xl overflow-hidden" style={cardStyle}>
      <div className="aspect-[21/9] w-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {url && <img src={url} alt={title} className="w-full h-full object-cover" />}
      </div>
      <div className="flex items-center gap-4 p-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">{title}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{hint}</p>
          {error && <p className="text-xs mt-1" style={{ color: '#F87171' }}>{error}</p>}
        </div>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium shrink-0 disabled:opacity-50"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
          {busy ? <Loader2 size={13} className="animate-spin" /> : done ? <Check size={13} /> : <Upload size={13} />}
          {busy ? 'Загрузка...' : done ? 'Сохранено' : 'Заменить фото'}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => upload(e.target.files)} />
    </div>
  )
}

export default function AdminPagesPage() {
  const [images, setImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/page-images')
      .then(async r => {
        // без права раздела не должно быть даже видно — уводим на дашборд
        if (r.status === 403) { router.replace('/admin'); return null }
        return r.json()
      })
      .then((rows: PageImage[] | null) => {
        if (!Array.isArray(rows)) return
        const map: Record<string, string> = {}
        for (const r of rows) map[r.page] = r.image_url
        setImages(map)
      })
      .finally(() => setLoading(false))
  }, [router])

  // ничего не показываем, пока сервер не подтвердил право — иначе заголовок
  // мелькнёт даже у того, кто просто угадал адрес
  if (loading) return null

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Изображения страниц</h1>
      <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Фоновые фотографии в шапках публичных страниц. Лучше всего подходят широкие снимки
        от 1600 px по ширине — изображение обрезается по центру.
      </p>

      <div className="grid gap-5 lg:grid-cols-2">
          {PAGES.map(p => (
            <PageRow key={p.key} page={p.key} title={p.title} hint={p.hint}
              url={images[p.key] ?? null}
              onSaved={url => setImages(prev => ({ ...prev, [p.key]: url }))} />
        ))}
      </div>
    </div>
  )
}
