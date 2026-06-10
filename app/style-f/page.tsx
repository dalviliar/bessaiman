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

// Precision dial — blueprint colors, actually rotating
function BlueprintDial() {
  const ring1 = useRef<SVGGElement>(null)
  const ring2 = useRef<SVGGElement>(null)
  const ring3 = useRef<SVGGElement>(null)
  const needle = useRef<SVGLineElement>(null)

  useEffect(() => {
    let a1 = 0, a2 = 0, a3 = 0, na = -90
    let raf: number
    const tick = () => {
      a1 += 0.10; a2 -= 0.06; a3 += 0.035; na += 0.08
      ring1.current?.setAttribute('transform', `rotate(${a1} 300 300)`)
      ring2.current?.setAttribute('transform', `rotate(${a2} 300 300)`)
      ring3.current?.setAttribute('transform', `rotate(${a3} 300 300)`)
      if (needle.current) {
        const rad = na * Math.PI / 180
        needle.current.setAttribute('x2', String(300 + 115 * Math.cos(rad)))
        needle.current.setAttribute('y2', String(300 + 115 * Math.sin(rad)))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const cx = 300, cy = 300

  return (
    <svg viewBox="0 0 600 600" className="w-full h-full" style={{ maxWidth: 520 }}>
      <defs>
        <filter id="bpShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#1A4A8A" floodOpacity="0.12" />
        </filter>
        <radialGradient id="bpGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1A4A8A" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#EDF2F8" stopOpacity="0" />
        </radialGradient>
        <marker id="dimArrow" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <path d="M0,0 L0,5 L5,2.5 Z" fill="#1A4A8A" fillOpacity="0.4" />
        </marker>
      </defs>

      {/* Background glow */}
      <circle cx={cx} cy={cy} r="270" fill="url(#bpGlow)" />

      {/* Outermost reference circle */}
      <circle cx={cx} cy={cy} r="265" fill="none" stroke="#1A4A8A" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="4 8" />

      {/* Dimension line — diameter */}
      <line x1={cx - 265} y1={cy + 285} x2={cx + 265} y2={cy + 285}
        stroke="#1A4A8A" strokeWidth="0.7" strokeOpacity="0.35"
        markerEnd="url(#dimArrow)" markerStart="url(#dimArrow)" />
      <text x={cx} y={cy + 298} textAnchor="middle" fontSize="11" fill="#1A4A8A"
        fillOpacity="0.5" fontFamily="monospace">Ø 530 мм</text>

      {/* Vertical dimension */}
      <line x1={cx + 285} y1={cy - 220} x2={cx + 285} y2={cy + 220}
        stroke="#1A4A8A" strokeWidth="0.7" strokeOpacity="0.35"
        markerEnd="url(#dimArrow)" markerStart="url(#dimArrow)" />
      <text x={cx + 298} y={cy + 5} textAnchor="start" fontSize="11" fill="#1A4A8A"
        fillOpacity="0.5" fontFamily="monospace">440 мм</text>

      {/* Cross hairs */}
      <line x1={cx} y1={cy - 285} x2={cx} y2={cy - 230} stroke="#1A4A8A" strokeWidth="0.7" strokeOpacity="0.25" />
      <line x1={cx} y1={cy + 230} x2={cx} y2={cy + 270} stroke="#1A4A8A" strokeWidth="0.7" strokeOpacity="0.25" />
      <line x1={cx - 285} y1={cy} x2={cx - 230} y2={cy} stroke="#1A4A8A" strokeWidth="0.7" strokeOpacity="0.25" />
      <line x1={cx + 230} y1={cy} x2={cx + 270} y2={cy} stroke="#1A4A8A" strokeWidth="0.7" strokeOpacity="0.25" />

      {/* === OUTER SLOW RING === */}
      <g ref={ring3}>
        <circle cx={cx} cy={cy} r="228" fill="none" stroke="#1A4A8A" strokeWidth="1" strokeOpacity="0.12" />
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i * 6) * Math.PI / 180
          const isMaj = i % 5 === 0
          return (
            <line key={i}
              x1={cx + (isMaj ? 218 : 222) * Math.cos(a)}
              y1={cy + (isMaj ? 218 : 222) * Math.sin(a)}
              x2={cx + 227 * Math.cos(a)}
              y2={cy + 227 * Math.sin(a)}
              stroke="#1A4A8A"
              strokeWidth={isMaj ? 1.2 : 0.5}
              strokeOpacity={isMaj ? 0.3 : 0.15}
            />
          )
        })}
      </g>

      {/* === MAIN ROTATING RING === */}
      <g ref={ring1}>
        <circle cx={cx} cy={cy} r="200" fill="none" stroke="#1A4A8A" strokeWidth="2.5" strokeOpacity="0.3" />
        <circle cx={cx} cy={cy} r="188" fill="none" stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.15" />

        {Array.from({ length: 72 }).map((_, i) => {
          const a = (i * 5) * Math.PI / 180
          const isMaj = i % 6 === 0
          const isMed = i % 3 === 0
          const r1 = isMaj ? 174 : isMed ? 180 : 184
          return (
            <line key={i}
              x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)}
              x2={cx + 199 * Math.cos(a)} y2={cy + 199 * Math.sin(a)}
              stroke="#1A4A8A"
              strokeWidth={isMaj ? 1.8 : isMed ? 1.0 : 0.5}
              strokeOpacity={isMaj ? 0.55 : isMed ? 0.3 : 0.15}
            />
          )
        })}

        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 - 90) * Math.PI / 180
          return (
            <text key={i}
              x={cx + 162 * Math.cos(a)} y={cy + 162 * Math.sin(a)}
              textAnchor="middle" dominantBaseline="central"
              fontSize="12" fontFamily="monospace" fontWeight="700"
              fill="#1A4A8A" fillOpacity="0.45"
            >
              {String(i === 0 ? 12 : i).padStart(2, '0')}
            </text>
          )
        })}

        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30) * Math.PI / 180
          return (
            <g key={i}>
              <circle cx={cx + 211 * Math.cos(a)} cy={cy + 211 * Math.sin(a)} r="5"
                fill="#EDF2F8" stroke="#1A4A8A" strokeWidth="1.2" strokeOpacity="0.35" />
              <circle cx={cx + 211 * Math.cos(a)} cy={cy + 211 * Math.sin(a)} r="1.8"
                fill="#1A4A8A" fillOpacity="0.25" />
            </g>
          )
        })}
      </g>

      {/* === COUNTER-ROTATING INNER RING === */}
      <g ref={ring2}>
        <circle cx={cx} cy={cy} r="138" fill="none" stroke="#1A4A8A" strokeWidth="1.5" strokeOpacity="0.2" />
        {Array.from({ length: 32 }).map((_, i) => {
          const step = (2 * Math.PI) / 32
          const a0 = i * step, a1 = a0 + step * 0.3, a2 = a0 + step * 0.7, a3 = a0 + step
          const rO = 138, rI = 124
          const pts = [
            `${cx + rI * Math.cos(a0)},${cy + rI * Math.sin(a0)}`,
            `${cx + rO * Math.cos(a1)},${cy + rO * Math.sin(a1)}`,
            `${cx + rO * Math.cos(a2)},${cy + rO * Math.sin(a2)}`,
            `${cx + rI * Math.cos(a3)},${cy + rI * Math.sin(a3)}`,
          ].join(' ')
          return (
            <polygon key={i} points={pts}
              fill="#DDE6F2" stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.3" />
          )
        })}

        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
          const a = deg * Math.PI / 180
          return (
            <line key={i}
              x1={cx + 34 * Math.cos(a)} y1={cy + 34 * Math.sin(a)}
              x2={cx + 108 * Math.cos(a)} y2={cy + 108 * Math.sin(a)}
              stroke="#1A4A8A" strokeWidth="3" strokeOpacity="0.15"
              strokeLinecap="round"
            />
          )
        })}
        <circle cx={cx} cy={cy} r="110" fill="none" stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.15" />
      </g>

      {/* Center disc */}
      <circle cx={cx} cy={cy} r="80" fill="#E8EFF8" filter="url(#bpShadow)" />
      <circle cx={cx} cy={cy} r="80" fill="none" stroke="#1A4A8A" strokeWidth="2" strokeOpacity="0.3" />
      <circle cx={cx} cy={cy} r="72" fill="none" stroke="#1A4A8A" strokeWidth="0.5" strokeOpacity="0.15" />

      <text x={cx} y={cy - 18} textAnchor="middle" fontSize="15" fontWeight="900"
        fill="#0A1E3A" fontFamily="Inter,sans-serif" letterSpacing="3">BES</text>
      <text x={cx} y={cy + 2} textAnchor="middle" fontSize="14" fontWeight="900"
        fill="#1A4A8A" fontFamily="Inter,sans-serif" letterSpacing="2">SAIMAN</text>
      <line x1={cx - 40} y1={cy + 10} x2={cx + 40} y2={cy + 10}
        stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.3" />
      <text x={cx} y={cy + 24} textAnchor="middle" fontSize="8"
        fill="#3A6AAA" fontFamily="monospace" letterSpacing="4">GROUP</text>

      <line ref={needle}
        x1={cx} y1={cy}
        x2={cx} y2={cy - 115}
        stroke="#1A4A8A" strokeWidth="2" strokeOpacity="0.55" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx} y2={cy + 30}
        stroke="#1A4A8A" strokeWidth="1.5" strokeOpacity="0.25" strokeLinecap="round" />

      <circle cx={cx} cy={cy} r="8" fill="#1A4A8A" fillOpacity="0.7" />
      <circle cx={cx} cy={cy} r="4" fill="#EDF2F8" />
      <circle cx={cx} cy={cy} r="1.5" fill="#1A4A8A" fillOpacity="0.5" />

      <rect x="18" y="18" width="120" height="32" rx="2"
        fill="#DDE6F2" stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.3" />
      <text x="78" y="31" textAnchor="middle" fontSize="7.5" fontWeight="700"
        fill="#1A4A8A" fillOpacity="0.8" fontFamily="monospace">BES SAIMAN GROUP</text>
      <text x="78" y="43" textAnchor="middle" fontSize="6.5"
        fill="#3A6AAA" fillOpacity="0.7" fontFamily="monospace">ЧЕРТёЖ REV.A 2024</text>

      <rect x="18" y="520" width="160" height="52" rx="2"
        fill="#DDE6F2" stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.3" />
      <text x="26" y="536" fontSize="7" fill="#1A4A8A" fillOpacity="0.75" fontFamily="monospace" fontWeight="600">МАТЕРИАЛ: СТАЛЬ 40Х</text>
      <text x="26" y="549" fontSize="7" fill="#3A6AAA" fillOpacity="0.7" fontFamily="monospace">ШЕРОХОВАТОСТЬ: Ra 1.6</text>
      <text x="26" y="562" fontSize="7" fill="#3A6AAA" fillOpacity="0.7" fontFamily="monospace">ДОПУСК: ±0.01 ММ</text>
    </svg>
  )
}

const specs = [
  { label: 'Высокотемп. печи', value: '≤ 1800°C', code: 'HT' },
  { label: 'Шаровые мельницы', value: '650 rpm', code: 'BM' },
  { label: 'Вакуумные боксы', value: '< 0.1 ppm', code: 'VB' },
  { label: 'Электроспиннинг', value: '≤ 50 kV', code: 'ES' },
]

export default function StyleFPage() {
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

      {/* Title bar */}
      <div style={{ height: 4, background: '#1A4A8A' }} />
      <div className="flex items-center justify-between px-8 py-2.5"
        style={{ background: '#E4EBF5', borderBottom: '1px solid rgba(26,74,138,0.2)' }}>
        <div className="flex items-center gap-4">
          <svg width="20" height="24" viewBox="0 0 28 32">
            <polygon points="14,1 27,8 27,24 14,31 1,24 1,8" fill="none" stroke="#1A4A8A" strokeWidth="1.5" />
            <text x="14" y="20" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1A4A8A" fontFamily="Inter,sans-serif">B</text>
          </svg>
          <span className="font-mono text-xs font-bold tracking-widest" style={{ color: '#1A4A8A' }}>
            BES SAIMAN GROUP — ПРЕЦИЗИОННОЕ ЛАБОРАТОРНОЕ ОБОРУДОВАНИЕ
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <span className="font-mono text-[10px]" style={{ color: 'rgba(26,74,138,0.5)' }}>ЧЕРТЁЖ № BSG-2024-F1</span>
          <span className="font-mono text-[10px]" style={{ color: 'rgba(26,74,138,0.5)' }}>ISO 9001</span>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span className="font-mono text-[10px]" style={{ color: 'rgba(26,74,138,0.5)' }}>ONLINE</span>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center" style={{ minHeight: '75vh' }}>

          {/* Left */}
          <div style={{ animation: 'fade-up 0.6s ease both' }}>
            <div className="flex items-center gap-3 mb-8">
              <div style={{ width: 28, height: 1, background: '#1A4A8A', opacity: 0.4 }} />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: '#3A6AAA' }}>
                Precision · Laboratory · Equipment
              </span>
            </div>

            <div className="mb-2 relative">
              <span className="font-mono text-[10px] tracking-widest absolute -top-4" style={{ color: 'rgba(26,74,138,0.4)' }}>НАИМЕНОВАНИЕ:</span>
              <h1 style={{ fontSize: 'clamp(56px, 8vw, 104px)', fontWeight: 900, color: '#0A1E3A', letterSpacing: '-0.04em', lineHeight: 0.9 }}>
                BES
              </h1>
            </div>
            <div className="mb-6">
              <h1 style={{ fontSize: 'clamp(56px, 8vw, 104px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.9, color: '#1A4A8A' }}>
                SAIMAN
              </h1>
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

            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/catalog"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-mono font-semibold transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: '#1A4A8A', color: '#EDF2F8', boxShadow: '3px 3px 0 rgba(26,74,138,0.2)' }}>
                ▶ КАТАЛОГ ОБОРУДОВАНИЯ
              </Link>
              <Link href="/contacts"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-mono font-semibold transition-all duration-200 hover:-translate-y-0.5"
                style={{ color: '#1A4A8A', border: '1px solid rgba(26,74,138,0.4)', boxShadow: '3px 3px 0 rgba(26,74,138,0.1)' }}>
                ЗАПРОСИТЬ КП
              </Link>
            </div>

            {/* Spec table */}
            <div style={{ border: '1px solid rgba(26,74,138,0.25)', background: '#E8EFF8' }}>
              <div className="px-4 py-2" style={{ borderBottom: '1px solid rgba(26,74,138,0.15)', background: '#DDE6F2' }}>
                <span className="font-mono text-[9px] font-bold tracking-widest uppercase" style={{ color: '#1A4A8A' }}>
                  Технические характеристики
                </span>
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
                    <span className="font-mono text-[9px] font-bold px-1.5 py-0.5"
                      style={{ background: '#1A4A8A', color: '#EDF2F8' }}>{s.code}</span>
                    <span className="text-xs font-medium" style={{ color: '#2A4A6A' }}>{s.label}</span>
                  </div>
                  <span className="font-mono text-xs font-bold" style={{ color: '#1A4A8A' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Live rotating precision dial */}
          <div className="flex items-center justify-center" style={{ animation: 'fade-up 0.5s ease both' }}>
            <div className="w-full relative"
              style={{ background: '#DDE6F2', border: '1px solid rgba(26,74,138,0.2)', padding: '12px', boxShadow: 'inset 0 2px 8px rgba(26,74,138,0.06)' }}>
              {[['top-2 left-2', 'M0 18 L0 0 L18 0'], ['top-2 right-2', 'M18 18 L18 0 L0 0'], ['bottom-2 left-2', 'M0 0 L0 18 L18 18'], ['bottom-2 right-2', 'M18 0 L18 18 L0 18']].map(([pos, d], i) => (
                <svg key={i} className={`absolute ${pos}`} width="20" height="20" viewBox="0 0 20 20">
                  <path d={d} fill="none" stroke="#1A4A8A" strokeWidth="1.5" strokeOpacity="0.4" />
                </svg>
              ))}
              <BlueprintDial />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '2px solid #1A4A8A', marginTop: 16 }}>
          <div className="flex flex-wrap items-stretch" style={{ borderBottom: '1px solid rgba(26,74,138,0.2)', background: '#DDE6F2' }}>
            {[
              { v: 200, s: '+', l: 'единиц оборудования' },
              { v: 12, s: '', l: 'лет на рынке' },
              { v: 50, s: '+', l: 'организаций-клиентов' },
              { v: 98, s: '%', l: 'удовлетворённость' },
            ].map((st, i) => (
              <div key={i} className="flex-1 px-6 py-4 text-center"
                style={{ borderRight: i < 3 ? '1px solid rgba(26,74,138,0.15)' : 'none' }}>
                <div className="font-black text-3xl mb-0.5" style={{ color: '#1A4A8A', fontFamily: 'monospace' }}>
                  <Counter to={st.v} suffix={st.s} />
                </div>
                <div className="font-mono text-[10px]" style={{ color: 'rgba(26,74,138,0.55)' }}>{st.l}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between px-6 py-2.5" style={{ background: '#1A4A8A' }}>
            {['KAZAKHSTAN', 'ALMATY', 'ISO 9001', '±0.001 MM', 'T: 25°C — 1800°C'].map((t, i, a) => (
              <span key={t} className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(200,220,240,0.75)' }}>
                {t}{i < a.length - 1 ? <span style={{ opacity: 0.3 }}> · </span> : ''}
              </span>
            ))}
            <Link href="/contacts" className="font-mono text-[10px] font-bold px-3 py-1.5"
              style={{ color: '#AED6FF', border: '1px solid rgba(174,214,255,0.3)' }}>
              СВЯЗАТЬСЯ →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
