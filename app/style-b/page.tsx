'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const VacuumChamber3D = dynamic(() => import('@/components/VacuumChamber3D'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 48, height: 48, border: '3px solid rgba(14,165,233,0.18)', borderTopColor: '#0EA5E9', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  ),
})

function buildGear(cx: number, cy: number, R: number, r: number, n: number): string {
  let d = ''
  for (let i = 0; i < n; i++) {
    const step = (2 * Math.PI) / n
    const a0 = i * step, a1 = a0 + step * 0.25, a2 = a0 + step * 0.75, a3 = a0 + step
    d += `${i === 0 ? 'M' : 'L'}${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} `
    d += `L${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)} `
    d += `L${cx + R * Math.cos(a2)},${cy + R * Math.sin(a2)} `
    d += `L${cx + r * Math.cos(a3)},${cy + r * Math.sin(a3)} `
  }
  return d + 'Z'
}

const G1 = buildGear(310, 310, 245, 190, 22)
const G2 = buildGear(200, 200, 155, 118, 16)
const G3 = buildGear(110, 110, 88, 66, 12)

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const raf = useRef(0)
  useEffect(() => {
    const S = performance.now(), D = 2200
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

const categories = [
  {
    code: 'HT',
    title: 'Высокотемп. печи',
    desc: 'Муфельные и трубчатые печи до 1800°C, контроллеры температуры, нагревательные элементы',
    stat: '40+ моделей',
  },
  {
    code: 'BM',
    title: 'Шаровые мельницы',
    desc: 'Планетарные и вибрационные мельницы, мелющие тела, сменные ёмкости из разных материалов',
    stat: '30+ моделей',
  },
  {
    code: 'IND',
    title: 'Индивидуальные разработки',
    desc: 'Вакуумные камеры, электроспиннинг, нестандартное оборудование по техническому заданию',
    stat: 'под заказ',
  },
]

export default function StyleBPage() {
  const [hovCard, setHovCard] = useState<string | null>(null)

  return (
    <div className="relative overflow-hidden" style={{ minHeight: '100vh', background: '#0A1520', color: '#C8D8E8', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        @keyframes gear-spin     { to { transform: rotate(360deg)  } }
        @keyframes gear-spin-rev { to { transform: rotate(-360deg) } }
        @keyframes scan-down     { 0% { top: -2px } 100% { top: 100% } }
        @keyframes spin          { to { transform: rotate(360deg)  } }
        @keyframes pulse-dot     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        @keyframes fade-up       { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        @keyframes beam-slide    {
          0%   { transform: translateX(-100%) skewX(-20deg); opacity: 0 }
          15%  { opacity: 1 }
          85%  { opacity: 1 }
          100% { transform: translateX(400%) skewX(-20deg); opacity: 0 }
        }
      `}</style>

      {/* ── Blueprint grids ─────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(30,92,200,0.11) 1px,transparent 1px),linear-gradient(90deg,rgba(30,92,200,0.11) 1px,transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(30,92,200,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(30,92,200,0.04) 1px,transparent 1px)',
        backgroundSize: '12px 12px',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 85% 55% at 62% 38%, rgba(14,165,233,0.07) 0%, transparent 70%)',
      }} />

      {/* ── Gear decorations ────────────────────────────────────── */}
      <svg className="absolute pointer-events-none"
        style={{ top: -80, right: -80, width: 640, height: 640, opacity: 0.11,
          animation: 'gear-spin 36s linear infinite', transformOrigin: '320px 320px' }}
        viewBox="0 0 640 640">
        <defs>
          <filter id="g1glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <path d={G1} fill="#1E62A8" filter="url(#g1glow)" />
        <circle cx="310" cy="310" r="122" fill="#0A1520" />
        {[0,40,80,120,160,200,240,280,320].map(deg => (
          <line key={deg} x1="310" y1="310"
            x2={310 + 112 * Math.cos(deg * Math.PI / 180)}
            y2={310 + 112 * Math.sin(deg * Math.PI / 180)}
            stroke="#2A72D8" strokeWidth="9" />
        ))}
        <circle cx="310" cy="310" r="35" fill="#1E62A8" />
        <circle cx="310" cy="310" r="15" fill="#0A1520" />
      </svg>

      <svg className="absolute pointer-events-none"
        style={{ bottom: -55, left: -55, width: 420, height: 420, opacity: 0.13,
          animation: 'gear-spin-rev 24s linear infinite', transformOrigin: '210px 210px' }}
        viewBox="0 0 420 420">
        <path d={G2} fill="#1A4E94" />
        <circle cx="200" cy="200" r="78" fill="#0A1520" />
        {[0,90,180,270].map(deg => (
          <line key={deg} x1="200" y1="200"
            x2={200 + 70 * Math.cos(deg * Math.PI / 180)}
            y2={200 + 70 * Math.sin(deg * Math.PI / 180)}
            stroke="#2A6ED8" strokeWidth="8" />
        ))}
        <circle cx="200" cy="200" r="25" fill="#1A5AAA" />
        <circle cx="200" cy="200" r="10" fill="#0A1520" />
      </svg>

      <svg className="absolute pointer-events-none"
        style={{ top: 140, left: 20, width: 190, height: 190, opacity: 0.10,
          animation: 'gear-spin 15s linear infinite', transformOrigin: '95px 95px' }}
        viewBox="0 0 220 220">
        <path d={G3} fill="#2A6ED8" />
        <circle cx="110" cy="110" r="43" fill="#0A1520" />
        {[0,120,240].map(deg => (
          <line key={deg} x1="110" y1="110"
            x2={110 + 37 * Math.cos(deg * Math.PI / 180)}
            y2={110 + 37 * Math.sin(deg * Math.PI / 180)}
            stroke="#3A80E8" strokeWidth="5" />
        ))}
        <circle cx="110" cy="110" r="14" fill="#2A6ED8" />
        <circle cx="110" cy="110" r="5" fill="#0A1520" />
      </svg>

      {/* ── Scan line ───────────────────────────────────────────── */}
      <div className="absolute left-0 right-0 pointer-events-none" style={{
        height: 1,
        background: 'linear-gradient(90deg,transparent,rgba(14,165,233,0.55) 30%,rgba(0,210,255,0.9) 50%,rgba(14,165,233,0.55) 70%,transparent)',
        boxShadow: '0 0 22px rgba(0,210,255,0.4)',
        animation: 'scan-down 13s linear infinite', zIndex: 4,
      }} />

      {/* ── Corner brackets ─────────────────────────────────────── */}
      {(['top-5 left-5 border-l border-t','top-5 right-5 border-r border-t',
         'bottom-5 left-5 border-l border-b','bottom-5 right-5 border-r border-b'] as const
      ).map(cls => (
        <div key={cls} className={`absolute w-7 h-7 pointer-events-none ${cls}`}
          style={{ borderColor: 'rgba(14,165,233,0.25)', borderWidth: '1.5px' }} />
      ))}

      {/* ── Corner labels ───────────────────────────────────────── */}
      <div className="absolute top-10 left-10 pointer-events-none font-mono text-[8px] tracking-widest" style={{ color: 'rgba(14,165,233,0.3)' }}>PREC: ±0.001 MM</div>
      <div className="absolute top-10 right-10 pointer-events-none font-mono text-[8px] tracking-widest" style={{ color: 'rgba(14,165,233,0.3)' }}>ISO 9001 CERTIFIED</div>
      <div className="absolute bottom-5 left-10 pointer-events-none flex items-center gap-1.5" style={{ zIndex: 20 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', animation: 'pulse-dot 2.5s ease infinite' }} />
        <span className="font-mono text-[8px] tracking-widest" style={{ color: 'rgba(14,165,233,0.3)' }}>SYS: ONLINE</span>
      </div>

      {/* ══ NAVBAR ══════════════════════════════════════════════════ */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-4"
        style={{ borderBottom: '1px solid rgba(14,165,233,0.1)', background: 'rgba(10,21,32,0.6)', backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center gap-3">
          <svg width="32" height="36" viewBox="0 0 32 36">
            <polygon points="16,2 30,10 30,26 16,34 2,26 2,10" fill="none" stroke="#0EA5E9" strokeWidth="1.5" />
            <text x="16" y="22" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0EA5E9" fontFamily="Inter,sans-serif">B</text>
          </svg>
          <div>
            <div className="font-black text-sm tracking-[0.12em]" style={{ color: '#C8D8E8' }}>BES SAIMAN</div>
            <div className="text-[9px] tracking-[0.28em] font-light" style={{ color: 'rgba(14,165,233,0.55)' }}>GROUP</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Главная','Каталог','О компании','Проекты'].map(item => (
            <a key={item} href="#" className="text-sm font-medium transition-colors hover:text-white" style={{ color: 'rgba(150,190,220,0.45)' }}>{item}</a>
          ))}
        </div>

        <Link href="/contacts" className="relative overflow-hidden px-5 py-2.5 font-bold text-sm transition-all"
          style={{ background: 'linear-gradient(135deg,#1260C0,#0EA5E9)', color: 'white', letterSpacing: '0.06em', boxShadow: '0 0 24px rgba(14,165,233,0.28)' }}>
          <span className="absolute inset-y-0 w-12 pointer-events-none"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)', animation: 'beam-slide 3s ease-in-out infinite' }} />
          КОНТАКТЫ
        </Link>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════ */}
      <section className="relative z-10" style={{ minHeight: '82vh' }}>
        <div className="w-full max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-6 items-center py-12">

          {/* Left */}
          <div className="flex flex-col gap-6" style={{ animation: 'fade-up 0.6s ease both' }}>

            {/* Badge */}
            <div className="inline-flex items-center gap-3 w-fit px-4 py-2"
              style={{ border: '1px solid rgba(14,165,233,0.2)', background: 'rgba(14,165,233,0.04)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D2FF', boxShadow: '0 0 8px #00D2FF', animation: 'pulse-dot 2s ease infinite' }} />
              <span className="text-[10px] font-mono tracking-[0.22em]" style={{ color: 'rgba(14,165,233,0.65)' }}>НАУЧНО-ПРОИЗВОДСТВЕННОЕ ПРЕДПРИЯТИЕ</span>
            </div>

            {/* Headline */}
            <h1 className="font-black select-none" style={{ fontSize: 'clamp(2.9rem, 5.8vw, 4.6rem)', letterSpacing: '-0.025em', lineHeight: 1.0 }}>
              <span style={{ display: 'block', color: '#D8E8F4' }}>ОТ ИДЕИ</span>
              <span style={{
                display: 'block',
                background: 'linear-gradient(90deg,#1878D8 0%,#0EA5E9 40%,#00D2FF 65%,#38BDF8 100%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>ДО ПУСКА</span>
            </h1>

            {/* Description */}
            <p className="text-sm leading-[1.85] max-w-md"
              style={{ color: 'rgba(140,185,220,0.6)', borderLeft: '2px solid rgba(14,165,233,0.2)', paddingLeft: 14 }}>
              Проектируем и производим высокотемпературные печи, шаровые мельницы, вакуумные камеры и установки электроспиннинга — от технического задания до запуска в эксплуатацию.
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-4 flex-wrap">
              <Link href="/catalog" className="relative overflow-hidden px-7 py-3.5 font-bold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#1260C0,#0EA5E9)', color: 'white', letterSpacing: '0.07em', boxShadow: '0 6px 28px rgba(14,165,233,0.32)' }}>
                <span className="absolute inset-y-0 w-12 pointer-events-none"
                  style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)', animation: 'beam-slide 4s 1s ease-in-out infinite' }} />
                СМОТРЕТЬ КАТАЛОГ
              </Link>
              <Link href="/contacts"
                className="px-7 py-3.5 font-bold text-sm transition-all hover:border-sky-400 hover:-translate-y-0.5"
                style={{ border: '1px solid rgba(14,165,233,0.22)', color: 'rgba(140,185,220,0.7)', letterSpacing: '0.07em' }}>
                СВЯЗАТЬСЯ С НАМИ
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-stretch gap-0 pt-2">
              {[['12+','лет на рынке'],['200+','позиций'],['50+','партнёров']].map(([num, label], i) => (
                <div key={label} className="flex flex-col px-6 py-3 text-center"
                  style={{ borderLeft: i === 0 ? 'none' : '1px solid rgba(14,165,233,0.12)' }}>
                  <span className="font-black text-2xl" style={{
                    background: 'linear-gradient(135deg,#1878D8,#00D2FF)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>{num}</span>
                  <span className="text-[10px] font-mono tracking-wider mt-0.5" style={{ color: 'rgba(80,140,185,0.5)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Three.js 3D */}
          <div className="flex justify-center items-center" style={{ animation: 'fade-up 0.5s 0.1s ease both' }}>
            <div style={{ width: '100%', maxWidth: 560 }}>
              <VacuumChamber3D dark={true} />
            </div>
          </div>
        </div>
      </section>

      {/* ══ SPEC STRIP ══════════════════════════════════════════════ */}
      <div className="relative z-10" style={{ borderTop: '1px solid rgba(14,165,233,0.08)', borderBottom: '1px solid rgba(14,165,233,0.06)', background: 'rgba(6,12,22,0.7)' }}>
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between flex-wrap gap-3">
          <span className="text-[10px] font-mono tracking-[0.18em]" style={{ color: 'rgba(30,92,168,0.4)' }}>КАТАЛОГ ПРОДУКЦИИ</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(14,165,233,0.06)', margin: '0 16px' }} />
          {['T: 25°C — 1800°C', '±0.001 MM PRECISION', 'KAZAKHSTAN · ALMATY', 'ISO 9001'].map(t => (
            <span key={t} className="text-[9px] font-mono tracking-widest" style={{ color: 'rgba(14,165,233,0.25)' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ══ CATEGORIES ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-14 px-8">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <div className="flex items-center gap-4 mb-10">
            <div style={{ width: 36, height: 2, background: 'linear-gradient(90deg,#0EA5E9,transparent)' }} />
            <span className="text-[10px] font-mono tracking-[0.24em]" style={{ color: 'rgba(14,165,233,0.55)' }}>ЛИНЕЙКА ПРОДУКТОВ</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(14,165,233,0.07)' }} />
            <Link href="/catalog" className="text-[10px] font-mono tracking-widest transition-colors hover:text-sky-400"
              style={{ color: 'rgba(14,165,233,0.35)' }}>
              ВЕСЬ КАТАЛОГ →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <div key={cat.code}
                onMouseEnter={() => setHovCard(cat.code)}
                onMouseLeave={() => setHovCard(null)}
                className="rounded-xl p-6 flex flex-col gap-4 cursor-pointer transition-all duration-300"
                style={{
                  background: hovCard === cat.code ? 'rgba(14,165,233,0.055)' : 'rgba(255,255,255,0.022)',
                  border: `1px solid ${hovCard === cat.code ? 'rgba(14,165,233,0.32)' : 'rgba(14,165,233,0.09)'}`,
                  transform: hovCard === cat.code ? 'translateY(-5px)' : 'none',
                  boxShadow: hovCard === cat.code ? '0 16px 48px rgba(14,165,233,0.1)' : 'none',
                }}>

                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 flex items-center justify-center font-black text-sm font-mono"
                    style={{ background: 'rgba(14,165,233,0.09)', color: '#0EA5E9', border: '1px solid rgba(14,165,233,0.18)', borderRadius: 8 }}>
                    {cat.code}
                  </div>
                  <span className="text-[10px] font-mono px-3 py-1 rounded-full"
                    style={{ background: 'rgba(14,165,233,0.07)', color: 'rgba(14,165,233,0.6)', border: '1px solid rgba(14,165,233,0.12)' }}>
                    {cat.stat}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base mb-2" style={{ color: '#C8D8E8' }}>{cat.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(110,160,200,0.58)' }}>{cat.desc}</p>
                </div>

                <div className="flex items-center gap-2 mt-auto pt-2">
                  <span className="text-sm font-semibold transition-colors"
                    style={{ color: hovCard === cat.code ? '#0EA5E9' : 'rgba(14,165,233,0.45)' }}>
                    Смотреть каталог
                  </span>
                  <span style={{ color: 'rgba(14,165,233,0.45)', transform: hovCard === cat.code ? 'translateX(3px)' : 'none', transition: 'transform 0.2s' }}>→</span>
                </div>

                <div style={{ height: 1, background: `linear-gradient(90deg,${hovCard === cat.code ? '#0EA5E9' : 'rgba(14,165,233,0.3)'},transparent)`, opacity: hovCard === cat.code ? 0.6 : 0.2, transition: 'opacity 0.3s' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════ */}
      <footer className="relative z-10 py-4 px-8"
        style={{ borderTop: '1px solid rgba(14,165,233,0.07)', background: 'rgba(6,12,22,0.85)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', animation: 'pulse-dot 2.5s ease infinite' }} />
            <span className="font-mono text-[8px] tracking-widest" style={{ color: 'rgba(14,165,233,0.28)' }}>SYS: ONLINE</span>
          </div>
          <span className="font-black text-sm tracking-widest" style={{ color: 'rgba(140,185,220,0.25)' }}>BES SAIMAN GROUP</span>
          <span className="text-[10px] font-mono" style={{ color: 'rgba(70,120,165,0.28)' }}>© 2024 · Казахстан · +7 (956) 436-17-17</span>
        </div>
      </footer>
    </div>
  )
}
