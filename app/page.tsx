'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// ── Animated molecular particle network (canvas) ─────────────────────────────
function MolecularCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COUNT = typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 70
    const LINK  = 160

    const pts = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.6 + 0.8,
    }))

    let raf = 0
    const draw = () => {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      for (const p of pts) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(14,165,233,0.55)'
        ctx.fill()
      }

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < LINK) {
            const a = (1 - d / LINK) * 0.22
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(14,165,233,${a})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.45 }}
    />
  )
}

// ── Sonar / instrument rings ─────────────────────────────────────────────────
function SonarRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {[320, 560, 820, 1100].map((size, i) => (
        <div
          key={size}
          className="absolute rounded-full"
          style={{
            width:  size, height: size,
            border: `1px solid rgba(14,165,233,${0.07 - i * 0.012})`,
            animation: `ring-breathe ${5 + i * 1.8}s ease-in-out ${i * 0.9}s infinite`,
          }}
        />
      ))}
      {/* Centre dot — precision point */}
      <div
        className="absolute w-1.5 h-1.5 rounded-full"
        style={{
          background: '#0EA5E9',
          boxShadow: '0 0 0 6px rgba(14,165,233,0.08), 0 0 20px rgba(14,165,233,0.3)',
        }}
      />
    </div>
  )
}

// ── Ruler ticks ───────────────────────────────────────────────────────────────
function HRuler() {
  return (
    <div className="absolute top-0 left-0 right-0 flex items-end overflow-hidden pointer-events-none" style={{ height: 22 }}>
      {Array.from({ length: 120 }).map((_, i) => (
        <div key={i} style={{
          flex: '0 0 calc(100%/120)', alignSelf: 'flex-end', marginRight: 1,
          height: i % 10 === 0 ? 16 : i % 5 === 0 ? 10 : 4,
          background: `rgba(14,165,233,${i % 10 === 0 ? 0.45 : i % 5 === 0 ? 0.25 : 0.1})`,
        }} />
      ))}
    </div>
  )
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const raf = useRef(0)
  useEffect(() => {
    const START = performance.now(), DUR = 2200
    const tick = (now: number) => {
      const p = Math.min((now - START) / DUR, 1)
      setVal(Math.round((1 - (1 - p) ** 3) * to))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    const t = setTimeout(() => { raf.current = requestAnimationFrame(tick) }, 700)
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current) }
  }, [to])
  return <>{val}{suffix}</>
}

// ── Instrument-panel category card ────────────────────────────────────────────
function CatCard({
  emoji, label, sub, delay,
}: { emoji: string; label: string; sub: string; delay: number }) {
  return (
    <Link
      href="/catalog"
      className="group flex flex-col items-center gap-3 px-6 py-5 transition-all duration-300"
      style={{
        background: 'rgba(14,165,233,0.03)',
        border: '1px solid rgba(14,165,233,0.12)',
        borderRadius: 2,
        animation: `fade-up 0.7s ease both`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        className="w-12 h-12 flex items-center justify-center text-2xl rounded-sm transition-all duration-300 group-hover:scale-110"
        style={{
          background: 'rgba(14,165,233,0.07)',
          border: '1px solid rgba(14,165,233,0.18)',
        }}
      >
        {emoji}
      </div>
      <div className="text-center">
        <div
          className="font-mono text-[11px] tracking-[0.15em] font-semibold mb-0.5 group-hover:text-sky-400 transition-colors"
          style={{ color: '#94A3B8' }}
        >
          {label}
        </div>
        <div className="font-mono text-[9px] tracking-widest" style={{ color: '#334155' }}>
          {sub}
        </div>
      </div>
    </Link>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{ minHeight: 'calc(100vh - 60px)', background: '#030608' }}
    >
      {/* ── Blueprint grid ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(14,165,233,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.055) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(14,165,233,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.018) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }} />

      {/* ── Cinematic vignette + glow ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 90% 70% at 50% 42%, rgba(14,165,233,0.065) 0%, transparent 70%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 100% 100% at 50% 100%, rgba(3,6,8,0.7) 0%, transparent 50%)',
      }} />

      {/* ── Molecular canvas ── */}
      <MolecularCanvas />

      {/* ── Sonar rings ── */}
      <SonarRings />

      {/* ── Horizontal scan line ── */}
      <div className="absolute left-0 right-0 pointer-events-none" style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.5) 30%, rgba(56,189,248,0.8) 50%, rgba(14,165,233,0.5) 70%, transparent)',
        boxShadow: '0 0 14px rgba(14,165,233,0.4)',
        animation: 'scan-down 10s linear infinite',
        zIndex: 4,
      }} />

      {/* ── Ruler ── */}
      <HRuler />

      {/* ── Corner brackets ── */}
      {(['top-7 left-7 border-l border-t', 'top-7 right-7 border-r border-t',
        'bottom-7 left-7 border-l border-b', 'bottom-7 right-7 border-r border-b'] as const
      ).map((cls) => (
        <div key={cls} className={`absolute w-9 h-9 pointer-events-none ${cls}`}
          style={{ borderColor: 'rgba(14,165,233,0.3)', borderWidth: '1px' }} />
      ))}

      {/* ── Corner labels ── */}
      <div className="absolute top-10 left-12 pointer-events-none font-mono text-[9px] tracking-widest" style={{ color: 'rgba(14,165,233,0.42)' }}>
        PREC: ±0.001 MM
      </div>
      <div className="absolute top-10 right-12 pointer-events-none font-mono text-[9px] tracking-widest text-right" style={{ color: 'rgba(14,165,233,0.42)' }}>
        ISO 9001 CERTIFIED
      </div>
      <div className="absolute bottom-[72px] left-12 pointer-events-none font-mono text-[9px] tracking-widest" style={{ color: 'rgba(14,165,233,0.3)' }}>
        KZ · ALM · 2014
      </div>
      <div className="absolute bottom-[72px] right-12 pointer-events-none flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 5px #22c55e', animation: 'pulse 2.5s ease infinite' }} />
        <span className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(14,165,233,0.35)' }}>SYS: ONLINE</span>
      </div>

      {/* ═══════════════════ HERO CONTENT ═══════════════════ */}
      <div
        className="relative flex-1 flex flex-col items-center justify-center text-center px-6"
        style={{ paddingTop: '5vh', paddingBottom: '2vh', zIndex: 10 }}
      >

        {/* ── Badge ── */}
        <div
          className="inline-flex items-center gap-3 px-5 py-2 mb-10"
          style={{
            border: '1px solid rgba(14,165,233,0.3)',
            background: 'rgba(14,165,233,0.05)',
            borderRadius: 2,
            animation: 'fade-up 0.6s ease both',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#0EA5E9', boxShadow: '0 0 8px #0EA5E9', animation: 'pulse 2s ease infinite' }} />
          <span className="font-mono text-[10px] tracking-[0.22em]" style={{ color: '#38BDF8' }}>
            KAZAKHSTAN · LABORATORY SOLUTIONS
          </span>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#0EA5E9', boxShadow: '0 0 8px #0EA5E9', animation: 'pulse 2s 0.5s ease infinite' }} />
        </div>

        {/* ── Title ── */}
        <div
          className="select-none mb-5"
          style={{ lineHeight: 1, animation: 'fade-up 0.7s 0.1s ease both' }}
        >
          {/* BES */}
          <div
            className="font-black"
            style={{
              fontSize: 'clamp(60px, 10.5vw, 140px)',
              letterSpacing: '-0.035em',
              lineHeight: 0.92,
              color: '#F1F5F9',
            }}
          >
            BES
          </div>

          {/* SAIMAN — animated metallic silver */}
          <div
            className="font-black"
            style={{
              fontSize: 'clamp(60px, 10.5vw, 140px)',
              letterSpacing: '-0.035em',
              lineHeight: 0.92,
              background: 'linear-gradient(90deg, #7B9AB8 0%, #D4E4F4 18%, #8AAAC4 35%, #EAF2FC 52%, #6B8CAE 68%, #C4D8EE 84%, #7B9AB8 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'metal-flow 8s ease-in-out infinite',
            }}
          >
            SAIMAN
          </div>
        </div>

        {/* GROUP */}
        <div
          className="font-light tracking-[0.4em] mb-10"
          style={{
            fontSize: 'clamp(12px, 2.2vw, 28px)',
            color: '#1E3A5A',
            animation: 'fade-up 0.7s 0.2s ease both',
          }}
        >
          GROUP
        </div>

        {/* ── Divider ── */}
        <div
          className="flex items-center gap-5 w-full max-w-lg mb-8"
          style={{ animation: 'fade-up 0.7s 0.3s ease both' }}
        >
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.4))' }} />
          <div className="flex items-center gap-2">
            <svg width="10" height="12" viewBox="0 0 10 12">
              <polygon points="5,0 10,3 10,9 5,12 0,9 0,3" fill="none" stroke="rgba(14,165,233,0.5)" strokeWidth="0.8" />
            </svg>
            <span className="font-mono text-[9px] tracking-[0.2em]" style={{ color: 'rgba(14,165,233,0.5)' }}>EST. 2014</span>
            <svg width="10" height="12" viewBox="0 0 10 12">
              <polygon points="5,0 10,3 10,9 5,12 0,9 0,3" fill="none" stroke="rgba(14,165,233,0.5)" strokeWidth="0.8" />
            </svg>
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.4), transparent)' }} />
        </div>

        {/* ── Tagline ── */}
        <p
          className="font-light mb-11"
          style={{
            fontSize: '14px',
            color: '#3A5470',
            letterSpacing: '0.1em',
            lineHeight: 2.2,
            animation: 'fade-up 0.7s 0.35s ease both',
          }}
        >
          ВЫСОКОТЕМПЕРАТУРНЫЕ ПЕЧИ · МЕЛЬНИЦЫ · ВАКУУМНОЕ ОБОРУДОВАНИЕ<br />
          ЭЛЕКТРОСПИННИНГ · АКСЕССУАРЫ И КОМПЛЕКТУЮЩИЕ
        </p>

        {/* ── CTA Buttons ── */}
        <div
          className="flex flex-wrap gap-4 justify-center mb-14"
          style={{ animation: 'fade-up 0.7s 0.4s ease both' }}
        >
          {/* Primary */}
          <Link
            href="/catalog"
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 font-semibold text-white overflow-hidden transition-all duration-300"
            style={{
              fontSize: 13, letterSpacing: '0.1em',
              background: 'linear-gradient(135deg, #0369A1, #0EA5E9)',
              borderRadius: 2,
              border: '1px solid rgba(14,165,233,0.6)',
              boxShadow: '0 0 0 0 rgba(14,165,233,0)',
            }}
          >
            {/* Hover shimmer */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(135deg, #0EA5E9, #38BDF8)' }} />
            <span className="relative font-mono tracking-wider text-[12px]">▶ СМОТРЕТЬ КАТАЛОГ</span>
          </Link>

          {/* Secondary */}
          <Link
            href="/contacts"
            className="inline-flex items-center gap-3 font-mono font-semibold transition-all duration-300 hover:border-sky-500 hover:text-sky-400"
            style={{
              fontSize: 12, letterSpacing: '0.1em',
              padding: '14px 32px',
              background: 'transparent',
              borderRadius: 2,
              border: '1px solid rgba(14,165,233,0.25)',
              color: '#3A6688',
            }}
          >
            СВЯЗАТЬСЯ С НАМИ
          </Link>
        </div>

        {/* ── Stats ── */}
        <div
          className="flex gap-10 md:gap-16"
          style={{ animation: 'fade-up 0.7s 0.5s ease both' }}
        >
          {[
            { to: 200, suffix: '+', label: 'ЕДИНИЦ\nОБОРУДОВАНИЯ' },
            { to: 50,  suffix: '+', label: 'ПАРТНЁРОВ' },
            { to: 10,  suffix: '+', label: 'ЛЕТ\nОПЫТА' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="font-black mb-1.5"
                style={{
                  fontSize: 'clamp(30px, 4vw, 50px)',
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #0EA5E9, #38BDF8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                <Counter to={s.to} suffix={s.suffix} />
              </div>
              <div className="font-mono text-[9px] tracking-[0.16em] whitespace-pre-line" style={{ color: 'rgba(14,165,233,0.45)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          CATEGORY PANEL — below the fold
      ══════════════════════════════════════════════════ */}
      <div
        className="relative px-6 pb-16 pt-8"
        style={{ zIndex: 10 }}
      >
        {/* Thin divider */}
        <div className="w-full mb-8" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.2) 30%, rgba(14,165,233,0.2) 70%, transparent)' }} />

        <div className="max-w-3xl mx-auto">
          <div className="font-mono text-[9px] tracking-[0.25em] text-center mb-5" style={{ color: 'rgba(14,165,233,0.3)' }}>
            НАПРАВЛЕНИЯ / PRODUCT LINES
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <CatCard emoji="🔥" label="ПЕЧИ"            sub="FURNACES"          delay={600} />
            <CatCard emoji="⚙️" label="МЕЛЬНИЦЫ"        sub="MILLS & GRINDERS"  delay={700} />
            <CatCard emoji="🔬" label="ВАКУУМ"           sub="VACUUM SYSTEMS"    delay={800} />
            <CatCard emoji="⚗" label="ЭЛЕКТРОСПИННИНГ" sub="ELECTROSPINNING"   delay={900} />
          </div>
        </div>
      </div>

      {/* ── Spec bar ── */}
      <div
        className="relative"
        style={{ borderTop: '1px solid rgba(14,165,233,0.1)', background: 'rgba(3,6,8,0.9)', zIndex: 10 }}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-2.5 font-mono text-[8px] tracking-[0.14em] overflow-hidden" style={{ color: 'rgba(14,165,233,0.35)' }}>
          {['KAZAKHSTAN', 'ALMATY', 'T: 25°C — 1800°C', '±0.001 MM PRECISION', '200+ PRODUCTS', 'ISO 9001', 'MATERIALS SCIENCE'].map((item, i, arr) => (
            <span key={item} className="flex items-center gap-6 whitespace-nowrap">
              {item}
              {i < arr.length - 1 && <span style={{ color: 'rgba(14,165,233,0.15)' }}>|</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
