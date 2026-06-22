'use client'

import { useEffect, useState } from 'react'
import { Wrench, Target, Lightbulb, TrendingUp } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'

export default function AboutPage() {
  const { tr } = useLang()
  const [stats, setStats] = useState({ products: 0, categories: 0, clients: 0, years: 5 })
  useEffect(() => {
    fetch('/api/site-stats').then(r => r.json()).then(d => setStats(d)).catch(() => {})
  }, [])

  const values = [
    { icon: <Wrench size={24} className="text-steel-accent" />,    title: tr.about.v1Title, desc: tr.about.v1Desc },
    { icon: <Target size={24} className="text-steel-accent" />,    title: tr.about.v2Title, desc: tr.about.v2Desc },
    { icon: <Lightbulb size={24} className="text-steel-accent" />, title: tr.about.v3Title, desc: tr.about.v3Desc },
    { icon: <TrendingUp size={24} className="text-steel-accent" />,title: tr.about.v4Title, desc: tr.about.v4Desc },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1565C0, #00B0FF)' }}>
          <Wrench size={28} className="text-white" />
        </div>
        <h1 className="section-title text-4xl mb-4">{tr.about.title}</h1>
        <p className="text-steel-accent text-lg font-medium mb-6">{tr.about.subtitle}</p>
        <p className="text-steel-silver leading-relaxed max-w-2xl mx-auto">
          {tr.about.missionText}
        </p>
      </div>

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
            <div className="text-steel-silver text-sm">{s.label}</div>
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
              <p className="text-steel-silver text-sm leading-relaxed">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Name meaning */}
      <div className="steel-card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-steel-sheen" />
        <div className="relative">
          <div className="text-5xl font-black text-[#0F172A] mb-3 tracking-tight">
            BES <span className="text-steel-accent">SAIMAN</span>
          </div>
          <p className="text-steel-silver max-w-lg mx-auto">
            {tr.about.besDesc}
          </p>
        </div>
      </div>
    </div>
  )
}
