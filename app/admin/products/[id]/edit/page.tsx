'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import ProductForm from '@/components/admin/ProductForm'
import type { Product } from '@/types'

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`)
      .then(async res => {
        const isJson = res.headers.get('content-type')?.includes('application/json')
        const data = isJson ? await res.json() : null
        if (!res.ok) throw new Error(data?.error || 'Товар не найден')
        setProduct(data)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [params.id])

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-black text-white mb-0.5">Редактирование товара</h1>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {product?.name_ru || '—'}
        </p>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} /></div>
      ) : error ? (
        <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
      ) : product ? (
        <ProductForm product={product} />
      ) : null}
    </div>
  )
}
