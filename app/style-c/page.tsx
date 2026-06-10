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
    const t = setTimeout(() => { raf.current = requestAnimationFrame(tick) }, 400)
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current) }
  }, [to])
  return <>{val}{suffix}</>
}

function AnimatedDots() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="dotFade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1565C0" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#1565C0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotFade)" />
        {Array.from({ length: 16 }).map((_, i) =>
          Array.from({ length: 10 }).map((_, j) => (
            <circle
              key={`${i}-${j}`}
              cx={`${i * 6.67}%`}
              cy={`${j * 11.1}%`}
              r="1.2"
              fill="#1565C0"
              fillOpacity={((i + j) % 3 === 0) ? 0.12 : 0.05}
            />
          ))
        )}
        {/* Diagonal lines */}
        <line x1="0" y1="60%" x2="100%" y2="0" stroke="#1565C0" strokeWidth="0.5" strokeOpacity="0.08" />
        <line x1="0" y1="100%" x2="100%" y2="40%" stroke="#0EA5E9" strokeWidth="0.3" strokeOpacity="0.05" />
        {/* Large circle */}
        <circle cx="80%" cy="15%" r="220" fill="none" stroke="#1565C0" strokeWidth="0.8" strokeOpacity="0.06" />
        <circle cx="80%" cy="15%" r="160" fill="none" stroke="#0EA5E9" strokeWidth="0.5" strokeOpacity="0.04" />
        {/* Corner marks */}
        <path d="M30 30 L30 65 M30 30 L65 30" stroke="#1565C0" strokeWidth="2" strokeOpacity="0.2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}

const cats = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="6" y="10" width="16" height="14" rx="2" stroke="#1565C0" strokeWidth="1.5" />
        <rect x="10" y="6" width="8" height="6" rx="1" stroke="#1565C0" strokeWidth="1.5" />
        <line x1="9" y1="17" x2="19" y2="17" stroke="#1565C0" strokeWidth="1.2" />
        <line x1="9" y1="20" x2="19" y2="20" stroke="#1565C0" strokeWidth="1.2" />
        <line x1="14" y1="10" x2="14" y2="24" stroke="#0EA5E9" strokeWidth="1" strokeOpacity="0.5" />
      </svg>
    ),
    name: 'Высокотемпературные печи',
    spec: 'до 1800°C',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="8" stroke="#1565C0" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="3" fill="#1565C0" fillOpacity="0.2" stroke="#0EA5E9" strokeWidth="1.2" />
        {[0,60,120,180,240,300].map((deg, i) => (
          <circle key={i}
            cx={14 + 5.5 * Math.cos(deg * Math.PI / 180)}
            cy={14 + 5.5 * Math.sin(deg * Math.PI / 180)}
            r="1.5" fill="#1565C0" fillOpacity="0.6" />
        ))}
      </svg>
    ),
    name: 'Шаровые мельницы',
    spec: '650 об/мин',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="8" width="20" height="14" rx="3" stroke="#1565C0" strokeWidth="1.5" />
        <circle cx="14" cy="15" r="4" stroke="#0EA5E9" strokeWidth="1.2" />
        <circle cx="14" cy="15" r="1.5" fill="#1565C0" fillOpacity="0.4" />
        <line x1="8" y1="8" x2="8" y2="22" stroke="#1565C0" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="20" y1="8" x2="20" y2="22" stroke="#1565C0" strokeWidth="1" strokeOpacity="0.4" />
        <path d="M4 12 Q0 15 4 18" stroke="#0EA5E9" strokeWidth="1" fill="none" strokeOpacity="0.5" />
        <path d="M24 12 Q28 15 24 18" stroke="#0EA5E9" strokeWidth="1" fill="none" strokeOpacity="0.5" />
      </svg>
    ),
    name: 'Вакуумные боксы',
    spec: '< 0.1 ppm O₂',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <line x1="4" y1="14" x2="10" y2="14" stroke="#1565C0" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="18" y1="14" x2="24" y2="14" stroke="#1565C0" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="14" cy="14" r="5" stroke="#0EA5E9" strokeWidth="1.5" />
        <path d="M10 8 Q14 4 18 8" stroke="#1565C0" strokeWidth="1.2" fill="none" strokeOpacity="0.5" />
        <path d="M10 20 Q14 24 18 20" stroke="#1565C0" strokeWidth="1.2" fill="none" strokeOpacity="0.5" />
        <circle cx="14" cy="14" r="2" fill="#1565C0" fillOpacity="0.3" />
        <line x1="14" y1="4" x2="14" y2="8" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="20" x2="14" y2="24" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    name: 'Электроспиннинг',
    spec: 'до 50 кВ',
  },
]

export default function StyleCPage() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div className="relative overflow-hidden" style={{ minHeight: 'calc(100vh - 60px)', background: '#F6F8FB' }}>
      <AnimatedDots />
      <div style={{ height: 3, background: 'linear-gradient(90deg, #1565C0 0%, #0EA5E9 50%, #1565C0 100%)' }} />

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center" style={{ minHeight: '72vh' }}>

          {/* Left */}
          <div style={{ animation: 'fade-up 0.7s ease both' }}>
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-mono font-semibold tracking-widest uppercase"
              style={{ background: '#E8F0FE', color: '#1565C0', border: '1px solid #BBDEFB' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0EA5E9', display: 'inline-block', animation: 'ring-breathe 2s ease infinite' }} />
              Казахстан · Лабораторное оборудование
            </div>

            <div className="mb-6">
              <h1 className="font-black leading-none" style={{ fontSize: 'clamp(52px, 7.5vw, 92px)', color: '#0D1B2A', letterSpacing: '-0.03em', lineHeight: 0.95 }}>
                BES
              </h1>
              <h1 className="font-black leading-none" style={{
                fontSize: 'clamp(52px, 7.5vw, 92px)',
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
                background: 'linear-gradient(130deg, #1565C0 0%, #0284C7 50%, #38BDF8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                SAIMAN
              </h1>
            </div>

            <div style={{ width: 48, height: 3, background: 'linear-gradient(90deg, #1565C0, #0EA5E9)', borderRadius: 2, marginBottom: 24 }} />

            <p className="text-base mb-10 max-w-md leading-relaxed" style={{ color: '#4A6070', lineHeight: 1.75 }}>
              Передовые решения для науки и промышленности. Высокотемпературные печи, мельницы, вакуумное оборудование, электроспиннинг.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/catalog"
                className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-sm rounded-lg text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #1565C0, #1976D2)', boxShadow: '0 4px 20px rgba(21,101,192,0.3)' }}>
                Каталог оборудования
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <Link href="/contacts"
                className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-sm rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                style={{ color: '#1565C0', background: '#fff', border: '1.5px solid #BBDEFB', boxShadow: '0 2px 8px rgba(21,101,192,0.08)' }}>
                Запросить КП
              </Link>
            </div>
          </div>

          {/* Right — Stats */}
          <div className="hidden lg:block" style={{ animation: 'fade-up 0.9s ease both' }}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { v: 200, s: '+', l: 'Позиций', sub: 'в каталоге' },
                { v: 12, s: '', l: 'Лет опыта', sub: 'на рынке КЗ' },
                { v: 98, s: '%', l: 'Удовлетворённость', sub: 'клиентов' },
                { v: 50, s: '+', l: 'Организаций', sub: 'работают с нами' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default"
                  style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(21,101,192,0.05)' }}>
                  <div className="font-black text-4xl mb-1" style={{
                    background: 'linear-gradient(135deg, #1565C0, #0EA5E9)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    <Counter to={s.v} suffix={s.s} />
                  </div>
                  <div className="font-semibold text-sm mb-0.5" style={{ color: '#1A2A3A' }}>{s.l}</div>
                  <div className="text-xs" style={{ color: '#94A3B8' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #E2E8F0 20%, #E2E8F0 80%, transparent)', margin: '0 0 40px' }} />

        {/* Categories */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg tracking-wide" style={{ color: '#0D1B2A' }}>
              Направления
            </h2>
            <Link href="/catalog" className="text-sm font-semibold flex items-center gap-1 group" style={{ color: '#1565C0' }}>
              Весь каталог
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cats.map((cat, i) => (
              <div key={i}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onClick={() => window.location.href = '/catalog'}
                className="rounded-xl p-5 cursor-pointer transition-all duration-200"
                style={{
                  background: active === i ? '#fff' : '#fff',
                  border: `1px solid ${active === i ? '#BBDEFB' : '#E8EEF4'}`,
                  boxShadow: active === i ? '0 8px 24px rgba(21,101,192,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
                  transform: active === i ? 'translateY(-4px)' : 'none',
                }}>
                <div className="mb-4 p-2.5 rounded-lg inline-flex" style={{
                  background: active === i ? '#E8F0FE' : '#F1F5FB',
                  transition: 'background 0.2s',
                }}>
                  {cat.icon}
                </div>
                <div className="font-semibold text-sm leading-snug mb-3" style={{ color: '#1A2A3A' }}>{cat.name}</div>
                <div className="text-xs font-mono font-bold px-2.5 py-1 rounded-md inline-block"
                  style={{ background: active === i ? '#DBEAFE' : '#EEF2FA', color: '#1565C0' }}>
                  {cat.spec}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spec bar */}
        <div className="rounded-xl px-8 py-5 flex flex-wrap gap-6 items-center justify-between"
          style={{ background: '#0D1B2A' }}>
          {[['Печи', 'до 1800°C'], ['Мельницы', '650 об/мин'], ['Давление', '< 10⁻³ мбар'], ['Напряжение', '1–50 кВ'], ['Гарантия', '12 мес']].map(([k, v]) => (
            <div key={k} className="flex items-center gap-3">
              <span className="text-xs font-mono" style={{ color: '#4A6A88' }}>{k}</span>
              <span className="text-sm font-bold font-mono" style={{ color: '#38BDF8' }}>{v}</span>
            </div>
          ))}
          <Link href="/contacts" className="text-xs font-semibold px-4 py-2 rounded-lg"
            style={{ background: 'rgba(14,165,233,0.1)', color: '#38BDF8', border: '1px solid rgba(14,165,233,0.2)' }}>
            Связаться →
          </Link>
        </div>
      </div>
    </div>
  )
}
