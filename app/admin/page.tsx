'use client'

import { useEffect, useState } from 'react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { Package, Users, FileText, BarChart3, TrendingUp, Boxes, Clock, type LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  products: number
  users: number
  kpRequests: number
  warehouseItems: number
  todayKP: number
}

function StatCard({ icon: Icon, label, value, color, href }: {
  icon: LucideIcon
  label: string
  value: number | string
  color: string
  href?: string
}) {
  const inner = (
    <div className="rounded-xl p-5 flex items-start gap-4 transition-all"
      style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', cursor: href ? 'pointer' : 'default' }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
        <p className="text-2xl font-black text-white font-mono">{value}</p>
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

export default function AdminDashboard() {
  const { user } = useAdminAuth()
  const [stats, setStats] = useState<Stats>({ products: 0, users: 0, kpRequests: 0, warehouseItems: 0, todayKP: 0 })
  const [recentKP, setRecentKP] = useState<{ client_name: string; product_name: string; created_at: string }[]>([])

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats({
          products: data.products ?? 0,
          users: data.users ?? 0,
          kpRequests: data.kpRequests ?? 0,
          warehouseItems: data.warehouseItems ?? 0,
          todayKP: data.todayKP ?? 0,
        })
        setRecentKP(data.recentKP ?? [])
      })
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Доброе утро' : hour < 17 ? 'Добрый день' : 'Добрый вечер'

  return (
    <div className="p-4 sm:p-8 max-w-6xl">

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {greeting}, <span className="text-white font-semibold">{user?.full_name || user?.email}</span>
        </p>
        <h1 className="text-2xl font-black text-white">Панель управления</h1>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {user?.role?.display_name_ru} · Bes Saiman Group Admin
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package}    label="Товаров в каталоге" value={stats.products}       color="#3B82F6" href="/admin/products" />
        <StatCard icon={Users}      label="Пользователей"      value={stats.users}          color="#10B981" href="/admin/users" />
        <StatCard icon={FileText}   label="Запросов КП"        value={stats.kpRequests}     color="#60A5FA" href="/admin/kp" />
        <StatCard icon={Boxes}      label="Позиций на складе"  value={stats.warehouseItems} color="#8B5CF6" href="/admin/warehouse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* KP today */}
        <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} style={{ color: '#60A5FA' }} />
            <h2 className="text-sm font-semibold text-white">Новые запросы КП</h2>
            <span className="ml-auto text-2xl font-black font-mono" style={{ color: '#60A5FA' }}>{stats.todayKP}</span>
          </div>
          {recentKP.length === 0 ? (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Запросов пока нет</p>
          ) : (
            <div className="space-y-2">
              {recentKP.map((r, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 px-3 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(245,158,11,0.15)', color: '#60A5FA' }}>
                    {r.client_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{r.client_name}</p>
                    <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{r.product_name}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <Clock size={9} />
                    {new Date(r.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={15} style={{ color: '#3B82F6' }} />
            <h2 className="text-sm font-semibold text-white">Популярные товары</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Добавить товар',      href: '/admin/products?action=new', color: '#3B82F6' },
              { label: 'Просмотр заявок КП',  href: '/admin/kp',                 color: '#60A5FA' },
              { label: 'Управление складом',  href: '/admin/warehouse',           color: '#8B5CF6' },
              { label: 'Новый пользователь',  href: '/admin/users?action=new',   color: '#10B981' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:translate-x-1"
                style={{ color: a.color, background: `${a.color}0A`, border: `1px solid ${a.color}20` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
                {a.label}
                <span className="ml-auto opacity-50">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
