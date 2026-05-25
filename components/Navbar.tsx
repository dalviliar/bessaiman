'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Globe } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import type { Lang } from '@/types'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'KK' },
  { code: 'en', label: 'EN' },
]

export default function Navbar() {
  const { lang, setLang, tr } = useLang()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const links = [
    { href: '/',          label: tr.nav.home },
    { href: '/catalog',   label: tr.nav.catalog },
    { href: '/about',     label: tr.nav.about },
    { href: '/contacts',  label: tr.nav.contacts },
    { href: '/warehouse', label: tr.nav.warehouse },
  ]

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(3,6,8,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(14,165,233,0.12)',
      }}
    >
      {/* Top accent line */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.5) 30%, rgba(56,189,248,0.9) 50%, rgba(14,165,233,0.5) 70%, transparent)',
      }} />

      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[60px]">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group select-none">
          <svg width="28" height="32" viewBox="0 0 28 32" className="shrink-0">
            <polygon points="14,1 27,8 27,24 14,31 1,24 1,8"
              fill="none" stroke="rgba(14,165,233,0.6)" strokeWidth="1.5" />
            <polygon points="14,6 22,10.5 22,21.5 14,26 6,21.5 6,10.5"
              fill="rgba(14,165,233,0.08)" stroke="rgba(56,189,248,0.35)" strokeWidth="1" />
            <text x="14" y="20" textAnchor="middle" fontSize="11" fontWeight="800"
              fill="#38BDF8" fontFamily="Inter,sans-serif">B</text>
          </svg>
          <div>
            <div className="font-black text-[13px] tracking-[0.08em]" style={{ color: '#CBD5E1', lineHeight: 1.1 }}>
              BES SAIMAN
            </div>
            <div className="font-light text-[9px] tracking-[0.3em]" style={{ color: '#1E3A5A' }}>
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
                className="relative px-4 py-2 text-[13px] font-medium tracking-wide transition-all duration-200 hover:text-sky-400"
                style={{ color: active ? '#38BDF8' : '#4A6A88', borderRadius: 2 }}
              >
                {active && (
                  <span className="absolute inset-0 rounded-sm"
                    style={{ background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.18)' }} />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-mono font-semibold tracking-wider transition-colors hover:border-sky-500 hover:text-sky-400"
              style={{
                color: '#3A6080',
                border: '1px solid rgba(14,165,233,0.22)',
                borderRadius: 2, background: 'transparent',
              }}
            >
              <Globe size={13} />
              {lang.toUpperCase()}
            </button>
            {langOpen && (
              <div
                className="absolute right-0 top-full mt-1 py-1 z-50"
                style={{
                  background: '#060C14',
                  border: '1px solid rgba(14,165,233,0.22)',
                  borderRadius: 2, minWidth: 72,
                }}
              >
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false) }}
                    className="w-full text-left px-4 py-2 text-[12px] font-mono font-semibold tracking-wider transition-colors"
                    style={{
                      color: lang === l.code ? '#38BDF8' : '#3A6080',
                      background: lang === l.code ? 'rgba(14,165,233,0.08)' : 'transparent',
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 transition-colors hover:text-sky-400"
            style={{ color: '#3A6080' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2" style={{ borderTop: '1px solid rgba(14,165,233,0.1)' }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium tracking-wide mb-1 transition-colors"
              style={{
                color: pathname === link.href ? '#38BDF8' : '#4A6A88',
                borderRadius: 2,
                background: pathname === link.href ? 'rgba(14,165,233,0.07)' : 'transparent',
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
