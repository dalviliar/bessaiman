'use client'

import { useEffect, useState } from 'react'
import {
  BookOpen, ShieldCheck, ExternalLink, Medal, FileSignature, X,
  Calendar, FlaskConical, ChevronLeft, ChevronRight, Image as ImageIcon, type LucideIcon,
} from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import { useZoomPreview, ZoomPreviewOverlay } from '@/components/HoverZoomPreview'

interface Publication { id: string; title: string; authors: string | null; journal: string | null; year: number | null; doi: string | null }
interface Patent { id: string; title: string; patent_number: string | null; badge_label: string }
interface Project {
  id: string; title_ru: string; title_kk: string | null; title_en: string | null
  description_ru: string | null; description_kk: string | null; description_en: string | null
  period: string | null; tags: string | null; images: string[] | null; kind: string; text_align: string
}
interface Achievement { id: string; full_name: string; award_name: string; year: number | null; organization: string | null; certificate_url: string | null }
interface Contract { id: string; title: string; customer: string | null; year: number | null; description: string | null; text_align: string }

// Every tab renders the same card, so each section is reduced to this shape.
interface NCard {
  id: string
  title: string
  subtitle?: string
  meta: string[]
  images: string[]
  icon?: LucideIcon
  accent?: string
  tags?: string | null
  badge?: string
  group?: string
  /** documents are shown whole; equipment photos fill the frame */
  fit?: 'cover' | 'contain'
  body: string[]
  bodyAlign?: 'left' | 'center' | 'justify'
  link?: { href: string; label: string }
}

// Rendered once from the first page of the accreditation PDF, so staff do
// not have to upload the same document twice.
const ACCREDITATION_IMAGE = '/docs/svidetelstvo-akkreditacii-preview.jpg'

// shipped photo, replaced by whatever the admin uploads
const HERO_FALLBACK = '/images/nauka-hero-lab.jpg'

const PAGE_SIZE = 9

function TagRow({ tags, size = 'sm' }: { tags?: string | null; size?: 'sm' | 'md' }) {
  if (!tags) return null
  const cls = size === 'sm' ? 'text-[12px] px-2 py-0.5' : 'text-[13px] px-2.5 py-1'
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
        <span key={t} className={`font-semibold rounded-full ${cls}`} style={{ background: '#EFF6FF', color: '#1565C0' }}>{t}</span>
      ))}
    </div>
  )
}

export default function NaukaPage() {
  const { tr, lang } = useLang()
  const [partners, setPartners] = useState<{ id: string; name: string; logo_url: string | null; website_url: string | null }[]>([])
  const [publications, setPublications] = useState<Publication[]>([])
  const [patents, setPatents] = useState<Patent[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [heroImage, setHeroImage] = useState(HERO_FALLBACK)

  const [tab, setTab] = useState('dev')
  const [sub, setSub] = useState('')
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [active, setActive] = useState<NCard | null>(null)
  const [shot, setShot] = useState(0)
  const { preview, show: showPreview, hide: hidePreview } = useZoomPreview()

  useEffect(() => {
    fetch('/api/page-images').then(r => r.json()).then(d => { if (d?.nauka) setHeroImage(d.nauka) }).catch(() => {})
    fetch('/api/partners').then(r => r.json()).then(d => setPartners(Array.isArray(d) ? d : [])).catch(() => {})
    fetch('/api/science').then(r => r.json()).then(d => {
      setPublications(Array.isArray(d?.publications) ? d.publications : [])
      setPatents(Array.isArray(d?.patents) ? d.patents : [])
      setProjects(Array.isArray(d?.projects) ? d.projects : [])
      setAchievements(Array.isArray(d?.achievements) ? d.achievements : [])
      setContracts(Array.isArray(d?.contracts) ? d.contracts : [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!active) return
    setShot(0)
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null) }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [active])

  const pick = (ru: string | null, kk: string | null, en: string | null) =>
    (lang === 'kk' ? kk : lang === 'en' ? en : ru) || ru || ''

  const projectCard = (p: Project): NCard => ({
    id: p.id,
    title: pick(p.title_ru, p.title_kk, p.title_en),
    meta: p.period ? [p.period] : [],
    images: p.images ?? [],
    icon: FlaskConical,
    accent: '#1565C0',
    tags: p.tags,
    body: [pick(p.description_ru, p.description_kk, p.description_en)].filter(Boolean),
    bodyAlign: (p.text_align as NCard['bodyAlign']) || 'left',
  })

  const devCards = projects.filter(p => p.kind !== 'project').map(projectCard)
  const projectCards = projects.filter(p => p.kind === 'project').map(projectCard)

  const contractCards: NCard[] = contracts.map(c => ({
    id: c.id,
    title: c.title,
    subtitle: c.customer ?? undefined,
    meta: c.year ? [String(c.year)] : [],
    images: [],
    icon: FileSignature,
    accent: '#0284C7',
    body: c.description ? [c.description] : [],
    bodyAlign: (c.text_align as NCard['bodyAlign']) || 'left',
  }))

  const ipCards: NCard[] = [
    ...patents.map(p => ({
      id: `pat-${p.id}`,
      title: p.title,
      subtitle: p.patent_number ?? undefined,
      meta: [],
      images: [],
      icon: ShieldCheck,
      accent: '#059669',
      badge: p.badge_label,
      group: 'patent',
      body: [],
    })),
    ...publications.map(p => ({
      id: `pub-${p.id}`,
      title: p.title,
      subtitle: p.journal ?? undefined,
      meta: p.year ? [String(p.year)] : [],
      images: [],
      icon: BookOpen,
      accent: '#1565C0',
      group: 'publication',
      body: p.authors ? [p.authors] : [],
      link: p.doi ? { href: `https://doi.org/${p.doi}`, label: 'DOI' } : undefined,
    })),
  ]

  const awardCards: NCard[] = achievements.map(a => ({
    id: a.id,
    title: a.full_name,
    subtitle: a.award_name,
    meta: [a.year ? String(a.year) : '', a.organization ?? ''].filter(Boolean),
    images: a.certificate_url ? [a.certificate_url] : [],
    fit: 'contain' as const,
    icon: Medal,
    accent: '#F59E0B',
    body: [],
  }))

  const TABS = [
    { key: 'dev', label: tr.nauka.indivDevTitle, intro: tr.nauka.indivDevIntro, cards: devCards },
    { key: 'projects', label: tr.nauka.projectsTitle, intro: tr.nauka.projectsIntro, cards: projectCards },
    { key: 'contracts', label: tr.nauka.contractsTitle, intro: tr.nauka.contractsIntro, cards: contractCards },
    { key: 'ip', label: tr.nauka.ipTitle, intro: tr.nauka.ipIntro, cards: ipCards },
    { key: 'awards', label: tr.nauka.achievementsTitle, intro: tr.nauka.achievementsIntro, cards: awardCards },
  ].filter(t => t.cards.length > 0)

  const current = TABS.find(t => t.key === tab) ?? TABS[0]

  const groups = current
    ? Array.from(new Set(current.cards.map(c => c.group).filter(Boolean))) as string[]
    : []
  const groupLabel: Record<string, string> = {
    patent: tr.nauka.patentsTitle,
    publication: tr.nauka.pubTitle,
  }
  const visible = current ? current.cards.filter(c => !sub || c.group === sub) : []

  useEffect(() => { setLimit(PAGE_SIZE); setSub('') }, [tab])
  useEffect(() => { setLimit(PAGE_SIZE) }, [sub])

  const shown = visible.slice(0, limit)
  const hasMedia = shown.some(c => c.images.length > 0)
  const rest = visible.length - shown.length

  return (
    <div>

      {/* ══ Hero ══ */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(8,17,34,0.82) 0%, rgba(8,17,34,0.68) 45%, rgba(8,17,34,0.88) 100%)' }}
          aria-hidden
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-[13px] font-mono tracking-[0.2em] font-bold"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#DBEAFE', border: '1px solid rgba(191,219,254,0.35)', backdropFilter: 'blur(4px)' }}>
            BES SAIMAN GROUP
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 text-white" style={{ textShadow: '0 2px 24px rgba(0,0,0,0.45)' }}>
            {tr.nauka.heroTitle}
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#E2E8F0' }}>
            {tr.nauka.heroSubtitle}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* ══ Section tabs ══ */}
        {current && (
          <div className="mb-16">
            {/* stays reachable while a long grid scrolls past */}
            <div className="sticky top-[76px] md:top-[96px] z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-5"
              style={{ background: 'rgba(240,244,248,0.94)', backdropFilter: 'blur(8px)' }}>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {TABS.map(t => {
                const on = t.key === current.key
                return (
                  <button key={t.key} type="button" onClick={() => setTab(t.key)}
                    className="flex-none inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-semibold transition-all"
                    style={{
                      background: on ? 'linear-gradient(135deg,#1565C0,#0284C7)' : 'white',
                      color: on ? 'white' : '#475569',
                      border: `1.5px solid ${on ? 'transparent' : '#E2E8F0'}`,
                      boxShadow: on ? '0 4px 14px rgba(21,101,192,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                    }}>
                    {t.label}
                    <span className="text-[12px] font-black px-1.5 py-0.5 rounded-md"
                      style={{ background: on ? 'rgba(255,255,255,0.22)' : '#F1F5F9', color: on ? 'white' : '#94A3B8' }}>
                      {t.cards.length}
                    </span>
                  </button>
                )
              })}
              </div>
            </div>

            <p className="text-base mb-5" style={{ color: '#64748B' }}>{current.intro}</p>

            {groups.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {[{ key: '', label: tr.nauka.allFilter }, ...groups.map(g => ({ key: g, label: groupLabel[g] ?? g }))].map(g => {
                  const on = g.key === sub
                  return (
                    <button key={g.key || 'all'} type="button" onClick={() => setSub(g.key)}
                      className="px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors"
                      style={{
                        background: on ? '#EFF6FF' : 'white',
                        color: on ? '#1565C0' : '#64748B',
                        border: `1px solid ${on ? '#BFDBFE' : '#E2E8F0'}`,
                      }}>
                      {g.label}
                      <span className="ml-1.5" style={{ color: '#94A3B8' }}>
                        {g.key ? current.cards.filter(c => c.group === g.key).length : current.cards.length}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Patents, publications and contracts never carry a photo, so they
                get a document row instead of a card with an empty picture. */}
            {!hasMedia ? (
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0', background: 'white' }}>
                <div className="divide-y" style={{ borderColor: '#F1F5F9' }}>
                  {shown.map((card, i) => (
                    <button key={card.id} type="button" onClick={() => setActive(card)}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      className="w-full text-left flex items-start gap-4 px-5 py-4 transition-colors">
                      <span className="shrink-0 w-7 text-sm font-black text-right pt-0.5" style={{ color: '#CBD5E1' }}>
                        {i + 1}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-semibold text-base leading-snug" style={{ color: '#0F172A' }}>
                          {card.title}
                        </span>
                        {(card.subtitle || card.meta.length > 0) && (
                          <span className="block text-sm mt-1" style={{ color: '#1565C0' }}>
                            {[card.subtitle, ...card.meta].filter(Boolean).join('  ·  ')}
                          </span>
                        )}
                        {card.body[0] && (
                          <span className="block text-sm mt-1 line-clamp-2" style={{ color: '#94A3B8' }}>{card.body[0]}</span>
                        )}
                      </span>
                      <span className="flex items-center gap-2 shrink-0 pt-0.5">
                        {card.badge && (
                          <span className="px-2.5 py-1 rounded-full text-[12px] font-bold whitespace-nowrap"
                            style={{ background: '#ECFDF5', color: '#059669' }}>{card.badge}</span>
                        )}
                        {card.link && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-bold"
                            style={{ background: '#EFF6FF', color: '#1565C0' }}>
                            <ExternalLink size={10} />{card.link.label}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shown.map(card => {
                const Icon = card.icon ?? FlaskConical
                const cover = card.images[0]
                return (
                  <button key={card.id} type="button" onClick={() => setActive(card)}
                    onMouseEnter={e => {
                      if (cover) showPreview(cover, e.currentTarget, card.id)
                      e.currentTarget.style.borderColor = '#93C5FD'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(21,101,192,0.12)'
                    }}
                    onMouseLeave={e => {
                      hidePreview(card.id)
                      e.currentTarget.style.borderColor = '#E2E8F0'
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                    className="group text-left rounded-xl overflow-hidden flex flex-col transition-[box-shadow,border-color] duration-200"
                    style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div className="relative aspect-[4/3] overflow-hidden" style={{ background: card.fit === 'contain' ? '#F8FAFC' : '#F1F5F9' }}>
                      {cover ? (
                        <img src={cover} alt={card.title} draggable={false}
                          className={`w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.03] ${card.fit === 'contain' ? 'object-contain p-3' : 'object-cover'}`} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${card.accent}14, ${card.accent}05)` }}>
                          <Icon size={40} style={{ color: card.accent, opacity: 0.55 }} />
                        </div>
                      )}
                      {card.images.length > 1 && (
                        <span className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-semibold"
                          style={{ background: 'rgba(15,23,42,0.72)', color: 'white' }}>
                          <ImageIcon size={12} />{card.images.length}
                        </span>
                      )}
                      {card.badge && (
                        <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[12px] font-bold"
                          style={{ background: '#ECFDF5', color: '#059669' }}>{card.badge}</span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-base leading-snug line-clamp-2 mb-1.5" style={{ color: '#0F172A' }}>{card.title}</h3>
                      {card.subtitle && (
                        <p className="text-sm line-clamp-1 mb-1.5" style={{ color: '#1565C0' }}>{card.subtitle}</p>
                      )}
                      {card.meta.length > 0 && (
                        <div className="flex items-center gap-1.5 text-sm mb-2" style={{ color: '#64748B' }}>
                          <Calendar size={12} />{card.meta.join(' · ')}
                        </div>
                      )}
                      <div className="mt-auto"><TagRow tags={card.tags} /></div>
                    </div>
                  </button>
                )
              })}
            </div>
            )}

            {rest > 0 && (
              <div className="text-center mt-7">
                <button type="button" onClick={() => setLimit(l => l + PAGE_SIZE)}
                  className="px-6 py-2.5 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5"
                  style={{ background: 'white', border: '1.5px solid #CBD5E1', color: '#1565C0' }}>
                  {tr.nauka.showMore} · {rest}
                </button>
              </div>
            )}
          </div>
        )}

        <ZoomPreviewOverlay preview={preview} scale={1.25} maxHeight="55vh"
          objectFit={current?.key === 'awards' ? 'contain' : 'cover'} />

        {/* ══ Accreditation — separate section ══ */}
        <div className="mb-14">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#0F172A' }}>{tr.nauka.accSectionTitle}</h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]">
              <div className="overflow-hidden" style={{ background: '#F1F5F9' }}>
                <img src={ACCREDITATION_IMAGE} alt={tr.nauka.accTitle} className="w-full h-full object-cover" style={{ minHeight: 160 }} />
              </div>
              <div className="p-6">
                <div className="text-[12px] font-mono tracking-widest mb-1" style={{ color: '#94A3B8' }}>
                  МОН РК · до 09.02.2029
                </div>
                <h3 className="font-black text-lg leading-tight mb-3" style={{ color: '#0F172A' }}>
                  {tr.nauka.accTitle}
                </h3>
                <p className="text-base leading-relaxed mb-2" style={{ color: '#334155', textAlign: 'justify' }}>
                  {tr.nauka.accDesc1}
                </p>
                <p className="text-base leading-relaxed mb-2" style={{ color: '#64748B', textAlign: 'justify' }}>
                  {tr.nauka.accDesc2}
                </p>
                <p className="text-sm font-semibold mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background: '#EFF6FF', color: '#1565C0' }}>
                  📅 {tr.nauka.accDesc3}
                </p>
                <div>
                  <a href="/docs/svidetelstvo-akkreditacii.pdf" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg,#1565C0,#0284C7)', color: 'white', boxShadow: '0 4px 12px rgba(21,101,192,0.25)' }}>
                    <ExternalLink size={13} />
                    {tr.nauka.accViewDoc}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ Card detail modal ══ */}
        {active && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.6)' }} onClick={() => setActive(null)}>
            <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl"
              style={{ background: 'white' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setActive(null)} aria-label="Закрыть"
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-10 transition-colors hover:opacity-80"
                style={{ background: 'rgba(15,23,42,0.06)' }}>
                <X size={16} style={{ color: '#0F172A' }} />
              </button>

              {active.images.length > 0 && (
                <div>
                  <div className="relative w-full aspect-[16/9]" style={{ background: '#F1F5F9' }}>
                    <img src={active.images[Math.min(shot, active.images.length - 1)]} alt={active.title}
                      className="w-full h-full object-contain" />
                    {active.images.length > 1 && (
                      <>
                        <button onClick={() => setShot(s => (s - 1 + active.images.length) % active.images.length)} aria-label="Предыдущее фото"
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                          style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
                          <ChevronLeft size={17} style={{ color: '#0F172A' }} />
                        </button>
                        <button onClick={() => setShot(s => (s + 1) % active.images.length)} aria-label="Следующее фото"
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                          style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
                          <ChevronRight size={17} style={{ color: '#0F172A' }} />
                        </button>
                      </>
                    )}
                  </div>
                  {active.images.length > 1 && (
                    <div className="flex gap-2 px-6 pt-4 overflow-x-auto no-scrollbar">
                      {active.images.map((src, i) => (
                        <button key={src + i} onClick={() => setShot(i)}
                          className="flex-none w-20 h-16 rounded-lg overflow-hidden transition-opacity"
                          style={{
                            border: i === shot ? '2px solid #1565C0' : '1px solid #E2E8F0',
                            opacity: i === shot ? 1 : 0.7,
                            background: '#F8FAFC',
                          }}>
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="p-6">
                {active.meta.length > 0 && (
                  <div className="text-[12px] font-mono tracking-widest mb-1" style={{ color: '#94A3B8' }}>
                    {active.meta.join(' · ')}
                  </div>
                )}
                <h3 className="text-xl font-black mb-1 leading-tight" style={{ color: '#0F172A' }}>{active.title}</h3>
                {active.subtitle && (
                  <p className="text-base font-semibold mb-3" style={{ color: '#1565C0' }}>{active.subtitle}</p>
                )}
                {active.tags && <div className="mb-4"><TagRow tags={active.tags} size="md" /></div>}
                {active.body.length > 0
                  ? active.body.map((p, i) => (
                    <p key={i} className="text-base leading-relaxed whitespace-pre-line mb-2"
                      style={{ color: i === 0 ? '#334155' : '#64748B', textAlign: active.bodyAlign ?? 'left' }}>{p}</p>
                  ))
                  : <p className="text-base" style={{ color: '#94A3B8' }}>{tr.nauka.noDetails}</p>}
                {active.link && (
                  <a href={active.link.href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg,#1565C0,#0284C7)', color: 'white', boxShadow: '0 4px 12px rgba(21,101,192,0.25)' }}>
                    <ExternalLink size={13} />
                    {active.link.label}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ Partners ══ */}
        {partners.length > 0 && (
          <div className="rounded-2xl p-8 mb-12"
            style={{ background: 'linear-gradient(135deg,#EBF2FB,#F0F9FF)', border: '1px solid rgba(21,101,192,0.12)' }}>
            <h2 className="text-xl font-bold mb-1.5 text-center" style={{ color: '#0F172A' }}>{tr.nauka.partnersTitle}</h2>
            <p className="text-base mb-6 text-center" style={{ color: '#64748B' }}>{tr.nauka.partnersSubtitle}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {partners.map((p) => {
                const card = (
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                    style={{ background: '#FFFFFF', border: '1px solid rgba(21,101,192,0.18)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    {p.logo_url && <img src={p.logo_url} alt={p.name} style={{ height: 28, maxWidth: 70, objectFit: 'contain' }} />}
                    <span className="text-base font-medium" style={{ color: '#1565C0' }}>{p.name}</span>
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
          <p className="text-blue-100 mb-6 text-base">{tr.nauka.ctaSubtitle}</p>
          <a href="/contacts"
            className="inline-block px-8 py-3 rounded-xl font-semibold text-base transition-all hover:opacity-90"
            style={{ background: '#FFFFFF', color: '#1565C0' }}>
            {tr.nauka.ctaButton}
          </a>
        </div>

      </div>
    </div>
  )
}
