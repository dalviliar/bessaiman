import { query } from '@/lib/db'

/**
 * kk/en employee name + organization for science_achievements, saved in a
 * separate UPDATE so saving keeps working before add_achievement_name_org_i18n
 * has been run (the translations are just skipped until then).
 */
export async function saveAchievementI18n(id: string, body: Record<string, unknown>) {
  const v = (k: string) => (typeof body[k] === 'string' && (body[k] as string).trim() ? (body[k] as string).trim() : null)
  const value = {
    full_name_kk: v('full_name_kk'), full_name_en: v('full_name_en'),
    organization_kk: v('organization_kk'), organization_en: v('organization_en'),
  }
  try {
    await query(
      'UPDATE science_achievements SET full_name_kk=$1, full_name_en=$2, organization_kk=$3, organization_en=$4 WHERE id=$5',
      [value.full_name_kk, value.full_name_en, value.organization_kk, value.organization_en, id],
    )
  } catch (e) {
    if (e instanceof Error && /full_name_|organization_/.test(e.message)) return {}
    throw e
  }
  return value
}
