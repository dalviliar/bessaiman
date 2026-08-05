'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export interface ZoomPreview { src: string; rect: DOMRect }

// Shared hover-zoom behavior: shows a larger copy of the image fixed to the
// viewport (not clipped by any scrolling/overflow-hidden ancestor), so the
// zoomed photo floats above the rest of the page instead of just scaling
// in place inside its own card.
export function useZoomPreview() {
  const [preview, setPreview] = useState<ZoomPreview | null>(null)
  const idRef = useRef<string | null>(null)

  const show = (src: string, el: HTMLElement, id?: string) => {
    idRef.current = id ?? src
    setPreview({ src, rect: el.getBoundingClientRect() })
  }
  const hide = (id?: string) => {
    if (id !== undefined && idRef.current !== id) return
    setPreview(null)
  }

  return { preview, show, hide }
}

export function ZoomPreviewOverlay({ preview, maxHeight = '65vh', scale = 1.7 }: { preview: ZoomPreview | null; maxHeight?: string; scale?: number }) {
  if (!preview?.src || typeof document === 'undefined') return null
  // Portaled to <body> so a transformed ancestor (e.g. a card's hover:-translate-y-1)
  // can't turn this fixed-position element into one positioned relative to itself
  // instead of the viewport.
  return createPortal(
    <div
      className="hidden md:block fixed z-[90] pointer-events-none animate-[devPreviewIn_0.18s_ease-out]"
      style={{
        left: preview.rect.left + preview.rect.width / 2,
        top: Math.max(preview.rect.top, 16),
        width: preview.rect.width * scale,
        transform: 'translate(-50%, -14%)',
      }}
    >
      <img src={preview.src} alt="" draggable={false}
        className="w-full rounded-2xl"
        style={{
          border: '5px solid white',
          boxShadow: '0 25px 60px -10px rgba(15,23,42,0.45), 0 0 0 1px rgba(0,0,0,0.05)',
          maxHeight,
          objectFit: 'cover',
        }} />
    </div>,
    document.body,
  )
}
