'use client'

import { useEffect, useState } from 'react'
import { FlaskConical, Microscope, Atom, Zap, BookOpen, Award, Trophy, ShieldCheck, ExternalLink } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'

const PUBLICATIONS = [
  {
    title: 'Recent advances and challenges of current collectors for supercapacitors',
    doi: '10.1016/j.elecom.2022.107373',
    year: 2022,
    journal: 'Electrochemistry Communications',
    authors: 'Abdisattar A., Yeleuov M., Daulbayev Ch., Askaruly K., Tolynbekov A., Taurbekov A., Prikhodko N.',
  },
  {
    title: 'Enhancing supercapacitor performance through graphene flame synthesis on nickel current collectors and active carbon material from plant biomass',
    doi: '10.1016/j.est.2023.108853',
    year: 2023,
    journal: 'Journal of Energy Storage',
    authors: 'Prikhodko N., Yeleuov M., Abdisattar A., Askaruly K., Taurbekov A., Tolynbekov A., Rakhymzhan N., Daulbayev Ch.',
  },
  {
    title: 'A facile synthesis of graphite-coated amorphous SiO₂ from biosources as anode material for LIBs',
    doi: '10.1016/j.mtcomm.2022.105136',
    year: 2023,
    journal: 'Materials Today Communications',
    authors: 'Askaruly K., Yeleuov M., Taurbekov A., Sarsembayeva B., Tolynbekov A., Zhylybayeva N., Azat S., Abdisattar A., Daulbayev Ch.',
  },
  {
    title: 'Biomass Derived High Porous Carbon via CO₂ Activation for Supercapacitor Electrodes',
    doi: '10.3390/jcs7100444',
    year: 2023,
    journal: 'Journal of Composites Science (MDPI)',
    authors: 'Taurbekov A., Abdisattar A., Atamanov M., Yeleuov M., Daulbayev Ch., Askaruly K., Kaidar B. et al.',
  },
  {
    title: 'Characterization of Activated Carbon from Rice Husk for Enhanced Energy Storage Devices',
    doi: '10.3390/molecules28155818',
    year: 2023,
    journal: 'Molecules (MDPI)',
    authors: 'Yerdauletov M., Nazarov K., Mukhametuly B., Yeleuov M., Daulbayev Ch., Abdulkarimova R. et al.',
  },
  {
    title: 'Investigations of Activated Carbon from Different Natural Sources for Preparation of Binder-Free CNTs/Activated Carbon Electrodes',
    doi: '10.3390/jcs7110452',
    year: 2023,
    journal: 'Journal of Composites Science',
    authors: 'Taurbekov A., Abdisattar A., Atamanov M., Kaidar B., Yeleuov M., Joia R., Amrousse R., Atamanova T.',
  },
  {
    title: 'The Impact of Biowaste Composition and Activated Carbon Structure on the Electrochemical Performance of Supercapacitors',
    doi: '10.3390/molecules29215029',
    year: 2024,
    journal: 'Molecules (MDPI)',
    authors: 'Yerdauletov M., Napolskiy F., Abdisattar A., Rudnykh A., Nazarov K., Kenessarin M., Yeleuov M. et al.',
  },
  {
    title: 'Utilizing rice husk-derived Si/C composites to enhance energy capacity and cycle sustainability of lithium-ion batteries',
    doi: '10.1016/j.diamond.2024.111631',
    year: 2024,
    journal: 'Diamond and Related Materials',
    authors: 'Askaruly K., Idrissov N., Abdisattar A., Azat S., Kuli Zh., Yeleuov M., Malchik F., Daulbayev Ch. et al.',
  },
  {
    title: 'Effective photocatalytic degradation of sulfamethoxazole using PAN/SrTiO₃ nanofibers',
    doi: '10.1016/j.jwpe.2024.106052',
    year: 2024,
    journal: 'Journal of Water Process Engineering',
    authors: 'Serik A., Kuspanov Zh., Bissenova M., Idrissov N., Yeleuov M., Umirzakov A., Daulbayev Ch.',
  },
  {
    title: 'Efficient photocatalytic degradation of methylene blue via synergistic dual co-catalyst on SrTiO₃@Al under visible light: Experimental and DFT study',
    doi: '10.1016/j.jtice.2024.105806',
    year: 2025,
    journal: 'Taiwan Institute of Chemical Engineers',
    authors: 'Kuspanov Zh., Serik A., Matsko N., Bissenova M., Issadykov A., Yeleuov M., Daulbayev Ch.',
  },
  {
    title: 'MXene-Integrated Porous Carbon–Silicon Composite as a Stable and High-Capacity Anode for Lithium-Ion Batteries',
    doi: '10.30919/es1804',
    year: 2025,
    journal: 'Engineered Science Publisher',
    authors: 'Saitova N., Askaruly K., Idrissov N., Kuli Zh., Shakenov K., Azat S., Sultakhan Sh.',
  },
  {
    title: 'Cost-effective strategies and technologies for green hydrogen production',
    doi: '10.1016/j.rser.2025.116242',
    year: 2026,
    journal: 'Renewable and Sustainable Energy Reviews',
    authors: 'Serik A., Kuspanov Zh., Daulbayev Ch.',
  },
  {
    title: 'Biomass-derived activated carbon/MXene composites as supercapacitor electrodes',
    doi: '10.1016/j.elecom.2026.108166',
    year: 2026,
    journal: 'Electrochemistry Communications',
    authors: 'Liu J., Kuli Zh., Toshtay K., Lee J., Askaruly K., Azat S.',
  },
]

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
          <div key={d.title} className="p-6 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(21,101,192,0.08)', color: '#1565C0' }}>
              {d.icon}
            </div>
            <h3 className="font-bold text-base mb-2" style={{ color: '#0F172A' }}>{d.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{d.desc}</p>
          </div>
        ))}
      </div>

      {/* ══ Publications ══ */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-2">
          <div style={{ width: 32, height: 2.5, background: 'linear-gradient(90deg,#1565C0,#0EA5E9)', borderRadius: 2 }} />
          <span className="text-[10px] font-mono tracking-[0.22em] font-bold" style={{ color: '#1565C0' }}>RESEARCH</span>
        </div>
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <h2 className="text-2xl font-black" style={{ color: '#0F172A' }}>{tr.nauka.pubTitle}</h2>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <span className="text-xl font-black" style={{ color: '#1565C0' }}>{PUBLICATIONS.length}</span>
            <span className="text-xs font-medium" style={{ color: '#3B82F6' }}>{tr.nauka.pubCountLabel}</span>
          </div>
        </div>
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <p className="text-sm leading-relaxed mb-2" style={{ color: '#475569' }}>{tr.nauka.pubIntro}</p>
          <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{tr.nauka.pubIntro2}</p>
        </div>

        <div className="space-y-3">
          {PUBLICATIONS.map((pub, i) => (
            <div key={pub.doi} className="flex gap-4 p-4 rounded-xl transition-all"
              style={{ background: 'white', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs"
                style={{ background: '#EFF6FF', color: '#1565C0' }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={`https://doi.org/${pub.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sm leading-snug hover:text-blue-600 transition-colors"
                  style={{ color: '#0F172A' }}
                >
                  {pub.title}
                </a>
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: '#F1F5F9', color: '#64748B' }}>
                    {pub.year}
                  </span>
                  <span className="text-[11px]" style={{ color: '#1565C0' }}>{pub.journal}</span>
                </div>
                <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#94A3B8' }}>{pub.authors}</p>
              </div>
              <a
                href={`https://doi.org/${pub.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 self-center flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                style={{ background: '#EFF6FF', color: '#1565C0', whiteSpace: 'nowrap' }}
              >
                <ExternalLink size={11} />
                DOI
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* ══ Achievements + Accreditation ══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">

        {/* Diploma */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #FDE68A', boxShadow: '0 4px 20px rgba(245,158,11,0.1)' }}>
          <div className="px-6 py-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg,#92400E,#B45309,#D97706)' }}>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Trophy size={20} style={{ color: '#FEF3C7' }} />
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest" style={{ color: 'rgba(254,243,199,0.7)' }}>2025</p>
              <p className="font-black text-sm" style={{ color: '#FEF3C7' }}>{tr.nauka.achievTitle}</p>
            </div>
          </div>
          <div className="p-6" style={{ background: '#FFFBEB' }}>
            <p className="text-sm font-semibold leading-relaxed mb-3" style={{ color: '#78350F' }}>
              {tr.nauka.achievDesc1}
            </p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: '#92400E' }}>
              {tr.nauka.achievDesc2}
            </p>
            <a
              href="/docs/diplom-luchshiy-inzhener-2025.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
              style={{ background: 'linear-gradient(135deg,#B45309,#D97706)', color: 'white', boxShadow: '0 2px 8px rgba(180,83,9,0.3)' }}
            >
              <ExternalLink size={14} />
              {tr.nauka.achievViewDoc}
            </a>
          </div>
        </div>

        {/* Accreditation */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #BFDBFE', boxShadow: '0 4px 20px rgba(21,101,192,0.08)' }}>
          <div className="px-6 py-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg,#0F172A,#1E3A5F,#1565C0)' }}>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ShieldCheck size={20} style={{ color: '#BFDBFE' }} />
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest" style={{ color: 'rgba(191,219,254,0.6)' }}>МОН РК · до 2029</p>
              <p className="font-black text-sm" style={{ color: '#BFDBFE' }}>{tr.nauka.accTitle}</p>
            </div>
          </div>
          <div className="p-6" style={{ background: '#EFF6FF' }}>
            <p className="text-sm font-semibold leading-relaxed mb-3" style={{ color: '#1E3A5F' }}>
              {tr.nauka.accDesc1}
            </p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#1D4ED8' }}>
              {tr.nauka.accDesc2}
            </p>
            <p className="text-xs font-semibold mb-5 px-3 py-2 rounded-lg inline-block"
              style={{ background: '#DBEAFE', color: '#1565C0' }}>
              📅 {tr.nauka.accDesc3}
            </p>
            <div>
              <a
                href="/docs/svidetelstvo-akkreditacii.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
                style={{ background: 'linear-gradient(135deg,#1565C0,#0284C7)', color: 'white', boxShadow: '0 2px 8px rgba(21,101,192,0.3)' }}
              >
                <ExternalLink size={14} />
                {tr.nauka.accViewDoc}
              </a>
            </div>
          </div>
        </div>
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
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
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
        <p className="text-blue-100 mb-6 text-sm">{tr.nauka.ctaSubtitle}</p>
        <a href="/contacts" className="inline-block px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: '#FFFFFF', color: '#1565C0' }}>
          {tr.nauka.ctaButton}
        </a>
      </div>

    </div>
  )
}
