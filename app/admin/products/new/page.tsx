'use client'

import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-black text-white mb-0.5">Новый товар</h1>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Товар появится в каталоге на сайте сразу после сохранения
        </p>
      </div>
      <ProductForm />
    </div>
  )
}
