'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, FileText, Eye, Building2, Loader2, BarChart3, Globe } from 'lucide-react'

interface Analytics {
  totals: { total: string; this_month: string; today: string; total_views: string }
  daily: { day: string; count: string }[]
  topProducts: { product_name: string; product_model: string | null; kp_count: string; last_request: string }[]
  topCompanies: { company: string; count: string; last_request: string }[]
  topViewed: { product_id: string; name_ru: string; model: string | null; views: string }[]
  byLang: { lang: string; count: string }[]
}

const LANG_LABELS: Record<string, string> = { ru: 'Русский', kk: 'Қазақ', en: 'English' }

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ width: '100%', height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.05)' }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: color, transition: 'width 0.4s ease' }} />
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => {
        if (d?.error) { setError(d.error); return }
        setData(d)
      })
      .catch(() => setError('Не удалось загрузить аналитику'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <Loader2 size={24} className="animate-spin" style={{ color: '#60A5FA' }} />
      </div>
    )
  }
  if (error) {
    return (
      <div className="p-8">
        <p className="text-sm rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
          {error === 'Доступ запрещён' ? 'Сессия истекла — выйдите и войдите снова.' : error}
        </p>
      </div>
    )
  }
  if (!data) return null

  const maxDaily   = Math.max(...data.daily.map(d => Number(d.count)), 1)
  const maxProduct = Math.max(...data.topProducts.map(p => Number(p.kp_count)), 1)
  const maxViews   = Math.max(...data.topViewed.map(v => Number(v.views)), 1)
  const maxLang    = Math.max(...data.byLang.map(l => Number(l.count)), 1)

  const LANG_COLOR = ['#60A5FA', '#34D399', '#A78BFA']

  return (
    <div className="p-6 max-w-6xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white">Аналитика</h1>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Активность, просмотры и запросы КП</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: FileText,   label: 'Всего КП',           value: data.totals.total,       accent: '#60A5FA' },
          { icon: TrendingUp, label: 'КП в этом месяце',   value: data.totals.this_month,  accent: '#34D399' },
          { icon: FileText,   label: 'КП сегодня',         value: data.totals.today,       accent: '#A78BFA' },
          { icon: Eye,        label: 'Просмотры (30 дн.)', value: data.totals.total_views, accent: '#60A5FA' },
        ].map(({ icon: Icon, label, value, accent }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={13} style={{ color: accent }} />
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
            </div>
            <p className="text-2xl font-black font-mono text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Daily bar chart */}
        <div className="lg:col-span-2 rounded-xl p-5" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={13} style={{ color: '#60A5FA' }} />
              <h2 className="text-sm font-semibold text-white">Запросы КП за 30 дней</h2>
            </div>
            <span className="text-[11px] font-mono font-bold" style={{ color: '#60A5FA' }}>
              макс. {maxDaily}
            </span>
          </div>
          {data.daily.length === 0 ? (
            <p className="text-xs text-center py-10" style={{ color: 'rgba(255,255,255,0.2)' }}>Нет данных</p>
          ) : (
            <div className="relative">
              {/* Grid lines */}
              <div className="absolute inset-x-0 top-0" style={{ height: 120 }}>
                {[75, 50, 25].map(p => (
                  <div key={p} className="absolute w-full" style={{ bottom: `${p}%`, borderTop: '1px dashed rgba(255,255,255,0.04)' }} />
                ))}
              </div>
              {/* Bars */}
              <div className="flex items-end gap-px" style={{ height: 120 }}>
                {data.daily.map((d, i) => {
                  const count = Number(d.count)
                  const pct = count > 0 ? Math.max((count / maxDaily) * 100, 6) : 0
                  const isLast = i === data.daily.length - 1
                  const showLabel = i === 0 || i % 6 === 0 || isLast
                  return (
                    <div key={d.day} className="flex-1 flex flex-col justify-end group relative" style={{ height: '100%' }}>
                      {/* Tooltip */}
                      {count > 0 && (
                        <div className="absolute z-20 px-2 py-1 rounded-lg text-[9px] font-semibold opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap text-white"
                          style={{
                            bottom: `calc(${pct}% + 6px)`,
                            left: '50%', transform: 'translateX(-50%)',
                            background: '#1565C0',
                            boxShadow: '0 2px 8px rgba(21,101,192,0.4)',
                          }}>
                          {d.day}: {count}
                        </div>
                      )}
                      {/* Bar */}
                      <div className="w-full transition-all duration-300 rounded-t-sm"
                        style={{
                          height: count > 0 ? `${pct}%` : 1,
                          background: count > 0
                            ? `rgba(96,165,250,${0.4 + (count / maxDaily) * 0.6})`
                            : 'rgba(255,255,255,0.04)',
                          minHeight: count > 0 ? 4 : 1,
                        }} />
                    </div>
                  )
                })}
              </div>
              {/* X-axis labels */}
              <div className="flex gap-px mt-2" style={{ height: 14 }}>
                {data.daily.map((d, i) => {
                  const showLabel = i === 0 || i % 6 === 0 || i === data.daily.length - 1
                  return (
                    <div key={d.day} className="flex-1 text-center overflow-hidden">
                      {showLabel && (
                        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>
                          {d.day}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Language */}
        <div className="rounded-xl p-5" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-5">
            <Globe size={13} style={{ color: '#34D399' }} />
            <h2 className="text-sm font-semibold text-white">Язык запросов</h2>
          </div>
          <div className="space-y-5">
            {data.byLang.map((l, i) => {
              const total = data.byLang.reduce((s, x) => s + Number(x.count), 0)
              const pct = total > 0 ? Math.round((Number(l.count) / total) * 100) : 0
              const color = LANG_COLOR[i] ?? '#6B7280'
              return (
                <div key={l.lang}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white">{LANG_LABELS[l.lang] ?? l.lang}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{l.count}</span>
                      <span className="text-[10px] w-8 text-right" style={{ color: 'rgba(255,255,255,0.3)' }}>{pct}%</span>
                    </div>
                  </div>
                  <Bar value={Number(l.count)} max={maxLang} color={color} />
                </div>
              )
            })}
            {data.byLang.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: 'rgba(255,255,255,0.2)' }}>Нет данных</p>
            )}
          </div>
        </div>
      </div>

      {/* Top products + Top viewed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top by KP */}
        <div className="rounded-xl p-5" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={13} style={{ color: '#34D399' }} />
            <h2 className="text-sm font-semibold text-white">Топ товаров по запросам КП</h2>
          </div>
          <div className="space-y-4">
            {data.topProducts.length === 0 ? (
              <p className="text-xs text-center py-6" style={{ color: 'rgba(255,255,255,0.2)' }}>Нет данных</p>
            ) : data.topProducts.map((p, i) => (
              <div key={i}>
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-[10px] font-black font-mono mt-0.5 w-5 flex-shrink-0"
                      style={{ color: i < 3 ? '#60A5FA' : 'rgba(255,255,255,0.2)' }}>
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-white leading-tight truncate">{p.product_name}</p>
                      {p.product_model && (
                        <p className="text-[10px] mt-0.5 font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{p.product_model}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-black font-mono text-sm flex-shrink-0 text-white">{p.kp_count}</span>
                </div>
                <Bar value={Number(p.kp_count)} max={maxProduct} color="#60A5FA" />
              </div>
            ))}
          </div>
        </div>

        {/* Top viewed */}
        <div className="rounded-xl p-5" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-5">
            <Eye size={13} style={{ color: '#A78BFA' }} />
            <h2 className="text-sm font-semibold text-white">Топ просматриваемых товаров (30 дн.)</h2>
          </div>
          <div className="space-y-4">
            {data.topViewed.length === 0 ? (
              <div className="py-10 text-center">
                <Eye size={24} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
                <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>Данные накапливаются</p>
                <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.15)' }}>Появятся по мере просмотра товаров</p>
              </div>
            ) : data.topViewed.map((v, i) => (
              <div key={v.product_id}>
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-[10px] font-black font-mono mt-0.5 w-5 flex-shrink-0"
                      style={{ color: i < 3 ? '#A78BFA' : 'rgba(255,255,255,0.2)' }}>
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-white leading-tight truncate">{v.name_ru}</p>
                      {v.model && (
                        <p className="text-[10px] mt-0.5 font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{v.model}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-black font-mono text-sm flex-shrink-0 text-white">{v.views}</span>
                </div>
                <Bar value={Number(v.views)} max={maxViews} color="#A78BFA" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top companies */}
      <div className="rounded-xl p-5" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-5">
          <Building2 size={13} style={{ color: '#34D399' }} />
          <h2 className="text-sm font-semibold text-white">Топ компаний по запросам</h2>
        </div>
        {data.topCompanies.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: 'rgba(255,255,255,0.2)' }}>Нет данных</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[360px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['#', 'Компания', 'Запросов', 'Последний'].map((h, i) => (
                    <th key={h} className={`py-2 px-3 font-medium text-[11px] ${i >= 2 ? 'text-center' : 'text-left'} ${i === 3 ? 'text-right' : ''}`}
                      style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.topCompanies.map((c, i) => (
                  <tr key={c.company} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td className="py-3 px-3 font-mono font-bold text-[11px] w-8"
                      style={{ color: i < 3 ? '#34D399' : 'rgba(255,255,255,0.2)' }}>{i + 1}</td>
                    <td className="py-3 px-3 text-white font-medium">{c.company}</td>
                    <td className="py-3 px-3 text-center font-black font-mono text-white">{c.count}</td>
                    <td className="py-3 px-3 text-right text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {new Date(c.last_request).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
