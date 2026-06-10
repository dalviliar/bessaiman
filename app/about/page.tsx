'use client'

import { Layers, Wrench, Target, Lightbulb, TrendingUp } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'

export default function AboutPage() {
  const { tr } = useLang()

  const values = [
    {
      icon: <Wrench size={24} className="text-steel-accent" />,
      title: 'Разработка. Производство. Применение.',
      desc: 'Проектируем и производим современное оборудование и пилотные установки для лабораторий, научно-исследовательских центров, промышленных и медицинских предприятий.',
    },
    {
      icon: <Target size={24} className="text-steel-accent" />,
      title: 'Серийность. Индивидуальность. Точность.',
      desc: 'Предлагаем серийные решения и уникальные разработки по техническому заданию клиента. Каждое изделие адаптируется под конкретные задачи.',
    },
    {
      icon: <Lightbulb size={24} className="text-steel-accent" />,
      title: 'Связь. Идея. Внедрение.',
      desc: 'Мы — мост между инновационными идеями учёных и реальными производственными решениями. От концепции до готового продукта.',
    },
    {
      icon: <TrendingUp size={24} className="text-steel-accent" />,
      title: 'Достижения. Поддержка. Развитие.',
      desc: 'Участвуем в научно-технических программах, поддерживаем исследования в области наноматериалов, энергонакопителей и зелёного водорода.',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1565C0, #00B0FF)' }}>
          <Wrench size={28} className="text-white" />
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
              <h3 className="text-[#0F172A] font-semibold mb-1">{v.title}</h3>
              <p className="text-steel-silver text-sm leading-relaxed">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Name meaning */}
      <div className="steel-card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-steel-sheen" />
        <div className="relative">
          <div className="text-5xl font-black text-[#0F172A] mb-3 tracking-tight">
            БЕС <span className="text-steel-accent">САЙМАН</span>
          </div>
          <p className="text-steel-silver max-w-lg mx-auto">
            Научно-производственная компания. Оборудование для науки и промышленности. Индивидуальные разработки под заказ. Работаем по РК и СНГ.
          </p>
        </div>
      </div>
    </div>
  )
}
