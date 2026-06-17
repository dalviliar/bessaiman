export type Lang = 'ru' | 'kk' | 'en'

export interface Category {
  id: string
  slug: string
  name_ru: string
  name_kk: string
  name_en: string
  description_ru: string | null
  description_kk: string | null
  description_en: string | null
  image_url: string | null
  classification_code: string | null
  created_at: string
}

export interface NewsPost {
  id: string
  title_ru: string
  title_kk: string | null
  title_en: string | null
  content_ru: string | null
  content_kk: string | null
  content_en: string | null
  image_url: string | null
  instagram_url: string | null
  type: 'news' | 'announcement'
  is_published: boolean
  published_at: string | null
  created_at: string
}

export type ProductType = 'S' | 'PP' | 'PA' | 'I'

export interface Product {
  id: string
  slug: string
  category_id: string
  name_ru: string
  name_kk: string
  name_en: string
  model: string | null
  description_ru: string | null
  description_kk: string | null
  description_en: string | null
  price: number | null
  price_with_discount: number | null
  bulk_threshold: number
  bulk_discount_percent: number
  availability: 'in_stock' | 'on_order' | 'out_of_stock'
  barcode: string | null
  images: string[]
  specs: Record<string, string> | null
  product_type: ProductType
  classification_code: string | null
  compatible_with: string[]
  weight_kg: number | null
  unit: string
  length_cm: number | null
  width_cm: number | null
  height_cm: number | null
  stock_quantity?: number | null
  created_at: string
  category?: Category
  accessories?: Product[]
  compatible_accessories?: Product[]
  documents?: ProductDocument[]
}

export interface ProductDocument {
  id: string
  product_id: string
  type: 'commercial_proposal' | 'tech_spec'
  file_url: string
  created_at: string
}

export interface WarehouseItem {
  id: string
  product_id: string
  barcode: string | null
  quantity: number
  location: string | null
  last_updated: string
  product?: Product
}

export interface WarehouseTransaction {
  id: string
  product_id: string
  barcode: string | null
  type: 'in' | 'out'
  quantity: number
  note: string | null
  created_at: string
  product?: Product
}
