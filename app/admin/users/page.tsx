'use client'

import { useEffect, useState } from 'react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { canManageRole, type AdminUser, type AdminRole } from '@/lib/admin'
import {
  UserPlus, Search, Shield, CheckCircle, XCircle,
  MoreHorizontal, Loader2, X, Eye, EyeOff, Check,
} from 'lucide-react'

const PERM_SECTIONS = [
  { key: 'users',    label: 'Управление пользователями', actions: ['create', 'read', 'update', 'delete'] },
  { key: 'products', label: 'Управление товарами',       actions: ['create', 'read', 'update', 'delete'] },
] as const

const ACTION_LABELS: Record<string, string> = {
  create: 'Добавление', read: 'Чтение', update: 'Редактирование', delete: 'Удаление',
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: '#EF4444', admin: '#F59E0B', manager: '#3B82F6',
  warehouse_manager: '#8B5CF6', product_manager: '#10B981',
  warehouse_specialist: '#0EA5E9', catalog_editor: '#EC4899', viewer: '#6B7280',
}

function CreateUserModal({ onClose, onCreated }: {
  onClose: () => void; onCreated: () => void
}) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [perms, setPerms] = useState<Record<string, Record<string, boolean>>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggle = (section: string, action: string) => {
    setPerms(p => ({
      ...p,
      [section]: { ...(p[section] ?? {}), [action]: !(p[section]?.[action] ?? false) },
    }))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, permissions: perms }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка создания')
      onCreated()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Новый пользователь</h2>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Имя</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Иван Иванов" className="steel-input w-full" required />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="user@bessaiman.kz" className="steel-input w-full" required />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Пароль</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Минимум 8 символов" className="steel-input w-full pr-10"
                required minLength={8} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>Права доступа</p>
            <div className="space-y-3">
              {PERM_SECTIONS.map(sec => (
                <div key={sec.key} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-xs font-semibold text-white mb-2">{sec.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {sec.actions.map(action => {
                      const active = perms[sec.key]?.[action] ?? false
                      return (
                        <button key={action} type="button"
                          onClick={() => toggle(sec.key, action)}
                          className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all"
                          style={{
                            background: active ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${active ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                            color: active ? '#60A5FA' : 'rgba(255,255,255,0.4)',
                          }}>
                          {active ? <Check size={10} /> : <X size={10} />}
                          {ACTION_LABELS[action] || action}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {error && (
            <p className="text-sm px-3 py-2 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
              {loading ? <><Loader2 size={14} className="animate-spin" /> Создаём...</> : 'Создать'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary px-4 text-sm">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const { user: me, can } = useAdminAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [actionUser, setActionUser] = useState<string | null>(null)

  const myLevel = (me?.role as AdminRole)?.level ?? 999

  const load = async () => {
    setLoading(true)
    const usersData = await fetch('/api/admin/users').then(r => r.json())
    setUsers((usersData ?? []) as AdminUser[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleActive = async (userId: string, current: boolean) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    load()
  }

  const filtered = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-5xl">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white mb-0.5">Пользователи</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{users.length} аккаунтов в системе</p>
        </div>
        {can('users', 'create') && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
            <UserPlus size={15} /> Добавить
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
        <input type="text" placeholder="Поиск по имени или email..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="steel-input w-full pl-10" />
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#0D1421', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Пользователь</th>
              <th className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Роль</th>
              <th className="px-5 py-3 text-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Статус</th>
              <th className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Последний вход</th>
              <th className="px-5 py-3 text-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <Loader2 size={20} className="animate-spin mx-auto" />
              </td></tr>
            ) : filtered.map((u, i) => {
              const roleColor = ROLE_COLORS[u.role?.name ?? ''] ?? '#6B7280'
              const isMe = u.id === me?.id
              const canAct = !isMe && can('users', 'update') && canManageRole(myLevel, u.role?.level ?? 999)
              return (
                <tr key={u.id}
                  style={{ background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: `${roleColor}20`, color: roleColor }}>
                        {u.full_name?.charAt(0)?.toUpperCase() || u.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{u.full_name || '—'} {isMe && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA' }}>Вы</span>}</p>
                        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Shield size={11} style={{ color: roleColor }} />
                      <span className="text-xs font-medium" style={{ color: roleColor }}>
                        {u.role?.display_name_ru || '—'}
                      </span>
                      <span className="text-[10px] font-mono px-1 rounded" style={{ background: `${roleColor}15`, color: roleColor }}>
                        Ур.{u.role?.level}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {u.is_active
                      ? <div className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#34d399' }}><CheckCircle size={13} /> Активен</div>
                      : <div className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#f87171' }}><XCircle size={13} /> Отключён</div>
                    }
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {u.last_seen
                      ? new Date(u.last_seen).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
                      : 'Ещё не входил'
                    }
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {canAct ? (
                      <button onClick={() => toggleActive(u.id, u.is_active)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                        style={u.is_active
                          ? { background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }
                          : { background: 'rgba(16,185,129,0.08)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }
                        }>
                        {u.is_active ? 'Отключить' : 'Включить'}
                      </button>
                    ) : (
                      <MoreHorizontal size={14} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto' }} />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateUserModal onClose={() => setShowCreate(false)} onCreated={load} />
      )}
    </div>
  )
}
