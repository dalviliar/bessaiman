'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X, Flame, Cog, Wind, Zap, Package, Wrench, ChevronRight, type LucideIcon } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import ProductCard from '@/components/ProductCard'
import { getCategories, getProducts } from '@/lib/supabase'
import type { Category, Product } from '@/types'

// ── Уровень 1: типы продукции (из документации) ──────────────────
const TYPE_DEFS = [
  { key: 'all', label: 'Все' },
  { key: 'S',   label: 'Серийные' },
  { key: 'PA',  label: 'Комплектующие' },
  { key: 'I',   label: 'Под заказ' },
]

// ── Уровень 2: иконки категорий ──────────────────────────────────
const CAT_ICONS: Record<string, LucideIcon> = {
  furnaces: Flame, mills: Cog, vacuum: Wind,
  electrospinning: Zap, furniture: Package, accessories: Wrench,
}

// ── Уровень 3: подтипы по категории (коды из классификатора) ─────
interface SubcatDef {
  code: string
  label: string
  modelMatch?: (model: string) => boolean
}

const CAT_SUBCATS: Record<string, SubcatDef[]> = {
  furnaces: [
    { code: 'SFM',  label: 'Муфельные' },
    { code: 'SFTH', label: 'Горизонт. трубчатые' },
    { code: 'SFTV', label: 'Вертикальные' },
    { code: 'SFTM', label: 'Мультипозиционные' },
    { code: 'SFO',  label: 'Прочие' },
  ],
  mills: [
    { code: 'SM',  label: 'Горизонтальные' },
    { code: 'SMP', label: 'Планетарные' },
    { code: 'SV',  label: 'Вибросита' },
  ],
  vacuum: [
    { code: 'SGB', label: 'Перчаточные боксы' },
  ],
  furniture: [
    { code: 'SLF-FH', label: 'Вытяжные шкафы', modelMatch: m => m.startsWith('BS-FH') },
    { code: 'SLF-GC', label: 'Газовые шкафы',  modelMatch: m => m.startsWith('BS-GC') },
    { code: 'SLF-LT', label: 'Столы',           modelMatch: m => /^BS-(LT|AVT|ILT|T-)/.test(m) },
  ],
  electrospinning: [],
  accessories: [],
}

// ── Уровень 4: атрибутные фильтры для подтипов ───────────────────
interface AttrDef { specKey: string; label: string }
const SUBCAT_ATTRS: Record<string, AttrDef[]> = {
  SFM: [
    { specKey: 'Объём камеры',      label: 'Объём' },
    { specKey: 'Макс. температура', label: 'Температура' },
  ],
  SFTH: [
    { specKey: 'Кол-во зон',        label: 'Зоны нагрева' },
    { specKey: 'Диаметр трубы',     label: 'Диаметр трубы' },
    { specKey: 'Макс. температура', label: 'Температура' },
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
      style={{
        background: active ? '#1565C0' : 'white',
        border: `1.5px solid ${active ? '#1565C0' : '#E2E8F0'}`,
        color: active ? 'white' : '#64748B',
        boxShadow: active ? '0 2px 8px rgba(21,101,192,0.25)' : 'none',
      }}>
      {label}
      {count !== undefined && (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: active ? 'rgba(255,255,255,0.2)' : '#F1F5F9', color: active ? 'white' : '#94A3B8' }}>
          {count}
        </span>
      )}
    </button>
  )
}

// ── Блок атрибутного фильтра ─────────────────────────────────────
function AttrFilterRow({
  def, values, selected, onSelect,
}: { def: AttrDef; values: string[]; selected: string; onSelect: (v: string) => void }) {
  if (values.length < 2) return null
  return (
    <div className="flex items-start gap-3 flex-wrap">
      <span className="text-[10px] font-mono font-bold tracking-wider uppercase mt-2 shrink-0 w-24"
        style={{ color: '#94A3B8' }}>
        {def.label}:
      </span>
      <div className="flex flex-wrap gap-1.5">
        {values.map(v => (
          <button key={v} onClick={() => onSelect(selected === v ? '' : v)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
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

// ── Основной компонент ────────────────────────────────────────────
function CatalogContent() {
  const { lang, tr } = useLang()
  const searchParams = useSearchParams()

  const [categories, setCategories]   = useState<Category[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading]         = useState(true)

  // Фильтры (4 уровня + поиск)
  const [selType,     setSelType]     = useState(searchParams.get('type') ?? 'all')
  const [selCat,      setSelCat]      = useState(searchParams.get('category') ?? '')
  const [selSubcat,   setSelSubcat]   = useState('')
  const [selAttrs,    setSelAttrs]    = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState('')

  // Загружаем всё один раз
  useEffect(() => {
    Promise.all([getCategories(), getProducts()])
      .then(([cats, prods]) => {
        setCategories(cats)
        setAllProducts(prods)
        setLoading(false)
      })
  }, [])

  // При смене категории — сбрасываем подтип и атрибуты
  const handleCatSelect = (slug: string) => {
    setSelCat(prev => prev === slug ? '' : slug)
    setSelSubcat('')
    setSelAttrs({})
  }

  // При смене типа — сбрасываем всё ниже
  const handleTypeSelect = (key: string) => {
    setSelType(key)
    setSelCat('')
    setSelSubcat('')
    setSelAttrs({})
    setSearchQuery('')
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Заголовок ── */}
        <div className="mb-7">
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase mb-1.5 font-bold" style={{ color: '#1565C0' }}>
            BES SAIMAN GROUP
          </p>
          <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
            {tr.catalog.title}
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-0.5 w-10 rounded-full" style={{ background: 'linear-gradient(90deg,#1565C0,#0284C7)' }} />
            <p className="text-sm" style={{ color: '#64748B' }}>
              Высокоточное лабораторное оборудование казахстанского производства
            </p>
          </div>
        </div>

        {/* ═══ Уровень 1: Тип продукции ═══════════════════════════ */}
        <div className="mb-4">
          <p className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase mb-2" style={{ color: '#94A3B8' }}>
            ТИП ПРОДУКЦИИ
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {TYPE_DEFS.map(t => (
              <FilterChip key={t.key} label={t.label} count={typeCount(t.key)}
                active={selType === t.key} onClick={() => handleTypeSelect(t.key)} />
            ))}
          </div>
        </div>

        {/* ═══ Уровень 2: Категории ════════════════════════════════ */}
        {(selType === 'all' || selType === 'S') && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              {selType !== 'all' && <ChevronRight size={12} style={{ color: '#CBD5E1' }} />}
              <p className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase" style={{ color: '#94A3B8' }}>
                КАТЕГОРИЯ
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
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: active ? '#DBEAFE' : '#F1F5F9', color: active ? '#1565C0' : '#94A3B8' }}>
                        {count}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold leading-tight"
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
              <p className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase" style={{ color: '#94A3B8' }}>
                ПОДТИП
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {visibleSubcats.map(sc => (
                <FilterChip key={sc.code} label={sc.label} count={subcatCount(sc)}
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
              <p className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase" style={{ color: '#94A3B8' }}>
                ПАРАМЕТРЫ
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              {attrFilterDefs.map(def => (
                <AttrFilterRow key={def.specKey} def={def} values={def.values}
                  selected={selAttrs[def.specKey] ?? ''}
                  onSelect={v => setSelAttrs(prev => ({ ...prev, [def.specKey]: v }))} />
              ))}
            </div>
          </div>
        )}

        {/* ═══ Поиск + счётчик ═════════════════════════════════════ */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
            <input type="text" placeholder={tr.catalog.search}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg outline-none text-sm"
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

          {hasActiveFilters && (
            <button
              onClick={() => { setSelType('all'); setSelCat(''); setSelSubcat(''); setSelAttrs({}); setSearchQuery('') }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA' }}>
              <X size={12} /> Сбросить
            </button>
          )}

          <p className="text-sm font-mono shrink-0" style={{ color: '#94A3B8' }}>
            {loading ? '—' : finalProducts.length}{' '}
            {lang === 'ru' ? 'позиций' : lang === 'kk' ? 'позиция' : 'items'}
          </p>
        </div>

        {/* ═══ Сетка товаров ═══════════════════════════════════════ */}
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
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              Попробуйте изменить фильтры
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {finalProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CatalogPage() {
  return <Suspense><CatalogContent /></Suspense>
}
