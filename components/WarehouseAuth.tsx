'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'

const SESSION_KEY = 'bsg_warehouse_auth'

export default function WarehouseAuth({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setAuthed(sessionStorage.getItem(SESSION_KEY) === '1')
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/warehouse-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, '1')
        setAuthed(true)
      } else {
        setError('Неверный пароль')
        setPassword('')
      }
    } catch {
      setError('Ошибка соединения')
    } finally {
      setLoading(false)
    }
  }

  if (authed === null) return null

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: '#060E1A' }}>
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
              <Lock size={28} style={{ color: '#0EA5E9' }} />
            </div>
            <h1 className="text-xl font-black text-white mb-1">Склад</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Bes Saiman Group · Доступ закрыт</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs mb-2 font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Пароль
              </label>
              <div className="relative">
                <input
                  autoFocus
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="steel-input w-full pr-10"
                  required
                />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#94A3B8' }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm px-3 py-2 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading || !password}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Проверяем...</>
                : <><ShieldCheck size={15} /> Войти</>
              }
            </button>
          </form>

          <p className="mt-6 text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
            Доступ только для сотрудников Bes Saiman Group
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
