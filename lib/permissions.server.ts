import type { Permissions } from './admin'

// Этот модуль импортируется только из API-роутов и никогда из компонентов,
// поэтому ничего отсюда не попадает в браузерный бандл админки. Названия
// разделов уровня 1 отдаются клиенту по запросу и только суперадминистратору.

// Разделы и действия, которые можно назначить пользователю через форму
// "Индивидуальный доступ". Всё, что сюда не входит (в первую очередь
// permissions.all и roles.*), нельзя выставить через этот путь — иначе
// пользователь с правом users.update мог бы выдать кому угодно (включая себя)
// полный доступ суперадминистратора через прямой запрос к API в обход формы.
const EDITABLE_PERMISSIONS: Record<string, string[]> = {
  users:       ['create', 'read', 'update', 'delete'],
  products:    ['create', 'read', 'update', 'delete'],
  categories:  ['create', 'read', 'update', 'delete'],
  kp_requests: ['read', 'delete'],
  content:     ['create', 'read', 'update', 'delete'],
}

// Уровень 1 — доступ к самому сайту, а не к его наполнению. Выдаёт только
// суперадминистратор; остальные о существовании этих разделов не узнают.
export const LEVEL1_SECTIONS = [
  { key: 'settings', label: 'Настройки сайта (изображения страниц)', actions: ['read', 'update'] },
] as const

export const LEVEL1_NAV = [
  { href: '/admin/pages', label: 'Изображения', resource: 'settings' },
] as const

const LEVEL1_PERMISSIONS: Record<string, string[]> =
  Object.fromEntries(LEVEL1_SECTIONS.map(s => [s.key, [...s.actions]]))

export function sanitizePermissions(input: unknown, allowLevel1 = false): Permissions {
  const allowed = allowLevel1
    ? { ...EDITABLE_PERMISSIONS, ...LEVEL1_PERMISSIONS }
    : EDITABLE_PERMISSIONS
  const out: Record<string, Record<string, boolean>> = {}
  if (input && typeof input === 'object') {
    const src = input as Record<string, unknown>
    for (const [section, actions] of Object.entries(allowed)) {
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
