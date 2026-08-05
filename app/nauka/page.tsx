'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Trophy, ShieldCheck, ExternalLink, ChevronDown, Medal, FileSignature } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import { DevelopmentCarousel, type DevItem } from '@/components/nauka/DevelopmentCarousel'
import { useZoomPreview, ZoomPreviewOverlay } from '@/components/HoverZoomPreview'

interface Publication { id: string; title: string; authors: string | null; journal: string | null; year: number | null; doi: string | null }
interface Patent { id: string; title: string; patent_number: string | null; badge_label: string }
interface Project {
  id: string; title_ru: string; title_kk: string | null; title_en: string | null
  description_ru: string | null; description_kk: string | null; description_en: string | null
  period: string | null; tags: string | null; image_url: string | null; kind: string
}
interface Achievement { id: string; full_name: string; award_name: string; year: number | null; organization: string | null; certificate_url: string | null }
interface Contract { id: string; title: string; customer: string | null; year: number | null; description: string | null }

export default function NaukaPage() {
  const { tr, lang } = useLang()
  const [partners, setPartners] = useState<{ id: string; name: string; logo_url: string | null; website_url: string | null }[]>([])
  const [pubOpen, setPubOpen] = useState(false)
  const [patentsOpen, setPatentsOpen] = useState(false)
  const [publications, setPublications] = useState<Publication[]>([])
  const [patents, setPatents] = useState<Patent[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const { preview: achievPreview, show: showAchievPreview, hide: hideAchievPreview } = useZoomPreview()

  useEffect(() => {
    fetch('/api/partners').then(r => r.json()).then(d => setPartners(Array.isArray(d) ? d : [])).catch(() => {})
    fetch('/api/science').then(r => r.json()).then(d => {
      setPublications(Array.isArray(d?.publications) ? d.publications : [])
      setPatents(Array.isArray(d?.patents) ? d.patents : [])
      setProjects(Array.isArray(d?.projects) ? d.projects : [])
      setAchievements(Array.isArray(d?.achievements) ? d.achievements : [])
      setContracts(Array.isArray(d?.contracts) ? d.contracts : [])
    }).catch(() => {})
  }, [])

  const toDevItem = (p: Project): DevItem => ({
    id: p.id,
    title: (lang === 'kk' ? p.title_kk : lang === 'en' ? p.title_en : p.title_ru) || p.title_ru,
    description: (lang === 'kk' ? p.description_kk : lang === 'en' ? p.description_en : p.description_ru) || '',
    period: p.period,
    tags: p.tags,
    image_url: p.image_url,
  })

  const individualDevs = projects.filter(p => p.kind !== 'project').map(toDevItem)
  const researchProjects = projects.filter(p => p.kind === 'project').map(toDevItem)

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

      {/* ══ Individual developments ══ */}
      {individualDevs.length > 0 && (
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-1.5" style={{ color: '#0F172A' }}>{tr.nauka.indivDevTitle}</h2>
          <p className="text-sm mb-6" style={{ color: '#64748B' }}>{tr.nauka.indivDevIntro}</p>
          <DevelopmentCarousel items={individualDevs} />
        </div>
      )}

      {/* ══ Projects ══ */}
      {researchProjects.length > 0 && (
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-1.5" style={{ color: '#0F172A' }}>{tr.nauka.projectsTitle}</h2>
          <p className="text-sm mb-6" style={{ color: '#64748B' }}>{tr.nauka.projectsIntro}</p>
          <DevelopmentCarousel items={researchProjects} />
        </div>
      )}

      {/* ══ Contract research (хоздоговоры) ══ */}
      {contracts.length > 0 && (
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-1.5" style={{ color: '#0F172A' }}>{tr.nauka.contractsTitle}</h2>
          <p className="text-sm mb-6" style={{ color: '#64748B' }}>{tr.nauka.contractsIntro}</p>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #E2E8F0', background: 'white' }}>
            <div className="divide-y" style={{ borderColor: '#F1F5F9' }}>
              {contracts.map(c => (
                <div key={c.id} className="flex items-start gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#EFF6FF' }}>
                    <FileSignature size={16} style={{ color: '#1565C0' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{c.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {c.year && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#475569' }}>{c.year}</span>}
                      {c.customer && <span className="text-[11px]" style={{ color: '#1565C0' }}>{c.customer}</span>}
                    </div>
                    {c.description && <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: '#64748B' }}>{c.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ Intellectual property ══ */}
      {(publications.length > 0 || patents.length > 0) && (
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-1.5" style={{ color: '#0F172A' }}>{tr.nauka.ipTitle}</h2>
          <p className="text-sm mb-6" style={{ color: '#64748B' }}>{tr.nauka.ipIntro}</p>

          {/* Publications accordion */}
          {publications.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setPubOpen(v => !v)}
                className="w-full flex items-center justify-between p-5 rounded-2xl transition-all"
                style={{
                  background: 'white',
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
                  <span className="font-black text-lg px-3 py-1 rounded-lg" style={{ background: '#EFF6FF', color: '#1565C0' }}>
                    {publications.length}
                  </span>
                  <ChevronDown size={18} style={{ color: '#94A3B8', transform: pubOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
                </div>
              </button>

              {pubOpen && (
                <div className="mt-3 rounded-2xl overflow-hidden" style={{ border: '1.5px solid #E2E8F0', background: 'white' }}>
                  <div className="divide-y" style={{ borderColor: '#F1F5F9' }}>
                    {publications.map((pub, i) => (
                      <div key={pub.id} className="flex items-start gap-3 px-6 py-4">
                        <span className="shrink-0 mt-0.5 w-6 text-[11px] font-black text-right" style={{ color: '#CBD5E1' }}>{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          {pub.doi ? (
                            <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                              className="text-sm font-semibold leading-snug hover:underline" style={{ color: '#0F172A' }}>
                              {pub.title}
                            </a>
                          ) : (
                            <span className="text-sm font-semibold leading-snug" style={{ color: '#0F172A' }}>{pub.title}</span>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {pub.year && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#475569' }}>{pub.year}</span>}
                            {pub.journal && <span className="text-[11px]" style={{ color: '#1565C0' }}>{pub.journal}</span>}
                          </div>
                          {pub.authors && <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>{pub.authors}</p>}
                        </div>
                        {pub.doi && (
                          <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
                            style={{ background: '#EFF6FF', color: '#1565C0' }}>
                            <ExternalLink size={10} />DOI
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Patents & copyright certificates accordion */}
          {patents.length > 0 && (
            <div>
              <button
                onClick={() => setPatentsOpen(v => !v)}
                className="w-full flex items-center justify-between p-5 rounded-2xl transition-all"
                style={{
                  background: 'white',
                  border: `1.5px solid ${patentsOpen ? '#1565C0' : '#E2E8F0'}`,
                  boxShadow: patentsOpen ? '0 4px 20px rgba(21,101,192,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: patentsOpen ? '#1565C0' : '#EFF6FF' }}>
                    <ShieldCheck size={20} style={{ color: patentsOpen ? 'white' : '#1565C0' }} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm" style={{ color: '#0F172A' }}>{tr.nauka.patentsTitle}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{tr.nauka.patentsIntro.slice(0, 80)}…</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="font-black text-lg px-3 py-1 rounded-lg" style={{ background: '#EFF6FF', color: '#1565C0' }}>
                    {patents.length}
                  </span>
                  <ChevronDown size={18} style={{ color: '#94A3B8', transform: patentsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
                </div>
              </button>

              {patentsOpen && (
                <div className="mt-3 rounded-2xl overflow-hidden" style={{ border: '1.5px solid #E2E8F0', background: 'white' }}>
                  <div className="divide-y" style={{ borderColor: '#F1F5F9' }}>
                    {patents.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3 px-6 py-4">
                        <span className="shrink-0 w-6 text-[11px] font-black text-right" style={{ color: '#CBD5E1' }}>{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{p.title}</p>
                          {p.patent_number && <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>{p.patent_number}</p>}
                        </div>
                        <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#ECFDF5', color: '#059669' }}>{p.badge_label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ Achievements — company diploma + employee gallery together ══ */}
      <div className="mb-16">
        <h2 className="text-xl font-bold mb-1.5" style={{ color: '#0F172A' }}>{tr.nauka.achievementsTitle}</h2>
        <p className="text-sm mb-6" style={{ color: '#64748B' }}>{tr.nauka.achievementsIntro}</p>

        {/* Company achievement — featured banner */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]">
            <div className="flex items-center justify-center p-8 sm:p-6" style={{ background: 'linear-gradient(135deg,#1565C0,#0284C7)' }}>
              <Trophy size={44} style={{ color: 'white' }} />
            </div>
            <div className="p-6">
              <div className="text-[10px] font-mono tracking-widest mb-1" style={{ color: '#94A3B8' }}>
                НИНЖ РК · 2025
              </div>
              <h3 className="font-black text-lg leading-tight mb-3" style={{ color: '#0F172A' }}>
                {tr.nauka.achievTitle}
              </h3>
              <p className="text-sm leading-relaxed mb-2" style={{ color: '#334155' }}>
                {tr.nauka.achievDesc1}
              </p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#64748B' }}>
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
        </div>

        {/* Employee achievements — same section, right below */}
        {achievements.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1" style={{ background: '#E2E8F0' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>{tr.nauka.empAchievLabel}</span>
              <div className="h-px flex-1" style={{ background: '#E2E8F0' }} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {achievements.map((a, i) => {
                const medalColor = i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#B45309' : '#64748B'
                return (
                  <div key={a.id}
                    onMouseEnter={e => { if (a.certificate_url) showAchievPreview(a.certificate_url, e.currentTarget, a.id) }}
                    onMouseLeave={() => hideAchievPreview(a.id)}
                    className="group rounded-xl overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div className="aspect-[4/3] overflow-hidden" style={{ background: '#F1F5F9' }}>
                      {a.certificate_url ? (
                        <img src={a.certificate_url} alt={a.award_name} draggable={false}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: `${medalColor}1A` }}>
                          <Medal size={28} style={{ color: medalColor }} />
                        </div>
                      )}
                    </div>
                    <div className="p-3.5">
                      <p className="font-bold text-sm truncate" style={{ color: '#0F172A' }}>{a.full_name}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: '#64748B' }}>{a.award_name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {a.year && <span className="text-[11px]" style={{ color: '#94A3B8' }}>{a.year}</span>}
                        {a.organization && <span className="text-[11px] truncate" style={{ color: '#1565C0' }}>{a.organization}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <ZoomPreviewOverlay preview={achievPreview} scale={1.25} maxHeight="45vh" />
          </>
        )}
      </div>

      {/* ══ Accreditation — separate section ══ */}
      <div className="mb-14">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0F172A' }}>{tr.nauka.accSectionTitle}</h2>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]">
            <div className="flex items-center justify-center p-8 sm:p-6" style={{ background: 'linear-gradient(135deg,#0284C7,#0EA5E9)' }}>
              <ShieldCheck size={44} style={{ color: 'white' }} />
            </div>
            <div className="p-6">
              <div className="text-[10px] font-mono tracking-widest mb-1" style={{ color: '#94A3B8' }}>
                МОН РК · до 09.02.2029
              </div>
              <h3 className="font-black text-lg leading-tight mb-3" style={{ color: '#0F172A' }}>
                {tr.nauka.accTitle}
              </h3>
              <p className="text-sm leading-relaxed mb-2" style={{ color: '#334155' }}>
                {tr.nauka.accDesc1}
              </p>
              <p className="text-sm leading-relaxed mb-2" style={{ color: '#64748B' }}>
                {tr.nauka.accDesc2}
              </p>
              <p className="text-xs font-semibold mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
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
