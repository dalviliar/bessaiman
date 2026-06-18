'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, FileText, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import PriceCalculator from '@/components/PriceCalculator'
import ProductCard from '@/components/ProductCard'
import KPModal from '@/components/KPModal'
import { getProductBySlug } from '@/lib/supabase'
import type { Product } from '@/types'

function DescriptionRenderer({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div>
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={i} className="h-2" />
        if (trimmed.endsWith(':')) {
          return (
            <p key={i} className="font-bold text-sm mt-3 mb-0.5" style={{ color: '#0F172A' }}>
              {trimmed}
            </p>
          )
        }
        if (/^[•*\-]\s/.test(trimmed)) {
          return (
            <div key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: '#475569' }}>
              <span className="mt-0.5" style={{ color: '#1565C0', flexShrink: 0 }}>•</span>
              <span>{trimmed.replace(/^[•*\-]\s/, '')}</span>
            </div>
          )
        }
        return (
          <p key={i} className="text-sm leading-relaxed" style={{ color: '#475569' }}>
            {trimmed}
          </p>
        )
      })}
    </div>
  )
}

function AvailabilityBadge({ status }: { status: Product['availability'] }) {
  const { tr } = useLang()
  const map = {
    in_stock: { cls: 'badge-in-stock', label: tr.catalog.inStock },
    on_order: { cls: 'badge-on-order', label: tr.catalog.onOrder },
    out_of_stock: { cls: 'badge-out-of-stock', label: tr.catalog.outOfStock },
  }
  const { cls, label } = map[status]
  return <span className={cls}>{label}</span>
}

function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [current, setCurrent] = useState(0)

  if (!images.length) {
    return (
      <div className="steel-card aspect-square flex items-center justify-center">
        <Package size={80} className="text-steel-border" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="steel-card aspect-square relative overflow-hidden">
        <Image src={images[current]} alt={name} fill className="object-contain p-6" />
        {images.length > 1 && (
          <>
            <button onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-steel-border flex items-center justify-center hover:border-steel-accent text-slate-600 transition-all shadow-sm">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setCurrent((c) => (c + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-steel-border flex items-center justify-center hover:border-steel-accent text-slate-600 transition-all shadow-sm">
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? 'border-steel-accent' : 'border-steel-border hover:border-steel-silver'
              }`}>
              <Image src={img} alt="" width={64} height={64} className="object-contain p-1 w-full h-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { lang, tr } = useLang()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [showKP, setShowKP] = useState(false)

  useEffect(() => {
    getProductBySlug(slug).then((p) => {
      setProduct(p)
      setLoading(false)
      // Track product view (fire-and-forget)
      fetch(`/api/products/${slug}/view`, { method: 'POST' }).catch(() => {})
    }).catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="steel-card aspect-square animate-pulse" />
          <div className="space-y-4">
            {[80, 60, 40, 40, 100].map((w, i) => (
              <div key={i} className="h-6 rounded-lg animate-pulse bg-steel-card"
                style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Package size={64} className="mx-auto mb-4 text-steel-border" />
        <p className="text-steel-silver text-lg">{tr.common.error}</p>
        <Link href="/catalog" className="btn-primary inline-flex mt-6">{tr.product.back}</Link>
      </div>
    )
  }

  const name = product[`name_${lang}` as 'name_ru' | 'name_kk' | 'name_en'] || product.name_ru
  const description = product[`description_${lang}` as 'description_ru' | 'description_kk' | 'description_en'] || product.description_ru

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <Link href="/catalog"
        className="inline-flex items-center gap-2 text-steel-silver hover:text-steel-accent text-sm mb-8 transition-colors">
        <ArrowLeft size={15} />
        {tr.product.back}
      </Link>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Images */}
        <ImageGallery images={product.images ?? []} name={name} />

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <AvailabilityBadge status={product.availability} />
              {product.model && (
                <span className="text-steel-accent text-xs font-mono font-semibold tracking-wider">
                  {product.model}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] leading-tight">{name}</h1>
            {product.category && (
              <p className="text-steel-silver text-sm mt-2">
                {tr.product.category}:{' '}
                <span className="text-steel-accent">
                  {product.category[`name_${lang}` as 'name_ru' | 'name_kk' | 'name_en'] || product.category.name_ru}
                </span>
              </p>
            )}
          </div>

          {/* Price & Calculator */}
          <PriceCalculator product={product} />
          {!product.price && (
            <div className="steel-card p-4 text-center">
              <p className="text-steel-silver mb-3">{tr.catalog.priceOnRequest}</p>
              <Link href="/contacts" className="btn-primary inline-flex">{tr.contacts.sendMessage}</Link>
            </div>
          )}

          {/* КП */}
          <div className="steel-card p-5 space-y-3" style={{ borderColor: '#BFDBFE' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#DBEAFE' }}>
                <FileText size={13} style={{ color: '#1565C0' }} />
              </div>
              <h3 className="text-[#0F172A] font-semibold text-sm">Коммерческое предложение</h3>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
              Сформируйте КП с реквизитами компании и техническими характеристиками — PDF скачается автоматически.
            </p>
            <button
              onClick={() => setShowKP(true)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <FileText size={15} />
              Получить КП (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <section className="mb-10">
          <div className="steel-card p-6">
            <DescriptionRenderer text={description} />
          </div>
        </section>
      )}

      {/* Specifications */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <section className="mb-16">
          <h2 className="section-title text-xl mb-6">{tr.product.specifications}</h2>
          <div className="steel-card overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specs).map(([key, val], i) => (
                  <tr key={key}
                    className={`border-b border-steel-border/30 last:border-0 ${i % 2 === 0 ? '' : 'bg-[#F8FAFC]'}`}>
                    <td className="px-6 py-3 text-steel-silver font-medium w-1/2">{key}</td>
                    <td className="px-6 py-3 text-[#0F172A]">{val as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Аксессуары */}
      {product.accessories && product.accessories.length > 0 && (
        <section className="mb-16">
          <h2 className="section-title text-xl mb-6">{tr.product.accessories}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {product.accessories.map((acc) => (
              <ProductCard key={acc.id} product={acc} />
            ))}
          </div>
        </section>
      )}

      {/* КП Modal */}
      {showKP && <KPModal product={product} onClose={() => setShowKP(false)} />}
    </div>
  )
}
