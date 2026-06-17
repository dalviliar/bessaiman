'use client'

import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Users, Shield, Package, Warehouse, FileText, History,
  LogOut, ChevronRight, Loader2, ExternalLink, Newspaper, Tag, KeyRound, X, Eye, EyeOff,
} from 'lucide-react'

const NAV = [
  { href: '/admin',           label: 'Дашборд',         icon: LayoutDashboard, resource: null },
  { href: '/admin/users',     label: 'Пользователи',    icon: Users,           resource: 'users' },
  { href: '/admin/roles',     label: 'Роли',            icon: Shield,          resource: 'roles' },
  { href: '/admin/products',    label: 'Каталог',          icon: Package,    resource: 'products' },
  { href: '/admin/categories',  label: 'Категории',        icon: Tag,        resource: 'products' },
  { href: '/admin/warehouse',   label: 'Склад',            icon: Warehouse,  resource: 'warehouse' },
  { href: '/admin/news',        label: 'Новости',          icon: Newspaper,  resource: 'content' },
  { href: '/admin/kp',          label: 'Запросы КП',       icon: FileText,   resource: 'kp_requests' },
  { href: '/admin/audit',       label: 'Журнал действий',  icon: History,    resource: 'audit' },
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
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}>
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
              { label: 'Текущий пароль', val: cur, set: setCur, show: showCur, toggle: () => setShowCur(v => !v) },
              { label: 'Новый пароль',   val: next, set: setNext, show: showNew, toggle: () => setShowNew(v => !v) },
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
            {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171' }}>{error}</p>}
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

function Sidebar() {
  const { user, loading, logout, can } = useAdminAuth()
  const pathname = usePathname()
  const [showPwModal, setShowPwModal] = useState(false)

  if (loading) {
    return (
      <div className="w-60 flex items-center justify-center" style={{ background: '#080E1C', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <Loader2 size={22} className="animate-spin" style={{ color: '#3B82F6' }} />
      </div>
    )
  }

  const roleColor = ROLE_COLORS[user?.role?.name ?? ''] ?? '#6B7280'

  return (
    <div className="w-60 flex flex-col flex-shrink-0 h-full" style={{ background: '#080E1C', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
            style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.25)' }}>
            B
          </div>
          <div>
            <div className="font-black text-xs tracking-wide text-white">BES SAIMAN</div>
            <div className="text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>ADMIN PANEL</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const { href, label, icon: Icon, resource } = item
          if (resource && !can(resource, 'read')) return null
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: active ? '#60A5FA' : 'rgba(255,255,255,0.5)',
                borderLeft: active ? '2px solid #3B82F6' : '2px solid transparent',
              }}>
              <Icon size={15} />
              {label}
              {active && <ChevronRight size={12} className="ml-auto" />}
            </Link>
          )
        })}

        <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            <ExternalLink size={14} />
            Открыть сайт
          </Link>
        </div>
      </nav>

      {/* User info */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: `${roleColor}25`, color: roleColor, border: `1px solid ${roleColor}40` }}>
            {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name || user?.email}</p>
            <p className="text-[10px] font-medium" style={{ color: roleColor }}>
              {user?.role?.display_name_ru || '—'}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setShowPwModal(true)}
            className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.03)' }}>
            <KeyRound size={11} /> Сменить пароль
          </button>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-red-500/10"
            style={{ color: 'rgba(248,113,113,0.6)' }}>
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
  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div className="fixed inset-0 z-[100] flex" style={{ background: '#0A1221', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
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
