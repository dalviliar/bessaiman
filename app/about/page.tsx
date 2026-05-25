'use client'

import { Layers, Globe, Award, Users } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'

export default function AboutPage() {
  const { tr } = useLang()

  const values = [
    {
      icon: <Layers size={24} className="text-steel-accent" />,
      title: 'Многообразие',
      desc: 'Широкий ассортимент высокоточного оборудования для разных отраслей',
    },
    {
      icon: <Globe size={24} className="text-steel-accent" />,
      title: 'Международные стандарты',
      desc: 'Сотрудничество с ведущими мировыми производителями',
    },
    {
      icon: <Award size={24} className="text-steel-accent" />,
      title: 'Качество',
      desc: 'Все оборудование проходит проверку и имеет гарантию',
    },
    {
      icon: <Users size={24} className="text-steel-accent" />,
      title: 'Команда',
      desc: 'Профессиональные инженеры и технические специалисты',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1565C0, #00B0FF)' }}>
          <Layers size={28} className="text-white" />
        </div>
        <h1 className="section-title text-4xl mb-4">{tr.about.title}</h1>
        <p className="text-steel-accent text-lg font-medium mb-6">{tr.about.subtitle}</p>
        <p className="text-steel-silver leading-relaxed max-w-2xl mx-auto">
          {tr.about.missionText}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {[
          { value: '200+', label: 'Единиц оборудования' },
          { value: '50+', label: 'Клиентов' },
          { value: '10+', label: 'Лет опыта' },
          { value: '5', label: 'Категорий оборудования' },
        ].map((s) => (
          <div key={s.value} className="steel-card p-6 text-center">
            <div className="text-3xl font-black text-steel-accent mb-1">{s.value}</div>
            <div className="text-steel-silver text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Values */}
      <h2 className="section-title text-2xl mb-8">{tr.about.mission}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {values.map((v) => (
          <div key={v.title} className="steel-card p-6 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-steel-blue/10 border border-steel-blue/20 flex items-center justify-center shrink-0">
              {v.icon}
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">{v.title}</h3>
              <p className="text-steel-silver text-sm leading-relaxed">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Name meaning */}
      <div className="steel-card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-steel-sheen" />
        <div className="relative">
          <div className="text-5xl font-black text-white mb-3 tracking-tight">
            БЕС <span className="text-steel-accent">САЙМАН</span>
          </div>
          <p className="text-steel-silver-light text-lg mb-2">
            Қазақша: «Бес Сайман» — «Әртүрлі аспаптар»
          </p>
          <p className="text-steel-silver max-w-lg mx-auto">
            Название компании символизирует многообразие высокоточных инструментов и оборудования для науки и промышленности Казахстана.
          </p>
        </div>
      </div>
    </div>
  )
}
