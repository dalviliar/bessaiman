'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, Layers } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'

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
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
            <span className="text-steel-silver/60 text-xs">System operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
