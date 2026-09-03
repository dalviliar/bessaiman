'use client'

import Navbar from '@/components/Navbar'

// Internal-only page (not linked from the nav) for reviewing every seasonal
// navbar theme and the birthday special day side by side, without waiting
// for the calendar to actually reach each one. Same pattern as the old
// style-a..h prototype pages, just for this instead of hero-layout drafts.
const VARIANTS: { label: string; hint: string; date: Date }[] = [
  { label: 'Зима',            hint: 'декабрь – февраль, снежинки',             date: new Date(2026, 0, 15) },
  { label: 'Весна',           hint: 'март – май, лепестки',                    date: new Date(2026, 3, 15) },
  { label: 'Лето',            hint: 'июнь – август, пузырьки плывут вверх',    date: new Date(2026, 6, 15) },
  { label: 'Осень',           hint: 'сентябрь – ноябрь, листья (два вида)',    date: new Date(2026, 9, 15) },
  { label: '8 Марта',         hint: '8 марта, лепестки и бейдж-поздравление',  date: new Date(2026, 2, 8) },
  { label: 'Наурыз',          hint: '22 марта, тюльпаны и бейдж-поздравление', date: new Date(2026, 2, 22) },
  { label: 'День рождения',   hint: '26 апреля любого года, конфетти + бейдж', date: new Date(2026, 3, 26) },
  { label: 'Ғылым күні',      hint: '12 апреля, искры и бейдж-поздравление',   date: new Date(2026, 3, 12) },
  { label: 'Новый год',       hint: '31 декабря, искры и бейдж-поздравление',  date: new Date(2026, 11, 31) },
]

export default function SeasonPreviewPage() {
  return (
    <div style={{ background: '#F1F5F9', paddingBottom: 80 }}>
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-6">
        <p className="text-sm font-mono tracking-widest" style={{ color: '#1565C0' }}>ВНУТРЕННЯЯ СТРАНИЦА</p>
        <h1 className="text-2xl font-black mt-1" style={{ color: '#0F172A' }}>Все варианты шапки сайта</h1>
        <p className="text-base mt-2 max-w-2xl" style={{ color: '#64748B' }}>
          Шапка на сайте сейчас показывает сегодняшний вариант. Здесь собраны все остальные,
          они уже есть в коде и включаются сами по календарю. Ждать наступления даты не нужно,
          можно сразу посмотреть, как будет выглядеть зимой, летом или в любой праздник.
        </p>
      </div>

      {VARIANTS.map(v => (
        <div key={v.label} className="max-w-5xl mx-auto px-6 mb-10">
          <div className="flex items-baseline gap-3 mb-3">
            <h2 className="text-lg font-bold" style={{ color: '#0F172A' }}>{v.label}</h2>
            <span className="text-sm" style={{ color: '#94A3B8' }}>{v.hint}</span>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 8px 30px -12px rgba(15,23,42,0.25)' }}>
            <Navbar previewDate={v.date} />
          </div>
        </div>
      ))}

      <div className="max-w-5xl mx-auto px-6">
        <p className="text-sm" style={{ color: '#94A3B8' }}>
          Нужна тема под ещё одно событие, праздник или дату компании? Скажите какое и на какое
          число, добавлю сюда же для предпросмотра перед тем, как включать на сайте.
        </p>
      </div>
    </div>
  )
}
