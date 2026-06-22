'use client'

import { useEffect, useState } from 'react'
import { FlaskConical, Microscope, Atom, Zap, BookOpen, Award } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'

export default function NaukaPage() {
  const { tr } = useLang()
  const [partners, setPartners] = useState<{ id: string; name: string; logo_url: string | null; website_url: string | null }[]>([])

  useEffect(() => {
    fetch('/api/partners').then(r => r.json()).then(d => setPartners(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  const directions = [
    { icon: <FlaskConical size={28} />, title: tr.nauka.d1Title, desc: tr.nauka.d1Desc },
    { icon: <Atom size={28} />,         title: tr.nauka.d2Title, desc: tr.nauka.d2Desc },
    { icon: <Zap size={28} />,          title: tr.nauka.d3Title, desc: tr.nauka.d3Desc },
    { icon: <Microscope size={28} />,   title: tr.nauka.d4Title, desc: tr.nauka.d4Desc },
    { icon: <BookOpen size={28} />,     title: tr.nauka.d5Title, desc: tr.nauka.d5Desc },
    { icon: <Award size={28} />,        title: tr.nauka.d6Title, desc: tr.nauka.d6Desc },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold tracking-widest uppercase"
          style={{ background: 'rgba(21,101,192,0.08)', color: '#1565C0', border: '1px solid rgba(21,101,192,0.15)' }}>
          Bes Saiman Group
        </div>
        <h1 className="text-4xl font-black mb-4" style={{ color: '#0F172A' }}>
          {tr.nauka.heroTitle}
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: '#64748B' }}>
          {tr.nauka.heroSubtitle}
        </p>
      </div>

      {/* Directions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {directions.map((d) => (
          <div
            key={d.title}
            className="p-6 rounded-2xl transition-all duration-200"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(21,101,192,0.08)', color: '#1565C0' }}>
              {d.icon}
            </div>
            <h3 className="font-bold text-base mb-2" style={{ color: '#0F172A' }}>{d.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{d.desc}</p>
          </div>
        ))}
      </div>

      {/* Scientific partners */}
      <div className="rounded-2xl p-8 mb-12" style={{ background: 'linear-gradient(135deg, #EBF2FB 0%, #F0F9FF 100%)', border: '1px solid rgba(21,101,192,0.12)' }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#0F172A' }}>{tr.nauka.partnersTitle}</h2>
        <p className="text-sm mb-6" style={{ color: '#64748B' }}>
          {tr.nauka.partnersSubtitle}
        </p>
        <div className="flex flex-wrap gap-3">
          {partners.length === 0 ? (
            <span className="text-sm" style={{ color: '#94A3B8' }}>{tr.nauka.noPartners}</span>
          ) : partners.map((p) => {
            const card = (
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-200"
                style={{ background: '#FFFFFF', border: '1px solid rgba(21,101,192,0.18)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                {p.logo_url && (
                  <img src={p.logo_url} alt={p.name} style={{ height: 28, maxWidth: 70, objectFit: 'contain', flexShrink: 0 }} />
                )}
                <span className="text-sm font-medium" style={{ color: '#1565C0' }}>{p.name}</span>
              </div>
            )
            return p.website_url
              ? <a key={p.id} href={p.website_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{card}</a>
              : <div key={p.id}>{card}</div>
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-10 rounded-2xl" style={{ background: 'linear-gradient(135deg, #1565C0 0%, #0284C7 100%)' }}>
        <h2 className="text-2xl font-bold text-white mb-3">{tr.nauka.ctaTitle}</h2>
        <p className="text-blue-100 mb-6 text-sm">
          {tr.nauka.ctaSubtitle}
        </p>
        <a
          href="/contacts"
          className="inline-block px-8 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{ background: '#FFFFFF', color: '#1565C0' }}
        >
          {tr.nauka.ctaButton}
        </a>
      </div>

    </div>
  )
}
