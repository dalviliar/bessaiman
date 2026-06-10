'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const VacuumChamber3D = dynamic(() => import('@/components/VacuumChamber3D'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(26,74,138,0.15)', borderTopColor: '#1A4A8A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  ),
})

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

const specs = [
  { label: 'Высокотемп. печи', value: '≤ 1800°C', code: 'HT' },
  { label: 'Шаровые мельницы', value: '650 rpm', code: 'BM' },
  { label: 'Вакуумные боксы', value: '< 0.1 ppm', code: 'VB' },
  { label: 'Электроспиннинг', value: '≤ 50 kV', code: 'ES' },
]

export default function StyleHPage() {
  const [hov, setHov] = useState<number | null>(null)

  return (
    <div className="relative overflow-hidden" style={{ minHeight: '100vh', background: '#EDF2F8' }}>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

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
          {['Каталог', 'О компании', 'Проекты', 'Контакты'].map(item => (
            <a key={item} href="#" className="font-mono text-[10px] transition-colors hover:opacity-80" style={{ color: 'rgba(26,74,138,0.6)' }}>{item}</a>
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center" style={{ minHeight: '80vh' }}>

          {/* LEFT */}
          <div style={{ animation: 'fade-up 0.6s ease both' }}>
            <div className="flex items-center gap-3 mb-6">
              <div style={{ width: 28, height: 2, background: '#1A4A8A', opacity: 0.5 }} />
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: '#3A6AAA' }}>
                Научно-производственное предприятие
              </span>
            </div>

            <div className="mb-1">
              <h1 style={{ fontSize: 'clamp(52px, 7.5vw, 98px)', fontWeight: 900, color: '#0A1E3A', letterSpacing: '-0.04em', lineHeight: 0.92 }}>
                ОТ ИДЕИ
              </h1>
            </div>
            <div className="mb-6">
              <h1 style={{ fontSize: 'clamp(52px, 7.5vw, 98px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.92, color: '#1A4A8A' }}>
                ДО ПУСКА
              </h1>
              <div className="flex items-center gap-2 mt-3">
                <div style={{ flex: 1, height: 1, background: '#1A4A8A', opacity: 0.25 }} />
                <span className="font-mono text-[9px] tracking-[0.2em]" style={{ color: 'rgba(26,74,138,0.45)' }}>BES SAIMAN GROUP</span>
                <div style={{ flex: 1, height: 1, background: '#1A4A8A', opacity: 0.25 }} />
              </div>
            </div>

            <p className="text-sm mb-8 leading-relaxed" style={{ color: '#3A5A7A', borderLeft: '3px solid rgba(26,74,138,0.25)', paddingLeft: 14 }}>
              Проектируем и производим высокотемпературные печи, шаровые мельницы, вакуумные камеры и установки электроспиннинга — от технического задания до запуска.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/catalog"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-mono font-semibold transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: '#1A4A8A', color: '#EDF2F8', boxShadow: '3px 3px 0 rgba(26,74,138,0.2)' }}>
                ▶ ЗАКАЗАТЬ ПРОЕКТ
              </Link>
              <Link href="/catalog"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-mono font-semibold transition-all duration-200 hover:-translate-y-0.5"
                style={{ color: '#1A4A8A', border: '1px solid rgba(26,74,138,0.4)', boxShadow: '3px 3px 0 rgba(26,74,138,0.1)' }}>
                НАШИ ОБЪЕКТЫ
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

          {/* RIGHT — Real Three.js 3D chamber in blueprint colors */}
          <div className="flex items-center justify-center">
            <div style={{ width: '100%', maxWidth: 560 }}>
              <VacuumChamber3D dark={false} theme="blueprint" />
            </div>
          </div>
        </div>

        {/* Bottom stats bar */}
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
