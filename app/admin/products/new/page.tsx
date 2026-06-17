'use client'

import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-black text-white mb-0.5">РќРѕРІС‹Р№ С‚РѕРІР°СЂ</h1>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          РўРѕРІР°СЂ РїРѕСЏРІРёС‚СЃСЏ РІ РєР°С‚Р°Р»РѕРіРµ РЅР° СЃР°Р№С‚Рµ СЃСЂР°Р·Сѓ РїРѕСЃР»Рµ СЃРѕС…СЂР°РЅРµРЅРёСЏ
        </p>
      </div>
      <ProductForm />
    </div>
  )
}
