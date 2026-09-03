'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Globe, ShoppingCart } from 'lucide-react'

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.096.54 4.07 1.487 5.785L0 24l6.374-1.467A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.796 9.796 0 01-5.003-1.373l-.36-.213-3.713.855.884-3.612-.233-.372A9.796 9.796 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/>
  </svg>
)
import { useLang } from '@/context/LanguageContext'
import { seasonTheme, isCompanyBirthday, companyAge } from '@/lib/season'
import SeasonParticles from './SeasonParticles'
import { useCart } from '@/context/CartContext'
import type { Lang } from '@/types'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'KK' },
  { code: 'en', label: 'EN' },
]

export default function Navbar({ previewDate }: { previewDate?: Date } = {}) {
  const { lang, setLang, tr } = useLang()
  const { totalItems } = useCart()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  // previewDate lets /season-preview render this same component pinned to a
  // fixed date for each season, instead of only ever showing today's — kept
  // optional so ordinary pages behave exactly as before.
  const [season] = useState(() => seasonTheme(previewDate))
  const [birthday] = useState(() => isCompanyBirthday(previewDate))
  const [age] = useState(() => companyAge(previewDate))
  // Birthday needs a computed age mixed into its text, every other special
  // day just shows its fixed season.badge — one pill covers both.
  const badgeText = birthday ? `${age} ${tr.nav.birthday}` : season.badge

  // The admin panel is a fixed full-screen overlay everywhere except its
  // login screen (which sits in normal document flow), so this is the one
  // admin route the public chrome would otherwise show through on.
  if (pathname?.startsWith('/admin')) return null

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
        position: 'relative',
        background: `linear-gradient(180deg, ${season.soft} 0%, rgba(255,255,255,0.85) 100%)`,
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${season.edge}`,
        boxShadow: '0 2px 10px rgba(15,23,42,0.06)',
      }}
    >
      {/* Top accent line — carries the season's colour */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        height: 3,
        background: `linear-gradient(90deg, ${season.strip[1]} 0%, ${season.strip[0]} 50%, ${season.strip[1]} 100%)`,
      }} />

      {/* Seasonal particles drift across the whole navbar, behind the logo/links */}
      <SeasonParticles kind={season.particle} rise={season.rise} />

      {badgeText && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 3,
            transform: 'translateX(-50%)',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 14px',
            borderRadius: 999,
            background: `linear-gradient(135deg, ${season.solid}, ${season.strip[0]})`,
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.01em',
            boxShadow: `0 6px 16px ${season.solid}59`,
            whiteSpace: 'nowrap',
          }}
        >
          {badgeText}
        </div>
      )}

      <div
        className="max-w-[100rem] mx-auto px-6 flex items-center justify-between gap-4 py-3"
        style={{ position: 'relative', paddingTop: badgeText ? 36 : undefined }}
      >

        {/* Logo */}
        <Link href="/" className="flex items-center select-none shrink-0">
          <Image
            src="/logo-full.png"
            alt="Bes Saiman Group"
            width={1600}
            height={396}
            priority
            className="h-[82px] sm:h-[102px] w-auto"
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative whitespace-nowrap px-3.5 lg:px-6 py-3.5 text-lg font-semibold tracking-wide rounded-lg transition-colors duration-200"
                style={{
                  color: active ? '#FFFFFF' : '#334155',
                  background: active ? season.solid : 'transparent',
                  boxShadow: active ? `0 4px 12px ${season.solid}38` : 'none',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = season.soft }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Social icons */}
          <a
            href="https://www.instagram.com/bes_saiman_group?igsh=MTFlb2F5ODlldDEwNg=="
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-11 h-11 rounded-lg transition-all"
            style={{ color: '#94A3B8', border: '1px solid transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E1306C'; (e.currentTarget as HTMLElement).style.border = '1px solid rgba(225,48,108,0.2)'; (e.currentTarget as HTMLElement).style.background = 'rgba(225,48,108,0.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8'; (e.currentTarget as HTMLElement).style.border = '1px solid transparent'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <InstagramIcon />
          </a>
          <a
            href="https://wa.me/77076202890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-11 h-11 rounded-lg transition-all"
            style={{ color: '#94A3B8', border: '1px solid transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#25D366'; (e.currentTarget as HTMLElement).style.border = '1px solid rgba(37,211,102,0.2)'; (e.currentTarget as HTMLElement).style.background = 'rgba(37,211,102,0.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8'; (e.currentTarget as HTMLElement).style.border = '1px solid transparent'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <WhatsAppIcon />
          </a>

          {/* KP Cart */}
          <Link href="/kp" className="relative flex items-center justify-center w-11 h-11 rounded-lg transition-all"
            style={{
              background: totalItems > 0 ? 'rgba(21,101,192,0.08)' : 'transparent',
              border: totalItems > 0 ? '1px solid rgba(21,101,192,0.2)' : '1px solid transparent',
              color: totalItems > 0 ? '#1565C0' : '#94A3B8',
            }}>
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[11px] font-black"
                style={{ background: '#1565C0', color: 'white' }}>
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-[15px] font-mono font-semibold tracking-wider transition-colors"
              style={{
                color: '#64748B',
                border: '1px solid #CBD5E1',
                borderRadius: 6, background: 'transparent',
              }}
            >
              <Globe size={15} />
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
                    className="w-full text-left px-4 py-2.5 text-[15px] font-mono font-semibold tracking-wider transition-colors"
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
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2" style={{ borderTop: `1px solid ${season.edge}` }}>
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3.5 text-lg font-semibold tracking-wide mb-1 rounded-lg transition-colors"
                style={{
                  color: active ? '#FFFFFF' : '#334155',
                  background: active ? season.solid : 'transparent',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
