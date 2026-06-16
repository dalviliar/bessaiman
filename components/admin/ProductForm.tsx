'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, X, Upload, Image as ImageIcon } from 'lucide-react'
import type { Category, Product, ProductType } from '@/types'

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: 'S',  label: 'Серийный' },
  { value: 'PA', label: 'Комплектующие' },
  { value: 'PP', label: 'Для сборки' },
  { value: 'I',  label: 'Под заказ' },
]

const AVAILABILITY = [
  { value: 'in_stock',     label: 'В наличии' },
  { value: 'on_order',     label: 'Под заказ' },
  { value: 'out_of_stock', label: 'Нет в наличии' },
]

const UNITS = ['шт', 'кг', 'л', 'м', 'комплект']

const SPEC_PRESETS = [
  'Мощность', 'Напряжение', 'Объём камеры', 'Температурный диапазон',
  'Производительность', 'Материал корпуса', 'Степень защиты (IP)', 'Гарантия',
]

interface FormState {
  name_ru: string; name_kk: string; name_en: string
  model: string; category_id: string
  description_ru: string; description_kk: string; description_en: string
  price: string; price_with_discount: string
  bulk_threshold: string; bulk_discount_percent: string
  availability: string; barcode: string
  images: string[]
  specs: { key: string; value: string }[]
  product_type: ProductType
  classification_code: string
  weight_kg: string
  unit: string
  quantity: string
  length_cm: string
  width_cm: string
  height_cm: string
}

const EMPTY: FormState = {
  name_ru: '', name_kk: '', name_en: '',
  model: '', category_id: '',
  description_ru: '', description_kk: '', description_en: '',
  price: '', price_with_discount: '',
  bulk_threshold: '3', bulk_discount_percent: '5',
  availability: 'in_stock', barcode: '',
  images: [],
  specs: [],
  product_type: 'S',
  classification_code: '',
  weight_kg: '',
  unit: 'шт',
  quantity: '',
  length_cm: '',
  width_cm: '',
  height_cm: '',
}

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<FormState>(EMPTY)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(data => setCategories(data ?? []))
  }, [])

  useEffect(() => {
    if (!product) return
    setForm({
      name_ru: product.name_ru, name_kk: product.name_kk, name_en: product.name_en,
      model: product.model ?? '', category_id: product.category_id ?? '',
      description_ru: product.description_ru ?? '', description_kk: product.description_kk ?? '', description_en: product.description_en ?? '',
      price: product.price?.toString() ?? '', price_with_discount: product.price_with_discount?.toString() ?? '',
      bulk_threshold: product.bulk_threshold?.toString() ?? '3', bulk_discount_percent: product.bulk_discount_percent?.toString() ?? '5',
      availability: product.availability, barcode: product.barcode ?? '',
      images: product.images ?? [],
      specs: product.specs ? Object.entries(product.specs).map(([key, value]) => ({ key, value: String(value) })) : [],
      product_type: product.product_type,
      classification_code: product.classification_code ?? '',
      weight_kg: product.weight_kg?.toString() ?? '',
      unit: product.unit ?? 'шт',
      quantity: product.stock_quantity?.toString() ?? '',
      length_cm: product.length_cm?.toString() ?? '',
      width_cm: product.width_cm?.toString() ?? '',
      height_cm: product.height_cm?.toString() ?? '',
    })
  }, [product])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setError('')
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/admin/products/upload', { method: 'POST', body: fd })
        const isJson = res.headers.get('content-type')?.includes('application/json')
        const data = isJson ? await res.json() : null
        if (!res.ok) throw new Error(data?.error || 'Не удалось загрузить файл')
        set('images', [...form.images, data.url])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (url: string) => set('images', form.images.filter(i => i !== url))

  const addSpec = () => set('specs', [...form.specs, { key: '', value: '' }])
  const addPresetSpec = (key: string) => {
    if (form.specs.some(s => s.key === key)) return
    set('specs', [...form.specs, { key, value: '' }])
  }
  const updateSpec = (i: number, field: 'key' | 'value', value: string) =>
    set('specs', form.specs.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  const removeSpec = (i: number) => set('specs', form.specs.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name_ru || !form.category_id) {
      setError('Заполните название и категорию')
      return
    }
    setSaving(true)
    setError('')

    const specsObj = Object.fromEntries(
      form.specs.filter(s => s.key.trim()).map(s => [s.key.trim(), s.value.trim()])
    )

    const payload = {
      name_ru: form.name_ru, name_kk: form.name_kk, name_en: form.name_en,
      model: form.model || null, category_id: form.category_id,
      description_ru: form.description_ru || null, description_kk: form.description_kk || null, description_en: form.description_en || null,
      price: form.price ? Number(form.price) : null,
      price_with_discount: form.price_with_discount ? Number(form.price_with_discount) : null,
      bulk_threshold: Number(form.bulk_threshold) || 3,
      bulk_discount_percent: Number(form.bulk_discount_percent) || 5,
      availability: form.availability, barcode: form.barcode || null,
      images: form.images,
      specs: Object.keys(specsObj).length ? specsObj : null,
      product_type: form.product_type,
      classification_code: form.classification_code || null,
      compatible_with: product?.compatible_with ?? [],
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      unit: form.unit,
      quantity: form.quantity ? Number(form.quantity) : 0,
      length_cm: form.length_cm ? Number(form.length_cm) : null,
      width_cm: form.width_cm ? Number(form.width_cm) : null,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
    }

    try {
      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const res = await fetch(url, {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const isJson = res.headers.get('content-type')?.includes('application/json')
      const data = isJson ? await res.json() : null
      if (!res.ok) throw new Error(data?.error || `Ошибка сервера (${res.status})`)
      router.push('/admin/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
      {/* Названия */}
      <Section title="Название">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Русский *">
            <input className="steel-input w-full" value={form.name_ru} onChange={e => set('name_ru', e.target.value)} required />
          </Field>
          <Field label="Қазақша">
            <input className="steel-input w-full" value={form.name_kk} onChange={e => set('name_kk', e.target.value)} />
          </Field>
          <Field label="English">
            <input className="steel-input w-full" value={form.name_en} onChange={e => set('name_en', e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* Основное */}
      <Section title="Основное">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Категория *">
            <select className="steel-input w-full" value={form.category_id} onChange={e => set('category_id', e.target.value)} required>
              <option value="">— Выберите —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name_ru}</option>)}
            </select>
          </Field>
          <Field label="Тип товара">
            <select className="steel-input w-full" value={form.product_type} onChange={e => set('product_type', e.target.value as ProductType)}>
              {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Модель / артикул">
            <input className="steel-input w-full" value={form.model} onChange={e => set('model', e.target.value)} />
          </Field>
          <Field label="Код классификации">
            <input className="steel-input w-full" value={form.classification_code} onChange={e => set('classification_code', e.target.value.toUpperCase())} placeholder="напр. SFM" />
          </Field>
          <Field label="Штрихкод">
            <input className="steel-input w-full" value={form.barcode} onChange={e => set('barcode', e.target.value)} />
          </Field>
          <Field label="Наличие">
            <select className="steel-input w-full" value={form.availability} onChange={e => set('availability', e.target.value)}>
              {AVAILABILITY.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      {/* Вес, габариты и количество */}
      <Section title="Вес, габариты и количество">
        <div className="grid grid-cols-3 gap-3 mb-3">
          <Field label="Вес (кг)">
            <input type="number" step="0.01" className="steel-input w-full" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} placeholder="напр. 12.5" />
          </Field>
          <Field label="Единица измерения">
            <select className="steel-input w-full" value={form.unit} onChange={e => set('unit', e.target.value)}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </Field>
          <Field label={product ? 'Остаток на складе' : 'Начальное количество'}>
            <input type="number" min="0" className="steel-input w-full" value={form.quantity} onChange={e => set('quantity', e.target.value)}
              placeholder="0" disabled={!!product} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Длина (см)">
            <input type="number" step="0.1" className="steel-input w-full" value={form.length_cm} onChange={e => set('length_cm', e.target.value)} placeholder="напр. 80" />
          </Field>
          <Field label="Ширина (см)">
            <input type="number" step="0.1" className="steel-input w-full" value={form.width_cm} onChange={e => set('width_cm', e.target.value)} placeholder="напр. 60" />
          </Field>
          <Field label="Высота (см)">
            <input type="number" step="0.1" className="steel-input w-full" value={form.height_cm} onChange={e => set('height_cm', e.target.value)} placeholder="напр. 120" />
          </Field>
        </div>
        <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Габариты и вес нужны логистам, чтобы подобрать машину для доставки.
        </p>
        {product && (
          <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Остаток меняется через «Склад» — приёмка/списание, а не из этой формы.
          </p>
        )}
      </Section>

      {/* Цена */}
      <Section title="Цена">
        <div className="grid grid-cols-4 gap-3">
          <Field label="Цена (₸)">
            <input type="number" step="0.01" className="steel-input w-full" value={form.price} onChange={e => set('price', e.target.value)} />
          </Field>
          <Field label="Цена со скидкой (₸)">
            <input type="number" step="0.01" className="steel-input w-full" value={form.price_with_discount} onChange={e => set('price_with_discount', e.target.value)} />
          </Field>
          <Field label="Скидка от (шт)">
            <input type="number" className="steel-input w-full" value={form.bulk_threshold} onChange={e => set('bulk_threshold', e.target.value)} />
          </Field>
          <Field label="Скидка (%)">
            <input type="number" className="steel-input w-full" value={form.bulk_discount_percent} onChange={e => set('bulk_discount_percent', e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* Описание */}
      <Section title="Описание">
        <div className="space-y-3">
          <Field label="Русский">
            <textarea className="steel-input w-full resize-none" rows={3} value={form.description_ru} onChange={e => set('description_ru', e.target.value)} />
          </Field>
          <Field label="Қазақша">
            <textarea className="steel-input w-full resize-none" rows={3} value={form.description_kk} onChange={e => set('description_kk', e.target.value)} />
          </Field>
          <Field label="English">
            <textarea className="steel-input w-full resize-none" rows={3} value={form.description_en} onChange={e => set('description_en', e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* Фото */}
      <Section title="Фотографии">
        <div className="flex flex-wrap gap-3 mb-3">
          {form.images.map(url => (
            <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeImage(url)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
                <X size={11} />
              </button>
            </div>
          ))}
          <label className="w-20 h-20 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer flex-shrink-0"
            style={{ border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)' }}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span className="text-[9px]">Загрузить</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple
              className="hidden" onChange={e => handleUpload(e.target.files)} disabled={uploading} />
          </label>
        </div>
        {!form.images.length && (
          <p className="text-[11px] flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <ImageIcon size={12} /> Без фото товар тоже сохранится — можно добавить позже
          </p>
        )}
      </Section>

      {/* Характеристики */}
      <Section title="Технические характеристики">
        <p className="text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Это пары «параметр — значение», которые покажутся в карточке товара на сайте и в КП.
          Например: «Мощность» → «5 кВт», «Объём камеры» → «200 л». Нажмите на готовый параметр ниже или впишите свой.
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {SPEC_PRESETS.map(preset => (
            <button key={preset} type="button" onClick={() => addPresetSpec(preset)}
              disabled={form.specs.some(s => s.key === preset)}
              className="text-[11px] px-2.5 py-1 rounded-full font-medium disabled:opacity-30"
              style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
              + {preset}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {form.specs.map((spec, i) => (
            <div key={i} className="flex gap-2">
              <input className="steel-input flex-1" placeholder="Параметр (напр. Объём камеры)" value={spec.key} onChange={e => updateSpec(i, 'key', e.target.value)} />
              <input className="steel-input flex-1" placeholder="Значение (напр. 200 л)" value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} />
              <button type="button" onClick={() => removeSpec(i)} className="px-2.5 rounded-lg" style={{ color: '#F87171', background: 'rgba(239,68,68,0.08)' }}>
                <X size={14} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addSpec}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
            <Plus size={13} /> Добавить свой параметр
          </button>
        </div>
      </Section>

      {error && (
        <p className="text-sm px-3 py-2 rounded-lg"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </p>
      )}

      <div className="flex gap-3 pb-8">
        <button type="submit" disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
          {saving ? <><Loader2 size={14} className="animate-spin" /> Сохраняем...</> : product ? 'Сохранить' : 'Создать товар'}
        </button>
        <button type="button" onClick={() => router.push('/admin/products')} className="btn-secondary px-4 text-sm">Отмена</button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <h3 className="text-xs font-bold text-white mb-3 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</label>
      {children}
    </div>
  )
}
