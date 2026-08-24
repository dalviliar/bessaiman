import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'
import { can } from '@/lib/admin'
import { logAction } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// A single editable record — the wording printed as "УСЛОВИЯ ПОСТАВКИ" on
// every КП PDF, split into an in-stock and an on-order variant for delivery
// and payment (the generators already pick between them by availability).
export async function GET() {
  const me = await getCurrentAdminUser()
  if (!me || !can(me.role, 'content', 'read')) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  const row = await queryOne(`SELECT * FROM kp_terms WHERE id = 'main'`)
  if (row) return NextResponse.json(row)
  const created = await queryOne(`INSERT INTO kp_terms (id) VALUES ('main') RETURNING *`)
  return NextResponse.json(created)
}

export async function PUT(request: Request) {
  try {
    const me = await getCurrentAdminUser()
    if (!me || !can(me.role, 'content', 'update')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }
    const {
      delivery_in_stock, delivery_on_order, warranty,
      payment_in_stock, payment_on_order, validity,
    } = await request.json()

    const row = await queryOne(
      `INSERT INTO kp_terms (id, delivery_in_stock, delivery_on_order, warranty, payment_in_stock, payment_on_order, validity, updated_at)
       VALUES ('main',$1,$2,$3,$4,$5,$6, NOW())
       ON CONFLICT (id) DO UPDATE SET
         delivery_in_stock=$1, delivery_on_order=$2, warranty=$3, payment_in_stock=$4, payment_on_order=$5, validity=$6, updated_at=NOW()
       RETURNING *`,
      [
        delivery_in_stock || '', delivery_on_order || '', warranty || '',
        payment_in_stock || '', payment_on_order || '', validity || '',
      ],
    )

    await logAction({
      adminId: me.id, adminEmail: me.email, action: 'update',
      entityType: 'kp_terms', entityId: 'main', entityLabel: 'Условия поставки (КП)',
    })

    return NextResponse.json(row)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}
