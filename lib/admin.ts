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
  content?: { create: boolean; read: boolean; update: boolean; delete: boolean }
  warehouse?: { read: boolean; write: boolean }
  kp_requests?: { read: boolean; delete: boolean }
  settings?: { read: boolean; update: boolean }
}

// Разделы и действия, которые можно назначить пользователю через форму "Индивидуальный доступ".
// Всё, что сюда не входит (в первую очередь permissions.all и roles.*), нельзя выставить
// через этот путь — иначе пользователь с правом users.update мог бы выдать кому угодно
// (включая себя) полный доступ суперадминистратора через прямой запрос к API в обход формы.
const EDITABLE_PERMISSIONS: Record<string, string[]> = {
  users:       ['create', 'read', 'update', 'delete'],
  products:    ['create', 'read', 'update', 'delete'],
  categories:  ['create', 'read', 'update', 'delete'],
  kp_requests: ['read', 'delete'],
  content:     ['create', 'read', 'update', 'delete'],
  settings:    ['read', 'update'],
}

export function sanitizePermissions(input: unknown): Permissions {
  const out: Record<string, Record<string, boolean>> = {}
  if (input && typeof input === 'object') {
    const src = input as Record<string, unknown>
    for (const [section, actions] of Object.entries(EDITABLE_PERMISSIONS)) {
      const sectionSrc = src[section]
      if (sectionSrc && typeof sectionSrc === 'object') {
        const clean: Record<string, boolean> = {}
        for (const action of actions) {
          clean[action] = (sectionSrc as Record<string, unknown>)[action] === true
        }
        out[section] = clean
      }
    }
  }
  return out as Permissions
}

export function can(role: AdminRole | null | undefined, resource: string, action: string): boolean {
  if (!role) return false
  const p = role.permissions as Permissions & Record<string, unknown>
  if (p.all || role.name === 'super_admin' || role.level === 0) return true
  const section = p[resource] as Record<string, boolean> | undefined
  return section?.[action] === true
}

// Проверяет может ли пользователь с roleA создать роль/пользователя-с-НОВОЙ-ролью уровня targetLevel
// Правило: можно создавать только роли ниже своей (строго больше по числу) — нельзя создать
// себе равную или более высокую роль
export function canManageRole(myLevel: number, targetLevel: number): boolean {
  return myLevel < targetLevel
}

// Проверяет может ли пользователь с roleA управлять УЖЕ СУЩЕСТВУЮЩИМ аккаунтом с roleB
// (редактирование данных, блокировка, права и т.д.). В отличие от canManageRole разрешает
// управлять аккаунтами своего же уровня — иначе кастомные "Индивидуальный доступ" пользователи
// (все создаются на одном уровне) не могли бы управлять друг другом, даже имея явно выданное
// право users.update. Запрещено только управлять более привилегированными (меньший level).
export function canManageUser(myLevel: number, targetLevel: number): boolean {
  return myLevel <= targetLevel
}
