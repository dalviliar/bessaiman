'use client'

import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, Shield, Package, Warehouse, FileText, History,
  LogOut, ChevronRight, Loader2, ExternalLink, Newspaper, Tag, KeyRound, X, Eye, EyeOff, Menu, BarChart3,
} from 'lucide-react'

const NAV = [
  { href: '/admin',             label: 'Дашборд',         icon: LayoutDashboard, resource: null },
  { href: '/admin/users',       label: 'Пользователи',    icon: Users,           resource: 'users' },
  { href: '/admin/roles',       label: 'Роли',            icon: Shield,          resource: 'roles' },
  { href: '/admin/products',    label: 'Каталог',         icon: Package,         resource: 'products' },
  { href: '/admin/categories',  label: 'Категории',       icon: Tag,             resource: 'products' },
  { href: '/admin/warehouse',   label: 'Склад',           icon: Warehouse,       resource: 'warehouse' },
  { href: '/admin/news',        label: 'Новости',         icon: Newspaper,       resource: 'content' },
  { href: '/admin/kp',          label: 'Запросы КП',      icon: FileText,        resource: 'kp_requests' },
  { href: '/admin/analytics',   label: 'Аналитика',       icon: BarChart3,       resource: 'kp_requests' },
  { href: '/admin/audit',       label: 'Журнал действий', icon: History,         resource: 'audit' },
]

const ROLE_COLORS: Record<string, string> = {
  super_admin:          '#EF4444',
  admin:                '#F59E0B',
  manager:              '#3B82F6',
  warehouse_manager:    '#8B5CF6',
  product_manager:      '#10B981',
  warehouse_specialist: '#0EA5E9',
  catalog_editor:       '#EC4899',
  viewer:               '#6B7280',
}

const PAGE_LABELS: Record<string, string> = {
  '/admin':            'Дашборд',
  '/admin/users':      'Пользователи',
  '/admin/roles':      'Роли',
  '/admin/products':   'Каталог',
  '/admin/categories': 'Категории',
  '/admin/warehouse':  'Склад',
  '/admin/news':       'Новости',
  '/admin/kp':         'Запросы КП',
  '/admin/analytics':  'Аналитика',
  '/admin/audit':      'Журнал действий',
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [cur, setCur]       = useState('')
  const [next, setNext]     = useState('')
  const [confirm, setConf]  = useState('')
  const [showCur, setShowCur]   = useState(false)
  const [showNew, setShowNew]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (next !== confirm) { setError('Пароли не совпадают'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/admin/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: cur, new_password: next }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Ошибка'); return }
    setSuccess(true)
    setTimeout(onClose, 1500)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound size={14} style={{ color: '#60A5FA' }} /> Сменить пароль
          </h2>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)' }}><X size={16} /></button>
        </div>
        {success ? (
          <div className="py-6 text-center">
            <p className="text-sm font-bold" style={{ color: '#34d399' }}>✓ Пароль успешно изменён</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {[
              { label: 'Текущий пароль',  val: cur,     set: setCur,  show: showCur, toggle: () => setShowCur(v => !v) },
              { label: 'Новый пароль',    val: next,    set: setNext, show: showNew, toggle: () => setShowNew(v => !v) },
              { label: 'Повторите новый', val: confirm, set: setConf, show: showNew, toggle: () => setShowNew(v => !v) },
            ].map(({ label, val, set, show, toggle }, i) => (
              <div key={i}>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)}
                    className="steel-input w-full pr-9" required minLength={i === 0 ? 1 : 8} />
                  <button type="button" onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }}>
                    {show ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            ))}
            {error && (
              <p className="text-xs px-3 py-2 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>{error}
              </p>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
              {loading ? <><Loader2 size={13} className="animate-spin" /> Сохранение...</> : 'Сохранить'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, loading, logout, can } = useAdminAuth()
  const pathname = usePathname()
  const [showPwModal, setShowPwModal] = useState(false)

  if (loading) {
    return (
      <div className="w-64 flex items-center justify-center h-full"
        style={{ background: '#0F172A', borderRight: '1px solid #1E293B' }}>
        <Loader2 size={22} className="animate-spin" style={{ color: '#3B82F6' }} />
      </div>
    )
  }

  const roleColor = ROLE_COLORS[user?.role?.name ?? ''] ?? '#6B7280'

  return (
    <div className="w-64 flex flex-col h-full"
      style={{ background: '#0F172A', borderRight: '1px solid #1E293B' }}>

      {/* Logo */}
      <div className="px-5 py-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid #1E293B' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs"
            style={{ background: '#1D4ED8', color: 'white' }}>
            BS
          </div>
          <div>
            <div className="font-bold text-[13px] tracking-wide text-white">BES SAIMAN</div>
            <div className="text-[9px] tracking-widest font-medium" style={{ color: '#475569' }}>
              ADMIN PANEL
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg"
            style={{ color: '#475569' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const { href, label, icon: Icon, resource } = item
          if (resource && !can(resource, 'read')) return null
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all"
              style={{
                background: active ? '#1E3A5F' : 'transparent',
                color: active ? '#93C5FD' : '#64748B',
              }}>
              <Icon size={15} style={{ flexShrink: 0, color: active ? '#60A5FA' : '#475569' }} />
              <span className="flex-1">{label}</span>
              {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3B82F6', flexShrink: 0 }} />}
            </Link>
          )
        })}

        <div className="pt-2 mt-2" style={{ borderTop: '1px solid #1E293B' }}>
          <Link href="/" target="_blank"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{ color: '#334155' }}>
            <ExternalLink size={14} style={{ color: '#334155' }} />
            Открыть сайт
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid #1E293B' }}>
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ background: `${roleColor}20`, color: roleColor, border: `1.5px solid ${roleColor}40` }}>
            {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-white truncate leading-tight">{user?.full_name || user?.email}</p>
            <p className="text-[11px]" style={{ color: roleColor }}>
              {user?.role?.display_name_ru || '—'}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setShowPwModal(true)}
            className="flex-1 flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-colors"
            style={{ color: '#64748B', background: '#1E293B' }}>
            <KeyRound size={11} /> Сменить пароль
          </button>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-colors"
            style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>
            <LogOut size={11} /> Выйти
          </button>
        </div>
      </div>
      {showPwModal && <ChangePasswordModal onClose={() => setShowPwModal(false)} />}
    </div>
  )
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { setSidebarOpen(false) }, [pathname])

  if (pathname === '/admin/login') return <>{children}</>

  const pageLabel = Object.entries(PAGE_LABELS).find(([k]) =>
    k === pathname || (k !== '/admin' && pathname.startsWith(k))
  )?.[1] ?? ''

  return (
    <div className="fixed inset-0 z-[100] flex" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[110] lg:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-[120] flex-shrink-0
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main area */}
      <main className="flex-1 overflow-auto min-w-0 flex flex-col" style={{ background: '#111827' }}>

        {/* Top bar */}
        <div className="flex-shrink-0 flex items-center gap-4 px-6 py-3.5"
          style={{ background: '#0F172A', borderBottom: '1px solid #1E293B', minHeight: 54 }}>
          <button className="lg:hidden p-1.5 rounded-lg" onClick={() => setSidebarOpen(true)}
            style={{ color: '#64748B', background: '#1E293B' }}>
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <span style={{ color: '#475569', fontSize: 12 }}>Bес Saiman</span>
            {pageLabel && (
              <>
                <span style={{ color: '#334155', fontSize: 12 }}>/</span>
                <span className="font-semibold text-white" style={{ fontSize: 13 }}>{pageLabel}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  )
}
