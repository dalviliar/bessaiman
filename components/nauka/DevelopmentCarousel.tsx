'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X, Calendar, FlaskConical, Image as ImageIcon } from 'lucide-react'
import { useZoomPreview, ZoomPreviewOverlay } from '@/components/HoverZoomPreview'

export interface DevItem {
  id: string
  title: string
  description: string
  period: string | null
  tags: string | null
  images: string[]
}

function TagRow({ tags, size = 'sm' }: { tags: string | null; size?: 'sm' | 'md' }) {
  if (!tags) return null
  const cls = size === 'sm' ? 'text-[12px] px-2 py-0.5' : 'text-[13px] px-2.5 py-1'
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
        <span key={t} className={`font-semibold rounded-full ${cls}`} style={{ background: '#EFF6FF', color: '#1565C0' }}>{t}</span>
      ))}
    </div>
  )
}

export function DevelopmentCarousel({ items }: { items: DevItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ down: false, startX: 0, scrollStart: 0, moved: false })
  const [active, setActive] = useState<DevItem | null>(null)
  const [shot, setShot] = useState(0)
  const { preview, show: showPreview, hide: hidePreview } = useZoomPreview()

  useEffect(() => {
    if (!active) return
    setShot(0)
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null) }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [active])

  if (items.length === 0) return null

  const onMouseDown = (e: React.MouseEvent) => {
    const track = trackRef.current
    if (!track) return
    drag.current = { down: true, startX: e.pageX, scrollStart: track.scrollLeft, moved: false }
    track.style.cursor = 'grabbing'
    hidePreview()
  }
  const onMouseMove = (e: React.MouseEvent) => {
    const track = trackRef.current
    if (!track || !drag.current.down) return
    const dx = e.pageX - drag.current.startX
    if (Math.abs(dx) > 4) drag.current.moved = true
    track.scrollLeft = drag.current.scrollStart - dx
  }
  const stopDrag = () => {
    drag.current.down = false
    if (trackRef.current) trackRef.current.style.cursor = 'grab'
  }
  const scrollByCard = (dir: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('[data-card]')
    const width = card ? card.offsetWidth + 16 : 300
    track.scrollBy({ left: width * dir, behavior: 'smooth' })
  }
  const openCard = (item: DevItem) => {
    if (drag.current.moved) return
    setActive(item)
  }

  return (
    <div className="relative">
      {items.length > 3 && (
        <>
          <button onClick={() => scrollByCard(-1)} aria-label="Назад"
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full items-center justify-center transition-transform hover:scale-110"
            style={{ background: 'white', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <ChevronLeft size={16} style={{ color: '#1565C0' }} />
          </button>
          <button onClick={() => scrollByCard(1)} aria-label="Вперёд"
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full items-center justify-center transition-transform hover:scale-110"
            style={{ background: 'white', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <ChevronRight size={16} style={{ color: '#1565C0' }} />
          </button>
        </>
      )}

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto no-scrollbar select-none"
        style={{ scrollSnapType: 'x mandatory', cursor: 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        {items.map(item => (
          <div key={item.id} data-card
            onClick={() => openCard(item)}
            onMouseEnter={e => { if (!drag.current.down && item.images[0]) showPreview(item.images[0], e.currentTarget, item.id) }}
            onMouseLeave={() => hidePreview(item.id)}
            className="group flex-none w-[85%] sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', scrollSnapAlign: 'start' }}
          >
            <div className="relative aspect-[4/3] overflow-hidden" style={{ background: '#F1F5F9' }}>
              {item.images[0] ? (
                <img src={item.images[0]} alt={item.title} draggable={false}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FlaskConical size={28} style={{ color: '#CBD5E1' }} />
                </div>
              )}
              {item.images.length > 1 && (
                <span className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-semibold"
                  style={{ background: 'rgba(15,23,42,0.72)', color: 'white' }}>
                  <ImageIcon size={12} />{item.images.length}
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-base mb-2 leading-snug" style={{ color: '#0F172A' }}>{item.title}</h3>
              {item.period && (
                <div className="flex items-center gap-1.5 text-sm mb-1.5" style={{ color: '#64748B' }}>
                  <Calendar size={12} />{item.period}
                </div>
              )}
              <TagRow tags={item.tags} />
            </div>
          </div>
        ))}
      </div>

      <ZoomPreviewOverlay preview={preview} scale={1.25} maxHeight="45vh" />

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.6)' }} onClick={() => setActive(null)}>
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl"
            style={{ background: 'white' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setActive(null)} aria-label="Закрыть"
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-10 transition-colors hover:opacity-80"
              style={{ background: 'rgba(15,23,42,0.06)' }}>
              <X size={16} style={{ color: '#0F172A' }} />
            </button>
            {active.images.length > 0 && (
              <div>
                <div className="relative w-full aspect-[16/9]" style={{ background: '#F1F5F9' }}>
                  <img src={active.images[Math.min(shot, active.images.length - 1)]} alt={active.title}
                    className="w-full h-full object-contain" />
                  {active.images.length > 1 && (
                    <>
                      <button onClick={() => setShot(s => (s - 1 + active.images.length) % active.images.length)} aria-label="Предыдущее фото"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                        style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
                        <ChevronLeft size={17} style={{ color: '#0F172A' }} />
                      </button>
                      <button onClick={() => setShot(s => (s + 1) % active.images.length)} aria-label="Следующее фото"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                        style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
                        <ChevronRight size={17} style={{ color: '#0F172A' }} />
                      </button>
                    </>
                  )}
                </div>
                {active.images.length > 1 && (
                  <div className="flex gap-2 px-6 pt-4 overflow-x-auto no-scrollbar">
                    {active.images.map((src, i) => (
                      <button key={src + i} onClick={() => setShot(i)}
                        className="flex-none w-20 h-16 rounded-lg overflow-hidden transition-opacity"
                        style={{
                          border: i === shot ? '2px solid #1565C0' : '1px solid #E2E8F0',
                          opacity: i === shot ? 1 : 0.7,
                          background: '#F8FAFC',
                        }}>
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2" style={{ color: '#0F172A' }}>{active.title}</h3>
              {active.period && (
                <div className="flex items-center gap-1.5 text-base mb-3" style={{ color: '#64748B' }}>
                  <Calendar size={14} />{active.period}
                </div>
              )}
              <div className="mb-4"><TagRow tags={active.tags} size="md" /></div>
              {active.description ? (
                <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: '#334155' }}>{active.description}</p>
              ) : (
                <p className="text-base" style={{ color: '#94A3B8' }}>Подробное описание пока не добавлено.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
