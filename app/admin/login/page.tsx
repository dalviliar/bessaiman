'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Неверный email или пароль')
        setLoading(false)
        return
      }
      router.replace('/admin')
    } catch {
      setError('Ошибка соединения')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #060E1A 0%, #0A1520 50%, #060E1A 100%)' }}>

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-30" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.1) 1px,transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
            <ShieldCheck size={30} style={{ color: '#3B82F6' }} />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Панель управления</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Bes Saiman Group · Admin</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl p-8" style={{ background: '#0D1421', border: '1px solid rgba(255,255,255,0.07)' }}>
          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@bessaiman.kz"
                className="steel-input w-full"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Пароль
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="steel-input w-full pr-10"
                  required
                />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#94A3B8' }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm px-4 py-3 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !email || !password}
              className="w-full py-3 font-bold text-sm flex items-center justify-center gap-2 rounded-lg transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white' }}>
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Входим...</>
                : <><ShieldCheck size={15} /> Войти в панель управления</>
              }
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
          Только для авторизованных сотрудников Bes Saiman Group
        </p>
      </div>
    </div>
  )
}
