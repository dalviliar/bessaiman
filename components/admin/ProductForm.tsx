'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, X, Upload, Image as ImageIcon, Search, Package } from 'lucide-react'
import type { Category, Product, ProductType } from '@/types'

interface AccessoryItem {
  id: string
  name_ru: string
  model: string | null
  images: string[]
}

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
  video_url: string
  specs: { key: string; value: string }[]
  product_type: ProductType
  classification_code: string
  compatible_with: string[]
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
  video_url: '',
  specs: [],
  product_type: 'S',
  classification_code: '',
  compatible_with: [],
  weight_kg: '',
  unit: 'шт',
  quantity: '',
  length_cm: '',
  width_cm: '',
  height_cm: '',
}

type DescLang = 'ru' | 'kk' | 'en'

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<FormState>(EMPTY)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [descLang, setDescLang] = useState<DescLang>('ru')
  const [accSearch, setAccSearch] = useState('')
  const [accResults, setAccResults] = useState<AccessoryItem[]>([])
  const [accDropOpen, setAccDropOpen] = useState(false)
  const [accObjects, setAccObjects] = useState<AccessoryItem[]>([])
  const accDropRef = useRef<HTMLDivElement>(null)

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
      video_url: product.video_url ?? '',
      specs: product.specs ? Object.entries(product.specs).map(([key, value]) => ({ key, value: String(value) })) : [],
      product_type: product.product_type,
      classification_code: product.classification_code ?? '',
      compatible_with: product.compatible_with ?? [],
      weight_kg: product.weight_kg?.toString() ?? '',
      unit: product.unit ?? 'шт',
      quantity: product.stock_quantity?.toString() ?? '',
      length_cm: product.length_cm?.toString() ?? '',
      width_cm: product.width_cm?.toString() ?? '',
      height_cm: product.height_cm?.toString() ?? '',
    })
    if (product.accessories?.length) {
      setAccObjects(product.accessories.map(a => ({
        id: a.id, name_ru: a.name_ru, model: a.model, images: a.images ?? [],
      })))
    }
  }, [product])

  useEffect(() => {
    if (accSearch.length < 2) { setAccResults([]); setAccDropOpen(false); return }
    const t = setTimeout(() => {
      fetch(`/api/admin/products/search?q=${encodeURIComponent(accSearch)}`)
        .then(r => r.json())
        .then(data => {
          const results = Array.isArray(data)
            ? data.filter((p: AccessoryItem) => p.id !== product?.id)
            : []
          setAccResults(results)
          setAccDropOpen(results.length > 0)
        })
        .catch(() => {})
    }, 300)
    return () => clearTimeout(t)
  }, [accSearch, product?.id])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accDropRef.current && !accDropRef.current.contains(e.target as Node)) {
        setAccDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleCategoryChange = (categoryId: string) => {
    set('category_id', categoryId)
    const cat = categories.find(c => c.id === categoryId)
    if (cat?.classification_code) {
      set('classification_code', cat.classification_code)
    }
  }

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
      video_url: form.video_url || null,
      specs: Object.keys(specsObj).length ? specsObj : null,
      product_type: form.product_type,
      classification_code: form.classification_code || null,
      compatible_with: form.compatible_with,
      accessory_ids: accObjects.map(a => a.id),
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
            <select className="steel-input w-full" value={form.category_id} onChange={e => handleCategoryChange(e.target.value)} required>
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
            <input className="steel-input w-full" value={form.classification_code}
              onChange={e => set('classification_code', e.target.value.toUpperCase())}
              placeholder="Подставится из категории" />
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

      {/* Совместимость (для аксессуаров PA) */}
      {form.product_type === 'PA' && (
        <Section title="Совместимость — коды серий">
          <p className="text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Этот аксессуар будет автоматически показываться на страницах всех товаров с выбранными кодами. Установите коды в разделе «Категории».
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(
              categories.filter(c => c.classification_code).map(c => c.classification_code!)
            )).sort().map(code => {
              const isSelected = form.compatible_with.includes(code)
              return (
                <button key={code} type="button"
                  onClick={() => set('compatible_with',
                    isSelected ? form.compatible_with.filter(c => c !== code) : [...form.compatible_with, code]
                  )}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all"
                  style={{
                    background: isSelected ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                    color: isSelected ? '#60A5FA' : 'rgba(255,255,255,0.35)',
                    border: `1px solid ${isSelected ? '#3B82F6' : 'rgba(255,255,255,0.1)'}`,
                  }}>
                  {isSelected ? '✓ ' : '+ '}{code}
                </button>
              )
            })}
            {!categories.some(c => c.classification_code) && (
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Нет кодов классификации — задайте их в разделе «Категории»
              </p>
            )}
          </div>
          {form.compatible_with.length > 0 && (
            <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Совместим с {form.compatible_with.length} кодом(-ами): {form.compatible_with.join(', ')}
            </p>
          )}
        </Section>
      )}

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
        <div className="flex gap-1.5 mb-3">
          {(['ru', 'kk', 'en'] as DescLang[]).map(lang => {
            const labels: Record<DescLang, string> = { ru: 'RU — Русский', kk: 'KK — Қазақша', en: 'EN — English' }
            const has = !!form[`description_${lang}` as keyof FormState]
            const isActive = descLang === lang
            return (
              <button key={lang} type="button" onClick={() => setDescLang(lang)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: isActive ? '#1D4ED8' : 'rgba(255,255,255,0.06)',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.45)',
                  border: `1px solid ${isActive ? '#1D4ED8' : 'rgba(255,255,255,0.1)'}`,
                }}>
                {labels[lang]}
                {has && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399', display: 'inline-block' }} />}
              </button>
            )
          })}
        </div>
        <p className="text-[10px] mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Строки заканчивающиеся на «:» будут жирными заголовками на странице товара и в КП. Пример: «Характеристики:»
        </p>
        <textarea
          className="steel-input w-full resize-y font-mono text-xs"
          rows={9}
          value={form[`description_${descLang}` as keyof FormState] as string}
          onChange={e => set(`description_${descLang}` as keyof FormState, e.target.value)}
          placeholder={
            descLang === 'ru'
              ? 'Описание товара...\n\nНапример:\nХарактеристики:\nМощность — 5 кВт\nОбъём камеры — 200 л\n\nПрименение:\nДля хранения продуктов питания'
              : descLang === 'kk'
              ? 'Тауар сипаттамасы...'
              : 'Product description...'
          }
        />
      </Section>

      {/* Фото */}
      <Section title="Фотографии">
        <p className="text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Можно выбрать сразу 3–4 фото. <span style={{ color: '#34d399', fontWeight: 600 }}>Первое фото = главное</span> — оно показывается в карточке каталога.
          Нажмите на любое фото чтобы сделать его главным.
        </p>
        <div className="flex flex-wrap gap-3 mb-3">
          {form.images.map((url, idx) => (
            <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
              style={{ border: idx === 0 ? '2px solid #34d399' : '1px solid rgba(255,255,255,0.1)' }}
              onClick={() => {
                const reordered = [url, ...form.images.filter(u => u !== url)]
                set('images', reordered)
              }}
              title={idx === 0 ? 'Главное фото' : 'Нажмите — сделать главным'}>
              <img src={url} alt="" className="w-full h-full object-cover" />
              {idx === 0 && (
                <div className="absolute bottom-0 left-0 right-0 text-center"
                  style={{ background: 'rgba(52,211,153,0.85)', fontSize: 8, fontWeight: 700, color: 'white', padding: '2px 0' }}>
                  ГЛАВНОЕ
                </div>
              )}
              <button type="button"
                onClick={e => { e.stopPropagation(); removeImage(url) }}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
                <X size={11} />
              </button>
            </div>
          ))}
          <label className="w-20 h-20 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer flex-shrink-0"
            style={{ border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)' }}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span className="text-[9px] text-center leading-tight px-1">Загрузить<br/>3–4 фото</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple
              className="hidden" onChange={e => handleUpload(e.target.files)} disabled={uploading} />
          </label>
        </div>
        {!form.images.length && (
          <p className="text-[11px] flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <ImageIcon size={12} /> Без фото товар тоже сохранится — можно добавить позже
          </p>
        )}
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <Field label="Ссылка на YouTube видео">
            <input
              className="steel-input w-full"
              value={form.video_url}
              onChange={e => set('video_url', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </Field>
          <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Видео будет встроено на странице товара под галереей фотографий
          </p>
        </div>
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

      {/* Аксессуары — ручная привязка */}
      <Section title="Аксессуары (ручная привязка)">
        <p className="text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Выберите конкретные товары, которые всегда будут показываться как аксессуары к этому товару — независимо от кодов.
        </p>

        {accObjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {accObjects.map(acc => (
              <div key={acc.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                {acc.images?.[0] ? (
                  <img src={acc.images[0]} alt="" className="w-6 h-6 rounded object-contain"
                    style={{ background: 'rgba(255,255,255,0.05)' }} />
                ) : (
                  <Package size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                )}
                <span className="text-xs text-white font-medium">{acc.name_ru}</span>
                {acc.model && (
                  <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {acc.model}
                  </span>
                )}
                <button type="button"
                  onClick={() => setAccObjects(prev => prev.filter(a => a.id !== acc.id))}
                  className="ml-0.5 rounded flex items-center justify-center"
                  style={{ color: '#F87171' }}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative" ref={accDropRef}>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              className="steel-input w-full pl-8"
              placeholder="Найти товар (название или артикул)..."
              value={accSearch}
              onChange={e => setAccSearch(e.target.value)}
              onFocus={() => accResults.length > 0 && setAccDropOpen(true)}
            />
          </div>
          {accDropOpen && accResults.length > 0 && (
            <div className="absolute z-30 left-0 right-0 mt-1 rounded-lg overflow-hidden"
              style={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
              {accResults.map(p => {
                const already = accObjects.some(a => a.id === p.id)
                return (
                  <button key={p.id} type="button"
                    onClick={() => {
                      if (!already) setAccObjects(prev => [...prev, p])
                      setAccSearch('')
                      setAccDropOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-contain flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.05)' }} />
                    ) : (
                      <div className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Package size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate">{p.name_ru}</p>
                      {p.model && <p className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{p.model}</p>}
                    </div>
                    {already ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>✓ Добавлен</span>
                    ) : (
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>+ добавить</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
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
