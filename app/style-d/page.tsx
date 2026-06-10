'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// Rotating precision dial
function PrecisionDial() {
  const dialRef = useRef<SVGGElement>(null)
  const innerRef = useRef<SVGGElement>(null)
  const outerRef = useRef<SVGGElement>(null)

  useEffect(() => {
    let angle = 0
    let angle2 = 0
    let raf: number
    const tick = () => {
      angle += 0.12
      angle2 -= 0.07
      if (dialRef.current) dialRef.current.setAttribute('transform', `rotate(${angle} 300 300)`)
      if (innerRef.current) innerRef.current.setAttribute('transform', `rotate(${angle2} 300 300)`)
      if (outerRef.current) outerRef.current.setAttribute('transform', `rotate(${angle * 0.4} 300 300)`)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const ticks = Array.from({ length: 72 })
  const majorTicks = Array.from({ length: 12 })

  return (
    <svg viewBox="0 0 600 600" className="w-full h-full" style={{ maxWidth: 540, maxHeight: 540 }}>
      <defs>
        <radialGradient id="dialGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8BAEC8" stopOpacity="0.06" />
          <stop offset="60%" stopColor="#4A7090" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#1A3050" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A0C0D8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2A4A68" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="steelRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8AAABB" />
          <stop offset="30%" stopColor="#C8D8E4" />
          <stop offset="60%" stopColor="#7A9AAA" />
          <stop offset="100%" stopColor="#B0C4D0" />
        </linearGradient>
        <linearGradient id="steelInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3A5A70" />
          <stop offset="50%" stopColor="#7090A8" />
          <stop offset="100%" stopColor="#2A4A60" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background glow */}
      <circle cx="300" cy="300" r="260" fill="url(#dialGlow)" />

      {/* Outer slow ring */}
      <g ref={outerRef}>
        <circle cx="300" cy="300" r="255" fill="none" stroke="rgba(140,180,200,0.1)" strokeWidth="1" />
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i * 10) * Math.PI / 180
          const r1 = 248, r2 = 255
          return (
            <line key={i}
              x1={300 + r1 * Math.cos(a)} y1={300 + r1 * Math.sin(a)}
              x2={300 + r2 * Math.cos(a)} y2={300 + r2 * Math.sin(a)}
              stroke="rgba(140,180,200,0.2)" strokeWidth="0.8" />
          )
        })}
      </g>

      {/* Main rotating ring — minute ticks */}
      <g ref={dialRef}>
        <circle cx="300" cy="300" r="220" fill="none" stroke="url(#steelRing)" strokeWidth="2" />
        {ticks.map((_, i) => {
          const a = (i * 5) * Math.PI / 180
          const isMajor = i % 6 === 0
          const r1 = isMajor ? 198 : 206
          const r2 = 218
          return (
            <line key={i}
              x1={300 + r1 * Math.cos(a)} y1={300 + r1 * Math.sin(a)}
              x2={300 + r2 * Math.cos(a)} y2={300 + r2 * Math.sin(a)}
              stroke={isMajor ? '#B8CED8' : '#6A8A9A'}
              strokeWidth={isMajor ? 2 : 0.8}
            />
          )
        })}
        {/* Major numbers */}
        {majorTicks.map((_, i) => {
          const a = (i * 30 - 90) * Math.PI / 180
          const r = 184
          return (
            <text key={i}
              x={300 + r * Math.cos(a)} y={300 + r * Math.sin(a)}
              textAnchor="middle" dominantBaseline="central"
              fontSize="10" fill="#8AAABB" fontFamily="monospace" fontWeight="600"
            >{String(i === 0 ? 12 : i).padStart(2, '0')}</text>
          )
        })}
        {/* Bolt holes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * 45) * Math.PI / 180
          return (
            <circle key={i}
              cx={300 + 230 * Math.cos(a)} cy={300 + 230 * Math.sin(a)}
              r="4" fill="none" stroke="#5A7A8A" strokeWidth="1.5" />
          )
        })}
      </g>

      {/* Counter-rotating inner ring */}
      <g ref={innerRef}>
        <circle cx="300" cy="300" r="150" fill="none" stroke="rgba(100,150,170,0.25)" strokeWidth="1.5" />
        {Array.from({ length: 32 }).map((_, i) => {
          const a = (i * 11.25) * Math.PI / 180
          return (
            <line key={i}
              x1={300 + 142 * Math.cos(a)} y1={300 + 142 * Math.sin(a)}
              x2={300 + 150 * Math.cos(a)} y2={300 + 150 * Math.sin(a)}
              stroke="rgba(140,180,200,0.3)" strokeWidth="1" />
          )
        })}
        {/* Inner gear teeth */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * 15) * Math.PI / 180
          const a1 = ((i + 0.3) * 15) * Math.PI / 180
          return (
            <path key={i}
              d={`M ${300 + 120 * Math.cos(a)} ${300 + 120 * Math.sin(a)} L ${300 + 132 * Math.cos(a)} ${300 + 132 * Math.sin(a)} L ${300 + 132 * Math.cos(a1)} ${300 + 132 * Math.sin(a1)} L ${300 + 120 * Math.cos(a1)} ${300 + 120 * Math.sin(a1)} Z`}
              fill="rgba(100,150,170,0.2)" stroke="rgba(140,180,200,0.25)" strokeWidth="0.5"
            />
          )
        })}
      </g>

      {/* Center disc */}
      <circle cx="300" cy="300" r="108" fill="url(#centerGlow)" />
      <circle cx="300" cy="300" r="108" fill="none" stroke="rgba(140,180,200,0.2)" strokeWidth="1" />
      <circle cx="300" cy="300" r="100" fill="rgba(10,16,24,0.9)" />
      <circle cx="300" cy="300" r="100" fill="none" stroke="url(#steelInner)" strokeWidth="3" />

      {/* Center content */}
      <text x="300" y="276" textAnchor="middle" fontSize="13" fontWeight="900"
        fill="#C8D8E4" fontFamily="Inter,sans-serif" letterSpacing="6">BES</text>
      <text x="300" y="297" textAnchor="middle" fontSize="13" fontWeight="900"
        fill="url(#steelRing)" fontFamily="Inter,sans-serif" letterSpacing="4">SAIMAN</text>
      <line x1="265" y1="305" x2="335" y2="305" stroke="#3A5A70" strokeWidth="1" />
      <text x="300" y="318" textAnchor="middle" fontSize="6.5" fill="#5A7A90"
        fontFamily="monospace" letterSpacing="3">GROUP</text>

      {/* Center dot */}
      <circle cx="300" cy="300" r="6" fill="#8AAABB" />
      <circle cx="300" cy="300" r="3" fill="#C8D8E4" filter="url(#glow)" />

      {/* Cross hairs */}
      <line x1="300" y1="200" x2="300" y2="216" stroke="#3A5A70" strokeWidth="1" />
      <line x1="300" y1="384" x2="300" y2="400" stroke="#3A5A70" strokeWidth="1" />
      <line x1="200" y1="300" x2="216" y2="300" stroke="#3A5A70" strokeWidth="1" />
      <line x1="384" y1="300" x2="400" y2="300" stroke="#3A5A70" strokeWidth="1" />
    </svg>
  )
}

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
    const t = setTimeout(() => { raf.current = requestAnimationFrame(tick) }, 500)
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current) }
  }, [to])
  return <>{val}{suffix}</>
}

const cats = [
  { code: 'HT-FURN', name: 'Высокотемп. печи', spec: '≤ 1800°C' },
  { code: 'BALL-ML', name: 'Шаровые мельницы', spec: '650 rpm' },
  { code: 'VAC-BOX', name: 'Вакуумные боксы', spec: '< 0.1 ppm' },
  { code: 'E-SPIN', name: 'Электроспиннинг', spec: '≤ 50 kV' },
]

export default function StyleDPage() {
  const [hovCat, setHovCat] = useState<number | null>(null)

  return (
    <div className="relative overflow-hidden" style={{ minHeight: 'calc(100vh - 60px)', background: '#05090E' }}>
      {/* Steel texture overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(140,180,200,0.012) 2px, rgba(140,180,200,0.012) 4px)',
      }} />
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(70,110,140,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(70,110,140,0.06) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 60% at 70% 40%, rgba(70,110,140,0.08) 0%, transparent 70%)',
      }} />

      {/* Scan line */}
      <div className="absolute left-0 right-0 pointer-events-none" style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(140,180,200,0.4) 30%, rgba(180,210,230,0.6) 50%, rgba(140,180,200,0.4) 70%, transparent)',
        boxShadow: '0 0 10px rgba(140,180,200,0.2)',
        animation: 'scan-down 14s linear infinite', zIndex: 4,
      }} />

      {/* Corner marks */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M0 40 L0 0 L40 0" fill="none" stroke="rgba(140,180,200,0.25)" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="absolute top-6 right-6 pointer-events-none">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M40 40 L40 0 L0 0" fill="none" stroke="rgba(140,180,200,0.25)" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="absolute bottom-6 left-6 pointer-events-none">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M0 0 L0 40 L40 40" fill="none" stroke="rgba(140,180,200,0.15)" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="absolute bottom-6 right-6 pointer-events-none">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M40 0 L40 40 L0 40" fill="none" stroke="rgba(140,180,200,0.15)" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center" style={{ minHeight: '80vh' }}>

          {/* Left text */}
          <div className="order-2 lg:order-1" style={{ animation: 'fade-up 0.7s ease both' }}>
            {/* Label */}
            <div className="flex items-center gap-3 mb-10">
              <div style={{ height: 1, width: 32, background: 'linear-gradient(90deg, transparent, rgba(140,180,200,0.5))' }} />
              <span className="text-xs font-mono tracking-[0.3em] uppercase" style={{ color: '#4A6A80' }}>
                Precision Engineering
              </span>
              <div style={{ height: 1, width: 32, background: 'linear-gradient(90deg, rgba(140,180,200,0.5), transparent)' }} />
            </div>

            {/* Main heading */}
            <div className="mb-8">
              <h1 style={{
                fontSize: 'clamp(56px, 8vw, 100px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 0.9,
                background: 'linear-gradient(160deg, #C8D8E4 0%, #8AAABB 30%, #E4EEF4 55%, #7090A8 80%, #B0C8D8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                BES<br />SAIMAN
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <div style={{ height: 2, width: 40, background: 'linear-gradient(90deg, rgba(140,180,200,0.6), transparent)' }} />
                <span className="text-xs font-mono tracking-[0.25em] uppercase" style={{ color: '#3A5A70' }}>GROUP</span>
              </div>
            </div>

            <p className="text-sm mb-10 max-w-md leading-loose" style={{ color: '#4A6A80', borderLeft: '2px solid rgba(140,180,200,0.15)', paddingLeft: 16 }}>
              Высокотехнологичное лабораторное оборудование для науки, исследований и промышленного производства Казахстана.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-12">
              <Link href="/catalog"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #2A4A60 0%, #1A3040 100%)',
                  border: '1px solid rgba(140,180,200,0.25)',
                  color: '#C8D8E4',
                  borderRadius: 6,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(140,180,200,0.1)',
                }}>
                Каталог оборудования
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <Link href="/contacts"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(140,180,200,0.2)',
                  color: '#7090A8',
                  borderRadius: 6,
                }}>
                Запросить КП
              </Link>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3">
              {cats.map((cat, i) => (
                <div key={i}
                  onMouseEnter={() => setHovCat(i)}
                  onMouseLeave={() => setHovCat(null)}
                  className="p-4 rounded-lg cursor-pointer transition-all duration-200"
                  style={{
                    background: hovCat === i ? 'rgba(140,180,200,0.07)' : 'rgba(140,180,200,0.03)',
                    border: `1px solid ${hovCat === i ? 'rgba(140,180,200,0.2)' : 'rgba(140,180,200,0.08)'}`,
                  }}>
                  <div className="text-[9px] font-mono tracking-[0.2em] mb-1.5" style={{ color: '#3A5A6A' }}>{cat.code}</div>
                  <div className="text-xs font-semibold mb-1" style={{ color: hovCat === i ? '#A0C0D0' : '#6A8A9A' }}>{cat.name}</div>
                  <div className="text-xs font-mono font-bold" style={{ color: hovCat === i ? '#C8D8E4' : '#4A6A80' }}>{cat.spec}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dial */}
          <div className="order-1 lg:order-2 flex items-center justify-center" style={{ animation: 'fade-up 0.5s ease both' }}>
            <div className="relative w-full" style={{ maxWidth: 500 }}>
              <PrecisionDial />
              {/* Stats around dial */}
              <div className="absolute top-1/2 -left-4 -translate-y-1/2 text-right hidden xl:block">
                <div className="text-3xl font-black" style={{
                  background: 'linear-gradient(135deg, #8AAABB, #C8D8E4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  <Counter to={200} suffix="+" />
                </div>
                <div className="text-xs font-mono" style={{ color: '#3A5A70' }}>позиций</div>
              </div>
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 hidden xl:block">
                <div className="text-3xl font-black" style={{
                  background: 'linear-gradient(135deg, #8AAABB, #C8D8E4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  <Counter to={12} suffix="" />
                </div>
                <div className="text-xs font-mono" style={{ color: '#3A5A70' }}>лет опыта</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="rounded-lg px-6 py-4 flex flex-wrap items-center justify-between gap-4"
          style={{
            background: 'rgba(140,180,200,0.04)',
            border: '1px solid rgba(140,180,200,0.1)',
            marginTop: 8,
          }}>
          <div className="flex flex-wrap gap-6">
            {[['T_MAX', '1800°C'], ['RPM', '650'], ['VAC', '<10⁻³ мбар'], ['HV', '50kV']].map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider" style={{ color: '#2A4A60' }}>{k}</span>
                <span className="text-xs font-mono font-bold" style={{ color: '#7090A8' }}>{v}</span>
              </div>
            ))}
          </div>
          <Link href="/contacts" className="text-xs font-mono font-semibold px-4 py-2 rounded transition-colors"
            style={{ color: '#8AAABB', border: '1px solid rgba(140,180,200,0.15)' }}>
            CONTACT →
          </Link>
        </div>
      </div>
    </div>
  )
}
