'use client'

import { useState } from 'react'
import { Calculator, TrendingDown } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import type { Product } from '@/types'

export default function PriceCalculator({ product }: { product: Product }) {
  const { tr } = useLang()
  const [qty, setQty] = useState(1)

  if (!product.price) return null

  const bulkQty = product.bulk_threshold ?? 3
  const discountPct = product.bulk_discount_percent ?? 5
  const isBulk = qty >= bulkQty

  const basePrice = product.price
  const discountedPrice = basePrice * (1 - discountPct / 100)
  const unitPrice = isBulk ? discountedPrice : basePrice
  const total = unitPrice * qty

  return (
    <div className="steel-card p-5 space-y-4">
      <div className="flex items-center gap-2 text-white font-semibold">
        <Calculator size={18} className="text-steel-accent" />
        {tr.product.calculator}
      </div>

      {/* Quantity input */}
      <div>
        <label className="text-steel-silver text-sm block mb-2">{tr.product.quantity}</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-9 h-9 rounded-lg border border-steel-border hover:border-steel-accent text-white font-bold transition-colors flex items-center justify-center bg-steel-surface"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="steel-input text-center w-20 text-white font-semibold"
          />
          <button
            onClick={() => setQty(qty + 1)}
            className="w-9 h-9 rounded-lg border border-steel-border hover:border-steel-accent text-white font-bold transition-colors flex items-center justify-center bg-steel-surface"
          >
            +
          </button>
          <span className="text-steel-silver text-sm">{tr.product.units}</span>
        </div>
      </div>

      {/* Bulk discount hint */}
      {!isBulk && (
        <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-900/20 border border-amber-700/30 rounded-lg px-3 py-2">
          <TrendingDown size={15} />
          {tr.product.bulkDiscount} {bulkQty} {tr.product.units} — {discountPct}%
        </div>
      )}

      {isBulk && (
        <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-900/20 border border-emerald-700/30 rounded-lg px-3 py-2">
          <TrendingDown size={15} />
          {tr.product.withDiscount} {discountPct}%
        </div>
      )}

      {/* Price breakdown */}
      <div className="space-y-2 pt-2 border-t border-steel-border/40">
        <div className="flex justify-between text-sm">
          <span className="text-steel-silver">{tr.product.pricePerUnit}</span>
          <div className="text-right">
            <span className="text-white font-medium">
              {unitPrice.toLocaleString('ru-RU')} ₸
            </span>
            {isBulk && (
              <div className="text-steel-silver text-xs line-through">
                {basePrice.toLocaleString('ru-RU')} ₸
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-steel-silver text-sm">{tr.product.totalPrice}</span>
          <span className="text-steel-accent font-bold text-xl">
            {total.toLocaleString('ru-RU')} ₸
          </span>
        </div>
      </div>

      <button className="btn-primary w-full mt-1">
        {tr.product.addToRequest}
      </button>
    </div>
  )
}
