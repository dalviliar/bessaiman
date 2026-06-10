'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const VacuumChamber3D = dynamic(() => import('@/components/VacuumChamber3D'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 48, height: 48, border: '3px solid #E2E8F0', borderTopColor: '#1565C0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  ),
})

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
    const t = setTimeout(() => { raf.current = requestAnimationFrame(tick) }, 400)
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current) }
  }, [to])
  return <>{val}{suffix}</>
}

const categories = [
  {
    code: 'SFM',
    title: 'Муфельные печи',
    spec: 'до 1800°C · 1–12 л',
    desc: 'Серийные муфельные печи с PID-контроллером. 6 объёмов камеры, 3 класса температур.',
    stat: '18 моделей',
    href: '/catalog?category=furnaces&type=S',
  },
  {
    code: 'SFTH',
    title: 'Трубчатые печи',
    spec: '1100–1200°C · 1–3 зоны',
    desc: 'Горизонтальные, вертикальные и мультипозиционные трубчатые печи. Диаметр 25–70 мм.',
    stat: '9 моделей',
    href: '/catalog?category=furnaces&type=S',
  },
  {
    code: 'SM',
    title: 'Шаровые мельницы',
    spec: 'до 650 об/мин',
    desc: 'Горизонтальные и планетарные шаровые мельницы для помола и смешивания материалов.',
    stat: '3 модели',
    href: '/catalog?category=mills&type=S',
  },
  {
    code: 'SGB',
    title: 'Вакуумные боксы',
    spec: '< 0.1 ppm · ≤1 Па',
    desc: 'Перчаточные боксы из нержавеющей стали и акрила для работы в инертной атмосфере.',
    stat: '2 модели',
    href: '/catalog?category=vacuum&type=S',
  },
  {
    code: 'SES',
    title: 'Электроспиннинг',
    spec: 'до 50 кВ',
    desc: 'Лабораторные установки для получения нановолокон полимеров и керамик.',
    stat: 'под заказ',
    href: '/catalog?category=electrospinning&type=S',
  },
  {
    code: 'PA',
    title: 'Комплектующие',
    spec: 'нагреватели · контроллеры',
    desc: 'Нагревательные платы, контроллеры температуры, системы газоснабжения и расходники.',
    stat: '5+ позиций',
    href: '/catalog?category=accessories&type=PA',
  },
]

const STATS = [
  { num: 200, suf: '+', label: 'позиций' },
  { num: 12,  suf: '+', label: 'лет на рынке' },
  { num: 50,  suf: '+', label: 'партнёров' },
]

export default function HomePage() {
  const [hovCard, setHovCard] = useState<string | null>(null)

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fade-up { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:none } }
        @keyframes beam-slide {
          0%   { transform: translateX(-100%) skewX(-20deg); opacity: 0 }
          15%  { opacity: 1 }
          85%  { opacity: 1 }
          100% { transform: translateX(400%) skewX(-20deg); opacity: 0 }
        }
      `}</style>

      {/* ══ HERO ══ */}
      <section style={{ borderBottom: '1px solid #E2E8F0', background: 'white' }}>
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-6 items-center py-14 md:py-20">

          {/* Left */}
          <div className="flex flex-col gap-6" style={{ animation: 'fade-up 0.6s ease both' }}>

            <div className="inline-flex items-center gap-2.5 w-fit px-3.5 py-1.5 rounded-full"
              style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1565C0', boxShadow: '0 0 6px rgba(21,101,192,0.6)' }} />
              <span className="text-[10px] font-mono tracking-[0.2em]" style={{ color: '#1565C0', fontWeight: 700 }}>
                НАУЧНО-ПРОИЗВОДСТВЕННОЕ ПРЕДПРИЯТИЕ
              </span>
            </div>

            <h1 className="font-black select-none" style={{ fontSize: 'clamp(2.6rem,5.5vw,4.2rem)', letterSpacing: '-0.025em', lineHeight: 1.02 }}>
              <span style={{ display: 'block', color: '#0F172A' }}>ОТ ИДЕИ</span>
              <span style={{
                display: 'block',
                background: 'linear-gradient(90deg,#1565C0 0%,#0284C7 60%,#0EA5E9 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>ДО ПУСКА</span>
            </h1>

            <p className="text-sm leading-[1.85] max-w-md"
              style={{ color: '#475569', borderLeft: '2px solid #BFDBFE', paddingLeft: 14 }}>
              Проектируем и производим высокотемпературные печи, шаровые мельницы, вакуумные камеры и установки электроспиннинга — от технического задания до запуска в эксплуатацию.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/catalog"
                className="relative overflow-hidden px-7 py-3.5 font-bold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#1260C0,#0284C7)', color: 'white', letterSpacing: '0.07em', borderRadius: 8, boxShadow: '0 4px 20px rgba(21,101,192,0.3)' }}>
                <span className="absolute inset-y-0 w-12 pointer-events-none"
                  style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)', animation: 'beam-slide 4s 1s ease-in-out infinite' }} />
                СМОТРЕТЬ КАТАЛОГ
              </Link>
              <Link href="/contacts"
                className="px-7 py-3.5 font-bold text-sm transition-all hover:-translate-y-0.5"
                style={{ border: '1.5px solid #CBD5E1', color: '#475569', letterSpacing: '0.07em', borderRadius: 8, background: 'white' }}>
                СВЯЗАТЬСЯ
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-stretch gap-0 pt-1">
              {STATS.map(({ num, suf, label }, i) => (
                <div key={label} className="flex flex-col px-5 py-3 text-center"
                  style={{ borderLeft: i === 0 ? 'none' : '1px solid #E2E8F0' }}>
                  <span className="font-black text-2xl" style={{ color: '#1565C0' }}>
                    <Counter to={num} suffix={suf} />
                  </span>
                  <span className="text-[10px] font-mono tracking-wider mt-0.5" style={{ color: '#94A3B8' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — 3D model */}
          <div className="flex justify-center items-center" style={{ animation: 'fade-up 0.5s 0.12s ease both' }}>
            <div style={{ width: '100%', maxWidth: 520 }}>
              <VacuumChamber3D dark={false} />
            </div>
          </div>
        </div>
      </section>

      {/* ══ SPEC STRIP ══ */}
      <div style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center justify-between flex-wrap gap-3">
          <span className="text-[9px] font-mono tracking-[0.2em] font-bold" style={{ color: '#94A3B8' }}>
            КАТАЛОГ ПРОДУКЦИИ
          </span>
          <div style={{ flex: 1, height: 1, background: '#E2E8F0', margin: '0 12px' }} />
          {['T: 25°C — 1800°C', '±0.001 MM', 'КАЗАХСТАН · АЛМАТЫ', 'ISO 9001'].map(t => (
            <span key={t} className="text-[9px] font-mono tracking-widest" style={{ color: '#94A3B8' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ══ CATEGORIES ══ */}
      <section className="py-14 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center gap-4 mb-8">
            <div style={{ width: 32, height: 2, background: 'linear-gradient(90deg,#1565C0,transparent)', borderRadius: 2 }} />
            <span className="text-[10px] font-mono tracking-[0.22em] font-bold" style={{ color: '#1565C0' }}>
              ЛИНЕЙКА ПРОДУКТОВ
            </span>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            <Link href="/catalog" className="text-[11px] font-semibold transition-colors hover:text-[#1565C0]"
              style={{ color: '#94A3B8' }}>
              Весь каталог →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const hov = hovCard === cat.code
              return (
                <Link key={cat.code} href={cat.href}
                  onMouseEnter={() => setHovCard(cat.code)}
                  onMouseLeave={() => setHovCard(null)}
                  className="flex flex-col gap-3.5 p-5 rounded-xl transition-all duration-200"
                  style={{
                    background: 'white',
                    border: `1.5px solid ${hov ? '#1565C0' : '#E2E8F0'}`,
                    transform: hov ? 'translateY(-3px)' : 'none',
                    boxShadow: hov ? '0 8px 28px rgba(21,101,192,0.12)' : '0 1px 3px rgba(0,0,0,0.05)',
                  }}>

                  <div className="flex items-start justify-between gap-2">
                    <div className="font-mono text-xs font-black px-2.5 py-1 rounded-lg"
                      style={{
                        background: hov ? '#1565C0' : '#F1F5F9',
                        color: hov ? 'white' : '#475569',
                        transition: 'all 0.2s',
                      }}>
                      {cat.code}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                      style={{ background: '#F8FAFC', color: '#94A3B8', border: '1px solid #E2E8F0' }}>
                      {cat.stat}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm mb-1"
                      style={{ color: hov ? '#1565C0' : '#0F172A', transition: 'color 0.2s' }}>
                      {cat.title}
                    </h3>
                    <p className="text-[11px] font-mono" style={{ color: '#94A3B8' }}>{cat.spec}</p>
                  </div>

                  <p className="text-[12px] leading-relaxed" style={{ color: '#64748B' }}>
                    {cat.desc}
                  </p>

                  <div className="flex items-center gap-1.5 mt-auto pt-1 text-xs font-semibold"
                    style={{ color: hov ? '#1565C0' : '#94A3B8', transition: 'color 0.2s' }}>
                    Смотреть каталог
                    <span style={{ transform: hov ? 'translateX(3px)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: '1px solid #E2E8F0', background: 'white' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span className="font-mono text-[9px] tracking-widest" style={{ color: '#94A3B8' }}>ОНЛАЙН</span>
          </div>
          <span className="font-black text-sm tracking-widest" style={{ color: '#CBD5E1' }}>BES SAIMAN GROUP</span>
          <span className="text-[10px] font-mono" style={{ color: '#94A3B8' }}>
            © 2025 · Казахстан · bessaimangroup1@gmail.com
          </span>
        </div>
      </footer>
    </div>
  )
}
