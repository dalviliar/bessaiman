import { queryOne } from './db'

export interface KpTerms {
  delivery_in_stock: string
  delivery_on_order: string
  warranty: string
  payment_in_stock: string
  payment_on_order: string
  validity: string
}

// Matches the migration's seed row, so a PDF generated before the migration
// has run (or if the table is briefly unreachable) still prints something
// sensible instead of blank lines.
const FALLBACK: KpTerms = {
  delivery_in_stock: 'Товар в наличии на складе — отгрузка в течение 1–3 рабочих дней',
  delivery_on_order: 'По согласованию, в зависимости от наличия на складе',
  warranty: '12 месяцев с момента поставки',
  payment_in_stock: 'Оплата 100% по факту выставления счёта',
  payment_on_order: 'Предоплата 50%, остаток — по факту готовности товара',
  validity: '30 календарных дней с даты выставления',
}

// Both КП PDF generators run server-side already, so they read this
// directly rather than through a public HTTP round trip.
export async function getKpTerms(): Promise<KpTerms> {
  try {
    const row = await queryOne<KpTerms>(`SELECT * FROM kp_terms WHERE id = 'main'`)
    return row ?? FALLBACK
  } catch {
    return FALLBACK
  }
}
