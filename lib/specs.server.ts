import { query } from '@/lib/db'
import type { SpecsI18n } from '@/types'

/**
 * Stores kk/en spec translations in a separate UPDATE so saving a product
 * keeps working on a DB where add_product_specs_i18n hasn't been run yet -
 * the translations are just skipped until then.
 */
export async function saveSpecsI18n(productId: string, specsI18n: unknown): Promise<SpecsI18n | null> {
  const value = cleanSpecsI18n(specsI18n)
  try {
    await query('UPDATE products SET specs_i18n = $1 WHERE id = $2', [value ? JSON.stringify(value) : null, productId])
  } catch (e) {
    if (e instanceof Error && e.message.includes('specs_i18n')) return null
    throw e
  }
  return value
}

function cleanSpecsI18n(raw: unknown): SpecsI18n | null {
  if (!raw || typeof raw !== 'object') return null
  const out: SpecsI18n = {}
  for (const [ruKey, tr] of Object.entries(raw as Record<string, Record<string, unknown>>)) {
    if (!ruKey.trim() || !tr || typeof tr !== 'object') continue
    const row: Record<string, string> = {}
    for (const f of ['key_kk', 'value_kk', 'key_en', 'value_en']) {
      const v = typeof tr[f] === 'string' ? (tr[f] as string).trim() : ''
      if (v) row[f] = v
    }
    if (Object.keys(row).length) out[ruKey.trim()] = row
  }
  return Object.keys(out).length ? out : null
}
