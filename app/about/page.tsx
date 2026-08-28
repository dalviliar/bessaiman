'use client'

import { useEffect, useState } from 'react'
import { Wrench, Target, Lightbulb, TrendingUp } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'

// shipped photo, replaced by whatever the admin uploads
const HERO_FALLBACK = '/images/about-hero.jpg'

export default function AboutPage() {
  const { tr } = useLang()
  const [stats, setStats] = useState({ products: 0, categories: 0, clients: 0, years: 5 })
  const [heroImage, setHeroImage] = useState(HERO_FALLBACK)
  useEffect(() => {
    fetch('/api/site-stats').then(r => r.json()).then(d => setStats(d)).catch(() => {})
    fetch('/api/page-images').then(r => r.json()).then(d => { if (d?.about) setHeroImage(d.about) }).catch(() => {})
  }, [])

  const values = [
    { icon: <Wrench size={24} className="text-steel-accent" />,    title: tr.about.v1Title, desc: tr.about.v1Desc },
    { icon: <Target size={24} className="text-steel-accent" />,    title: tr.about.v2Title, desc: tr.about.v2Desc },
    { icon: <Lightbulb size={24} className="text-steel-accent" />, title: tr.about.v3Title, desc: tr.about.v3Desc },
    { icon: <TrendingUp size={24} className="text-steel-accent" />,title: tr.about.v4Title, desc: tr.about.v4Desc },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(8,17,34,0.84) 0%, rgba(8,17,34,0.7) 45%, rgba(8,17,34,0.9) 100%)' }}
          aria-hidden
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-[13px] font-mono tracking-[0.2em] font-bold"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#DBEAFE', border: '1px solid rgba(191,219,254,0.35)', backdropFilter: 'blur(4px)' }}>
            BES SAIMAN GROUP
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 text-white" style={{ textShadow: '0 2px 24px rgba(0,0,0,0.45)' }}>
            {tr.about.title}
          </h1>
          <p className="text-lg font-medium" style={{ color: '#93C5FD' }}>{tr.about.subtitle}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {[
          { value: stats.products > 0 ? `${stats.products}+` : '—', label: tr.about.statsEquipment },
          { value: stats.clients > 0  ? `${stats.clients}+`  : '—', label: tr.about.statsClients },
          { value: `${stats.years}+`,                                 label: tr.about.statsYears },
          { value: stats.categories > 0 ? String(stats.categories) : '—', label: tr.about.statsCategories },
        ].map((s) => (
          <div key={s.label} className="steel-card p-6 text-center">
            <div className="text-3xl font-black text-steel-accent mb-1">{s.value}</div>
            <div className="text-steel-silver text-base">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Values */}
      <h2 className="section-title text-2xl mb-8">{tr.about.mission}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {values.map((v) => (
          <div key={v.title} className="steel-card p-6 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-steel-blue/10 border border-steel-blue/20 flex items-center justify-center shrink-0">
              {v.icon}
            </div>
            <div>
              <h3 className="text-[#0F172A] font-semibold mb-1">{v.title}</h3>
              <p className="text-steel-silver text-base leading-relaxed">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Name meaning */}
      <div className="steel-card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-steel-sheen" />
        <div className="relative">
          <div className="text-4xl font-black text-[#0F172A] mb-3 tracking-tight">
            {tr.contacts.company}
          </div>
          <p className="text-steel-silver max-w-lg mx-auto whitespace-pre-line">
            {tr.about.besDesc}
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
