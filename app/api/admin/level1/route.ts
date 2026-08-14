import { NextResponse } from 'next/server'
import { getCurrentAdminUser } from '@/lib/auth'
import { isSuperAdmin, can } from '@/lib/admin'
import { LEVEL1_SECTIONS, LEVEL1_NAV } from '@/lib/permissions.server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Отдаёт разделы уровня 1. Суперадминистратор получает и список для формы прав,
// и пункты меню; обладатель выданного права — только пункты меню; остальные —
// пустой ответ, по которому нельзя понять, что такие разделы вообще есть.
export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me) return NextResponse.json({ sections: [], nav: [] })

  const sections = isSuperAdmin(me.role) ? LEVEL1_SECTIONS : []
  const nav = LEVEL1_NAV.filter(item => can(me.role, item.resource, 'read'))
  return NextResponse.json({ sections, nav })
}
