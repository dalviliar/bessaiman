'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'

export default function Footer() {
  const { tr } = useLang()

  return (
    <footer className="border-t border-steel-border/40 mt-auto"
      style={{ background: 'linear-gradient(180deg, #0A0F1C 0%, #050810 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Image
              src="/logo-full-white.png"
              alt="Bes Saiman Group"
              width={1600}
              height={396}
              className="h-20 w-auto mb-4"
            />
            <p className="text-steel-silver text-base leading-relaxed max-w-xs" style={{ textAlign: 'justify' }}>
              {tr.about.missionText}
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4 uppercase tracking-wider">
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
                  className="block text-steel-silver hover:text-steel-accent text-base transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4 uppercase tracking-wider">
              {tr.nav.contacts}
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-steel-accent mt-0.5 shrink-0" />
                <span className="text-steel-silver text-base">{tr.contacts.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={15} className="text-steel-accent shrink-0" />
                <a href={`tel:${tr.contacts.phone}`}
                  className="text-steel-silver hover:text-white text-base transition-colors">
                  {tr.contacts.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={15} className="text-steel-accent shrink-0" />
                <a href={`mailto:${tr.contacts.email}`}
                  className="text-steel-silver hover:text-white text-base transition-colors">
                  {tr.contacts.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Social icons already live in the navbar — the bottom row only
            needs the legal line and the studio credit, kept to one row. */}
        <div className="mt-9 pt-5 border-t border-steel-border/30 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-steel-silver/60 text-sm">
            © {new Date().getFullYear()} Bes Saiman Group. {tr.nav.rights}
          </p>
          <a href="https://wa.me/77470636611" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm tracking-wide transition-colors"
            style={{ color: 'rgba(148,163,184,0.45)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(203,213,225,0.85)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.45)' }}
          >
            {tr.nav.builtBy}
            <span style={{ color: 'rgba(148,163,184,0.3)' }}>—</span>
            <span className="font-semibold">Веб-студия Rauza</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
