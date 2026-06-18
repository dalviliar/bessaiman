export interface AdminRole {
  id: string
  name: string
  display_name_ru: string
  display_name_en: string | null
  level: number
  permissions: Permissions
  is_system: boolean
  created_at: string
}

export interface AdminUser {
  id: string
  email: string
  full_name: string | null
  role_id: string | null
  is_active: boolean
  created_by: string | null
  last_seen: string | null
  created_at: string
  role?: AdminRole
}

export interface Permissions {
  all?: boolean
  users?: { create: boolean; read: boolean; update: boolean; delete: boolean }
  roles?: { create: boolean; read: boolean; update: boolean; delete: boolean }
  products?: { create: boolean; read: boolean; update: boolean; delete: boolean }
  categories?: { create: boolean; read: boolean; update: boolean; delete: boolean }
  warehouse?: { read: boolean; write: boolean }
  kp_requests?: { read: boolean; delete: boolean }
  settings?: { read: boolean; update: boolean }
}

export function can(role: AdminRole | null | undefined, resource: string, action: string): boolean {
  if (!role) return false
  const p = role.permissions as Permissions & Record<string, unknown>
  if (p.all || role.name === 'super_admin' || role.level === 0) return true
  const section = p[resource] as Record<string, boolean> | undefined
  return section?.[action] === true
}

// Проверяет может ли пользователь с roleA создать/изменить пользователя с roleB
// Правило: можно управлять только теми, чей level ВЫШЕ (больше числа) твоего
export function canManageRole(myLevel: number, targetLevel: number): boolean {
  return myLevel < targetLevel
}
