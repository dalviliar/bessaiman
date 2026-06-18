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
const LANG_COLORS: Record<string, string> = { ru: '#3B82F6', kk: '#10B981', en: '#F59E0B' }

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.5s ease' }} />
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
      <div className="p-4 sm:p-8 flex justify-center items-center min-h-[400px]">
        <Loader2 size={28} className="animate-spin" style={{ color: '#3B82F6' }} />
      </div>
    )
  }
  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-black text-white mb-2">Аналитика</h1>
        <div className="rounded-xl p-5 text-sm" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error === 'Доступ запрещён' ? 'Сессия истекла — выйдите и войдите снова.' : error}
        </div>
      </div>
    )
  }
  if (!data) return null

  const maxDaily = Math.max(...data.daily.map(d => Number(d.count)), 1)
  const maxProduct = Math.max(...data.topProducts.map(p => Number(p.kp_count)), 1)
  const maxViews = Math.max(...data.topViewed.map(v => Number(v.views)), 1)

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-black text-white mb-0.5">Аналитика</h1>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Спрос по товарам, просмотры и активность клиентов
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FileText,   label: 'Всего запросов КП',     value: data.totals.total,       color: '#3B82F6' },
          { icon: TrendingUp, label: 'Запросов в этом месяце', value: data.totals.this_month,  color: '#10B981' },
          { icon: FileText,   label: 'Запросов сегодня',       value: data.totals.today,       color: '#F59E0B' },
          { icon: Eye,        label: 'Просмотров товаров (30д)', value: data.totals.total_views, color: '#8B5CF6' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl p-5" style={{ background: '#111827', border: `1px solid ${color}20` }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} style={{ color }} />
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
            </div>
            <p className="text-3xl font-black font-mono text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Daily chart + Lang */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Daily bar chart */}
        <div className="lg:col-span-2 rounded-xl p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={14} style={{ color: '#3B82F6' }} />
            <h2 className="text-sm font-bold text-white">Запросы КП за 30 дней</h2>
          </div>
          {data.daily.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Нет данных</p>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {data.daily.map(d => {
                const pct = (Number(d.count) / maxDaily) * 100
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      title={`${d.day}: ${d.count} запросов`}
                      style={{
                        height: `${Math.max(pct, 4)}%`,
                        background: `linear-gradient(to top, #1D4ED8, #3B82F6)`,
                        minHeight: 3,
                      }}
                    />
                    {/* tooltip */}
                    <div className="absolute bottom-full mb-1 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                      {d.day}: {d.count}
                    </div>
                    <span className="text-[8px] rotate-45 origin-left"
                      style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>
                      {d.day.slice(0, 5)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* By language */}
        <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-5">
            <Globe size={14} style={{ color: '#10B981' }} />
            <h2 className="text-sm font-bold text-white">Язык запросов</h2>
          </div>
          <div className="space-y-4">
            {data.byLang.map(l => {
              const total = data.byLang.reduce((s, x) => s + Number(x.count), 0)
              const pct = total > 0 ? Math.round((Number(l.count) / total) * 100) : 0
              const color = LANG_COLORS[l.lang] ?? '#6B7280'
              return (
                <div key={l.lang}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-white">{LANG_LABELS[l.lang] ?? l.lang}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold" style={{ color }}>{l.count}</span>
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{pct}%</span>
                    </div>
                  </div>
                  <MiniBar value={Number(l.count)} max={Math.max(...data.byLang.map(x => Number(x.count)))} color={color} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top products KP + Top viewed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Top by KP */}
        <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} style={{ color: '#F59E0B' }} />
            <h2 className="text-sm font-bold text-white">Топ товаров по запросам КП</h2>
          </div>
          <div className="space-y-3">
            {data.topProducts.map((p, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-black font-mono w-5 flex-shrink-0"
                      style={{ color: i < 3 ? '#F59E0B' : 'rgba(255,255,255,0.3)' }}>
                      #{i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{p.product_name}</p>
                      {p.product_model && (
                        <p className="font-mono text-[9px]" style={{ color: '#0EA5E9' }}>{p.product_model}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-black font-mono text-sm flex-shrink-0 ml-2" style={{ color: '#F59E0B' }}>
                    {p.kp_count}
                  </span>
                </div>
                <MiniBar value={Number(p.kp_count)} max={maxProduct} color="#F59E0B" />
              </div>
            ))}
            {data.topProducts.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Нет данных</p>
            )}
          </div>
        </div>

        {/* Top viewed */}
        <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Eye size={14} style={{ color: '#8B5CF6' }} />
            <h2 className="text-sm font-bold text-white">Топ просматриваемых товаров (30 дней)</h2>
          </div>
          <div className="space-y-3">
            {data.topViewed.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Данные накапливаются</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Появятся по мере просмотра товаров на сайте
                </p>
              </div>
            ) : data.topViewed.map((v, i) => (
              <div key={v.product_id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-black font-mono w-5 flex-shrink-0"
                      style={{ color: i < 3 ? '#8B5CF6' : 'rgba(255,255,255,0.3)' }}>
                      #{i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{v.name_ru}</p>
                      {v.model && <p className="font-mono text-[9px]" style={{ color: '#0EA5E9' }}>{v.model}</p>}
                    </div>
                  </div>
                  <span className="font-black font-mono text-sm flex-shrink-0 ml-2" style={{ color: '#8B5CF6' }}>
                    {v.views}
                  </span>
                </div>
                <MiniBar value={Number(v.views)} max={maxViews} color="#8B5CF6" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top companies */}
      <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={14} style={{ color: '#10B981' }} />
          <h2 className="text-sm font-bold text-white">Топ компаний по запросам</h2>
        </div>
        {data.topCompanies.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Нет данных</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[400px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="py-2 px-3 text-left font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>#</th>
                  <th className="py-2 px-3 text-left font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Компания</th>
                  <th className="py-2 px-3 text-center font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Запросов</th>
                  <th className="py-2 px-3 text-right font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Последний</th>
                </tr>
              </thead>
              <tbody>
                {data.topCompanies.map((c, i) => (
                  <tr key={c.company} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="py-2.5 px-3 font-mono font-bold" style={{ color: i < 3 ? '#10B981' : 'rgba(255,255,255,0.3)' }}>
                      {i + 1}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white">{c.company}</td>
                    <td className="py-2.5 px-3 text-center font-black font-mono" style={{ color: '#10B981' }}>{c.count}</td>
                    <td className="py-2.5 px-3 text-right" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
