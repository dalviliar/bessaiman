'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Download, FileText, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import PriceCalculator from '@/components/PriceCalculator'
import ProductCard from '@/components/ProductCard'
import { getProductBySlug } from '@/lib/supabase'
import type { Product } from '@/types'

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
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-steel-surface/80 border border-steel-border flex items-center justify-center hover:border-steel-accent text-white transition-all">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setCurrent((c) => (c + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-steel-surface/80 border border-steel-border flex items-center justify-center hover:border-steel-accent text-white transition-all">
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

async function generatePDF(product: Product, lang: string, type: 'spec' | 'offer') {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  const name = product[`name_${lang}` as const] || product.name_ru
  const desc = product[`description_${lang}` as const] || product.description_ru || ''

  doc.setFontSize(20)
  doc.text('Bes Saiman Group', 20, 20)
  doc.setFontSize(14)
  doc.text(name, 20, 35)
  if (product.model) {
    doc.setFontSize(11)
    doc.text(`Model: ${product.model}`, 20, 45)
  }
  doc.setFontSize(10)
  doc.text(type === 'offer' ? 'COMMERCIAL OFFER' : 'TECHNICAL SPECIFICATION', 20, 58)
  doc.line(20, 62, 190, 62)

  if (product.specs && type === 'spec') {
    let y = 72
    Object.entries(product.specs).forEach(([key, val]) => {
      doc.text(`${key}: ${val}`, 20, y)
      y += 8
      if (y > 270) { doc.addPage(); y = 20 }
    })
  } else if (desc) {
    const lines = doc.splitTextToSize(desc, 170)
    doc.text(lines, 20, 72)
  }

  if (product.price) {
    doc.text(`Price: ${product.price.toLocaleString()} ₸`, 20, 250)
  }
  doc.text('Tel: +7 (701) 101-34-33 | bessaimangroup1@gmail.com', 20, 280)

  doc.save(`${product.slug}-${type}.pdf`)
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { lang, tr } = useLang()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProductBySlug(slug).then((p) => { setProduct(p); setLoading(false) }).catch(() => setLoading(false))
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

  const name = product[`name_${lang}` as const] || product.name_ru
  const description = product[`description_${lang}` as const] || product.description_ru

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
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{name}</h1>
            {product.category && (
              <p className="text-steel-silver text-sm mt-2">
                {tr.product.category}:{' '}
                <span className="text-steel-accent">
                  {product.category[`name_${lang}` as const] || product.category.name_ru}
                </span>
              </p>
            )}
          </div>

          {description && (
            <p className="text-steel-silver leading-relaxed text-sm">{description}</p>
          )}

          {/* Price & Calculator */}
          <PriceCalculator product={product} />
          {!product.price && (
            <div className="steel-card p-4 text-center">
              <p className="text-steel-silver mb-3">{tr.catalog.priceOnRequest}</p>
              <Link href="/contacts" className="btn-primary inline-flex">{tr.contacts.sendMessage}</Link>
            </div>
          )}

          {/* Documents */}
          {(product.documents?.length || true) && (
            <div className="steel-card p-4 space-y-3">
              <h3 className="text-white font-semibold text-sm">{tr.product.documents}</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => generatePDF(product, lang, 'spec')}
                  className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
                >
                  <FileText size={15} />
                  {tr.product.downloadSpec}
                </button>
                <button
                  onClick={() => generatePDF(product, lang, 'offer')}
                  className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
                >
                  <Download size={15} />
                  {tr.product.downloadOffer}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Specifications */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <section className="mb-16">
          <h2 className="section-title text-xl mb-6">{tr.product.specifications}</h2>
          <div className="steel-card overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specs).map(([key, val], i) => (
                  <tr key={key}
                    className={`border-b border-steel-border/30 last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                    <td className="px-6 py-3 text-steel-silver font-medium w-1/2">{key}</td>
                    <td className="px-6 py-3 text-white">{val as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Accessories */}
      {product.accessories && product.accessories.length > 0 && (
        <section>
          <h2 className="section-title text-xl mb-6">{tr.product.accessories}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {product.accessories.map((acc) => (
              <ProductCard key={acc.id} product={acc} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
