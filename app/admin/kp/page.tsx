'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Search, Clock, Phone, Mail, Building2, Package } from 'lucide-react'

interface KPRequest {
  id: string
  client_name: string
  client_company: string | null
  client_email: string | null
  client_phone: string | null
  product_name: string | null
  product_model: string | null
  quantity: number
  note: string | null
  lang: string
  kp_number: string | null
  created_at: string
}

export default function AdminKPPage() {
  const [requests, setRequests] = useState<KPRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<KPRequest | null>(null)

  useEffect(() => {
    supabase.from('kp_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setRequests(data ?? []); setLoading(false) })
  }, [])

  const filtered = requests.filter(r =>
    !search ||
    r.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.client_company?.toLowerCase().includes(search.toLowerCase()) ||
    r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.kp_number?.includes(search)
  )

  const today = new Date().toISOString().slice(0, 10)
  const todayCount = requests.filter(r => r.created_at.startsWith(today)).length

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white mb-0.5">Запросы КП</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {requests.length} всего · <span style={{ color: '#F59E0B' }}>{todayCount} сегодня</span>
          </p>
        </div>
      </div>

      <div className="relative mb-5">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
        <input type="text" placeholder="Поиск по имени, компании, товару..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="steel-input w-full pl-10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl animate-pulse" style={{ background: '#111827', height: 140 }} />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-2 py-16 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>Запросов пока нет</p>
          </div>
        ) : filtered.map(r => (
          <div key={r.id}
            onClick={() => setSelected(r)}
            className="rounded-xl p-4 cursor-pointer transition-all hover:border-blue-500/30"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-semibold text-sm text-white">{r.client_name}</p>
                {r.client_company && (
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{r.client_company}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                {r.kp_number && (
                  <p className="font-mono text-[10px] text-blue-400">{r.kp_number}</p>
                )}
                <div className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <Clock size={9} />
                  {new Date(r.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg mb-3"
              style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
              <Package size={12} style={{ color: '#60A5FA' }} />
              <span className="text-xs text-white font-medium">{r.product_name || '—'}</span>
              {r.product_model && <span className="font-mono text-[10px] ml-auto" style={{ color: '#60A5FA' }}>{r.product_model}</span>}
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>× {r.quantity}</span>
            </div>
            <div className="flex items-center gap-4">
              {r.client_phone && (
                <div className="flex items-center gap-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Phone size={10} />{r.client_phone}
                </div>
              )}
              {r.client_email && (
                <div className="flex items-center gap-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Mail size={10} />{r.client_email}
                </div>
              )}
            </div>
            {r.note && (
              <p className="text-[11px] mt-2 italic" style={{ color: 'rgba(255,255,255,0.35)' }}>
                «{r.note}»
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white">Детали запроса</h2>
              <button onClick={() => setSelected(null)} style={{ color: 'rgba(255,255,255,0.4)' }}>✕</button>
            </div>
            {[
              ['КП номер', selected.kp_number],
              ['Дата', new Date(selected.created_at).toLocaleString('ru-RU')],
              ['Клиент', selected.client_name],
              ['Компания', selected.client_company],
              ['Телефон', selected.client_phone],
              ['Email', selected.client_email],
              ['Товар', selected.product_name],
              ['Модель', selected.product_model],
              ['Количество', `${selected.quantity} шт.`],
              ['Примечание', selected.note],
            ].filter(([,v]) => v).map(([label, value]) => (
              <div key={label} className="flex gap-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs w-24 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                <span className="text-xs text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
