'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, Pencil, Trash2, ChevronDown } from 'lucide-react'

interface AuditLog {
  id: string
  admin_email: string
  action: 'create' | 'update' | 'delete'
  entity_type: string
  entity_label: string | null
  details: Record<string, unknown> | null
  created_at: string
}

const ACTION_META: Record<string, { label: string; color: string; icon: typeof Plus }> = {
  create: { label: 'Создал(а)',   color: '#34D399', icon: Plus },
  update: { label: 'Изменил(а)',  color: '#60A5FA', icon: Pencil },
  delete: { label: 'Удалил(а)',   color: '#F87171', icon: Trash2 },
}

const ENTITY_LABELS: Record<string, string> = {
  product: 'товар',
  user: 'пользователя',
  role: 'роль',
  category: 'категорию',
  news: 'новость',
  partner: 'партнёра',
  science_publication: 'публикацию',
  science_patent: 'патент',
  science_project: 'проект',
  science_achievement: 'достижение',
  science_contract: 'договор',
  science_accreditation: 'аккредитацию',
  page_image: 'картинку страницы',
  kp_terms: 'условия КП',
}

interface Change { label: string; from: string; to: string }

function getChanges(log: AuditLog): Change[] | null {
  const c = log.details?.changes
  return Array.isArray(c) ? (c as Change[]) : null
}

function ChangeList({ changes }: { changes: Change[] }) {
  if (changes.length === 0) {
    return <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Сохранено без изменений</p>
  }
  return (
    <div className="space-y-1.5">
      {changes.map((c, i) => (
        <div key={i} className="text-[11px] leading-relaxed">
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>{c.label}: </span>
          <span className="line-through" style={{ color: '#F87171', whiteSpace: 'pre-wrap' }}>{c.from || 'пусто'}</span>
          <span style={{ color: 'rgba(255,255,255,0.35)' }}> → </span>
          <span style={{ color: '#34D399', whiteSpace: 'pre-wrap' }}>{c.to || 'пусто'}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<Set<string>>(new Set())
  const toggle = (id: string) => setOpen(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  useEffect(() => {
    fetch('/api/admin/audit')
      .then(res => res.json())
      .then(data => { setLogs(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-black text-white mb-0.5">Журнал действий</h1>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Кто и когда создавал, менял или удалял товары, пользователей и роли. У изменений нажмите «Что изменено», чтобы увидеть, что было и что стало
        </p>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} /></div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Записей пока нет</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {logs.map(log => {
              const meta = ACTION_META[log.action] ?? ACTION_META.update
              const Icon = meta.icon
              const changes = getChanges(log)
              const isOpen = open.has(log.id)
              return (
                <div key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-3 px-5 py-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${meta.color}15`, color: meta.color }}>
                    <Icon size={13} />
                  </div>
                  <div className="flex-1 text-xs">
                    <span className="font-semibold text-white">{log.admin_email}</span>{' '}
                    <span style={{ color: meta.color }}>{meta.label.toLowerCase()}</span>{' '}
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{ENTITY_LABELS[log.entity_type] ?? log.entity_type}</span>{' '}
                    <span className="font-medium text-white">{log.entity_label ?? ''}</span>
                    {changes && (
                      <button type="button" onClick={() => toggle(log.id)}
                        className="ml-2 inline-flex items-center gap-0.5 text-[11px] font-medium"
                        style={{ color: '#60A5FA' }}>
                        {changes.length > 0 ? `Что изменено (${changes.length})` : 'Что изменено'}
                        <ChevronDown size={11} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {new Date(log.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {changes && isOpen && (
                  <div className="px-5 pb-3 pl-[60px]">
                    <ChangeList changes={changes} />
                  </div>
                )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
