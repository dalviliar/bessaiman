'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import type { ParticleKind } from '@/lib/season'

interface ParticleSpec {
  id: number
  left: number
  duration: number
  delay: number
  dx: number
  rot: number
  maple?: boolean
}

const MAPLE_PATH =
  'M12,1 L14,3 L15.5,5 L18,4.5 L20.5,7 L19,9.5 L17.5,11 L19,12.5 L18.5,15 L14,16.5 L12,17 L10,16.5 L5.5,15 L5,12.5 L6.5,11 L5,9.5 L3.5,7 L6,4.5 L8.5,5 L10,3 Z'
const MAPLE_VEINS = 'M12,15 L12,2 M12,15 L20,7.5 M12,15 L4,7.5 M12,15 L18,14.5 M12,15 L6,14.5'
const MAPLE_STEM = 'M12,17C12,19 13.5,20 15.5,21.5'

const COUNTS: Record<ParticleKind, number> = {
  snowflake: 18,
  petal: 16,
  bubble: 16,
  leaf: 16,
  confetti: 22,
}

const CONFETTI_COLORS = ['#1565c0', '#facc15', '#f97316', '#38bdf8', '#fb7185']

const PARTICLE_STYLES: Record<ParticleKind, CSSProperties> = {
  snowflake: {
    fontSize: 12, lineHeight: 1, color: '#fff',
    textShadow: '0 0 4px rgba(255,255,255,0.85), 0 0 1px rgba(255,255,255,0.9)',
  },
  petal: {
    width: 12, height: 8, background: '#f9a8c9', borderRadius: '60% 60% 60% 0',
  },
  bubble: {
    width: 9, height: 9, borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(6,182,212,0.25))',
    border: '1px solid rgba(6,182,212,0.55)',
  },
  leaf: {
    width: 13, height: 13, background: '#ea9a3e', borderRadius: '0 60% 0 60%',
    boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.15)',
  },
  confetti: {
    width: 8, height: 12, borderRadius: 1,
  },
}

function generate(count: number, kind: ParticleKind): ParticleSpec[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    duration: 3.5 + Math.random() * 3.5,
    delay: Math.random() * 6,
    dx: Math.round(Math.random() * 40 - 20),
    rot: Math.round(Math.random() * 200 - 100),
    maple: kind === 'leaf' ? Math.random() < 0.5 : undefined,
  }))
}

/**
 * Decorative particle field spanning the full navbar height. Generated
 * client-side only (empty on the server render) so Math.random() never
 * causes a hydration mismatch.
 */
export default function SeasonParticles({ kind, rise }: { kind: ParticleKind; rise?: boolean }) {
  const [particles, setParticles] = useState<ParticleSpec[] | null>(null)

  useEffect(() => {
    setParticles(generate(COUNTS[kind], kind))
  }, [kind])

  if (!particles) return null

  return (
    <div
      aria-hidden
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}
    >
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="mapleGrad" x1="12" y1="1" x2="15.5" y2="21.5" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fbbf24" />
            <stop offset="0.5" stopColor="#f97316" />
            <stop offset="1" stopColor="#b91c1c" />
          </linearGradient>
        </defs>
      </svg>
      {particles.map(p => (
        <div
          key={p.id}
          className={rise ? 'season-particle season-particle-rise' : 'season-particle season-particle-drift'}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            [rise ? 'bottom' : 'top']: -6,
            animationDuration: `${p.duration}s`,
            animationDelay: `-${p.delay}s`,
            ['--dx' as string]: `${p.dx}px`,
            ['--rot' as string]: `${p.rot}deg`,
            willChange: 'transform, opacity',
            background: kind === 'confetti' ? CONFETTI_COLORS[p.id % CONFETTI_COLORS.length] : undefined,
            ...(p.maple ? { width: 15, height: 15 } : PARTICLE_STYLES[kind]),
          }}
        >
          {kind === 'snowflake' ? '❄' : null}
          {p.maple && (
            <svg viewBox="0 0 24 24" width="15" height="15">
              <path d={MAPLE_PATH} fill="url(#mapleGrad)" />
              <path d={MAPLE_VEINS} stroke="rgba(0,0,0,0.28)" strokeWidth={0.6} />
              <path d={MAPLE_STEM} stroke="#7c2d12" strokeWidth={1} fill="none" strokeLinecap="round" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}
