'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Globe, ShoppingCart } from 'lucide-react'

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.096.54 4.07 1.487 5.785L0 24l6.374-1.467A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.796 9.796 0 01-5.003-1.373l-.36-.213-3.713.855.884-3.612-.233-.372A9.796 9.796 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/>
  </svg>
)
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
    { href: '/nauka',    label: tr.nav.nauka },
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
          {/* Social icons */}
          <a
            href="https://www.instagram.com/bes_saiman_group?igsh=MTFlb2F5ODlldDEwNg=="
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-all"
            style={{ color: '#94A3B8', border: '1px solid transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E1306C'; (e.currentTarget as HTMLElement).style.border = '1px solid rgba(225,48,108,0.2)'; (e.currentTarget as HTMLElement).style.background = 'rgba(225,48,108,0.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8'; (e.currentTarget as HTMLElement).style.border = '1px solid transparent'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <InstagramIcon />
          </a>
          <a
            href="https://wa.me/77011013433"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-all"
            style={{ color: '#94A3B8', border: '1px solid transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#25D366'; (e.currentTarget as HTMLElement).style.border = '1px solid rgba(37,211,102,0.2)'; (e.currentTarget as HTMLElement).style.background = 'rgba(37,211,102,0.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8'; (e.currentTarget as HTMLElement).style.border = '1px solid transparent'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <WhatsAppIcon />
          </a>

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
