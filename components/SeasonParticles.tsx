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
  glyph?: string
}

const LEAF_GLYPHS = ['🍁', '🍂', '🍃']

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
    fontSize: 15, lineHeight: 1,
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
    glyph: kind === 'leaf' ? LEAF_GLYPHS[Math.floor(Math.random() * LEAF_GLYPHS.length)] : undefined,
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
            ...PARTICLE_STYLES[kind],
          }}
        >
          {kind === 'snowflake' ? '❄' : kind === 'leaf' ? p.glyph : null}
        </div>
      ))}
    </div>
  )
}
