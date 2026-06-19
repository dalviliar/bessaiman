'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, Layers } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'

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

export default function Footer() {
  const { tr } = useLang()

  return (
    <footer className="border-t border-steel-border/40 mt-auto"
      style={{ background: 'linear-gradient(180deg, #0A0F1C 0%, #050810 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1565C0, #00B0FF)' }}>
                <Layers size={18} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">BES SAIMAN GROUP</div>
                <div className="text-steel-silver text-[10px] tracking-widest">LABORATORY EQUIPMENT</div>
              </div>
            </div>
            <p className="text-steel-silver text-sm leading-relaxed max-w-xs">
              {tr.about.missionText}
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              {tr.nav.catalog}
            </h4>
            <div className="space-y-2">
              {[
                { href: '/', label: tr.nav.home },
                { href: '/catalog', label: tr.nav.catalog },
                { href: '/nauka', label: tr.nav.nauka },
                { href: '/about', label: tr.nav.about },
                { href: '/contacts', label: tr.nav.contacts },
              ].map((l) => (
                <Link key={l.href} href={l.href}
                  className="block text-steel-silver hover:text-steel-accent text-sm transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              {tr.nav.contacts}
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-steel-accent mt-0.5 shrink-0" />
                <span className="text-steel-silver text-sm">{tr.contacts.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={15} className="text-steel-accent shrink-0" />
                <a href={`tel:${tr.contacts.phone}`}
                  className="text-steel-silver hover:text-white text-sm transition-colors">
                  {tr.contacts.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={15} className="text-steel-accent shrink-0" />
                <a href={`mailto:${tr.contacts.email}`}
                  className="text-steel-silver hover:text-white text-sm transition-colors">
                  {tr.contacts.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-steel-border/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-steel-silver/60 text-xs">
            © {new Date().getFullYear()} Bes Saiman Group. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/bes_saiman_group?igsh=MTFlb2F5ODlldDEwNg=="
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors"
              style={{ color: 'rgba(148,163,184,0.5)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E1306C' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.5)' }}
            >
              <InstagramIcon />
            </a>
            <a
              href="https://wa.me/77011013433"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors"
              style={{ color: 'rgba(148,163,184,0.5)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#25D366' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.5)' }}
            >
              <WhatsAppIcon />
            </a>
            <div className="w-px h-4 bg-steel-border/30" />
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
              <span className="text-steel-silver/60 text-xs">System operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
