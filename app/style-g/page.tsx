'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const VacuumChamber3D = dynamic(() => import('@/components/VacuumChamber3D'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 48, height: 48, border: '3px solid rgba(255,85,0,0.2)', borderTopColor: '#FF5500', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  ),
})

const categories = [
  {
    code: 'HT',
    title: 'Серийные товары',
    desc: 'Высокотемпературные печи, шаровые мельницы, вакуумные перчаточные боксы и другое серийное оборудование',
    stat: '120+ позиций',
  },
  {
    code: 'BM',
    title: 'Комплектующие',
    desc: 'Запасные части, расходные материалы и комплектующие для лабораторного оборудования',
    stat: '80+ позиций',
  },
  {
    code: 'IND',
    title: 'Индивидуальные разработки',
    desc: 'Проектирование и изготовление нестандартного оборудования по техническому заданию заказчика',
    stat: 'под заказ',
  },
]

export default function StyleG() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0C1424', color: '#E8EEF6', fontFamily: 'Inter, sans-serif' }}>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Blueprint bg decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute left-0 top-0 h-full" style={{ width: 280, opacity: 0.055 }} viewBox="0 0 280 900" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1={i * 40} y1="0" x2={i * 40} y2="900" stroke="#4A90D9" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 24 }).map((_, i) => (
            <line key={i} x1="0" y1={i * 40} x2="280" y2={i * 40} stroke="#4A90D9" strokeWidth="0.5" />
          ))}
          <circle cx="80" cy="200" r="70" fill="none" stroke="#4A90D9" strokeWidth="1" />
          <circle cx="80" cy="200" r="45" fill="none" stroke="#4A90D9" strokeWidth="0.7" strokeDasharray="6 4" />
          <line x1="10" y1="200" x2="150" y2="200" stroke="#4A90D9" strokeWidth="0.7" />
          <line x1="80" y1="130" x2="80" y2="270" stroke="#4A90D9" strokeWidth="0.7" />
          <rect x="20" y="350" width="200" height="130" fill="none" stroke="#4A90D9" strokeWidth="0.7" />
          <rect x="20" y="350" width="200" height="16" fill="#4A90D9" fillOpacity="0.12" />
          <text x="30" y="363" fontSize="7" fill="#4A90D9" fontFamily="monospace">ВАКУУМНАЯ КАМЕРА VK-01</text>
          {[['Материал','12Х18Н10Т'],['P','0.001 мбар'],['V','50 л'],['m','120 кг']].map(([k,v],i)=>(
            <g key={k}>
              <text x="30" y={380+i*16} fontSize="7" fill="#4A90D9" fontFamily="monospace">{k}:</text>
              <text x="110" y={380+i*16} fontSize="7" fill="#4A90D9" fontFamily="monospace" fontWeight="700">{v}</text>
            </g>
          ))}
          <circle cx="160" cy="590" r="85" fill="none" stroke="#4A90D9" strokeWidth="0.7" />
          <circle cx="160" cy="590" r="56" fill="none" stroke="#4A90D9" strokeWidth="0.5" strokeDasharray="4 3" />
          {Array.from({length:12}).map((_,i)=>{const a=(i*30)*Math.PI/180;return <line key={i} x1={160+56*Math.cos(a)} y1={590+56*Math.sin(a)} x2={160+83*Math.cos(a)} y2={590+83*Math.sin(a)} stroke="#4A90D9" strokeWidth="0.6" />})}
        </svg>
        <svg className="absolute right-0 top-0 h-full" style={{ width: 260, opacity: 0.055 }} viewBox="0 0 260 900" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={i} x1={i * 40} y1="0" x2={i * 40} y2="900" stroke="#4A90D9" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 24 }).map((_, i) => (
            <line key={i} x1="0" y1={i * 40} x2="260" y2={i * 40} stroke="#4A90D9" strokeWidth="0.5" />
          ))}
          <rect x="30" y="100" width="160" height="200" rx="4" fill="none" stroke="#4A90D9" strokeWidth="0.8" />
          <rect x="30" y="100" width="160" height="16" fill="#4A90D9" fillOpacity="0.1" />
          <text x="40" y="112" fontSize="7" fill="#4A90D9" fontFamily="monospace">ВИД СПЕРЕДИ</text>
          <rect x="55" y="135" width="110" height="145" rx="55" fill="none" stroke="#4A90D9" strokeWidth="0.8" />
          <line x1="30" y1="208" x2="190" y2="208" stroke="#4A90D9" strokeWidth="0.5" />
          <line x1="110" y1="100" x2="110" y2="300" stroke="#4A90D9" strokeWidth="0.5" />
          <text x="40" y="330" fontSize="7" fill="#4A90D9" fontFamily="monospace">BSG-VK-01 · МАСШТАБ 1:10</text>
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(74,144,217,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(74,144,217,0.028) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-4" style={{ borderBottom: '1px solid rgba(255,85,0,0.14)' }}>
        <div className="flex items-center gap-3">
          <svg width="32" height="36" viewBox="0 0 32 36">
            <polygon points="16,2 30,10 30,26 16,34 2,26 2,10" fill="none" stroke="#FF5500" strokeWidth="1.5" />
            <text x="16" y="22" textAnchor="middle" fontSize="13" fontWeight="800" fill="#FF5500" fontFamily="Inter,sans-serif">B</text>
          </svg>
          <div>
            <div className="font-black text-sm tracking-[0.12em]" style={{ color: '#E8EEF6' }}>BES SAIMAN</div>
            <div className="text-[9px] tracking-[0.25em] font-light" style={{ color: 'rgba(255,85,0,0.7)' }}>GROUP</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Главная', 'Каталог', 'О компании', 'Проекты'].map(item => (
            <a key={item} href="#" className="text-sm font-medium transition-colors hover:text-white" style={{ color: 'rgba(200,215,230,0.6)' }}>{item}</a>
          ))}
        </div>
        <button className="px-5 py-2 rounded font-bold text-sm" style={{ background: '#FF5500', color: 'white', letterSpacing: '0.05em' }}>
          КОНТАКТЫ
        </button>
      </nav>

      {/* HERO */}
      <section className="relative z-10 flex-1 flex items-center" style={{ minHeight: '82vh' }}>
        <div className="w-full max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-4 items-center py-10">

          {/* Left */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div style={{ width: 40, height: 2, background: '#FF5500' }} />
              <span className="text-xs font-mono tracking-[0.22em]" style={{ color: 'rgba(255,85,0,0.8)' }}>НАУЧНО-ПРОИЗВОДСТВЕННОЕ ПРЕДПРИЯТИЕ</span>
            </div>
            <h1 className="font-black leading-[1.05]" style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)', letterSpacing: '-0.02em' }}>
              <span style={{ color: '#E8EEF6' }}>ОТ ИДЕИ</span><br />
              <span style={{ color: '#FF5500' }}>ДО ПУСКА</span>
            </h1>
            <p className="text-base leading-relaxed max-w-md" style={{ color: 'rgba(180,200,220,0.7)' }}>
              Проектируем и производим высокотемпературные печи, шаровые мельницы, вакуумные камеры и установки электроспиннинга — от технического задания до запуска в эксплуатацию.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button className="px-7 py-3.5 rounded font-bold text-sm" style={{ background: '#FF5500', color: 'white', letterSpacing: '0.06em', boxShadow: '0 4px 24px rgba(255,85,0,0.35)' }}>
                ЗАКАЗАТЬ ПРОЕКТ
              </button>
              <button className="px-7 py-3.5 rounded font-bold text-sm" style={{ border: '1px solid rgba(200,215,230,0.25)', color: 'rgba(200,215,230,0.8)', letterSpacing: '0.06em' }}>
                НАШИ ОБЪЕКТЫ
              </button>
            </div>
            <div className="flex items-center gap-8 pt-2">
              {[['12+', 'лет на рынке'], ['200+', 'позиций'], ['50+', 'проектов']].map(([num, label]) => (
                <div key={label} className="flex flex-col">
                  <span className="font-black text-xl" style={{ color: '#FF5500' }}>{num}</span>
                  <span className="text-xs" style={{ color: 'rgba(150,180,200,0.6)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Real Three.js 3D */}
          <div className="flex justify-center items-center">
            <div style={{ width: '100%', maxWidth: 560 }}>
              <VacuumChamber3D dark={true} />
            </div>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="relative z-10" style={{ borderTop: '1px solid rgba(255,85,0,0.1)' }}>
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
          <span className="text-xs font-mono" style={{ color: 'rgba(255,85,0,0.4)' }}>КАТАЛОГ ПРОДУКЦИИ</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,85,0,0.07)', margin: '0 16px' }} />
          <span className="text-xs font-mono" style={{ color: 'rgba(100,140,170,0.4)' }}>BES SAIMAN GROUP · КЗ</span>
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="relative z-10 py-12 px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div key={cat.code} className="rounded-xl p-6 flex flex-col gap-4 cursor-pointer group"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,85,0,0.12)' }}>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center font-black text-sm"
                  style={{ background: 'rgba(255,85,0,0.12)', color: '#FF5500', fontFamily: 'monospace' }}>
                  {cat.code}
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full"
                  style={{ background: 'rgba(255,85,0,0.08)', color: 'rgba(255,85,0,0.7)' }}>
                  {cat.stat}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base mb-2" style={{ color: '#E8EEF6' }}>{cat.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(150,180,200,0.65)' }}>{cat.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: 'rgba(255,85,0,0.7)' }}>Смотреть каталог</span>
                <span style={{ color: 'rgba(255,85,0,0.5)' }}>→</span>
              </div>
              <div className="h-0.5 rounded" style={{ background: 'linear-gradient(90deg, #FF5500, transparent)', opacity: 0.4 }} />
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-5 px-8" style={{ borderTop: '1px solid rgba(255,85,0,0.08)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <span className="font-black text-sm tracking-widest" style={{ color: 'rgba(200,215,230,0.4)' }}>BES SAIMAN GROUP</span>
          <span className="text-xs font-mono" style={{ color: 'rgba(100,140,170,0.35)' }}>© 2024 · Казахстан · +7 (956) 436-17-17</span>
        </div>
      </footer>
    </div>
  )
}
