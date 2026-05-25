'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
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

export default function ProductCard({ product }: { product: Product }) {
  const { lang, tr } = useLang()
  const name = product[`name_${lang}` as const] || product.name_ru
  const image = product.images?.[0]

  return (
    <Link href={`/catalog/${product.slug}`}
      className="steel-card group flex flex-col overflow-hidden hover:border-steel-accent/30 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-steel-surface overflow-hidden">
        {image ? (
          <Image src={image} alt={name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package size={48} className="text-steel-border" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-steel-card/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <AvailabilityBadge status={product.availability} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {product.model && (
          <span className="text-steel-accent text-xs font-mono font-semibold tracking-wider">
            {product.model}
          </span>
        )}
        <h3 className="text-text-primary font-semibold text-sm leading-snug line-clamp-2 group-hover:text-steel-accent transition-colors">
          {name}
        </h3>

        {/* Price */}
        <div className="mt-auto">
          {product.price ? (
            <div>
              <span className="text-white font-bold text-lg">
                {product.price.toLocaleString('ru-RU')} ₸
              </span>
              {product.price_with_discount && product.price_with_discount < product.price && (
                <span className="ml-2 text-steel-silver text-sm line-through">
                  {product.price_with_discount.toLocaleString('ru-RU')} ₸
                </span>
              )}
            </div>
          ) : (
            <span className="text-steel-silver text-sm">{tr.catalog.priceOnRequest}</span>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-1.5 text-steel-accent text-sm font-medium group-hover:gap-2.5 transition-all">
          {tr.catalog.viewProduct}
          <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  )
}
