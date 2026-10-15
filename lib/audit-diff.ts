// "What changed" for the admin audit log: compares a row before and after an
// update and turns it into readable lines like «Цена: 100 000 → 120 000».
// Stored ready-formatted in admin_audit_log.details, so old entries keep
// reading correctly even if field names change later.

export interface AuditChange {
  label: string
  from: string
  to: string
}

type Row = Record<string, unknown>
type Formatter = (v: unknown) => string

const MAX_LEN = 400

const AVAILABILITY: Record<string, string> = {
  in_stock: 'В наличии', on_order: 'Под заказ', out_of_stock: 'Нет в наличии',
}
const PRODUCT_TYPE: Record<string, string> = {
  S: 'Серийный', PP: 'Серийный', PA: 'Комплектующие', I: 'Разработка по ТЗ',
}

const fileName = (v: unknown) => (typeof v === 'string' && v ? decodeURIComponent(v.split('/').pop() ?? v) : '')
const list = (v: unknown) => (Array.isArray(v) ? v.join(', ') : '')
const count = (word: string) => (v: unknown) => (Array.isArray(v) && v.length ? `${v.length} ${word}` : '')
const mapped = (m: Record<string, string>) => (v: unknown) => (typeof v === 'string' ? m[v] ?? v : '')
const kpTerms = (v: unknown) =>
  Array.isArray(v) ? v.map(r => `${(r as { label?: string }).label ?? ''} ${(r as { value?: string }).value ?? ''}`.trim()).join('; ') : ''

const PRODUCT_FIELDS: Record<string, [string, Formatter?]> = {
  name_ru: ['Название (RU)'], name_kk: ['Название (KK)'], name_en: ['Название (EN)'],
  model: ['Модель'],
  category_id: ['Категория'], // resolved to names by the caller
  description_ru: ['Описание (RU)'], description_kk: ['Описание (KK)'], description_en: ['Описание (EN)'],
  price: ['Цена'], price_with_discount: ['Цена со скидкой'],
  bulk_threshold: ['Оптовая скидка от (шт.)'], bulk_discount_percent: ['Оптовая скидка, %'],
  availability: ['Наличие', mapped(AVAILABILITY)],
  barcode: ['Штрихкод'],
  images: ['Фото', count('фото')],
  video_url: ['Видео'], instagram_url: ['Instagram'],
  product_type: ['Тип товара', mapped(PRODUCT_TYPE)],
  classification_code: ['Код классификации'],
  compatible_with: ['Совместимость', list],
  weight_kg: ['Вес, кг'], unit: ['Ед. изм.'],
  length_cm: ['Длина, см'], width_cm: ['Ширина, см'], height_cm: ['Высота, см'],
  kp_terms_override: ['Условия поставки в КП', kpTerms],
  featured_specs: ['Значки на карточке', list],
  questionnaire_url: ['Опросный лист (RU)', fileName],
  questionnaire_url_kk: ['Опросный лист (KK)', fileName],
  questionnaire_url_en: ['Опросный лист (EN)', fileName],
}

const CATEGORY_FIELDS: Record<string, [string, Formatter?]> = {
  name_ru: ['Название (RU)'], name_kk: ['Название (KK)'], name_en: ['Название (EN)'],
  description_ru: ['Описание (RU)'], description_kk: ['Описание (KK)'], description_en: ['Описание (EN)'],
  classification_code: ['Код классификации'],
  image_url: ['Картинка', fileName],
}

function plain(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'number') return v.toLocaleString('ru-RU')
  if (typeof v === 'string') {
    // pg returns numeric columns as strings - show them like numbers
    return /^-?\d+(\.\d+)?$/.test(v) ? Number(v).toLocaleString('ru-RU') : v
  }
  if (typeof v === 'boolean') return v ? 'да' : 'нет'
  return JSON.stringify(v)
}

function cut(s: string) {
  const t = s.trim()
  return t.length > MAX_LEN ? t.slice(0, MAX_LEN) + '…' : t
}

function push(out: AuditChange[], label: string, from: string, to: string) {
  if (from.trim() === to.trim()) return
  out.push({ label, from: cut(from), to: cut(to) })
}

function diffFields(before: Row, after: Row, fields: Record<string, [string, Formatter?]>): AuditChange[] {
  const out: AuditChange[] = []
  for (const [field, [label, fmt = plain]] of Object.entries(fields)) {
    if (!(field in after)) continue
    push(out, label, fmt(before[field]), fmt(after[field]))
  }
  return out
}

type SpecsI18n = Record<string, Record<string, string>>

function diffSpecs(before: Row, after: Row): AuditChange[] {
  const out: AuditChange[] = []
  const b = (before.specs ?? {}) as Record<string, string>
  const a = (after.specs ?? {}) as Record<string, string>
  for (const key of Array.from(new Set([...Object.keys(b), ...Object.keys(a)]))) {
    push(out, `Характеристика «${key}»`, b[key] ?? '', a[key] ?? '')
  }
  const bk = Object.keys(b).filter(k => k in a), ak = Object.keys(a).filter(k => k in b)
  if (bk.join('\n') !== ak.join('\n')) push(out, 'Порядок характеристик', bk.join(', '), ak.join(', '))

  if ('specs_i18n' in after) {
    const bt = (before.specs_i18n ?? {}) as SpecsI18n
    const at = (after.specs_i18n ?? {}) as SpecsI18n
    for (const key of Array.from(new Set([...Object.keys(bt), ...Object.keys(at)]))) {
      for (const lang of ['kk', 'en']) {
        const show = (t?: Record<string, string>) =>
          [t?.[`key_${lang}`], t?.[`value_${lang}`]].filter(Boolean).join(': ')
        push(out, `Перевод «${key}» (${lang.toUpperCase()})`, show(bt[key]), show(at[key]))
      }
    }
  }
  return out
}

export function diffProduct(
  before: Row, after: Row,
  extra?: { categoryNames?: Record<string, string>; accessoriesBefore?: string[]; accessoriesAfter?: string[] },
): AuditChange[] {
  const names = extra?.categoryNames ?? {}
  const out = diffFields(
    { ...before, category_id: names[before.category_id as string] ?? before.category_id },
    { ...after, category_id: names[after.category_id as string] ?? after.category_id },
    PRODUCT_FIELDS,
  )
  out.push(...diffSpecs(before, after))
  if (extra?.accessoriesBefore && extra.accessoriesAfter) {
    const b = [...extra.accessoriesBefore].sort(), a = [...extra.accessoriesAfter].sort()
    push(out, 'Аксессуары', b.join(', '), a.join(', '))
  }
  return out
}

export function diffCategory(before: Row, after: Row): AuditChange[] {
  return diffFields(before, after, CATEGORY_FIELDS)
}
