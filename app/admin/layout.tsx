'use client'

import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Shield, Package, Warehouse, FileText, History,
  LogOut, ChevronRight, Loader2, ExternalLink,
} from 'lucide-react'

const NAV = [
  { href: '/admin',           label: 'Дашборд',         icon: LayoutDashboard, resource: null },
  { href: '/admin/users',     label: 'Пользователи',    icon: Users,           resource: 'users' },
  { href: '/admin/roles',     label: 'Роли',            icon: Shield,          resource: 'roles' },
  { href: '/admin/products',  label: 'Каталог',         icon: Package,         resource: 'products' },
  { href: '/admin/warehouse', label: 'Склад',           icon: Warehouse,       resource: 'warehouse' },
  { href: '/admin/kp',        label: 'Запросы КП',      icon: FileText,        resource: 'kp_requests' },
  { href: '/admin/audit',     label: 'Журнал действий', icon: History,         resource: 'audit' },
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

function Sidebar() {
  const { user, loading, logout, can } = useAdminAuth()
  const pathname = usePathname()

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
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-red-500/10"
          style={{ color: 'rgba(248,113,113,0.6)' }}>
          <LogOut size={13} />
          Выйти
        </button>
      </div>
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
