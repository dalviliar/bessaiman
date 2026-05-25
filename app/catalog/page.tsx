'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import ProductCard from '@/components/ProductCard'
import { getCategories, getProducts, searchProducts } from '@/lib/supabase'
import type { Category, Product } from '@/types'

export default function CatalogPage() {
  const { lang, tr } = useLang()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') ?? ''

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let data: Product[]
      if (searchQuery.trim().length > 1) {
        data = await searchProducts(searchQuery.trim())
      } else {
        data = await getProducts(selectedCategory || undefined)
      }
      setProducts(data)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, searchQuery])

  useEffect(() => {
    const timer = setTimeout(load, 300)
    return () => clearTimeout(timer)
  }, [load])

  const filteredByCategory = selectedCategory
    ? products.filter((p) => p.category?.slug === selectedCategory)
    : products

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title text-3xl mb-2">{tr.catalog.title}</h1>
        <div className="h-1 w-16 rounded-full"
          style={{ background: 'linear-gradient(90deg, #1565C0, #00B0FF)' }} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar — Categories */}
        <aside className="lg:w-64 shrink-0">
          <div className="steel-card p-4 sticky top-20">
            <div className="flex items-center gap-2 text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              <SlidersHorizontal size={15} className="text-steel-accent" />
              {tr.catalog.allCategories}
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                  !selectedCategory
                    ? 'bg-steel-blue/10 text-steel-accent border border-steel-blue/30'
                    : 'text-steel-silver hover:text-white hover:bg-white/5'
                }`}
              >
                {tr.catalog.allCategories}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-steel-blue/10 text-steel-accent border border-steel-blue/30'
                      : 'text-steel-silver hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat[`name_${lang}` as const] || cat.name_ru}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Search */}
          <div className="relative mb-6">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-silver" />
            <input
              type="text"
              placeholder={tr.catalog.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="steel-input pl-10 pr-10"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-silver hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Results count */}
          <p className="text-steel-silver text-sm mb-6">
            {filteredByCategory.length} {lang === 'ru' ? 'товаров' : lang === 'kk' ? 'тауар' : 'products'}
          </p>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="steel-card aspect-[4/5] animate-pulse bg-steel-card" />
              ))}
            </div>
          ) : filteredByCategory.length === 0 ? (
            <div className="text-center py-24 text-steel-silver">
              <Search size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">{tr.catalog.noProducts}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredByCategory.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
