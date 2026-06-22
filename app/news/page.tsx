'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { NewsPost } from '@/types'
import { useLang } from '@/context/LanguageContext'

function NewsModal({ post, onClose, postTitle, postContent }: {
  post: NewsPost
  onClose: () => void
  postTitle: (p: NewsPost) => string
  postContent: (p: NewsPost) => string | null
}) {
  const { tr } = useLang()
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: 'white', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        {post.image_url && (
          <div className="relative w-full" style={{ height: 260 }}>
            <img src={post.image_url} alt={postTitle(post)} className="w-full h-full object-cover"
              style={{ borderRadius: '16px 16px 0 0' }} />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top,rgba(15,23,42,0.5) 0%,transparent 60%)', borderRadius: '16px 16px 0 0' }} />
          </div>
        )}
        <div className="p-7">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-black tracking-wide px-3 py-1 rounded-full"
              style={{ background: post.type === 'announcement' ? '#FEF3C7' : '#EFF6FF', color: post.type === 'announcement' ? '#B45309' : '#1D4ED8' }}>
              {post.type === 'announcement' ? `⚡ ${tr.news.badgeAnn}` : `● ${tr.news.badgeNews}`}
            </span>
            {post.published_at && (
              <span className="text-[11px]" style={{ color: '#94A3B8' }}>
                {new Date(post.published_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
          <h2 className="font-black text-xl leading-tight mb-4" style={{ color: '#0F172A' }}>
            {postTitle(post)}
          </h2>
          {postContent(post) && (
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#475569' }}>
              {postContent(post)}
            </p>
          )}
          {post.instagram_url && (
            <a href={post.instagram_url} target="_blank" rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold py-2.5 px-5 rounded-full"
              style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: 'white' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              {tr.home.instagramBtn}
            </a>
          )}
          <div className="mt-6 flex justify-end">
            <button onClick={onClose}
              className="px-5 py-2 rounded-lg text-sm font-semibold"
              style={{ border: '1.5px solid #E2E8F0', color: '#64748B' }}>
              {tr.home.closeBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewsPage() {
  const { lang, tr } = useLang()
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'news' | 'announcement'>('all')
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null)

  const postTitle = (p: NewsPost) =>
    (lang === 'kk' ? p.title_kk : lang === 'en' ? p.title_en : null) || p.title_ru
  const postContent = (p: NewsPost) =>
    (lang === 'kk' ? p.content_kk : lang === 'en' ? p.content_en : null) || p.content_ru

  useEffect(() => {
    const url = filter === 'all' ? '/api/news?limit=50' : `/api/news?limit=50&type=${filter}`
    setLoading(true)
    fetch(url).then(r => r.json()).then(d => { setPosts(Array.isArray(d) ? d : []); setLoading(false) })
  }, [filter])

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {selectedPost && (
        <NewsModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          postTitle={postTitle}
          postContent={postContent}
        />
      )}

      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center gap-3">
          <Link href="/" className="text-xs font-medium" style={{ color: '#94A3B8' }}>{tr.news.backHome}</Link>
          <span style={{ color: '#E2E8F0' }}>/</span>
          <span className="text-xs font-semibold" style={{ color: '#0F172A' }}>{tr.news.breadcrumb}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="text-[10px] font-black tracking-widest mb-1" style={{ color: '#94A3B8' }}>BES SAIMAN GROUP</div>
          <h1 className="text-3xl font-black mb-4" style={{ color: '#0F172A' }}>{tr.news.title}</h1>
          <div className="flex gap-2">
            {(['all', 'news', 'announcement'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{ background: filter === f ? '#1565C0' : '#F1F5F9', color: filter === f ? 'white' : '#64748B' }}>
                {f === 'all' ? tr.news.filterAll : f === 'news' ? tr.news.filterNews : tr.news.filterAnn}
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
            <p className="text-lg font-bold mb-2">{tr.news.empty}</p>
            <p className="text-sm">{tr.news.emptyDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map(post => (
              <button key={post.id}
                onClick={() => setSelectedPost(post)}
                className="rounded-2xl overflow-hidden flex flex-col text-left transition-all hover:-translate-y-1 w-full"
                style={{ border: '1px solid #E2E8F0', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
                {post.image_url && (
                  <img src={post.image_url} alt={postTitle(post)} className="w-full h-48 object-cover" />
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: post.type === 'announcement' ? '#FEF3C7' : '#EFF6FF', color: post.type === 'announcement' ? '#B45309' : '#1D4ED8' }}>
                      {post.type === 'announcement' ? tr.news.badgeAnn : tr.news.badgeNews}
                    </span>
                    <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
                        : ''}
                    </span>
                  </div>
                  <h2 className="font-bold text-base leading-snug mb-2" style={{ color: '#0F172A' }}>
                    {postTitle(post)}
                  </h2>
                  {postContent(post) && (
                    <p className="text-sm leading-relaxed flex-1 line-clamp-3" style={{ color: '#64748B' }}>
                      {postContent(post)}
                    </p>
                  )}
                  <div className="mt-3 text-xs font-semibold" style={{ color: '#1565C0' }}>
                    {tr.news.readMore}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
