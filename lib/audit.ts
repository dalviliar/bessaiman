import { query } from './db'

export type AuditEntity = 'product' | 'user' | 'role' | 'category'
  | 'news' | 'partner'
  | 'science_publication' | 'science_patent' | 'science_project' | 'science_achievement' | 'science_contract'
  | 'science_accreditation'
  | 'page_image'
  | 'kp_terms'
export type AuditAction = 'create' | 'update' | 'delete'

export async function logAction(params: {
  adminId: string
  adminEmail: string
  action: AuditAction
  entityType: AuditEntity
  // admin_audit_log.entity_id is a uuid column — pass a real row id or
  // null, never a slug/constant like 'main' (Postgres will reject the
  // insert with "invalid input syntax for type uuid", which surfaces to
  // the admin as their save failing even though it already went through).
  entityId?: string | null
  entityLabel?: string | null
  details?: Record<string, unknown>
}) {
  const { adminId, adminEmail, action, entityType, entityId, entityLabel, details } = params
  await query(
    `INSERT INTO admin_audit_log (admin_user_id, admin_email, action, entity_type, entity_id, entity_label, details)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [adminId, adminEmail, action, entityType, entityId ?? null, entityLabel ?? null, details ? JSON.stringify(details) : null],
  )
}
