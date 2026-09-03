'use client'

import { useEffect, useState, useMemo, useRef, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X, Flame, Cog, Wind, Zap, Package, Wrench, ChevronRight, ChevronLeft, type LucideIcon } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import ProductCard from '@/components/ProductCard'
import { getCategories, getProducts } from '@/lib/supabase'
import type { Category, Product } from '@/types'

// ── Уровень 1: типы продукции (из документации) ──────────────────
const TYPE_DEFS = [
  { key: 'all', labelKey: 'typeAll' },
  { key: 'S',   labelKey: 'typeSerial' },
  { key: 'PA',  labelKey: 'typeAccessories' },
  { key: 'I',   labelKey: 'typeCustom' },
]

// ── Уровень 2: иконки категорий ──────────────────────────────────
const CAT_ICONS: Record<string, LucideIcon> = {
  sfm: Flame, sfth: Flame, sftv: Flame, sftm: Flame,
  sm: Cog, ss: Wind, furniture: Package, pa: Wrench,
}

// ── Уровень 3: подтипы по категории ──────────────────────────────
interface SubcatDef {
  code: string
  labelKey: string
  modelMatch?: (model: string) => boolean
}

const CAT_SUBCATS: Record<string, SubcatDef[]> = {
  sfm:       [],
  sfth:      [],
  sftv:      [],
  sftm:      [],
  sm: [
    { code: 'SM', labelKey: 'subBallMill', modelMatch: m => m.includes('BALLMILL') || m.includes('PBALL') },
    { code: 'SV', labelKey: 'subSieve', modelMatch: m => m.includes('VIBSIEVE') },
  ],
  ss: [
    { code: 'SES', labelKey: 'subSpinning', modelMatch: m => m.startsWith('BS-ES') },
    { code: 'SGB', labelKey: 'subGlovebox', modelMatch: m => m.startsWith('BS-VGB') || m.startsWith('BS-AGB') },
  ],
  furniture: [
    { code: 'FH',  labelKey: 'subFumeHood', modelMatch: m => m.startsWith('BS-FH') },
    { code: 'GC',  labelKey: 'subGasCabinet', modelMatch: m => m.startsWith('BS-GC') },
    { code: 'LT',  labelKey: 'subTables', modelMatch: m => /^BS-(LT|AVT|ILT|T-)/.test(m) },
  ],
  pa: [],
}

// ── Уровень 4: атрибутные фильтры для подтипов ───────────────────
interface AttrDef { specKey: string; labelKey: string }
const SUBCAT_ATTRS: Record<string, AttrDef[]> = {
  SFM: [
    { specKey: 'Объём камеры',      labelKey: 'specVolume' },
    { specKey: 'Макс. температура', labelKey: 'specTemperature' },
  ],
  SFTH: [
    { specKey: 'Кол-во зон',        labelKey: 'specZones' },
    { specKey: 'Диаметр трубы',     labelKey: 'specTubeDiameter' },
    { specKey: 'Макс. температура', labelKey: 'specTemperature' },
  ],
}

// ── Хелперы ──────────────────────────────────────────────────────
function matchesSubcat(p: Product, sc: SubcatDef): boolean {
  if (sc.modelMatch) return sc.modelMatch(p.model ?? '')
  return p.classification_code === sc.code
}

function sortSpecVals(vals: string[]): string[] {
  return [...vals].sort((a, b) => {
    const na = parseFloat(a.replace(/[^\d.]/g, ''))
    const nb = parseFloat(b.replace(/[^\d.]/g, ''))
    if (!isNaN(na) && !isNaN(nb)) return na - nb
    return a.localeCompare(b, 'ru')
  })
}

// ── Компонент чипа-фильтра ────────────────────────────────────────
function FilterChip({
  label, count, active, onClick,
}: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base font-semibold transition-all whitespace-nowrap"
      style={{
        background: active ? '#1565C0' : 'white',
        border: `1.5px solid ${active ? '#1565C0' : '#E2E8F0'}`,
        color: active ? 'white' : '#64748B',
        boxShadow: active ? '0 2px 8px rgba(21,101,192,0.25)' : 'none',
      }}>
      {label}
      {count !== undefined && (
        <span className="text-[12px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: active ? 'rgba(255,255,255,0.2)' : '#F1F5F9', color: active ? 'white' : '#94A3B8' }}>
          {count}
        </span>
      )}
    </button>
  )
}

// ── Блок атрибутного фильтра ─────────────────────────────────────
function AttrFilterRow({
  def, values, selected, onSelect, label,
}: { def: AttrDef; values: string[]; selected: string; onSelect: (v: string) => void; label: string }) {
  if (values.length < 2) return null
  return (
    <div className="flex items-start gap-3 flex-wrap">
      <span className="text-[12px] font-mono font-bold tracking-wider uppercase mt-2 shrink-0 w-24"
        style={{ color: '#94A3B8' }}>
        {label}:
      </span>
      <div className="flex flex-wrap gap-1.5">
        {values.map(v => (
          <button key={v} onClick={() => onSelect(selected === v ? '' : v)}
            className="px-2.5 py-1 rounded-lg text-[13px] font-semibold transition-all"
            style={{
              background: selected === v ? '#1565C0' : '#F1F5F9',
              color: selected === v ? 'white' : '#475569',
              border: `1.5px solid ${selected === v ? '#1565C0' : 'transparent'}`,
            }}>
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

// shipped photo, replaced by whatever the admin uploads
const HERO_FALLBACK = '/images/catalog-hero-lab.jpg'

const PAGE_SIZE = 12

// Compact page list: always show first/last, current ±1, "…" for the gaps
function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current, current - 1, current + 1])
  const sorted = Array.from(pages).filter(n => n >= 1 && n <= total).sort((a, b) => a - b)
  const result: (number | '…')[] = []
  sorted.forEach((n, i) => {
    if (i > 0 && n - (sorted[i - 1] as number) > 1) result.push('…')
    result.push(n)
  })
  return result
}

// ── Основной компонент ────────────────────────────────────────────
function CatalogContent() {
  const { lang, tr } = useLang()
  // filter definitions store translation keys, since their labels are ours
  // rather than admin-entered content
  const L = (key: string) => (tr.catalog as Record<string, string>)[key] ?? key
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [heroImage, setHeroImage] = useState(HERO_FALLBACK)
  const [categories, setCategories]   = useState<Category[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading]         = useState(true)

  // Фильтры (4 уровня + поиск)
  const [selType,     setSelType]     = useState(searchParams.get('type') ?? 'all')
  const [selCat,      setSelCat]      = useState(searchParams.get('category') ?? '')
  const [selSubcat,   setSelSubcat]   = useState('')
  const [selAttrs,    setSelAttrs]    = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [page,        setPage]        = useState(1)
  const gridTopRef = useRef<HTMLDivElement>(null)

  // Загружаем всё один раз
  useEffect(() => {
    fetch('/api/page-images').then(r => r.json()).then(d => { if (d?.catalog) setHeroImage(d.catalog) }).catch(() => {})
    Promise.all([getCategories(), getProducts()])
      .then(([cats, prods]) => {
        setCategories(cats)
        setAllProducts(prods)
        setLoading(false)
      })
  }, [])

  // Держим тип/категорию в URL — иначе кнопка "назад" из карточки товара
  // возвращает на каталог без фильтров (React-состояние не переживает переход)
  const updateUrl = (next: { type?: string; category?: string }) => {
    const type = next.type ?? selType
    const category = next.category ?? selCat
    const sp = new URLSearchParams()
    if (type && type !== 'all') sp.set('type', type)
    if (category) sp.set('category', category)
    const qs = sp.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  // При смене категории — сбрасываем подтип и атрибуты
  const handleCatSelect = (slug: string) => {
    const next = selCat === slug ? '' : slug
    setSelCat(next)
    setSelSubcat('')
    setSelAttrs({})
    updateUrl({ category: next })
  }

  // При смене типа — сбрасываем всё ниже
  const handleTypeSelect = (key: string) => {
    setSelType(key)
    setSelCat('')
    setSelSubcat('')
    setSelAttrs({})
    setSearchQuery('')
    updateUrl({ type: key, category: '' })
  }

  // При смене подтипа — сбрасываем атрибуты
  const handleSubcatSelect = (code: string) => {
    setSelSubcat(prev => prev === code ? '' : code)
    setSelAttrs({})
  }

  // ── Фильтрация пошагово ────────────────────────────────────────

  const byType = useMemo(() =>
    selType === 'all' ? allProducts : allProducts.filter(p => p.product_type === selType),
    [allProducts, selType])

  const byCat = useMemo(() =>
    selCat ? byType.filter(p => p.category?.slug === selCat) : byType,
    [byType, selCat])

  const bySubcat = useMemo(() => {
    if (!selSubcat) return byCat
    const sc = (CAT_SUBCATS[selCat] ?? []).find(s => s.code === selSubcat)
    if (!sc) return byCat
    return byCat.filter(p => matchesSubcat(p, sc))
  }, [byCat, selCat, selSubcat])

  // Опции атрибутных фильтров (динамически из данных)
  const attrFilterDefs = useMemo(() => {
    const defs = SUBCAT_ATTRS[selSubcat] ?? []
    return defs.map(def => ({
      ...def,
      values: sortSpecVals(
        Array.from(new Set(bySubcat.map(p => p.specs?.[def.specKey]).filter(Boolean) as string[]))
      ),
    })).filter(d => d.values.length >= 2)
  }, [bySubcat, selSubcat])

  const byAttrs = useMemo(() => {
    let result = bySubcat
    for (const [key, val] of Object.entries(selAttrs)) {
      if (val) result = result.filter(p => p.specs?.[key] === val)
    }
    return result
  }, [bySubcat, selAttrs])

  const finalProducts = useMemo(() => {
    if (searchQuery.trim().length < 2) return byAttrs
    const q = searchQuery.toLowerCase()
    return allProducts.filter(p =>
      p.name_ru.toLowerCase().includes(q) ||
      (p.model?.toLowerCase().includes(q) ?? false) ||
      (p.description_ru?.toLowerCase().includes(q) ?? false)
    )
  }, [byAttrs, allProducts, searchQuery])

  // Any filter or search change starts back at page 1 — otherwise you can
  // land on an empty page 4 after narrowing the results down.
  useEffect(() => { setPage(1) }, [selType, selCat, selSubcat, selAttrs, searchQuery])

  const pageCount = Math.max(1, Math.ceil(finalProducts.length / PAGE_SIZE))
  const pagedProducts = useMemo(
    () => finalProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [finalProducts, page]
  )

  const goToPage = (n: number) => {
    setPage(Math.min(Math.max(1, n), pageCount))
    gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── Подсчёты для чипов ─────────────────────────────────────────
  const typeCount = (key: string) =>
    key === 'all' ? allProducts.length : allProducts.filter(p => p.product_type === key).length

  const catCount = (slug: string) => byType.filter(p => p.category?.slug === slug).length

  const subcatCount = (sc: SubcatDef) => byCat.filter(p => matchesSubcat(p, sc)).length

  const catName = (cat: Category) =>
    cat[`name_${lang}` as 'name_ru' | 'name_kk' | 'name_en'] || cat.name_ru

  // Подтипы только те, у которых есть товары в текущей выборке
  const visibleSubcats = useMemo(() => {
    if (!selCat) return []
    return (CAT_SUBCATS[selCat] ?? []).filter(sc => subcatCount(sc) > 0)
  }, [selCat, byCat])  // eslint-disable-line react-hooks/exhaustive-deps

  const hasActiveFilters = selType !== 'all' || selCat || selSubcat || Object.values(selAttrs).some(Boolean) || searchQuery

  // ── UI ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>

      {/* ── Заголовок ── */}
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-[13px] font-mono tracking-[0.2em] font-bold"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#DBEAFE', border: '1px solid rgba(191,219,254,0.35)', backdropFilter: 'blur(4px)' }}>
            BES SAIMAN GROUP
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 text-white" style={{ letterSpacing: '-0.02em', textShadow: '0 2px 24px rgba(0,0,0,0.45)' }}>
            {tr.catalog.title}
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#E2E8F0' }}>
            {tr.catalog.subtitle}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ═══ Уровень 1: Тип продукции ═══════════════════════════ */}
        <div className="mb-4">
          <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase mb-2" style={{ color: '#94A3B8' }}>
            {tr.catalog.typeLabel}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {TYPE_DEFS.map(t => (
              <FilterChip key={t.key} label={L(t.labelKey)} count={typeCount(t.key)}
                active={selType === t.key} onClick={() => handleTypeSelect(t.key)} />
            ))}
          </div>
        </div>

        {/* ═══ Уровень 2: Категории ════════════════════════════════ */}
        {(selType === 'all' || selType === 'S') && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              {selType !== 'all' && <ChevronRight size={12} style={{ color: '#CBD5E1' }} />}
              <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase" style={{ color: '#94A3B8' }}>
                {tr.catalog.categoryLabel}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {categories.map(cat => {
                const Icon = CAT_ICONS[cat.slug] ?? Package
                const active = selCat === cat.slug
                const count = catCount(cat.slug)
                if (count === 0) return null
                return (
                  <button key={cat.id} onClick={() => handleCatSelect(cat.slug)}
                    className="flex flex-col gap-2 p-3 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: active ? '#EFF6FF' : 'white',
                      border: `1.5px solid ${active ? '#1565C0' : '#E2E8F0'}`,
                      transform: active ? 'translateY(-2px)' : 'none',
                      boxShadow: active ? '0 4px 14px rgba(21,101,192,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                    }}>
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: active ? '#DBEAFE' : '#F1F5F9' }}>
                        <Icon size={15} style={{ color: active ? '#1565C0' : '#64748B' }} />
                      </div>
                      <span className="text-[12px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: active ? '#DBEAFE' : '#F1F5F9', color: active ? '#1565C0' : '#94A3B8' }}>
                        {count}
                      </span>
                    </div>
                    <span className="text-[13px] font-semibold leading-tight"
                      style={{ color: active ? '#1565C0' : '#374151' }}>
                      {catName(cat)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══ Уровень 3: Подтип (код классификатора) ══════════════ */}
        {selCat && visibleSubcats.length > 1 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <ChevronRight size={12} style={{ color: '#CBD5E1' }} />
              <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase" style={{ color: '#94A3B8' }}>
                {tr.catalog.subtypeLabel}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {visibleSubcats.map(sc => (
                <FilterChip key={sc.code} label={L(sc.labelKey)} count={subcatCount(sc)}
                  active={selSubcat === sc.code} onClick={() => handleSubcatSelect(sc.code)} />
              ))}
            </div>
          </div>
        )}

        {/* ═══ Уровень 4: Атрибутные фильтры ══════════════════════ */}
        {attrFilterDefs.length > 0 && (
          <div className="mb-4 p-4 rounded-xl" style={{ background: 'white', border: '1.5px solid #E2E8F0' }}>
            <div className="flex items-center gap-2 mb-3">
              <ChevronRight size={12} style={{ color: '#CBD5E1' }} />
              <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase" style={{ color: '#94A3B8' }}>
                ПАРАМЕТРЫ
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              {attrFilterDefs.map(def => (
                <AttrFilterRow key={def.specKey} def={def} values={def.values} label={L(def.labelKey)}
                  selected={selAttrs[def.specKey] ?? ''}
                  onSelect={v => setSelAttrs(prev => ({ ...prev, [def.specKey]: v }))} />
              ))}
            </div>
          </div>
        )}

        {/* ═══ Поиск + счётчик ═════════════════════════════════════ */}
        <div className="flex items-center justify-between gap-3 mb-5">
          {/* Разработки по ТЗ — единичные позиции, искать по названию/артикулу тут не нужно */}
          {selType !== 'I' && (
            <div className="relative flex-1">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
              <input type="text" placeholder={tr.catalog.search}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg outline-none text-base"
                style={{ background: 'white', border: '1.5px solid #E2E8F0', color: '#0F172A' }}
                onFocus={e => { e.target.style.borderColor = '#1565C0' }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }}>
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {selType !== 'I' && hasActiveFilters && (
            <button
              onClick={() => { setSelType('all'); setSelCat(''); setSelSubcat(''); setSelAttrs({}); setSearchQuery(''); updateUrl({ type: 'all', category: '' }) }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-base font-semibold transition-all"
              style={{ background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA' }}>
              <X size={12} /> {tr.catalog.reset}
            </button>
          )}

          <p className="text-base font-mono shrink-0" style={{ color: '#94A3B8' }}>
            {loading ? '—' : finalProducts.length}{' '}
            {tr.catalog.itemsCount}
          </p>
        </div>

        {/* ═══ Сетка товаров ═══════════════════════════════════════ */}
        <div ref={gridTopRef} />
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl animate-pulse"
                style={{ background: '#E2E8F0', aspectRatio: '3/4' }} />
            ))}
          </div>
        ) : finalProducts.length === 0 ? (
          <div className="py-24 text-center">
            <Search size={48} className="mx-auto mb-4" style={{ color: '#CBD5E1' }} />
            <p className="text-lg font-semibold mb-2" style={{ color: '#64748B' }}>
              {tr.catalog.noProducts}
            </p>
            <p className="text-base" style={{ color: '#94A3B8' }}>
              Попробуйте изменить фильтры
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {pagedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>

            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="flex items-center justify-center w-9 h-9 rounded-lg transition-all disabled:opacity-40"
                  style={{ background: 'white', border: '1.5px solid #E2E8F0', color: '#64748B' }}
                >
                  <ChevronLeft size={16} />
                </button>

                {pageNumbers(page, pageCount).map((n, i) =>
                  n === '…' ? (
                    <span key={`e${i}`} className="px-1.5 text-base" style={{ color: '#CBD5E1' }}>…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => goToPage(n)}
                      className="flex items-center justify-center min-w-9 h-9 px-2 rounded-lg text-base font-semibold transition-all"
                      style={{
                        background: n === page ? '#1565C0' : 'white',
                        border: `1.5px solid ${n === page ? '#1565C0' : '#E2E8F0'}`,
                        color: n === page ? 'white' : '#475569',
                      }}
                    >
                      {n}
                    </button>
                  )
                )}

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === pageCount}
                  className="flex items-center justify-center w-9 h-9 rounded-lg transition-all disabled:opacity-40"
                  style={{ background: 'white', border: '1.5px solid #E2E8F0', color: '#64748B' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function CatalogPage() {
  return <Suspense><CatalogContent /></Suspense>
}
