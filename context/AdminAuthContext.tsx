'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { can as canCheck, type AdminUser, type AdminRole } from '@/lib/admin'

interface AdminAuthCtx {
  user: AdminUser | null
  loading: boolean
  logout: () => Promise<void>
  refresh: () => Promise<void>
  can: (resource: string, action: string) => boolean
}

const Ctx = createContext<AdminAuthCtx>({
  user: null,
  loading: true,
  logout: async () => {},
  refresh: async () => {},
  can: () => false,
})

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/admin/auth/session')
      if (!res.ok) {
        setUser(null)
        if (!pathname.startsWith('/admin/login')) router.replace('/admin/login')
        return
      }
      const profile = await res.json()
      setUser(profile)
    } catch {
      setUser(null)
      if (!pathname.startsWith('/admin/login')) router.replace('/admin/login')
    }
  }

  useEffect(() => {
    let mounted = true

    const init = async () => {
      await fetchSession()
      if (mounted) setLoading(false)
    }

    init()
    return () => { mounted = false }
  }, [])

  const refresh = async () => {
    await fetchSession()
  }

  const logout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    setUser(null)
    router.replace('/admin/login')
  }

  const canDo = (resource: string, action: string) =>
    canCheck(user?.role as AdminRole, resource, action)

  return (
    <Ctx.Provider value={{ user, loading, logout, refresh, can: canDo }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAdminAuth = () => useContext(Ctx)
