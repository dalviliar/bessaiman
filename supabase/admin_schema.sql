-- ============================================================
-- Bes Saiman Group — Admin RBAC Schema
-- Запускать в Supabase SQL Editor
-- ============================================================

-- ── 1. Роли ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT UNIQUE NOT NULL,
  display_name_ru TEXT NOT NULL,
  display_name_en TEXT,
  level           INTEGER NOT NULL CHECK (level >= 1),
  permissions     JSONB NOT NULL DEFAULT '{}',
  is_system       BOOLEAN DEFAULT FALSE,  -- нельзя удалить
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Пользователи (связаны с Supabase Auth) ──────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id              UUID PRIMARY KEY,  -- = auth.users.id
  email           TEXT NOT NULL,
  full_name       TEXT,
  role_id         UUID REFERENCES admin_roles(id) ON DELETE RESTRICT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_by      UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  last_seen       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Индексы ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS admin_users_role_idx ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS admin_users_active_idx ON admin_users(is_active);

-- ── 4. RLS ─────────────────────────────────────────────────
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Чтение ролей — только авторизованные
DROP POLICY IF EXISTS "Auth read roles" ON admin_roles;
CREATE POLICY "Auth read roles" ON admin_roles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Запись ролей — только авторизованные (логика уровней — в app)
DROP POLICY IF EXISTS "Auth write roles" ON admin_roles;
CREATE POLICY "Auth write roles" ON admin_roles
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Чтение users — только авторизованные
DROP POLICY IF EXISTS "Auth read admin_users" ON admin_users;
CREATE POLICY "Auth read admin_users" ON admin_users
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Запись users — только авторизованные
DROP POLICY IF EXISTS "Auth write admin_users" ON admin_users;
CREATE POLICY "Auth write admin_users" ON admin_users
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ── 5. Предустановленные роли ──────────────────────────────
INSERT INTO admin_roles (name, display_name_ru, display_name_en, level, is_system, permissions) VALUES

-- Уровень 1: Суперадминистратор — всё без ограничений
('super_admin',
 'Суперадминистратор', 'Super Administrator', 1, TRUE,
 '{"all": true}'::jsonb),

-- Уровень 2: Администратор — всё, кроме создания суперадмина
('admin',
 'Администратор', 'Administrator', 2, TRUE,
 '{
   "users":       {"create": true,  "read": true, "update": true,  "delete": true},
   "roles":       {"create": true,  "read": true, "update": true,  "delete": true},
   "products":    {"create": true,  "read": true, "update": true,  "delete": true},
   "categories":  {"create": true,  "read": true, "update": true,  "delete": true},
   "warehouse":   {"read": true,  "write": true},
   "kp_requests": {"read": true,  "delete": true},
   "settings":    {"read": true,  "update": true}
 }'::jsonb),

-- Уровень 3: Менеджер — работает с товарами и заявками, склад только просмотр
('manager',
 'Менеджер', 'Manager', 3, TRUE,
 '{
   "users":       {"create": false, "read": true,  "update": false, "delete": false},
   "roles":       {"create": false, "read": true,  "update": false, "delete": false},
   "products":    {"create": true,  "read": true,  "update": true,  "delete": false},
   "categories":  {"create": false, "read": true,  "update": false, "delete": false},
   "warehouse":   {"read": true,  "write": false},
   "kp_requests": {"read": true,  "delete": false},
   "settings":    {"read": false, "update": false}
 }'::jsonb),

-- Уровень 4: Менеджер склада — только склад и просмотр товаров
('warehouse_manager',
 'Менеджер склада', 'Warehouse Manager', 4, TRUE,
 '{
   "users":       {"create": false, "read": false, "update": false, "delete": false},
   "roles":       {"create": false, "read": false, "update": false, "delete": false},
   "products":    {"create": false, "read": true,  "update": false, "delete": false},
   "categories":  {"create": false, "read": true,  "update": false, "delete": false},
   "warehouse":   {"read": true,  "write": true},
   "kp_requests": {"read": false, "delete": false},
   "settings":    {"read": false, "update": false}
 }'::jsonb),

-- Уровень 5: Редактор каталога — только товары и категории
('catalog_editor',
 'Редактор каталога', 'Catalog Editor', 5, TRUE,
 '{
   "users":       {"create": false, "read": false, "update": false, "delete": false},
   "roles":       {"create": false, "read": false, "update": false, "delete": false},
   "products":    {"create": true,  "read": true,  "update": true,  "delete": true},
   "categories":  {"create": true,  "read": true,  "update": true,  "delete": true},
   "warehouse":   {"read": false, "write": false},
   "kp_requests": {"read": true,  "delete": false},
   "settings":    {"read": false, "update": false}
 }'::jsonb),

-- Уровень 5: Менеджер товаров — полный CRUD по товарам (НЕ администратор)
('product_manager',
 'Менеджер товаров', 'Product Manager', 5, TRUE,
 '{
   "users":       {"create": false, "read": false, "update": false, "delete": false},
   "roles":       {"create": false, "read": false, "update": false, "delete": false},
   "products":    {"create": true,  "read": true,  "update": true,  "delete": true},
   "categories":  {"create": false, "read": true,  "update": false, "delete": false},
   "warehouse":   {"read": true,  "write": false},
   "kp_requests": {"read": true,  "delete": false},
   "settings":    {"read": false, "update": false}
 }'::jsonb),

-- Уровень 6: Складской специалист — добавление товаров + полный доступ к складу
('warehouse_specialist',
 'Складской специалист', 'Warehouse Specialist', 6, TRUE,
 '{
   "users":       {"create": false, "read": false, "update": false, "delete": false},
   "roles":       {"create": false, "read": false, "update": false, "delete": false},
   "products":    {"create": true,  "read": true,  "update": false, "delete": false},
   "categories":  {"create": false, "read": true,  "update": false, "delete": false},
   "warehouse":   {"read": true,  "write": true},
   "kp_requests": {"read": false, "delete": false},
   "settings":    {"read": false, "update": false}
 }'::jsonb),

-- Уровень 7: Наблюдатель — только чтение
('viewer',
 'Наблюдатель', 'Viewer', 7, TRUE,
 '{
   "users":       {"create": false, "read": false, "update": false, "delete": false},
   "roles":       {"create": false, "read": false, "update": false, "delete": false},
   "products":    {"create": false, "read": true,  "update": false, "delete": false},
   "categories":  {"create": false, "read": true,  "update": false, "delete": false},
   "warehouse":   {"read": true,  "write": false},
   "kp_requests": {"read": true,  "delete": false},
   "settings":    {"read": false, "update": false}
 }'::jsonb)

ON CONFLICT (name) DO UPDATE SET
  display_name_ru = EXCLUDED.display_name_ru,
  level           = EXCLUDED.level,
  permissions     = EXCLUDED.permissions;

-- Результат
SELECT name, display_name_ru, level FROM admin_roles ORDER BY level;
