import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'kp_requests', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  const [
    totals,
    daily,
    topProducts,
    topCompanies,
    topViewed,
    byLang,
  ] = await Promise.all([
    // Total KP stats
    query<{ total: string; this_month: string; today: string; total_views: string }>(`
      SELECT
        COUNT(*)::text AS total,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW()))::text AS this_month,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::text AS today,
        '0' AS total_views
      FROM kp_requests
    `).then(async (rows) => {
      try {
        const views = await query<{ c: string }>(
          `SELECT COUNT(*)::text AS c FROM product_views WHERE viewed_at >= NOW() - INTERVAL '30 days'`
        )
        if (rows[0]) rows[0].total_views = views[0]?.c ?? '0'
      } catch { /* product_views table may not exist yet */ }
      return rows
    }),

    // Daily KP requests last 30 days
    query<{ day: string; count: string }>(`
      SELECT TO_CHAR(DATE(created_at), 'DD.MM') AS day, COUNT(*)::text AS count
      FROM kp_requests
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `),

    // Top products by KP count
    query<{ product_name: string; product_model: string | null; kp_count: string; last_request: string }>(`
      SELECT
        COALESCE(product_name, 'Не указано') AS product_name,
        product_model,
        COUNT(*)::text AS kp_count,
        MAX(created_at)::text AS last_request
      FROM kp_requests
      GROUP BY product_name, product_model
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `),

    // Top companies
    query<{ company: string; count: string; last_request: string }>(`
      SELECT
        client_company AS company,
        COUNT(*)::text AS count,
        MAX(created_at)::text AS last_request
      FROM kp_requests
      WHERE client_company IS NOT NULL AND client_company != ''
      GROUP BY client_company
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `),

    // Top viewed products (last 30 days)
    query<{ product_id: string; name_ru: string; model: string | null; views: string }>(`
      SELECT pv.product_id, p.name_ru, p.model,
             COUNT(*)::text AS views
      FROM product_views pv
      JOIN products p ON p.id = pv.product_id
      WHERE pv.viewed_at >= NOW() - INTERVAL '30 days'
      GROUP BY pv.product_id, p.name_ru, p.model
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `).catch(() => []),

    // By language
    query<{ lang: string; count: string }>(`
      SELECT lang, COUNT(*)::text AS count
      FROM kp_requests
      GROUP BY lang
      ORDER BY COUNT(*) DESC
    `),
  ])

  return NextResponse.json({
    totals: totals[0],
    daily,
    topProducts,
    topCompanies,
    topViewed,
    byLang,
  })
}
