import { query } from './db'

export type AuditEntity = 'product' | 'user' | 'role'
export type AuditAction = 'create' | 'update' | 'delete'

export async function logAction(params: {
  adminId: string
  adminEmail: string
  action: AuditAction
  entityType: AuditEntity
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
