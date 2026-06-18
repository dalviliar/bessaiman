'use client'

import { useEffect, useState } from 'react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { canManageRole, type AdminRole, type Permissions } from '@/lib/admin'
import { Shield, Lock, Plus, Check, X, Loader2 } from 'lucide-react'

const PERM_SECTIONS = [
  { key: 'products',    label: 'Товары',               actions: ['create','read','update','delete'] },
  { key: 'categories',  label: 'Категории',            actions: ['create','read','update','delete'] },
  { key: 'content',     label: 'Новости/уведомления',  actions: ['create','read','update','delete'] },
  { key: 'warehouse',   label: 'Склад',                actions: ['read','write'] },
  { key: 'kp_requests', label: 'Запросы КП',           actions: ['read','delete'] },
  { key: 'users',       label: 'Пользователи',         actions: ['create','read','update','delete'] },
  { key: 'roles',       label: 'Роли',                 actions: ['create','read','update','delete'] },
  { key: 'settings',    label: 'Настройки',            actions: ['read','update'] },
]

const ACTION_LABELS: Record<string, string> = {
  create: 'Создавать', read: 'Читать', update: 'Редактировать',
  delete: 'Удалять', write: 'Записывать',
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: '#EF4444', admin: '#6366F1', manager: '#3B82F6',
  warehouse_manager: '#8B5CF6', product_manager: '#10B981',
  warehouse_specialist: '#0EA5E9', catalog_editor: '#EC4899', viewer: '#6B7280',
}

function RoleCard({ role, myLevel, onSelect }: { role: AdminRole; myLevel: number; onSelect: () => void }) {
  const color = ROLE_COLORS[role.name] ?? '#6B7280'
  const p = role.permissions as Permissions & { all?: boolean }
  const canEdit = canManageRole(myLevel, role.level)

  return (
    <div className="rounded-xl p-5 transition-all" style={{ background: '#111827', border: `1px solid ${color}20` }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} style={{ color }} />
            <span className="font-bold text-sm text-white">{role.display_name_ru}</span>
            {role.is_system && <Lock size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />}
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: `${color}15`, color }}>
            Уровень {role.level}
          </span>
        </div>
        {canEdit && !role.is_system && (
          <button onClick={onSelect} className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
            Изменить
          </button>
        )}
      </div>

      {p.all ? (
        <div className="text-xs font-semibold px-3 py-2 rounded-lg"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
          ⚡ Полный доступ ко всем функциям
        </div>
      ) : (
        <div className="space-y-2">
          {PERM_SECTIONS.map(sec => {
            const section = (p as Record<string, Record<string,boolean>>)[sec.key]
            if (!section) return null
            const allowed = sec.actions.filter(a => section[a])
            if (!allowed.length) return null
            return (
              <div key={sec.key} className="flex items-start gap-2">
                <span className="text-[10px] w-28 flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{sec.label}</span>
                <div className="flex flex-wrap gap-1">
                  {allowed.map(a => (
                    <span key={a} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: `${color}12`, color }}>
                      {ACTION_LABELS[a] || a}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CreateRoleModal({ myLevel, onClose, onCreated }: { myLevel: number; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [level, setLevel] = useState(myLevel + 1)
  const [perms, setPerms] = useState<Record<string, Record<string,boolean>>>({})
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
    if (!name.match(/^[a-z_]+$/)) { setError('Имя-код: только строчные буквы и _'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/admin/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, display_name_ru: displayName, level, permissions: perms }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Ошибка'); setLoading(false); return }
    onCreated(); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-lg rounded-2xl p-6 my-4" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Новая роль</h2>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Код роли (eng)</label>
              <input type="text" value={name} onChange={e => setName(e.target.value.toLowerCase().replace(/[^a-z_]/g,''))}
                placeholder="my_role" className="steel-input w-full" required />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Название (рус)</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                placeholder="Моя роль" className="steel-input w-full" required />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Уровень (выше вашего: {myLevel}+1 = минимум {myLevel + 1})
            </label>
            <input type="number" value={level} min={myLevel + 1} max={99}
              onChange={e => setLevel(Number(e.target.value))}
              className="steel-input w-full" required />
          </div>

          <div>
            <p className="text-xs font-medium mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>Права доступа</p>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
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
              {loading ? <><Loader2 size={14} className="animate-spin" /> Создаём...</> : 'Создать роль'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary px-4 text-sm">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminRolesPage() {
  const { user: me, can } = useAdminAuth()
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const myLevel = (me?.role as AdminRole)?.level ?? 999

  const load = async () => {
    setLoading(true)
    const data = await fetch('/api/admin/roles').then(r => r.json())
    setRoles((data ?? []) as AdminRole[])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white mb-0.5">Роли и права доступа</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {roles.length} ролей · Вы можете управлять ролями уровня выше {myLevel}
          </p>
        </div>
        {can('roles', 'create') && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
            <Plus size={15} /> Новая роль
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin" style={{ color: '#3B82F6' }} /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {roles.map(r => (
            <RoleCard key={r.id} role={r} myLevel={myLevel} onSelect={() => {}} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateRoleModal myLevel={myLevel} onClose={() => setShowCreate(false)} onCreated={load} />
      )}
    </div>
  )
}
