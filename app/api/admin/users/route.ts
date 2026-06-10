import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/admin'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { email, password, full_name, role_id } = await request.json()

    // Verify caller is authenticated admin
    const authHeader = request.headers.get('authorization') || ''
    const callerToken = authHeader.replace('Bearer ', '')

    const callerClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${callerToken}` } } }
    )
    const { data: { user: caller } } = await callerClient.auth.getUser()
    if (!caller) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

    // Check caller is admin_user with create permission
    const adminDb = getAdminClient()
    const { data: callerProfile } = await adminDb
      .from('admin_users')
      .select('*, role:admin_roles(*)')
      .eq('id', caller.id)
      .eq('is_active', true)
      .single()

    if (!callerProfile) return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })

    const p = callerProfile.role?.permissions as Record<string, Record<string,boolean>> & { all?: boolean }
    if (!p?.all && !p?.users?.create) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    // Check role level hierarchy
    const { data: targetRole } = await adminDb
      .from('admin_roles')
      .select('level')
      .eq('id', role_id)
      .single()

    if (!targetRole) return NextResponse.json({ error: 'Роль не найдена' }, { status: 404 })
    if (callerProfile.role?.level >= targetRole.level) {
      return NextResponse.json({ error: 'Нельзя назначить роль выше или равную своей' }, { status: 403 })
    }

    // Create auth user
    const { data: newAuthUser, error: authErr } = await adminDb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authErr || !newAuthUser.user) {
      return NextResponse.json({ error: authErr?.message || 'Ошибка создания' }, { status: 500 })
    }

    // Create admin_users record
    const { error: profileErr } = await adminDb.from('admin_users').insert({
      id: newAuthUser.user.id,
      email,
      full_name,
      role_id,
      is_active: true,
      created_by: caller.id,
    })
    if (profileErr) {
      // Rollback auth user
      await adminDb.auth.admin.deleteUser(newAuthUser.user.id)
      return NextResponse.json({ error: profileErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: newAuthUser.user.id })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
