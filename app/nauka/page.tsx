'use client'

import { useEffect, useState } from 'react'
import { FlaskConical, Microscope, Atom, Zap, BookOpen, Award, Trophy, ShieldCheck, ExternalLink, ChevronDown } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'

const PUBLICATIONS = [
  { title: 'Recent advances and challenges of current collectors for supercapacitors', doi: '10.1016/j.elecom.2022.107373', year: 2022, journal: 'Electrochemistry Communications', authors: 'Abdisattar A., Yeleuov M., Daulbayev Ch., Askaruly K., Taurbekov A., Prikhodko N.' },
  { title: 'Enhancing supercapacitor performance through graphene flame synthesis on nickel current collectors and active carbon material from plant biomass', doi: '10.1016/j.est.2023.108853', year: 2023, journal: 'Journal of Energy Storage', authors: 'Prikhodko N., Yeleuov M., Abdisattar A., Askaruly K., Taurbekov A., Tolynbekov A., Rakhymzhan N., Daulbayev Ch.' },
  { title: 'A facile synthesis of graphite-coated amorphous SiO₂ from biosources as anode material for LIBs', doi: '10.1016/j.mtcomm.2022.105136', year: 2023, journal: 'Materials Today Communications', authors: 'Askaruly K., Yeleuov M., Taurbekov A., Sarsembayeva B., Tolynbekov A., Zhylybayeva N., Azat S., Abdisattar A., Daulbayev Ch.' },
  { title: 'Biomass Derived High Porous Carbon via CO₂ Activation for Supercapacitor Electrodes', doi: '10.3390/jcs7100444', year: 2023, journal: 'Journal of Composites Science (MDPI)', authors: 'Taurbekov A., Abdisattar A., Atamanov M., Yeleuov M., Daulbayev Ch., Askaruly K., Kaidar B. et al.' },
  { title: 'Characterization of Activated Carbon from Rice Husk for Enhanced Energy Storage Devices', doi: '10.3390/molecules28155818', year: 2023, journal: 'Molecules (MDPI)', authors: 'Yerdauletov M., Nazarov K., Mukhametuly B., Yeleuov M., Daulbayev Ch., Abdulkarimova R. et al.' },
  { title: 'Investigations of Activated Carbon from Different Natural Sources for Preparation of Binder-Free CNTs/Activated Carbon Electrodes', doi: '10.3390/jcs7110452', year: 2023, journal: 'Journal of Composites Science', authors: 'Taurbekov A., Abdisattar A., Atamanov M., Kaidar B., Yeleuov M., Joia R., Amrousse R., Atamanova T.' },
  { title: 'The Impact of Biowaste Composition and Activated Carbon Structure on the Electrochemical Performance of Supercapacitors', doi: '10.3390/molecules29215029', year: 2024, journal: 'Molecules (MDPI)', authors: 'Yerdauletov M., Napolskiy F., Abdisattar A., Rudnykh A., Nazarov K., Kenessarin M., Yeleuov M. et al.' },
  { title: 'Utilizing rice husk-derived Si/C composites to enhance energy capacity and cycle sustainability of lithium-ion batteries', doi: '10.1016/j.diamond.2024.111631', year: 2024, journal: 'Diamond and Related Materials', authors: 'Askaruly K., Idrissov N., Abdisattar A., Azat S., Kuli Zh., Yeleuov M., Malchik F., Daulbayev Ch. et al.' },
  { title: 'Effective photocatalytic degradation of sulfamethoxazole using PAN/SrTiO₃ nanofibers', doi: '10.1016/j.jwpe.2024.106052', year: 2024, journal: 'Journal of Water Process Engineering', authors: 'Serik A., Kuspanov Zh., Bissenova M., Idrissov N., Yeleuov M., Umirzakov A., Daulbayev Ch.' },
  { title: 'Efficient photocatalytic degradation of methylene blue via synergistic dual co-catalyst on SrTiO₃@Al under visible light', doi: '10.1016/j.jtice.2024.105806', year: 2025, journal: 'Taiwan Institute of Chemical Engineers', authors: 'Kuspanov Zh., Serik A., Matsko N., Bissenova M., Issadykov A., Yeleuov M., Daulbayev Ch.' },
  { title: 'MXene-Integrated Porous Carbon–Silicon Composite as a Stable and High-Capacity Anode for Lithium-Ion Batteries', doi: '10.30919/es1804', year: 2025, journal: 'Engineered Science Publisher', authors: 'Saitova N., Askaruly K., Idrissov N., Kuli Zh., Shakenov K., Azat S., Sultakhan Sh.' },
  { title: 'Cost-effective strategies and technologies for green hydrogen production', doi: '10.1016/j.rser.2025.116242', year: 2026, journal: 'Renewable and Sustainable Energy Reviews', authors: 'Serik A., Kuspanov Zh., Daulbayev Ch.' },
  { title: 'Biomass-derived activated carbon/MXene composites as supercapacitor electrodes', doi: '10.1016/j.elecom.2026.108166', year: 2026, journal: 'Electrochemistry Communications', authors: 'Liu J., Kuli Zh., Toshtay K., Lee J., Askaruly K., Azat S.' },
]

export default function NaukaPage() {
  const { tr } = useLang()
  const [partners, setPartners] = useState<{ id: string; name: string; logo_url: string | null; website_url: string | null }[]>([])
  const [pubOpen, setPubOpen] = useState(false)

  useEffect(() => {
    fetch('/api/partners').then(r => r.json()).then(d => setPartners(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  const directions = [
    { icon: <FlaskConical size={24} />, title: tr.nauka.d1Title, desc: tr.nauka.d1Desc },
    { icon: <Atom size={24} />,         title: tr.nauka.d2Title, desc: tr.nauka.d2Desc },
    { icon: <Zap size={24} />,          title: tr.nauka.d3Title, desc: tr.nauka.d3Desc },
    { icon: <Microscope size={24} />,   title: tr.nauka.d4Title, desc: tr.nauka.d4Desc },
    { icon: <BookOpen size={24} />,     title: tr.nauka.d5Title, desc: tr.nauka.d5Desc },
    { icon: <Award size={24} />,        title: tr.nauka.d6Title, desc: tr.nauka.d6Desc },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* ══ Hero ══ */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-[10px] font-mono tracking-[0.2em] font-bold"
          style={{ background: '#EFF6FF', color: '#1565C0', border: '1px solid #BFDBFE' }}>
          BES SAIMAN GROUP
        </div>
        <h1 className="text-4xl font-black mb-4" style={{ color: '#0F172A' }}>
          {tr.nauka.heroTitle}
        </h1>
        <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: '#64748B' }}>
          {tr.nauka.heroSubtitle}
        </p>
      </div>

      {/* ══ Directions ══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        {directions.map((d) => (
          <div key={d.title} className="p-5 rounded-xl"
            style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
              style={{ background: '#EFF6FF', color: '#1565C0' }}>
              {d.icon}
            </div>
            <h3 className="font-bold text-sm mb-1.5" style={{ color: '#0F172A' }}>{d.title}</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>{d.desc}</p>
          </div>
        ))}
      </div>

      {/* ══ Publications accordion ══ */}
      <div className="mb-14">
        {/* Header row — always visible */}
        <button
          onClick={() => setPubOpen(v => !v)}
          className="w-full flex items-center justify-between p-5 rounded-2xl transition-all"
          style={{
            background: pubOpen ? 'white' : 'white',
            border: `1.5px solid ${pubOpen ? '#1565C0' : '#E2E8F0'}`,
            boxShadow: pubOpen ? '0 4px 20px rgba(21,101,192,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: pubOpen ? '#1565C0' : '#EFF6FF' }}>
              <BookOpen size={20} style={{ color: pubOpen ? 'white' : '#1565C0' }} />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm" style={{ color: '#0F172A' }}>{tr.nauka.pubTitle}</div>
              <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{tr.nauka.pubIntro.slice(0, 80)}…</div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <span className="font-black text-lg px-3 py-1 rounded-lg"
              style={{ background: '#EFF6FF', color: '#1565C0' }}>
              {PUBLICATIONS.length}
            </span>
            <ChevronDown
              size={18}
              style={{
                color: '#94A3B8',
                transform: pubOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.25s',
              }}
            />
          </div>
        </button>

        {/* Expandable body */}
        {pubOpen && (
          <div className="mt-3 rounded-2xl overflow-hidden"
            style={{ border: '1.5px solid #E2E8F0', background: 'white' }}>
            <div className="divide-y" style={{ borderColor: '#F1F5F9' }}>
              {PUBLICATIONS.map((pub, i) => (
                <div key={pub.doi} className="flex items-start gap-3 px-6 py-4">
                  <span className="shrink-0 mt-0.5 w-6 text-[11px] font-black text-right"
                    style={{ color: '#CBD5E1' }}>{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-semibold leading-snug hover:underline"
                      style={{ color: '#0F172A' }}>
                      {pub.title}
                    </a>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: '#F1F5F9', color: '#475569' }}>{pub.year}</span>
                      <span className="text-[11px]" style={{ color: '#1565C0' }}>{pub.journal}</span>
                    </div>
                    <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>{pub.authors}</p>
                  </div>
                  <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
                    style={{ background: '#EFF6FF', color: '#1565C0' }}>
                    <ExternalLink size={10} />DOI
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══ Certificates row ══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">

        {/* Diploma */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#1565C0,#0EA5E9)' }} />
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <Trophy size={22} style={{ color: '#1565C0' }} />
              </div>
              <div>
                <div className="text-[10px] font-mono tracking-widest mb-1" style={{ color: '#94A3B8' }}>
                  НИНЖ РК · 2025
                </div>
                <h3 className="font-black text-base leading-tight" style={{ color: '#0F172A' }}>
                  {tr.nauka.achievTitle}
                </h3>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-2" style={{ color: '#334155' }}>
              {tr.nauka.achievDesc1}
            </p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: '#64748B' }}>
              {tr.nauka.achievDesc2}
            </p>
            <a href="/docs/diplom-luchshiy-inzhener-2025.pdf" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#1565C0,#0284C7)', color: 'white', boxShadow: '0 4px 12px rgba(21,101,192,0.25)' }}>
              <ExternalLink size={13} />
              {tr.nauka.achievViewDoc}
            </a>
          </div>
        </div>

        {/* Accreditation */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#0284C7,#0EA5E9)' }} />
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <ShieldCheck size={22} style={{ color: '#1565C0' }} />
              </div>
              <div>
                <div className="text-[10px] font-mono tracking-widest mb-1" style={{ color: '#94A3B8' }}>
                  МОН РК · до 09.02.2029
                </div>
                <h3 className="font-black text-base leading-tight" style={{ color: '#0F172A' }}>
                  {tr.nauka.accTitle}
                </h3>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-2" style={{ color: '#334155' }}>
              {tr.nauka.accDesc1}
            </p>
            <p className="text-sm leading-relaxed mb-2" style={{ color: '#64748B' }}>
              {tr.nauka.accDesc2}
            </p>
            <p className="text-xs font-semibold mb-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: '#EFF6FF', color: '#1565C0' }}>
              📅 {tr.nauka.accDesc3}
            </p>
            <div>
              <a href="/docs/svidetelstvo-akkreditacii.pdf" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#1565C0,#0284C7)', color: 'white', boxShadow: '0 4px 12px rgba(21,101,192,0.25)' }}>
                <ExternalLink size={13} />
                {tr.nauka.accViewDoc}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Partners ══ */}
      {partners.length > 0 && (
        <div className="rounded-2xl p-8 mb-12"
          style={{ background: 'linear-gradient(135deg,#EBF2FB,#F0F9FF)', border: '1px solid rgba(21,101,192,0.12)' }}>
          <h2 className="text-xl font-bold mb-1.5" style={{ color: '#0F172A' }}>{tr.nauka.partnersTitle}</h2>
          <p className="text-sm mb-6" style={{ color: '#64748B' }}>{tr.nauka.partnersSubtitle}</p>
          <div className="flex flex-wrap gap-3">
            {partners.map((p) => {
              const card = (
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                  style={{ background: '#FFFFFF', border: '1px solid rgba(21,101,192,0.18)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  {p.logo_url && <img src={p.logo_url} alt={p.name} style={{ height: 28, maxWidth: 70, objectFit: 'contain' }} />}
                  <span className="text-sm font-medium" style={{ color: '#1565C0' }}>{p.name}</span>
                </div>
              )
              return p.website_url
                ? <a key={p.id} href={p.website_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{card}</a>
                : <div key={p.id}>{card}</div>
            })}
          </div>
        </div>
      )}

      {/* ══ CTA ══ */}
      <div className="text-center p-10 rounded-2xl"
        style={{ background: 'linear-gradient(135deg,#1565C0,#0284C7)' }}>
        <h2 className="text-2xl font-bold text-white mb-3">{tr.nauka.ctaTitle}</h2>
        <p className="text-blue-100 mb-6 text-sm">{tr.nauka.ctaSubtitle}</p>
        <a href="/contacts"
          className="inline-block px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: '#FFFFFF', color: '#1565C0' }}>
          {tr.nauka.ctaButton}
        </a>
      </div>

    </div>
  )
}
