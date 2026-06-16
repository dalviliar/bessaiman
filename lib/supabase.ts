import type { Product, Category, WarehouseItem, WarehouseTransaction } from '@/types'

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${path}`)
  }
  return res.json()
}

export async function getCategories(): Promise<Category[]> {
  return api<Category[]>('/api/categories')
}

export async function getProducts(
  categorySlug?: string,
  productType?: string,
): Promise<Product[]> {
  const params = new URLSearchParams()
  if (categorySlug) params.set('category', categorySlug)
  if (productType && productType !== 'all') params.set('type', productType)
  const qs = params.toString()
  return api<Product[]>(`/api/products${qs ? `?${qs}` : ''}`)
}

export async function getCompatibleAccessories(classificationCode: string): Promise<Product[]> {
  try {
    return await api<Product[]>(`/api/products/compatible?code=${encodeURIComponent(classificationCode)}`)
  } catch {
    return []
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await api<Product>(`/api/products/${encodeURIComponent(slug)}`)
  } catch {
    return null
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  return api<Product[]>(`/api/search?q=${encodeURIComponent(query)}`)
}

export async function getWarehouseItems(): Promise<WarehouseItem[]> {
  return api<WarehouseItem[]>('/api/warehouse/items')
}

export async function getWarehouseItemByBarcode(barcode: string): Promise<WarehouseItem | null> {
  try {
    return await api<WarehouseItem>(`/api/warehouse/items/${encodeURIComponent(barcode)}`)
  } catch {
    return null
  }
}

export async function createWarehouseTransaction(
  tx: Omit<WarehouseTransaction, 'id' | 'created_at'>
): Promise<void> {
  await api('/api/warehouse/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tx),
  })
}

export async function getRecentTransactions(limit = 50): Promise<WarehouseTransaction[]> {
  return api<WarehouseTransaction[]>(`/api/warehouse/transactions?limit=${limit}`)
}
