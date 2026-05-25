import { createClient } from '@supabase/supabase-js'
import type { Product, Category, WarehouseItem, WarehouseTransaction } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder',
)

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name_ru')
  if (error) throw error
  return data ?? []
}

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('name_ru')
  if (categorySlug) {
    query = query.eq('categories.slug', categorySlug)
  }
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      documents:product_documents(*),
      accessories:product_accessories!product_id(
        accessory:products!accessory_id(*, category:categories(*))
      )
    `)
    .eq('slug', slug)
    .single()
  if (error) return null
  if (!data) return null
  const product = {
    ...data,
    accessories: (data.accessories ?? []).map((a: { accessory: Product }) => a.accessory),
  }
  return product as Product
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .or(`name_ru.ilike.%${query}%,name_kk.ilike.%${query}%,name_en.ilike.%${query}%,model.ilike.%${query}%`)
    .limit(20)
  if (error) throw error
  return data ?? []
}

export async function getWarehouseItems(): Promise<WarehouseItem[]> {
  const { data, error } = await supabase
    .from('warehouse_items')
    .select('*, product:products(id, name_ru, name_kk, name_en, model, images)')
    .order('last_updated', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getWarehouseItemByBarcode(barcode: string): Promise<WarehouseItem | null> {
  const { data, error } = await supabase
    .from('warehouse_items')
    .select('*, product:products(*)')
    .eq('barcode', barcode)
    .single()
  if (error) return null
  return data
}

export async function createWarehouseTransaction(
  tx: Omit<WarehouseTransaction, 'id' | 'created_at'>
): Promise<void> {
  const { error: txError } = await supabase
    .from('warehouse_transactions')
    .insert(tx)
  if (txError) throw txError

  const delta = tx.type === 'in' ? tx.quantity : -tx.quantity
  const { data: existing } = await supabase
    .from('warehouse_items')
    .select('id, quantity')
    .eq('product_id', tx.product_id)
    .single()

  if (existing) {
    await supabase
      .from('warehouse_items')
      .update({ quantity: existing.quantity + delta, last_updated: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('warehouse_items')
      .insert({ product_id: tx.product_id, barcode: tx.barcode, quantity: Math.max(0, delta) })
  }
}

export async function getRecentTransactions(limit = 50): Promise<WarehouseTransaction[]> {
  const { data, error } = await supabase
    .from('warehouse_transactions')
    .select('*, product:products(id, name_ru, name_kk, name_en, model)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}
