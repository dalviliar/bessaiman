'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const raf = useRef(0)
  useEffect(() => {
    const S = performance.now(), D = 2000
    const tick = (n: number) => {
      const p = Math.min((n - S) / D, 1)
      setVal(Math.round((1 - (1 - p) ** 3) * to))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    const t = setTimeout(() => { raf.current = requestAnimationFrame(tick) }, 300)
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current) }
  }, [to])
  return <>{val}{suffix}</>
}

// Animated drawing SVG - blueprint technical drawing
function BlueprintCanvas() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const dur = 3000
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      setProgress(p)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [])

  const dash = (len: number) => `${len * progress} ${len * (1 - progress) + 9999}`

  return (
    <svg viewBox="0 0 520 420" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 Z" fill="#1A4A8A" fillOpacity="0.5" />
        </marker>
        <marker id="arrowR" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
          <path d="M0,0 L0,6 L6,3 Z" fill="#1A4A8A" fillOpacity="0.5" />
        </marker>
      </defs>

      {/* Main gear outline — animated draw */}
      <g opacity="0.85">
        {/* Outer gear ring */}
        <circle cx="260" cy="210" r="140"
          fill="none" stroke="#1A4A8A" strokeWidth="1.2" strokeOpacity="0.25"
          strokeDasharray={dash(880)} />
        {/* Gear teeth outline */}
        <circle cx="260" cy="210" r="155"
          fill="none" stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.2"
          strokeDasharray={`4 6`} />

        {/* Spokes */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const a = deg * Math.PI / 180
          const x1 = 260 + 30 * Math.cos(a), y1 = 210 + 30 * Math.sin(a)
          const x2 = 260 + 118 * Math.cos(a), y2 = 210 + 118 * Math.sin(a)
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#1A4A8A" strokeWidth="1" strokeOpacity="0.3"
              strokeDasharray={dash(90)} />
          )
        })}

        {/* Inner circles */}
        <circle cx="260" cy="210" r="85"
          fill="none" stroke="#1A5AAA" strokeWidth="1" strokeOpacity="0.2"
          strokeDasharray={dash(534)} />
        <circle cx="260" cy="210" r="30"
          fill="none" stroke="#1A5AAA" strokeWidth="1.5" strokeOpacity="0.35"
          strokeDasharray={dash(188)} />

        {/* Cross hairs */}
        <line x1="260" y1="50" x2="260" y2="370"
          stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.2"
          strokeDasharray={dash(320)} />
        <line x1="90" y1="210" x2="430" y2="210"
          stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.2"
          strokeDasharray={dash(340)} />

        {/* Dimension lines */}
        <line x1="260" y1="362" x2="420" y2="362"
          stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.4"
          markerEnd="url(#arrow)" markerStart="url(#arrowR)"
          strokeDasharray={dash(160)} />
        <text x="340" y="375" textAnchor="middle" fontSize="9" fill="#1A4A8A" fillOpacity={0.6 * progress} fontFamily="monospace">Ø 310 мм</text>

        <line x1="410" y1="70" x2="410" y2="350"
          stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.4"
          markerEnd="url(#arrow)" markerStart="url(#arrowR)"
          strokeDasharray={dash(280)} />
        <text x="430" y="215" textAnchor="start" fontSize="9" fill="#1A4A8A" fillOpacity={0.6 * progress} fontFamily="monospace">280 мм</text>

        {/* Bolt holes */}
        {[30, 90, 150, 210, 270, 330].map((deg, i) => {
          const a = deg * Math.PI / 180
          return (
            <g key={i}>
              <circle
                cx={260 + 105 * Math.cos(a)} cy={210 + 105 * Math.sin(a)} r="7"
                fill="none" stroke="#1A5AAA" strokeWidth="1" strokeOpacity={0.4 * progress} />
              <circle
                cx={260 + 105 * Math.cos(a)} cy={210 + 105 * Math.sin(a)} r="2.5"
                fill="#1A5AAA" fillOpacity={0.25 * progress} />
            </g>
          )
        })}

        {/* Annotation boxes */}
        <rect x="20" y="30" width="110" height="36" rx="2"
          fill="#EEF3FA" stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.4" />
        <text x="75" y="47" textAnchor="middle" fontSize="7.5" fill="#1A4A8A" fillOpacity={progress} fontFamily="monospace" fontWeight="600">BES SAIMAN GROUP</text>
        <text x="75" y="59" textAnchor="middle" fontSize="6.5" fill="#3A6AAA" fillOpacity={progress * 0.8} fontFamily="monospace">REV. 2024-A</text>

        <rect x="20" y="340" width="130" height="50" rx="2"
          fill="#EEF3FA" stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.35" />
        <text x="85" y="358" textAnchor="middle" fontSize="7" fill="#1A4A8A" fillOpacity={progress} fontFamily="monospace">МАТЕРИАЛ: СТАЛЬ 40Х</text>
        <text x="85" y="370" textAnchor="middle" fontSize="7" fill="#3A6AAA" fillOpacity={progress * 0.8} fontFamily="monospace">ШЕРОХОВАТОСТЬ: Ra 1.6</text>
        <text x="85" y="382" textAnchor="middle" fontSize="7" fill="#3A6AAA" fillOpacity={progress * 0.8} fontFamily="monospace">ТВЁРДОСТЬ: HRC 45-50</text>
      </g>
    </svg>
  )
}

const specs = [
  { label: 'Высокотемп. печи', value: '≤ 1800°C', code: 'HT' },
  { label: 'Шаровые мельницы', value: '650 rpm', code: 'BM' },
  { label: 'Вакуумные боксы', value: '< 0.1 ppm', code: 'VB' },
  { label: 'Электроспиннинг', value: '≤ 50 kV', code: 'ES' },
]

export default function StyleEPage() {
  const [hov, setHov] = useState<number | null>(null)

  return (
    <div className="relative overflow-hidden" style={{ minHeight: 'calc(100vh - 60px)', background: '#EDF2F8' }}>

      {/* Blueprint grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(26,74,138,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(26,74,138,0.12) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(26,74,138,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(26,74,138,0.05) 1px, transparent 1px)',
        backgroundSize: '12px 12px',
      }} />

      {/* Title bar — like a drawing frame */}
      <div style={{ height: 4, background: '#1A4A8A' }} />
      <div className="flex items-center justify-between px-8 py-2.5" style={{ background: '#E4EBF5', borderBottom: '1px solid rgba(26,74,138,0.2)' }}>
        <div className="flex items-center gap-4">
          <svg width="20" height="24" viewBox="0 0 28 32">
            <polygon points="14,1 27,8 27,24 14,31 1,24 1,8" fill="none" stroke="#1A4A8A" strokeWidth="1.5" />
            <text x="14" y="20" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1A4A8A" fontFamily="Inter,sans-serif">B</text>
          </svg>
          <span className="font-mono text-xs font-bold tracking-widest" style={{ color: '#1A4A8A' }}>BES SAIMAN GROUP — ЛАБОРАТОРНОЕ ОБОРУДОВАНИЕ</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <span className="font-mono text-[10px]" style={{ color: 'rgba(26,74,138,0.5)' }}>ЧЕРТЁЖ № BSG-2024-01</span>
          <span className="font-mono text-[10px]" style={{ color: 'rgba(26,74,138,0.5)' }}>МАСШТАБ 1:10</span>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px #22c55e' }} />
            <span className="font-mono text-[10px]" style={{ color: 'rgba(26,74,138,0.5)' }}>ONLINE</span>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center" style={{ minHeight: '72vh' }}>

          {/* Left — Text */}
          <div style={{ animation: 'fade-up 0.6s ease both' }}>
            {/* Technical label */}
            <div className="flex items-center gap-3 mb-8">
              <div style={{ width: 28, height: 1, background: '#1A4A8A', opacity: 0.4 }} />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: '#3A6AAA' }}>
                Precision · Laboratory · Equipment
              </span>
            </div>

            {/* Main heading — blueprint style */}
            <div className="mb-2 relative">
              <span className="font-mono text-[10px] tracking-widest absolute -top-4 left-0" style={{ color: 'rgba(26,74,138,0.4)' }}>НАИМЕНОВАНИЕ:</span>
              <h1 style={{
                fontSize: 'clamp(56px, 8vw, 104px)',
                fontWeight: 900,
                color: '#0A1E3A',
                letterSpacing: '-0.04em',
                lineHeight: 0.9,
              }}>
                BES
              </h1>
            </div>
            <div className="mb-6 relative">
              <h1 style={{
                fontSize: 'clamp(56px, 8vw, 104px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 0.9,
                color: '#1A4A8A',
              }}>
                SAIMAN
              </h1>
              {/* Underline with arrows */}
              <div className="flex items-center gap-2 mt-2">
                <div style={{ flex: 1, height: 1, background: '#1A4A8A', opacity: 0.3 }} />
                <span className="font-mono text-[9px] tracking-[0.2em]" style={{ color: 'rgba(26,74,138,0.5)' }}>GROUP</span>
                <div style={{ flex: 1, height: 1, background: '#1A4A8A', opacity: 0.3 }} />
              </div>
            </div>

            <p className="text-sm mb-10 leading-loose" style={{ color: '#3A5A7A', borderLeft: '3px solid rgba(26,74,138,0.2)', paddingLeft: 14 }}>
              Высокотехнологичное лабораторное оборудование<br />
              для науки, исследований и производства Казахстана.
            </p>

            {/* Blueprint-style buttons */}
            <div className="flex flex-wrap gap-3 mb-12">
              <Link href="/catalog"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-mono font-semibold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: '#1A4A8A',
                  color: '#EDF2F8',
                  border: '1px solid #1A4A8A',
                  boxShadow: '3px 3px 0 rgba(26,74,138,0.2)',
                }}>
                ▶ КАТАЛОГ ОБОРУДОВАНИЯ
              </Link>
              <Link href="/contacts"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-mono font-semibold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'transparent',
                  color: '#1A4A8A',
                  border: '1px solid rgba(26,74,138,0.4)',
                  boxShadow: '3px 3px 0 rgba(26,74,138,0.1)',
                }}>
                ЗАПРОСИТЬ КП
              </Link>
            </div>

            {/* Spec table — blueprint style */}
            <div style={{ border: '1px solid rgba(26,74,138,0.25)', background: '#E8EFF8' }}>
              <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(26,74,138,0.15)', background: '#DDE6F2' }}>
                <span className="font-mono text-[9px] font-bold tracking-widest uppercase" style={{ color: '#1A4A8A' }}>Технические характеристики</span>
              </div>
              {specs.map((s, i) => (
                <div key={i}
                  onMouseEnter={() => setHov(i)}
                  onMouseLeave={() => setHov(null)}
                  className="flex items-center justify-between px-4 py-2.5 cursor-default transition-colors"
                  style={{
                    borderBottom: i < specs.length - 1 ? '1px solid rgba(26,74,138,0.1)' : 'none',
                    background: hov === i ? 'rgba(26,74,138,0.06)' : 'transparent',
                  }}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[9px] font-bold px-1.5 py-0.5" style={{ background: '#1A4A8A', color: '#EDF2F8' }}>{s.code}</span>
                    <span className="text-xs font-medium" style={{ color: '#2A4A6A' }}>{s.label}</span>
                  </div>
                  <span className="font-mono text-xs font-bold" style={{ color: '#1A4A8A' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Blueprint drawing */}
          <div className="flex items-center justify-center" style={{ animation: 'fade-up 0.8s ease both' }}>
            <div className="w-full relative"
              style={{
                background: '#DDE6F2',
                border: '1px solid rgba(26,74,138,0.25)',
                padding: '16px',
                boxShadow: 'inset 0 2px 8px rgba(26,74,138,0.08)',
              }}>
              {/* Drawing frame corners */}
              {[['top-2 left-2', '0 20 M0 0 L20 0'], ['top-2 right-2', '20 20 M20 0 L0 0'], ['bottom-2 left-2', '0 0 M0 20 L20 20'], ['bottom-2 right-2', '20 0 M20 20 L0 20']].map(([pos, path], i) => (
                <svg key={i} className={`absolute ${pos}`} width="22" height="22" viewBox="0 0 22 22">
                  <path d={`M${path}`} fill="none" stroke="#1A4A8A" strokeWidth="1.5" strokeOpacity="0.4" />
                </svg>
              ))}
              <BlueprintCanvas />
            </div>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div style={{ borderTop: '2px solid #1A4A8A', marginTop: 24 }}>
          <div className="flex flex-wrap items-stretch" style={{ borderBottom: '1px solid rgba(26,74,138,0.2)', background: '#DDE6F2' }}>
            {[
              { v: 200, s: '+', l: 'единиц оборудования' },
              { v: 12, s: '', l: 'лет на рынке' },
              { v: 50, s: '+', l: 'организаций-клиентов' },
              { v: 98, s: '%', l: 'удовлетворённость' },
            ].map((st, i) => (
              <div key={i} className="flex-1 px-6 py-4 text-center" style={{
                borderRight: i < 3 ? '1px solid rgba(26,74,138,0.15)' : 'none',
              }}>
                <div className="font-black text-3xl mb-0.5" style={{ color: '#1A4A8A', fontFamily: 'monospace' }}>
                  <Counter to={st.v} suffix={st.s} />
                </div>
                <div className="font-mono text-[10px]" style={{ color: 'rgba(26,74,138,0.55)' }}>{st.l}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between px-6 py-2.5" style={{ background: '#1A4A8A' }}>
            {['KAZAKHSTAN', 'ALMATY', 'ISO 9001', '±0.001 MM', 'T: 25°C — 1800°C'].map((t, i, a) => (
              <span key={t} className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(200,220,240,0.7)' }}>
                {t}{i < a.length - 1 ? <span style={{ opacity: 0.3 }}> · </span> : ''}
              </span>
            ))}
            <Link href="/contacts" className="font-mono text-[10px] font-bold px-3 py-1.5 transition-colors hover:bg-white/20"
              style={{ color: '#AED6FF', border: '1px solid rgba(174,214,255,0.3)' }}>
              СВЯЗАТЬСЯ →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
