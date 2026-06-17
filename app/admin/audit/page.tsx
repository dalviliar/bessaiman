'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'

interface AuditLog {
  id: string
  admin_email: string
  action: 'create' | 'update' | 'delete'
  entity_type: 'product' | 'user' | 'role'
  entity_label: string | null
  details: Record<string, unknown> | null
  created_at: string
}

const ACTION_META: Record<string, { label: string; color: string; icon: typeof Plus }> = {
  create: { label: 'РЎРѕР·РґР°Р»(Р°)',    color: '#34D399', icon: Plus },
  update: { label: 'РР·РјРµРЅРёР»(Р°)',   color: '#60A5FA', icon: Pencil },
  delete: { label: 'РЈРґР°Р»РёР»(Р°)',    color: '#F87171', icon: Trash2 },
}

const ENTITY_LABELS: Record<string, string> = {
  product: 'С‚РѕРІР°СЂ',
  user: 'РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ',
  role: 'СЂРѕР»СЊ',
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/audit')
      .then(res => res.json())
      .then(data => { setLogs(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-black text-white mb-0.5">Р–СѓСЂРЅР°Р» РґРµР№СЃС‚РІРёР№</h1>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          РљС‚Рѕ Рё РєРѕРіРґР° СЃРѕР·РґР°РІР°Р», РјРµРЅСЏР» РёР»Рё СѓРґР°Р»СЏР» С‚РѕРІР°СЂС‹, РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№ Рё СЂРѕР»Рё
        </p>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} /></div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Р—Р°РїРёСЃРµР№ РїРѕРєР° РЅРµС‚</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {logs.map(log => {
              const meta = ACTION_META[log.action] ?? ACTION_META.update
              const Icon = meta.icon
              return (
                <div key={log.id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${meta.color}15`, color: meta.color }}>
                    <Icon size={13} />
                  </div>
                  <div className="flex-1 text-xs">
                    <span className="font-semibold text-white">{log.admin_email}</span>{' '}
                    <span style={{ color: meta.color }}>{meta.label.toLowerCase()}</span>{' '}
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{ENTITY_LABELS[log.entity_type] ?? log.entity_type}</span>{' '}
                    <span className="font-medium text-white">{log.entity_label ?? ''}</span>
                  </div>
                  <div className="text-[11px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {new Date(log.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
