'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, FileText, Package, ClipboardCheck, Download } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import PriceCalculator from '@/components/PriceCalculator'
import ProductCard from '@/components/ProductCard'
import KPModal from '@/components/KPModal'
import QuestionnaireModal from '@/components/QuestionnaireModal'
import { useZoomPreview, ZoomPreviewOverlay } from '@/components/HoverZoomPreview'
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
            <p key={i} className="font-bold text-base mt-3 mb-0.5" style={{ color: '#0F172A' }}>
              {trimmed}
            </p>
          )
        }
        if (/^[•*\-]\s/.test(trimmed)) {
          return (
            <div key={i} className="flex gap-2 text-base leading-relaxed" style={{ color: '#475569' }}>
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
            <p key={i} className="text-base leading-relaxed" style={{ color: '#475569' }}>
              <span className="font-semibold" style={{ color: '#0F172A' }}>{key}</span>{val}
            </p>
          )
        }
        return (
          <p key={i} className="text-base leading-relaxed" style={{ color: '#475569' }}>
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
  const { preview, show: showPreview, hide: hidePreview } = useZoomPreview()

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
        className="group steel-card relative overflow-hidden rounded-2xl"
        style={{ aspectRatio: showVideo ? '16/9' : '1/1', transition: 'aspect-ratio 0.3s ease' }}
        onMouseEnter={e => { if (!showVideo && images[current]) showPreview(images[current], e.currentTarget) }}
        onMouseLeave={() => hidePreview()}
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
                className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
              />
            )}
            {totalCount > 1 && (
              <div
                className="absolute bottom-3 right-3 text-sm font-semibold px-2.5 py-1 rounded-full"
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

      <ZoomPreviewOverlay preview={preview} scale={1.1} maxHeight="42vh" maxWidth="28vw" objectFit="contain" />

      {/* Thumbnail strip */}
      {totalCount > 1 && (
        <div className="flex gap-2.5 mt-3 overflow-x-auto pb-0.5 pt-0.5">
          {images.map((img, i) => (
            <button
              key={i}
              onMouseEnter={() => { setShowVideo(false); setCurrent(i) }}
              onClick={() => { setShowVideo(false); setCurrent(i) }}
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
  const router = useRouter()
  const { lang, tr } = useLang()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [showKP, setShowKP] = useState(false)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)

  // "Назад к каталогу" should return to whatever filters (category etc.)
  // the visitor had selected, not reset to "all" - going back in browser
  // history does that automatically since the catalog page keeps its
  // filters in the URL. Falls back to a plain /catalog link if this page
  // was opened directly (no history to go back to, e.g. a shared link).
  const goBackToCatalog = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/catalog')
    }
  }

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
      <button onClick={goBackToCatalog}
        className="inline-flex items-center gap-2 text-steel-silver hover:text-steel-accent text-base mb-8 transition-colors">
        <ArrowLeft size={15} />
        {tr.product.back}
      </button>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {/* Left: image + specs */}
        <div>
          <ImageGallery images={product.images ?? []} name={name} videoUrl={product.video_url} />
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mt-6">
              <h2 className="section-title text-lg mb-3">{tr.product.specifications}</h2>
              <div className="steel-card overflow-hidden">
                <table className="w-full text-base">
                  <tbody>
                    {Object.entries(product.specs).map(([key, val], i) => (
                      <tr key={key}
                        className={`border-b border-steel-border/30 last:border-0 ${i % 2 === 0 ? '' : 'bg-[#F8FAFC]'}`}>
                        <td className="px-5 py-2.5 text-steel-silver font-medium w-1/2 text-sm">{key}</td>
                        <td className="px-5 py-2.5 text-[#0F172A] text-sm">{val as string}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {product.instagram_url && (
            <a href={product.instagram_url} target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-base font-semibold py-2.5 px-5 rounded-full"
              style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: 'white' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              {tr.home.instagramBtn}
            </a>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <AvailabilityBadge status={product.availability} />
              {product.model && (
                <span className="text-steel-accent text-sm font-mono font-semibold tracking-wider">
                  {product.model}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] leading-tight">{name}</h1>
            {product.category && (
              <p className="text-steel-silver text-base mt-2">
                {tr.product.category}:{' '}
                <span className="text-steel-accent">
                  {product.category[`name_${lang}` as 'name_ru' | 'name_kk' | 'name_en'] || product.category.name_ru}
                </span>
              </p>
            )}
          </div>

          {/* Опросный лист — товары "Разработки по ТЗ" ведут сразу сюда,
              без количества/цены/КП: это индивидуальная разработка, а не
              заказ фиксированной позиции по фиксированной цене. */}
          {product.product_type === 'I' ? (
            <div className="steel-card p-5 space-y-3" style={{ borderColor: '#BFDBFE' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#DBEAFE' }}>
                  <ClipboardCheck size={13} style={{ color: '#1565C0' }} />
                </div>
                <h3 className="text-[#0F172A] font-semibold text-base">{tr.product.questionnaireTitle}</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
                {tr.product.questionnaireDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                {product.questionnaire_url && (
                  <a href={product.questionnaire_url} target="_blank" rel="noopener noreferrer" download
                    className="btn-secondary flex-1 flex items-center justify-center gap-2">
                    <Download size={15} />
                    {tr.product.questionnaireDownload}
                  </a>
                )}
                <button
                  onClick={() => setShowQuestionnaire(true)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <ClipboardCheck size={15} />
                  {tr.product.questionnaireSend}
                </button>
              </div>
            </div>
          ) : (
            <>
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
                  <h3 className="text-[#0F172A] font-semibold text-base">Коммерческое предложение</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
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
            </>
          )}
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
      {showQuestionnaire && <QuestionnaireModal product={product} onClose={() => setShowQuestionnaire(false)} />}
    </div>
  )
}
