'use client'

import { useState } from 'react'
import { Minus, Plus, TrendingDown, Check, ShoppingCart } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/types'

export default function PriceCalculator({ product }: { product: Product }) {
  const { tr } = useLang()
  const { addItem, isInCart } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!product.price) {
    return (
      <div style={{
        background: 'white', border: '1.5px solid #E2E8F0',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}>
        <div style={{ padding: '20px 20px 16px' }}>
          <label style={{
            fontSize: 11, fontWeight: 700, color: '#94A3B8',
            letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 10,
          }}>
            {tr.product.quantity}
          </label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} style={{
              width: 46, height: 50, flexShrink: 0,
              background: qty <= 1 ? '#F8FAFC' : '#F1F5F9',
              border: '1.5px solid #E2E8F0', borderRight: 'none',
              borderRadius: '10px 0 0 10px',
              color: qty <= 1 ? '#CBD5E1' : '#475569',
              cursor: qty <= 1 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Minus size={15} strokeWidth={2.5} />
            </button>
            <div style={{
              flex: 1, height: 50, minWidth: 72,
              border: '1.5px solid #E2E8F0', background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{qty}</span>
              <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>шт.</span>
            </div>
            <button onClick={() => setQty(q => q + 1)} style={{
              width: 46, height: 50, flexShrink: 0,
              background: 'linear-gradient(135deg,#1565C0,#0284C7)',
              border: '1.5px solid #1565C0', borderLeft: 'none',
              borderRadius: '0 10px 10px 0', color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(21,101,192,0.3)',
            }}>
              <Plus size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div style={{ padding: '0 20px 20px' }}>
          <button onClick={handleAdd} style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: added
              ? 'linear-gradient(135deg,#10B981,#059669)'
              : 'linear-gradient(135deg,#1260C0,#0284C7)',
            color: 'white', fontWeight: 700, fontSize: 14,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: added ? '0 4px 16px rgba(16,185,129,0.3)' : '0 4px 16px rgba(21,101,192,0.3)',
            transition: 'all 0.25s',
          }}>
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
            {added ? 'Добавлено!' : tr.product.addToRequest}
          </button>
        </div>
      </div>
    )
  }

  const bulkQty    = product.bulk_threshold      ?? 3
  const discountPct = product.bulk_discount_percent ?? 5
  const isBulk     = qty >= bulkQty
  const basePrice  = product.price
  const unitPrice  = isBulk ? basePrice * (1 - discountPct / 100) : basePrice
  const total      = unitPrice * qty
  const savings    = isBulk ? (basePrice - unitPrice) * qty : 0

  const changeQty = (delta: number) => setQty(q => Math.max(1, q + delta))

  return (
    <div style={{
      background: 'white',
      border: '1.5px solid #E2E8F0',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    }}>

      {/* ── Количество ── */}
      <div style={{ padding: '20px 20px 16px' }}>
        <label style={{
          fontSize: 11, fontWeight: 700, color: '#94A3B8',
          letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 10,
        }}>
          {tr.product.quantity}
        </label>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Minus */}
          <button
            onClick={() => changeQty(-1)}
            disabled={qty <= 1}
            style={{
              width: 46, height: 50, flexShrink: 0,
              background: qty <= 1 ? '#F8FAFC' : '#F1F5F9',
              border: '1.5px solid #E2E8F0', borderRight: 'none',
              borderRadius: '10px 0 0 10px',
              color: qty <= 1 ? '#CBD5E1' : '#475569',
              cursor: qty <= 1 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}>
            <Minus size={15} strokeWidth={2.5} />
          </button>

          {/* Value display */}
          <div style={{
            flex: 1, height: 50, minWidth: 72,
            border: '1.5px solid #E2E8F0',
            background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
              {qty}
            </span>
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>шт.</span>
          </div>

          {/* Plus */}
          <button
            onClick={() => changeQty(1)}
            style={{
              width: 46, height: 50, flexShrink: 0,
              background: 'linear-gradient(135deg,#1565C0,#0284C7)',
              border: '1.5px solid #1565C0', borderLeft: 'none',
              borderRadius: '0 10px 10px 0',
              color: 'white',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(21,101,192,0.3)',
              transition: 'all 0.15s',
            }}>
            <Plus size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Скидка (hint or applied) ── */}
      {product.bulk_threshold && !isBulk && (
        <div style={{ margin: '0 16px 4px', padding: '10px 12px', borderRadius: 10,
          background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
          border: '1px solid #FDE68A',
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8,
            background: '#D97706', color: 'white', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown size={14} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#92400E' }}>
              Скидка при заказе от {bulkQty} шт. — {discountPct}%
            </p>
            <p style={{ margin: 0, fontSize: 11, color: '#B45309' }}>
              Экономия {(basePrice - basePrice * (1 - discountPct / 100)).toLocaleString('ru-RU')} ₸ за единицу
            </p>
          </div>
        </div>
      )}

      {product.bulk_threshold && isBulk && (
        <div style={{ margin: '0 16px 4px', padding: '10px 12px', borderRadius: 10,
          background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)',
          border: '1px solid #6EE7B7',
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8,
            background: '#10B981', color: 'white', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={14} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#065F46' }}>
              Скидка {discountPct}% применена
            </p>
            <p style={{ margin: 0, fontSize: 11, color: '#047857' }}>
              Вы экономите {savings.toLocaleString('ru-RU')} ₸
            </p>
          </div>
        </div>
      )}

      {/* ── Цены ── */}
      <div style={{ padding: '14px 20px 0', marginTop: 8, borderTop: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>{tr.product.pricePerUnit}</span>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
              {unitPrice.toLocaleString('ru-RU')} ₸
            </span>
            {isBulk && (
              <div style={{ fontSize: 11, color: '#94A3B8', textDecoration: 'line-through' }}>
                {basePrice.toLocaleString('ru-RU')} ₸
              </div>
            )}
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 0', borderTop: '1px solid #F1F5F9',
        }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>{tr.product.totalPrice}</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#1565C0', letterSpacing: '-0.03em' }}>
            {total.toLocaleString('ru-RU')} ₸
          </span>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: '8px 20px 20px' }}>
        <button
          onClick={handleAdd}
          style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: added
              ? 'linear-gradient(135deg,#10B981,#059669)'
              : 'linear-gradient(135deg,#1260C0,#0284C7)',
            color: 'white', fontWeight: 700, fontSize: 14, letterSpacing: '0.02em',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: added
              ? '0 4px 16px rgba(16,185,129,0.3)'
              : '0 4px 16px rgba(21,101,192,0.3)',
            transition: 'all 0.25s',
          }}>
          {added ? <Check size={16} /> : <ShoppingCart size={16} />}
          {added ? 'Добавлено!' : tr.product.addToRequest}
        </button>
      </div>
    </div>
  )
}
