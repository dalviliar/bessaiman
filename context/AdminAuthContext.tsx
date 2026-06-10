'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { can as canCheck, type AdminUser, type AdminRole } from '@/lib/admin'

interface AdminAuthCtx {
  user: AdminUser | null
  loading: boolean
  logout: () => Promise<void>
  can: (resource: string, action: string) => boolean
}

const Ctx = createContext<AdminAuthCtx>({
  user: null,
  loading: true,
  logout: async () => {},
  can: () => false,
})

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase
      .from('admin_users')
      .select('*, role:admin_roles(*)')
      .eq('id', uid)
      .eq('is_active', true)
      .single()
    return data as AdminUser | null
  }

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        if (!pathname.startsWith('/admin/login')) router.replace('/admin/login')
        if (mounted) setLoading(false)
        return
      }

      const profile = await fetchProfile(session.user.id)
      if (!profile) {
        await supabase.auth.signOut()
        router.replace('/admin/login')
        if (mounted) setLoading(false)
        return
      }

      if (mounted) {
        setUser({ ...profile, email: session.user.email! })
        setLoading(false)
      }

      // Update last_seen
      supabase.from('admin_users')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', session.user.id)
        .then(() => {})
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        router.replace('/admin/login')
      }
      if (event === 'SIGNED_IN' && session) {
        const profile = await fetchProfile(session.user.id)
        if (profile && mounted) setUser({ ...profile, email: session.user.email! })
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.replace('/admin/login')
  }

  const canDo = (resource: string, action: string) =>
    canCheck(user?.role as AdminRole, resource, action)

  return (
    <Ctx.Provider value={{ user, loading, logout, can: canDo }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAdminAuth = () => useContext(Ctx)
