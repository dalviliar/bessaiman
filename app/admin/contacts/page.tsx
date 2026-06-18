'use client'

import { useEffect, useState } from 'react'
import { Loader2, Mail, MailOpen, Clock } from 'lucide-react'

interface ContactRequest {
  id: string
  name: string
  email: string
  message: string
  is_read: boolean
  created_at: string
}

export default function AdminContactsPage() {
  const [items, setItems] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ContactRequest | null>(null)

  const load = () => {
    fetch('/api/admin/contacts')
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const markRead = async (item: ContactRequest) => {
    setSelected(item)
    if (!item.is_read) {
      await fetch('/api/admin/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      })
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_read: true } : i))
    }
  }

  const unread = items.filter(i => !i.is_read).length

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white">Обращения с сайта</h1>
          {unread > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
              style={{ background: '#3B82F6', color: 'white' }}>
              {unread} новых
            </span>
          )}
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Сообщения из формы на странице Контакты
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={22} className="animate-spin" style={{ color: '#60A5FA' }} />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Mail size={32} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Обращений пока нет</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* List */}
          <div className="space-y-2">
            {items.map(item => (
              <button key={item.id}
                onClick={() => markRead(item)}
                className="w-full text-left rounded-xl p-4 transition-all"
                style={{
                  background: selected?.id === item.id ? '#1E3A5F' : '#1E293B',
                  border: `1px solid ${selected?.id === item.id ? '#3B82F6' : 'rgba(255,255,255,0.06)'}`,
                }}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {item.is_read
                      ? <MailOpen size={15} style={{ color: 'rgba(255,255,255,0.25)' }} />
                      : <Mail size={15} style={{ color: '#60A5FA' }} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate" style={{ color: item.is_read ? 'rgba(255,255,255,0.6)' : 'white' }}>
                        {item.name}
                      </p>
                      <span className="text-[10px] flex-shrink-0 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        <Clock size={9} />
                        {new Date(item.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: '#60A5FA' }}>{item.email}</p>
                    <p className="text-[11px] mt-1 line-clamp-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {item.message}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="rounded-xl p-5 sticky top-6 self-start" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}>
            {selected ? (
              <>
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <p className="text-sm font-bold text-white">{selected.name}</p>
                    <a href={`mailto:${selected.email}?subject=Ответ на ваш запрос с сайта`}
                      className="text-xs hover:underline" style={{ color: '#60A5FA' }}>
                      {selected.email}
                    </a>
                  </div>
                  <span className="text-[10px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {new Date(selected.created_at).toLocaleString('ru-RU', {
                      day: '2-digit', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="rounded-lg p-4 mb-5 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {selected.message}
                </div>

                <a
                  href={`mailto:${selected.email}?subject=Ответ на ваш запрос с сайта Bes Saiman&body=Здравствуйте, ${selected.name}!%0A%0A`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
                  <Mail size={14} />
                  Ответить по email
                </a>
              </>
            ) : (
              <div className="py-16 text-center">
                <MailOpen size={28} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Выберите обращение</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
