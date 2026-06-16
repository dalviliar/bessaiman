import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const [products, users, kpAll, warehouseItems, todayKP, recentKP] = await Promise.all([
    queryOne<{ count: string }>('SELECT COUNT(*) FROM products'),
    queryOne<{ count: string }>('SELECT COUNT(*) FROM admin_users WHERE is_active = true'),
    queryOne<{ count: string }>('SELECT COUNT(*) FROM kp_requests'),
    queryOne<{ count: string }>('SELECT COUNT(*) FROM warehouse_items'),
    queryOne<{ count: string }>(`SELECT COUNT(*) FROM kp_requests WHERE created_at >= current_date`),
    query('SELECT client_name, product_name, created_at FROM kp_requests ORDER BY created_at DESC LIMIT 5'),
  ])

  return NextResponse.json({
    products: Number(products?.count ?? 0),
    users: Number(users?.count ?? 0),
    kpRequests: Number(kpAll?.count ?? 0),
    warehouseItems: Number(warehouseItems?.count ?? 0),
    todayKP: Number(todayKP?.count ?? 0),
    recentKP,
  })
}
