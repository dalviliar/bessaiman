'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, FileText, Package } from 'lucide-react'
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
        const colonIdx = trimmed.indexOf(':')
        if (colonIdx > 0 && colonIdx < trimmed.length - 1) {
          const key = trimmed.slice(0, colonIdx + 1)
          const val = trimmed.slice(colonIdx + 1)
          return (
            <p key={i} className="text-sm leading-relaxed" style={{ color: '#475569' }}>
              <span className="font-semibold" style={{ color: '#0F172A' }}>{key}</span>{val}
            </p>
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

function ImageGallery({ images, name, videoUrl }: { images: string[]; name: string; videoUrl?: string | null }) {
  const [current, setCurrent] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [mainHovered, setMainHovered] = useState(false)

  const videoId = videoUrl?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null
  const totalCount = images.length + (videoId ? 1 : 0)

  if (!images.length && !videoId) {
    return (
      <div className="steel-card aspect-square flex items-center justify-center rounded-2xl">
        <Package size={80} className="text-steel-border" />
      </div>
    )
  }

  return (
    <div>
      {/* Main area */}
      <div
        className="steel-card relative overflow-hidden rounded-2xl"
        style={{ aspectRatio: '1/1', cursor: showVideo ? 'default' : 'zoom-in' }}
        onMouseEnter={() => setMainHovered(true)}
        onMouseLeave={() => setMainHovered(false)}
      >
        {showVideo && videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            style={{ border: 'none' }}
          />
        ) : (
          <>
            {images.length > 0 && (
              <Image
                src={images[current]}
                alt={name}
                fill
                className="object-contain p-6"
                style={{
                  transform: mainHovered ? 'scale(1.09)' : 'scale(1)',
                  transition: 'transform 0.35s ease',
                }}
              />
            )}
            {totalCount > 1 && (
              <div
                className="absolute bottom-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(15,23,42,0.5)',
                  color: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                {current + 1} / {totalCount}
              </div>
            )}
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {totalCount > 1 && (
        <div className="flex gap-2.5 mt-3 overflow-x-auto pb-0.5 pt-0.5">
          {images.map((img, i) => (
            <button
              key={i}
              onMouseEnter={() => { setShowVideo(false); setCurrent(i) }}
              className="relative shrink-0 rounded-xl overflow-hidden transition-all duration-200"
              style={{
                width: 80, height: 80,
                border: !showVideo && i === current ? '2px solid #1565C0' : '2px solid #E2E8F0',
                boxShadow: !showVideo && i === current ? '0 0 0 3px rgba(21,101,192,0.15), 0 4px 12px rgba(21,101,192,0.12)' : 'none',
                background: '#F8FAFC',
                transform: !showVideo && i === current ? 'scale(1.06)' : 'scale(1)',
              }}
            >
              <Image src={img} alt="" fill className="object-contain p-1.5" />
            </button>
          ))}

          {videoId && (
            <button
              onClick={() => setShowVideo(true)}
              title="Смотреть видео"
              className="relative shrink-0 rounded-xl overflow-hidden transition-all duration-200"
              style={{
                width: 80, height: 80,
                border: showVideo ? '2px solid #EF4444' : '2px solid #E2E8F0',
                boxShadow: showVideo ? '0 0 0 3px rgba(239,68,68,0.15), 0 4px 12px rgba(239,68,68,0.12)' : 'none',
                background: '#0F172A',
                transform: showVideo ? 'scale(1.06)' : 'scale(1)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                alt="video"
                className="w-full h-full object-cover"
                style={{ opacity: 0.5 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: '#FF0000' }}
                >
                  <svg viewBox="0 0 24 24" fill="white" style={{ width: 15, height: 15, marginLeft: 2 }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </button>
          )}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {/* Left: image + specs */}
        <div>
          <ImageGallery images={product.images ?? []} name={name} videoUrl={product.video_url} />
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mt-6">
              <h2 className="section-title text-lg mb-3">{tr.product.specifications}</h2>
              <div className="steel-card overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(product.specs).map(([key, val], i) => (
                      <tr key={key}
                        className={`border-b border-steel-border/30 last:border-0 ${i % 2 === 0 ? '' : 'bg-[#F8FAFC]'}`}>
                        <td className="px-5 py-2.5 text-steel-silver font-medium w-1/2 text-xs">{key}</td>
                        <td className="px-5 py-2.5 text-[#0F172A] text-xs">{val as string}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

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
