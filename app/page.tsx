'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { NewsPost } from '@/types'
import { useLang } from '@/context/LanguageContext'

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
    spec: 'до 1200°C · 1–12 л',
    desc: 'Серийные муфельные печи с PID-контроллером. 6 объёмов камеры, 3 класса температур.',
    stat: '6 моделей',
    href: '/catalog?category=sfm',
  },
  {
    code: 'SFTH',
    title: 'Трубчатые печи',
    spec: '1100–1200°C · 1–3 зоны',
    desc: 'Горизонтальные, вертикальные и мультипозиционные трубчатые печи. Диаметр 25–100 мм.',
    stat: '6 моделей',
    href: '/catalog?category=sfth',
  },
  {
    code: 'SM',
    title: 'Измельчение',
    spec: 'до 650 об/мин',
    desc: 'Горизонтальные и планетарные шаровые мельницы, вибрационные ситовые анализаторы.',
    stat: '4 модели',
    href: '/catalog?category=sm',
  },
  {
    code: 'SS',
    title: 'Установки синтеза',
    spec: '< 0.1 ppm · до 50 кВ',
    desc: 'Вакуумные перчаточные боксы, электроспиннинг, термопласты для синтеза материалов.',
    stat: '4 модели',
    href: '/catalog?category=ss',
  },
  {
    code: 'FUR',
    title: 'Лабораторная мебель',
    spec: 'шкафы · столы',
    desc: 'Вытяжные и газовые шкафы, сушильные шкафы, лабораторные и антивибрационные столы.',
    stat: '12 моделей',
    href: '/catalog?category=furniture',
  },
  {
    code: 'PA',
    title: 'Комплектующие',
    spec: 'нагреватели · контроллеры',
    desc: 'Нагревательные плиты, блоки управления температурой, системы подачи газа.',
    stat: '4 позиции',
    href: '/catalog?category=pa',
  },
]

const STATS = [
  { num: 200, suf: '+', label: 'позиций' },
  { num: 5,   suf: '+', label: 'лет на рынке' },
  { num: 50,  suf: '+', label: 'партнёров' },
]

function NewsModal({ post, onClose, postTitle, postContent }: {
  post: NewsPost
  onClose: () => void
  postTitle: (p: NewsPost) => string
  postContent: (p: NewsPost) => string | null
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: 'white', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        {post.image_url && (
          <div className="relative w-full" style={{ height: 260 }}>
            <img src={post.image_url} alt={postTitle(post)} className="w-full h-full object-cover" style={{ borderRadius: '16px 16px 0 0' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.5) 0%, transparent 60%)', borderRadius: '16px 16px 0 0' }} />
          </div>
        )}
        <div className="p-7">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-black tracking-wide px-3 py-1 rounded-full"
              style={{ background: post.type === 'announcement' ? '#FEF3C7' : '#EFF6FF', color: post.type === 'announcement' ? '#B45309' : '#1D4ED8' }}>
              {post.type === 'announcement' ? '⚡ Уведомление' : '● Новость'}
            </span>
            {post.published_at && (
              <span className="text-[11px]" style={{ color: '#94A3B8' }}>
                {new Date(post.published_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
          <h2 className="font-black text-xl leading-tight mb-4" style={{ color: '#0F172A' }}>
            {postTitle(post)}
          </h2>
          {postContent(post) && (
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#475569' }}>
              {postContent(post)}
            </p>
          )}
          {post.instagram_url && (
            <a href={post.instagram_url} target="_blank" rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold py-2.5 px-5 rounded-full"
              style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: 'white' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Посмотреть в Instagram
            </a>
          )}
          <div className="mt-6 flex justify-end">
            <button onClick={onClose}
              className="px-5 py-2 rounded-lg text-sm font-semibold"
              style={{ border: '1.5px solid #E2E8F0', color: '#64748B' }}>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { lang } = useLang()
  const [hovCard, setHovCard] = useState<string | null>(null)
  const [news, setNews] = useState<NewsPost[]>([])
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null)

  const postTitle = (p: NewsPost) =>
    (lang === 'kk' ? p.title_kk : lang === 'en' ? p.title_en : null) || p.title_ru
  const postContent = (p: NewsPost) =>
    (lang === 'kk' ? p.content_kk : lang === 'en' ? p.content_en : null) || p.content_ru

  useEffect(() => {
    fetch('/api/news?limit=5').then(r => r.json()).then(d => setNews(Array.isArray(d) ? d : []))
  }, [])

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {selectedPost && (
        <NewsModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          postTitle={postTitle}
          postContent={postContent}
        />
      )}
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

      {/* ══ НОВОСТИ & УВЕДОМЛЕНИЯ ══ */}
      {news.length > 0 && (
        <section style={{ background: '#F1F5F9', borderTop: '1px solid #E2E8F0', padding: '56px 0' }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">

            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div style={{ width: 28, height: 2.5, background: 'linear-gradient(90deg,#1565C0,#0EA5E9)', borderRadius: 2 }} />
                  <span className="text-[10px] font-mono tracking-[0.22em] font-bold" style={{ color: '#1565C0' }}>АКТУАЛЬНО</span>
                </div>
                <h2 className="font-black leading-tight" style={{ fontSize: 'clamp(1.4rem,3vw,1.9rem)', color: '#0F172A' }}>
                  Новости и акции
                </h2>
              </div>
              <Link href="/news"
                className="flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5"
                style={{ background: 'white', color: '#1565C0', border: '1px solid #BFDBFE', boxShadow: '0 2px 8px rgba(21,101,192,0.08)' }}>
                Все публикации →
              </Link>
            </div>

            <div className="grid lg:grid-cols-5 gap-5 items-start">

              {/* FEATURED */}
              <div className="lg:col-span-3">
                {(() => {
                  const post = news[0]
                  const isAnn = post.type === 'announcement'
                  return (
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="relative overflow-hidden rounded-2xl flex flex-col justify-end w-full text-left cursor-pointer transition-all hover:-translate-y-1"
                      style={{
                        height: 380,
                        background: post.image_url
                          ? undefined
                          : isAnn
                            ? 'linear-gradient(135deg,#92400E,#B45309,#D97706)'
                            : 'linear-gradient(135deg,#0F172A,#1E3A5F,#1565C0)',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      }}>
                      {post.image_url && (
                        <img src={post.image_url} alt={postTitle(post)}
                          className="absolute inset-0 w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0" style={{
                        background: post.image_url
                          ? 'linear-gradient(to top, rgba(10,20,40,0.92) 0%, rgba(10,20,40,0.5) 55%, rgba(10,20,40,0.1) 100%)'
                          : 'none',
                      }} />
                      <div className="absolute top-0 left-0 right-0 h-1"
                        style={{ background: isAnn ? 'linear-gradient(90deg,#4F46E5,#6366F1)' : 'linear-gradient(90deg,#1565C0,#0EA5E9)' }} />
                      <div className="relative z-10 p-7">
                        <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-full"
                          style={{ background: isAnn ? 'rgba(79,70,229,0.9)' : 'rgba(21,101,192,0.95)', backdropFilter: 'blur(8px)' }}>
                          <span className="text-[10px] font-black tracking-widest text-white">
                            {isAnn ? '● УВЕДОМЛЕНИЕ' : '● НОВОСТЬ'}
                          </span>
                        </div>
                        <h3 className="font-black leading-tight mb-2 text-white"
                          style={{ fontSize: 'clamp(1rem,2.5vw,1.4rem)', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                          {postTitle(post)}
                        </h3>
                        {postContent(post) && (
                          <p className="text-sm leading-relaxed line-clamp-2 mb-4"
                            style={{ color: 'rgba(255,255,255,0.75)' }}>
                            {postContent(post)}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            {post.published_at
                              ? new Date(post.published_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
                              : ''}
                          </span>
                          <span className="text-[11px] font-semibold px-3 py-1 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(8px)' }}>
                            Читать →
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })()}
              </div>

              {/* SECONDARY STACK */}
              <div className="lg:col-span-2 flex flex-col gap-3">
                {news.slice(1, 4).map((post) => {
                  const isAnn = post.type === 'announcement'
                  return (
                    <button key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="flex overflow-hidden rounded-xl transition-all hover:-translate-y-0.5 w-full text-left"
                      style={{ background: 'white', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
                      {post.image_url ? (
                        <div className="relative flex-shrink-0 overflow-hidden" style={{ width: 88, minHeight: 88 }}>
                          <img src={post.image_url} alt={postTitle(post)}
                            className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex-shrink-0" style={{ width: 4, background: isAnn ? '#4F46E5' : '#1565C0' }} />
                      )}
                      <div className="px-4 py-3.5 flex flex-col justify-center flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[9px] font-black tracking-wide px-2 py-0.5 rounded-full"
                            style={{ background: isAnn ? '#EEF2FF' : '#EFF6FF', color: isAnn ? '#3730A3' : '#1D4ED8' }}>
                            {isAnn ? '● ВАЖНО' : '● НОВОСТЬ'}
                          </span>
                          <span className="text-[9px] font-mono" style={{ color: '#94A3B8' }}>
                            {post.published_at
                              ? new Date(post.published_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
                              : ''}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs leading-snug line-clamp-2 mb-1" style={{ color: '#0F172A' }}>
                          {postTitle(post)}
                        </h4>
                        {postContent(post) && (
                          <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: '#64748B' }}>
                            {postContent(post)}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
                <Link href="/news"
                  className="flex items-center justify-between px-5 py-4 rounded-xl transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#1565C0,#0284C7)', boxShadow: '0 4px 16px rgba(21,101,192,0.25)' }}>
                  <div>
                    <p className="text-xs font-black text-white mb-0.5">Все публикации</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Новости, акции, уведомления</p>
                  </div>
                  <span className="text-white text-lg font-black">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

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
            © 2026 · Казахстан · bessaimangroup1@gmail.com
          </span>
        </div>
      </footer>
    </div>
  )
}
