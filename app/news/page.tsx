'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { NewsPost } from '@/types'

export default function NewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'news' | 'announcement'>('all')

  useEffect(() => {
    const url = filter === 'all' ? '/api/news?limit=50' : `/api/news?limit=50&type=${filter}`
    setLoading(true)
    fetch(url).then(r => r.json()).then(d => { setPosts(Array.isArray(d) ? d : []); setLoading(false) })
  }, [filter])

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center gap-3">
          <Link href="/" className="text-xs font-medium" style={{ color: '#94A3B8' }}>← Главная</Link>
          <span style={{ color: '#E2E8F0' }}>/</span>
          <span className="text-xs font-semibold" style={{ color: '#0F172A' }}>Новости</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="text-[10px] font-black tracking-widest mb-1" style={{ color: '#94A3B8' }}>BES SAIMAN GROUP</div>
          <h1 className="text-3xl font-black mb-4" style={{ color: '#0F172A' }}>Новости и уведомления</h1>
          <div className="flex gap-2">
            {(['all', 'news', 'announcement'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: filter === f ? '#1565C0' : '#F1F5F9',
                  color: filter === f ? 'white' : '#64748B',
                }}>
                {f === 'all' ? 'Все' : f === 'news' ? 'Новости' : 'Уведомления'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-2xl h-64 animate-pulse" style={{ background: '#E2E8F0' }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20" style={{ color: '#94A3B8' }}>
            <p className="text-lg font-bold mb-2">Пока нет публикаций</p>
            <p className="text-sm">Следите за обновлениями</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map(post => (
              <article key={post.id} className="rounded-2xl overflow-hidden flex flex-col"
                style={{ border: '1px solid #E2E8F0', background: 'white' }}>
                {post.image_url && (
                  <img src={post.image_url} alt={post.title_ru} className="w-full h-48 object-cover" />
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: post.type === 'announcement' ? '#FEF3C7' : '#EFF6FF', color: post.type === 'announcement' ? '#B45309' : '#1D4ED8' }}>
                      {post.type === 'announcement' ? 'Уведомление' : 'Новость'}
                    </span>
                    <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
                        : ''}
                    </span>
                  </div>
                  <h2 className="font-bold text-base leading-snug mb-2" style={{ color: '#0F172A' }}>{post.title_ru}</h2>
                  {post.content_ru && (
                    <p className="text-sm leading-relaxed flex-1" style={{ color: '#64748B' }}>{post.content_ru}</p>
                  )}
                  {post.instagram_url && (
                    <a href={post.instagram_url} target="_blank" rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-full w-fit"
                      style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: 'white' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      Посмотреть в Instagram
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
