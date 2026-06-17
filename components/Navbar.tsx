'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Globe, ShoppingCart } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import type { Lang } from '@/types'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'KK' },
  { code: 'en', label: 'EN' },
]

export default function Navbar() {
  const { lang, setLang, tr } = useLang()
  const { totalItems } = useCart()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const links = [
    { href: '/',         label: tr.nav.home },
    { href: '/catalog',  label: tr.nav.catalog },
    { href: '/about',    label: tr.nav.about },
    { href: '/contacts', label: tr.nav.contacts },
  ]

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Top accent line */}
      <div style={{
        height: 2,
        background: 'linear-gradient(90deg, #1565C0 0%, #0284C7 50%, #1565C0 100%)',
      }} />

      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[60px]">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group select-none">
          <svg width="28" height="32" viewBox="0 0 28 32" className="shrink-0">
            <polygon points="14,1 27,8 27,24 14,31 1,24 1,8"
              fill="none" stroke="#1565C0" strokeWidth="1.5" />
            <polygon points="14,6 22,10.5 22,21.5 14,26 6,21.5 6,10.5"
              fill="rgba(21,101,192,0.08)" stroke="rgba(21,101,192,0.3)" strokeWidth="1" />
            <text x="14" y="20" textAnchor="middle" fontSize="11" fontWeight="800"
              fill="#1565C0" fontFamily="Inter,sans-serif">B</text>
          </svg>
          <div>
            <div className="font-black text-[13px] tracking-[0.08em]" style={{ color: '#0F172A', lineHeight: 1.1 }}>
              BES SAIMAN
            </div>
            <div className="font-light text-[9px] tracking-[0.3em]" style={{ color: '#94A3B8' }}>
              GROUP
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-[13px] font-medium tracking-wide transition-all duration-200"
                style={{ color: active ? '#1565C0' : '#475569', borderRadius: 6 }}
              >
                {active && (
                  <span className="absolute inset-0 rounded-md"
                    style={{ background: 'rgba(21,101,192,0.08)', border: '1px solid rgba(21,101,192,0.15)' }} />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* KP Cart */}
          <Link href="/kp" className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-all"
            style={{
              background: totalItems > 0 ? 'rgba(21,101,192,0.08)' : 'transparent',
              border: totalItems > 0 ? '1px solid rgba(21,101,192,0.2)' : '1px solid transparent',
              color: totalItems > 0 ? '#1565C0' : '#94A3B8',
            }}>
            <ShoppingCart size={16} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
                style={{ background: '#1565C0', color: 'white' }}>
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-mono font-semibold tracking-wider transition-colors"
              style={{
                color: '#64748B',
                border: '1px solid #CBD5E1',
                borderRadius: 6, background: 'transparent',
              }}
            >
              <Globe size={13} />
              {lang.toUpperCase()}
            </button>
            {langOpen && (
              <div
                className="absolute right-0 top-full mt-1 py-1 z-50"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8, minWidth: 72,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              >
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false) }}
                    className="w-full text-left px-4 py-2 text-[12px] font-mono font-semibold tracking-wider transition-colors"
                    style={{
                      color: lang === l.code ? '#1565C0' : '#64748B',
                      background: lang === l.code ? 'rgba(21,101,192,0.06)' : 'transparent',
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 transition-colors"
            style={{ color: '#64748B' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2" style={{ borderTop: '1px solid #E2E8F0' }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium tracking-wide mb-1 transition-colors"
              style={{
                color: pathname === link.href ? '#1565C0' : '#475569',
                borderRadius: 6,
                background: pathname === link.href ? 'rgba(21,101,192,0.06)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
