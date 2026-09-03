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

// Plain (non-maple) leaf: a single-lobe blade tapering to a point at the
// top and a short stem at the bottom, instead of a rounded-corner square.
const LEAF_SIZE = 17
const LEAF_PATH =
  'M12,2 C17,4 20,9 18,14 C16.5,18 13,21 12,22.5 C11,21 7.5,18 6,14 C4,9 7,4 12,2 Z'
const LEAF_VEINS =
  'M12,4.5 L12,20.5 M12,8 L16,11 M12,8 L8,11 M12,12.5 L15.5,15 M12,12.5 L8.5,15 M12,16.5 L14.5,18.5 M12,16.5 L9.5,18.5'
const LEAF_STEM = 'M12,22.5 C12,23.5 12.3,24.3 13,25'

// Drawn snowflake — six branches with small V-ticks, instead of the ❄ text
// glyph (which rendered inconsistently across fonts/platforms).
const SNOWFLAKE_SIZE = 17
const SNOWFLAKE_LINES =
  'M12,1 L12,23 M2.5,6.5 L21.5,17.5 M2.5,17.5 L21.5,6.5' +
  ' M12,6 L9.3,4.2 M12,6 L14.7,4.2' +
  ' M12,18 L9.3,19.8 M12,18 L14.7,19.8' +
  ' M6.75,9 L4.3,8.4 M6.75,9 L4.9,11.2' +
  ' M17.25,15 L19.7,15.6 M17.25,15 L19.1,12.8' +
  ' M6.75,15 L4.3,15.6 M6.75,15 L4.9,12.8' +
  ' M17.25,9 L19.7,8.4 M17.25,9 L19.1,11.2'

// Tulip — a rounded three-petal cup on a stem with one small leaf, for
// Наурыз (the flower most associated with the holiday in Kazakhstan).
const TULIP_SIZE = 19
const TULIP_CUP =
  'M12,3 C8.5,3 6.5,5.8 6.5,8.5 C6.5,10.2 7.5,11.3 9,12 C7.8,13.2 7.3,15 8.5,16.3 C9.6,17.5 11,17 12,15.6 C13,17 14.4,17.5 15.5,16.3 C16.7,15 16.2,13.2 15,12 C16.5,11.3 17.5,10.2 17.5,8.5 C17.5,5.8 15.5,3 12,3 Z'
const TULIP_STEM = 'M12,15.8 L12,25'
const TULIP_LEAF = 'M12,21 C9.8,20.2 7.6,20.8 6.2,23'

// Spark — a four-point twinkle, for science and New Year's shine.
const SPARK_SIZE = 15
const SPARK_PATH =
  'M12,1 C12.6,7.2 13.4,10.6 23,12 C13.4,13.4 12.6,16.8 12,23 C11.4,16.8 10.6,13.4 1,12 C10.6,10.6 11.4,7.2 12,1 Z'

const COUNTS: Record<ParticleKind, number> = {
  snowflake: 18,
  petal: 16,
  bubble: 16,
  leaf: 16,
  confetti: 22,
  tulip: 12,
  scienceSpark: 20,
  newYearSpark: 20,
}

const CONFETTI_COLORS = ['#1565c0', '#facc15', '#f97316', '#38bdf8', '#fb7185']

const PARTICLE_STYLES: Partial<Record<ParticleKind, CSSProperties>> = {
  petal: {
    width: 15, height: 10, background: '#f9a8c9', borderRadius: '60% 60% 60% 0',
  },
  bubble: {
    width: 12, height: 12, borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(6,182,212,0.25))',
    border: '1px solid rgba(6,182,212,0.55)',
  },
  confetti: {
    width: 10, height: 15, borderRadius: 1,
  },
}

// Kinds rendered as SVG (drawn shapes) rather than a plain CSS box —
// sizing for these lives in SVG_SIZE, not PARTICLE_STYLES.
const SVG_SIZE: Partial<Record<ParticleKind, number>> = {
  snowflake: SNOWFLAKE_SIZE,
  leaf: LEAF_SIZE,
  tulip: TULIP_SIZE,
  scienceSpark: SPARK_SIZE,
  newYearSpark: SPARK_SIZE,
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

  const svgSize = kind === 'leaf' ? undefined : SVG_SIZE[kind]

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
          <linearGradient id="leafGrad" x1="12" y1="2" x2="12" y2="22.5" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fcd34d" />
            <stop offset="1" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="tulipGrad" x1="6.5" y1="3" x2="17.5" y2="17.5" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fb7185" />
            <stop offset="1" stopColor="#be123c" />
          </linearGradient>
          <linearGradient id="scienceSparkGrad" x1="1" y1="1" x2="23" y2="23" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#c7d2fe" />
            <stop offset="1" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="newYearSparkGrad" x1="1" y1="1" x2="23" y2="23" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fecaca" />
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
            ...(kind === 'leaf'
              ? { width: p.maple ? 36 : LEAF_SIZE, height: p.maple ? 36 : LEAF_SIZE }
              : svgSize
              ? { width: svgSize, height: svgSize }
              : PARTICLE_STYLES[kind]),
          }}
        >
          {kind === 'leaf' && (
            p.maple ? (
              <svg viewBox="0 0 24 24" width={36} height={36}>
                <path d={MAPLE_PATH} fill="url(#mapleGrad)" />
                <path d={MAPLE_VEINS} stroke="rgba(0,0,0,0.28)" strokeWidth={0.6} />
                <path d={MAPLE_STEM} stroke="#7c2d12" strokeWidth={1} fill="none" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width={LEAF_SIZE} height={LEAF_SIZE}>
                <path d={LEAF_PATH} fill="url(#leafGrad)" />
                <path d={LEAF_VEINS} stroke="rgba(0,0,0,0.25)" strokeWidth={0.6} fill="none" />
                <path d={LEAF_STEM} stroke="#7c4a1e" strokeWidth={1} fill="none" strokeLinecap="round" />
              </svg>
            )
          )}
          {kind === 'snowflake' && (
            <svg viewBox="0 0 24 24" width={SNOWFLAKE_SIZE} height={SNOWFLAKE_SIZE}
              style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.85))' }}>
              <path d={SNOWFLAKE_LINES} stroke="#fff" strokeWidth={1.4} strokeLinecap="round" fill="none" />
            </svg>
          )}
          {kind === 'tulip' && (
            <svg viewBox="0 0 24 25" width={TULIP_SIZE} height={TULIP_SIZE}>
              <path d={TULIP_STEM} stroke="#15803d" strokeWidth={1.3} fill="none" strokeLinecap="round" />
              <path d={TULIP_LEAF} stroke="#15803d" strokeWidth={1.3} fill="none" strokeLinecap="round" />
              <path d={TULIP_CUP} fill="url(#tulipGrad)" />
            </svg>
          )}
          {kind === 'scienceSpark' && (
            <svg viewBox="0 0 24 24" width={SPARK_SIZE} height={SPARK_SIZE}>
              <path d={SPARK_PATH} fill="url(#scienceSparkGrad)" />
            </svg>
          )}
          {kind === 'newYearSpark' && (
            <svg viewBox="0 0 24 24" width={SPARK_SIZE} height={SPARK_SIZE}>
              <path d={SPARK_PATH} fill="url(#newYearSparkGrad)" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}
