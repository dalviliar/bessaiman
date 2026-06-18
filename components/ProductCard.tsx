'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Package, Zap, ShoppingCart, Check } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/types'

const TYPE_META = {
  S:  { label: 'Серийный' },
  PA: { label: 'Комплектующие' },
  PP: { label: 'Для сборки' },
  I:  { label: 'Под заказ' },
}

const AVAIL_META = {
  in_stock:    { dot: '#10B981', label: 'В наличии' },
  on_order:    { dot: '#D97706', label: 'Под заказ' },
  out_of_stock:{ dot: '#EF4444', label: 'Нет в наличии' },
}

function getKeySpecs(specs: Record<string, string> | null, code: string | null): [string, string][] {
  if (!specs) return []
  const entries = Object.entries(specs)
  if (code?.startsWith('SF')) {
    const priority = ['Макс. температура', 'Максимальная температура', 'Объём камеры', 'Диаметр трубки', 'Диаметр трубы']
    const sorted = [...priority.map(k => entries.find(([key]) => key === k)).filter(Boolean) as [string,string][],
                    ...entries.filter(([k]) => !priority.includes(k))]
    return sorted.slice(0, 2) as [string, string][]
  }
  if (code?.startsWith('SM')) {
    const priority = ['Скорость вращения', 'Объём барабана', 'Мощность']
    const sorted = [...priority.map(k => entries.find(([key]) => key === k)).filter(Boolean) as [string,string][],
                    ...entries.filter(([k]) => !priority.includes(k))]
    return sorted.slice(0, 2) as [string, string][]
  }
  return entries.slice(0, 2) as [string, string][]
}

export default function ProductCard({ product }: { product: Product }) {
  const { lang, tr } = useLang()
  const { addItem, isInCart } = useCart()
  const name = product[`name_${lang}` as 'name_ru' | 'name_kk' | 'name_en'] || product.name_ru
  const image = product.images?.[0]
  const typeMeta = (TYPE_META as Record<string, { label: string }>)[product.product_type ?? 'S'] ?? TYPE_META.S
  const availMeta = AVAIL_META[product.availability]
  const keySpecs = getKeySpecs(product.specs, product.classification_code)
  const inCart = isInCart(product.id)

  return (
    <div
      className="group flex flex-col overflow-hidden transition-all duration-250 hover:-translate-y-1"
      style={{
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* ── Image area (link to product page) ── */}
      <Link href={`/catalog/${product.slug}`} className="block">
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3', background: '#F8FAFC' }}>
          {image ? (
            <Image
              src={image} alt={name} fill
              className="object-contain p-4 transition-transform duration-400 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Package size={40} style={{ color: '#CBD5E1' }} />
            </div>
          )}

          {/* Classification code — top left */}
          {product.classification_code && (
            <div className="absolute top-3 left-3 font-mono text-[10px] font-bold px-2 py-0.5 rounded"
              style={{ background: 'rgba(15,23,42,0.7)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.3)', backdropFilter: 'blur(4px)' }}>
              {product.classification_code}
            </div>
          )}

          {/* Type badge — top right */}
          <div className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }}>
            {typeMeta.label}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250"
            style={{ background: 'linear-gradient(to top, rgba(21,101,192,0.05), transparent)' }} />
        </div>
      </Link>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">

        {/* Артикул + availability */}
        <div className="flex items-center justify-between gap-2">
          {product.model && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[9px] font-mono font-semibold shrink-0"
                style={{ color: '#94A3B8' }}>Арт.:</span>
              <span className="font-mono text-[10px] font-bold tracking-wider truncate"
                style={{ color: '#0284C7' }}>
                {product.model}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: availMeta.dot }} />
            <span className="text-[9px] font-mono" style={{ color: '#64748B' }}>{availMeta.label}</span>
          </div>
        </div>

        {/* Name */}
        <Link href={`/catalog/${product.slug}`}>
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 hover:text-sky-600 transition-colors"
            style={{ color: '#0F172A' }}>
            {name}
          </h3>
        </Link>

        {/* Key specs */}
        {keySpecs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {keySpecs.map(([key, val]) => (
              <div key={key} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono"
                style={{ background: '#EFF9FF', border: '1px solid #BAE6FD', color: '#0369A1' }}>
                <Zap size={8} style={{ color: '#0284C7', flexShrink: 0 }} />
                {val}
              </div>
            ))}
          </div>
        )}

        {/* Bottom */}
        <div className="flex items-center justify-between mt-auto pt-2.5" style={{ borderTop: '1px solid #F1F5F9' }}>
          <span className="text-xs font-semibold" style={{ color: product.price ? '#0F172A' : '#94A3B8' }}>
            {product.price ? `${product.price.toLocaleString('ru-RU')} ₸` : tr.catalog.priceOnRequest}
          </span>
          <Link href={`/catalog/${product.slug}`}
            className="flex items-center gap-1 text-[11px] font-semibold group-hover:gap-2 transition-all"
            style={{ color: '#1565C0' }}>
            {tr.catalog.viewProduct}
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* В корзину КП */}
        <button
          onClick={() => addItem(product)}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: inCart ? '#F0FDF4' : '#EFF6FF',
            border: `1.5px solid ${inCart ? '#BBF7D0' : '#BFDBFE'}`,
            color: inCart ? '#16A34A' : '#1565C0',
          }}>
          {inCart
            ? <><Check size={13} /> В корзине КП</>
            : <><ShoppingCart size={13} /> В корзину КП</>
          }
        </button>
      </div>
    </div>
  )
}
