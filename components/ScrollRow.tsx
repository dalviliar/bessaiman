'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Horizontal row of tabs/chips that can be wider than the screen (the kk
 * labels on /nauka are long). The scrollbar stays hidden, so arrows appear on
 * whichever side has more tabs, the mouse wheel scrolls sideways, and the
 * active item (marked data-active="true") is scrolled into view.
 */
export default function ScrollRow({ children, fadeColor = '240,244,248', activeKey }: {
  children: ReactNode
  /** rgb of the background behind the row, for the edge fade */
  fadeColor?: string
  /** changes when the active tab changes, to scroll it into view */
  activeKey?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    // vertical wheel -> sideways scroll, only while the row can actually move
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || el.scrollWidth <= el.clientWidth) return
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && e.deltaY > 0
      if (atStart || atEnd) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => { ro.disconnect(); el.removeEventListener('wheel', onWheel) }
  }, [update])

  useEffect(() => {
    const active = ref.current?.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }, [activeKey])

  const scrollBy = (dir: -1 | 1) => {
    const el = ref.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' })
  }

  const arrow = (dir: -1 | 1, show: boolean) => (
    <div className={`absolute top-0 bottom-0 ${dir < 0 ? 'left-0' : 'right-0'} flex items-center pointer-events-none transition-opacity`}
      style={{
        opacity: show ? 1 : 0,
        width: 56,
        justifyContent: dir < 0 ? 'flex-start' : 'flex-end',
        background: `linear-gradient(to ${dir < 0 ? 'right' : 'left'}, rgba(${fadeColor},1) 35%, rgba(${fadeColor},0))`,
      }}>
      <button type="button" onClick={() => scrollBy(dir)} tabIndex={show ? 0 : -1}
        aria-label={dir < 0 ? 'Назад' : 'Вперёд'}
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ pointerEvents: show ? 'auto' : 'none', background: 'white', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', color: '#1565C0' }}>
        {dir < 0 ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </div>
  )

  return (
    <div className="relative">
      <div ref={ref} onScroll={update} className="flex gap-2 overflow-x-auto no-scrollbar">
        {children}
      </div>
      {arrow(-1, canLeft)}
      {arrow(1, canRight)}
    </div>
  )
}
