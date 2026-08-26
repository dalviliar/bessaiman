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

export function ZoomPreviewOverlay({ preview, maxHeight = '45vh', maxWidth = '30vw', scale = 1.15, objectFit = 'cover' }: { preview: ZoomPreview | null; maxHeight?: string; maxWidth?: string; scale?: number; objectFit?: 'cover' | 'contain' }) {
  if (!preview?.src || typeof document === 'undefined') return null
  // Portaled to <body> so a transformed ancestor (e.g. a card's hover:-translate-y-1)
  // can't turn this fixed-position element into one positioned relative to itself
  // instead of the viewport.
  // No backdrop/scrim layer — even a plain flat-color full-viewport div
  // repainting on every hover read as heavy. The image's own border and
  // shadow are enough to lift it off the page.
  return createPortal(
    <div
      className="hidden md:block fixed z-[90] pointer-events-none animate-[devPreviewIn_0.2s_ease-out]"
      style={{
        left: preview.rect.left + preview.rect.width / 2,
        top: Math.max(preview.rect.top, 16),
        width: preview.rect.width * scale,
        maxWidth,
        transform: 'translate(-50%, -14%)',
      }}
    >
      <img src={preview.src} alt="" draggable={false}
        className="w-full rounded-3xl"
        style={{
          border: '4px solid white',
          boxShadow: '0 30px 70px -14px rgba(15,23,42,0.5), 0 0 0 1px rgba(15,23,42,0.06)',
          maxHeight,
          objectFit,
          background: 'white',
        }} />
    </div>,
    document.body,
  )
}
