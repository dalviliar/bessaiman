-- ============================================================
-- Bes Saiman Group — Clean PostgreSQL schema (no Supabase)
-- Run once against a fresh database on the VPS:
--   psql "$DATABASE_URL" -f db/schema.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

-- ── Categories ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text UNIQUE NOT NULL,
  name_ru          text NOT NULL,
  name_kk          text NOT NULL,
  name_en          text NOT NULL,
  description_ru   text,
  description_kk   text,
  description_en   text,
  image_url        text,
  created_at       timestamptz DEFAULT now()
);

-- ── Products ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                   text UNIQUE NOT NULL,
  category_id            uuid REFERENCES categories(id) ON DELETE SET NULL,
  name_ru                text NOT NULL,
  name_kk                text NOT NULL,
  name_en                text NOT NULL,
  model                  text,
  description_ru         text,
  description_kk         text,
  description_en         text,
  price                  numeric,
  price_with_discount    numeric,
  bulk_threshold         integer DEFAULT 3,
  bulk_discount_percent  numeric DEFAULT 5,
  availability           text DEFAULT 'in_stock' CHECK (availability IN ('in_stock','on_order','out_of_stock')),
  barcode                text UNIQUE,
  images                 text[] DEFAULT '{}',
  specs                  jsonb,
  product_type           text DEFAULT 'S' CHECK (product_type IN ('S','A','P','PP','PA','I')),
  classification_code    text,
  compatible_with        text[] DEFAULT '{}',
  created_at             timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_accessories (
  product_id   uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  accessory_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, accessory_id),
  CONSTRAINT no_self_ref CHECK (product_id != accessory_id)
);

CREATE TABLE IF NOT EXISTS product_documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('commercial_proposal','tech_spec')),
  file_url    text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- ── Warehouse ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS warehouse_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  barcode       text,
  quantity      integer NOT NULL DEFAULT 0,
  location      text,
  last_updated  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS warehouse_transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  barcode     text,
  type        text NOT NULL CHECK (type IN ('in','out')),
  quantity    integer NOT NULL CHECK (quantity > 0),
  note        text,
  created_at  timestamptz DEFAULT now()
);

-- ── KP (commercial proposal) requests ──────────────────────
CREATE TABLE IF NOT EXISTS kp_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid REFERENCES products(id) ON DELETE SET NULL,
  product_model   text,
  product_name    text,
  kp_number       text,
  client_name     text NOT NULL,
  client_company  text,
  client_email    text,
  client_phone    text,
  quantity        int NOT NULL DEFAULT 1,
  note            text,
  lang            text DEFAULT 'ru',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Admin RBAC (self-contained, no Supabase Auth) ──────────
CREATE TABLE IF NOT EXISTS admin_roles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text UNIQUE NOT NULL,
  display_name_ru text NOT NULL,
  display_name_en text,
  level           integer NOT NULL CHECK (level >= 1),
  permissions     jsonb NOT NULL DEFAULT '{}',
  is_system       boolean DEFAULT FALSE,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name     text,
  role_id       uuid REFERENCES admin_roles(id) ON DELETE RESTRICT,
  is_active     boolean DEFAULT TRUE,
  created_by    uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  last_seen     timestamptz,
  created_at    timestamptz DEFAULT now()
);

-- ── Audit log: кто что сделал и когда ──────────────────────
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id  uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  admin_email    text NOT NULL,
  action         text NOT NULL,       -- 'create' | 'update' | 'delete'
  entity_type    text NOT NULL,       -- 'product' | 'user' | 'role'
  entity_id      uuid,
  entity_label   text,                -- человекочитаемое название на момент действия
  details        jsonb,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at DESC);

-- ── Доп. поля товара: вес, габариты, ед. измерения ─────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_kg numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit text NOT NULL DEFAULT 'шт';
ALTER TABLE products ADD COLUMN IF NOT EXISTS length_cm numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS width_cm numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS height_cm numeric;

-- ── Код классификации для категорий ─────────────────────────
ALTER TABLE categories ADD COLUMN IF NOT EXISTS classification_code text;
UPDATE categories SET classification_code = UPPER(slug)
  WHERE slug IN ('sfm','sfth','sftv','sftm','sm','ss','pa');
UPDATE categories SET classification_code = 'LF' WHERE slug = 'furniture';

-- ── Новости и уведомления ────────────────────────────────────
CREATE TABLE IF NOT EXISTS news_posts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ru       text NOT NULL,
  title_kk       text,
  title_en       text,
  content_ru     text,
  content_kk     text,
  content_en     text,
  image_url      text,
  instagram_url  text,
  type           text NOT NULL DEFAULT 'news',  -- 'news' | 'announcement'
  is_published   boolean NOT NULL DEFAULT false,
  published_at   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_posts(published_at DESC) WHERE is_published = true;

ALTER TABLE warehouse_transactions ADD COLUMN IF NOT EXISTS performed_by_name text;

-- ── Просмотры товаров ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_views (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ip_hash     text,
  viewed_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_product_views_product ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_at     ON product_views(viewed_at DESC);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug       ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_barcode    ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_type       ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_class      ON products(classification_code);
CREATE INDEX IF NOT EXISTS idx_warehouse_product    ON warehouse_items(product_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_barcode    ON warehouse_items(barcode);
CREATE INDEX IF NOT EXISTS idx_transactions_product ON warehouse_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON warehouse_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kp_requests_created  ON kp_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_users_role     ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_active   ON admin_users(is_active);

-- ── Classification categories (per spec) ───────────────────
INSERT INTO categories (slug, name_ru, name_kk, name_en, description_ru, description_kk, description_en) VALUES
('sfm',
 'Муфельные печи','Муфельді пештер','Muffle Furnaces',
 'Серийные муфельные печи до 1200 °C. Объём камеры от 1 до 12 л.',
 'Сериялы муфельді пештер 1200 °C дейін. 1-12 литр.',
 'Serial muffle furnaces up to 1200 °C. Chamber 1–12 L.'),
('sfth',
 'Горизонтальные трубчатые печи','Горизонтал түтікті пештер','Horizontal Tube Furnaces',
 'Горизонтальные трубчатые печи: 1–3 зоны нагрева, диаметр трубы 25–100 мм.',
 'Горизонтал түтікті пештер: 1-3 аймақ, диаметрі 25-100 мм.',
 'Horizontal tube furnaces: 1–3 zones, tube Ø 25–100 mm.'),
('sftv',
 'Вертикальные трубчатые печи','Тік түтікті пештер','Vertical Tube Furnaces',
 'Вертикальные трубчатые печи для обработки в вертикальном положении.',
 'Тік орналасуда өңдеуге арналған тік түтікті пештер.',
 'Vertical tube furnaces for vertical-orientation processing.'),
('sftm',
 'Мультипозиционные печи','Көпұясты пештер','Multi-position Furnaces',
 'Мультипозиционные трубчатые печи для одновременной обработки нескольких образцов.',
 'Бірнеше үлгіні бір мезгілде өңдеуге арналған пештер.',
 'Multi-position furnaces for simultaneous processing of multiple samples.'),
('sm',
 'Измельчение и разделение','Ұсату және бөлу','Milling & Separation',
 'Горизонтальные и планетарные шаровые мельницы, вибрационные ситовые анализаторы.',
 'Горизонтал және планеталық шарлы диірмендер, вибрациялық елеуіш анализаторлар.',
 'Ball mills and vibratory sieve analyzers.'),
('ss',
 'Установки синтеза','Синтез қондырғылары','Synthesis Systems',
 'Электроспиннинг, вакуумные перчаточные боксы, термопласты.',
 'Электроспиннинг, вакуумды қолғап жәшіктері, термопласттар.',
 'Electrospinning, vacuum glove boxes, thermoplasters.'),
('furniture',
 'Лабораторная мебель','Зертханалық жиhаз','Laboratory Furniture',
 'Вытяжные и газовые шкафы, сушильные шкафы, лабораторные столы.',
 'Сорғыш және газ шкафтары, кептіру шкафтары, зертханалық үстелдер.',
 'Fume hoods, gas cabinets, drying ovens, lab tables.'),
('pa',
 'Комплектующие','Жинақтаушылар','Components & Accessories',
 'Нагревательные плиты, блоки управления температурой, системы подачи газа.',
 'Жылыту плиталары, температура басқару блоктары, газ беру жүйелері.',
 'Heating plates, temperature controllers, gas supply systems.')
ON CONFLICT (slug) DO NOTHING;

-- ── System roles ────────────────────────────────────────────
INSERT INTO admin_roles (name, display_name_ru, display_name_en, level, is_system, permissions) VALUES
('super_admin','Суперадминистратор','Super Administrator',1,TRUE,'{"all": true}'::jsonb),
('admin','Администратор','Administrator',2,TRUE,
 '{"users":{"create":true,"read":true,"update":true,"delete":true},
   "roles":{"create":true,"read":true,"update":true,"delete":true},
   "products":{"create":true,"read":true,"update":true,"delete":true},
   "categories":{"create":true,"read":true,"update":true,"delete":true},
   "content":{"create":true,"read":true,"update":true,"delete":true},
   "warehouse":{"read":true,"write":true},
   "kp_requests":{"read":true,"delete":true},
   "settings":{"read":true,"update":true}}'::jsonb),
('manager','Менеджер','Manager',3,TRUE,
 '{"users":{"create":false,"read":true,"update":false,"delete":false},
   "roles":{"create":false,"read":true,"update":false,"delete":false},
   "products":{"create":true,"read":true,"update":true,"delete":false},
   "categories":{"create":false,"read":true,"update":false,"delete":false},
   "warehouse":{"read":true,"write":false},
   "kp_requests":{"read":true,"delete":false},
   "settings":{"read":false,"update":false}}'::jsonb),
('warehouse_manager','Менеджер склада','Warehouse Manager',4,TRUE,
 '{"users":{"create":false,"read":false,"update":false,"delete":false},
   "roles":{"create":false,"read":false,"update":false,"delete":false},
   "products":{"create":false,"read":true,"update":false,"delete":false},
   "categories":{"create":false,"read":true,"update":false,"delete":false},
   "warehouse":{"read":true,"write":true},
   "kp_requests":{"read":false,"delete":false},
   "settings":{"read":false,"update":false}}'::jsonb),
('catalog_editor','Редактор каталога','Catalog Editor',5,TRUE,
 '{"users":{"create":false,"read":false,"update":false,"delete":false},
   "roles":{"create":false,"read":false,"update":false,"delete":false},
   "products":{"create":true,"read":true,"update":true,"delete":true},
   "categories":{"create":true,"read":true,"update":true,"delete":true},
   "content":{"create":true,"read":true,"update":true,"delete":true},
   "warehouse":{"read":false,"write":false},
   "kp_requests":{"read":true,"delete":false},
   "settings":{"read":false,"update":false}}'::jsonb),
('product_manager','Менеджер товаров','Product Manager',5,TRUE,
 '{"users":{"create":false,"read":false,"update":false,"delete":false},
   "roles":{"create":false,"read":false,"update":false,"delete":false},
   "products":{"create":true,"read":true,"update":true,"delete":true},
   "categories":{"create":false,"read":true,"update":false,"delete":false},
   "warehouse":{"read":true,"write":false},
   "kp_requests":{"read":true,"delete":false},
   "settings":{"read":false,"update":false}}'::jsonb),
('warehouse_specialist','Складской специалист','Warehouse Specialist',6,TRUE,
 '{"users":{"create":false,"read":false,"update":false,"delete":false},
   "roles":{"create":false,"read":false,"update":false,"delete":false},
   "products":{"create":true,"read":true,"update":false,"delete":false},
   "categories":{"create":false,"read":true,"update":false,"delete":false},
   "warehouse":{"read":true,"write":true},
   "kp_requests":{"read":false,"delete":false},
   "settings":{"read":false,"update":false}}'::jsonb),
('viewer','Наблюдатель','Viewer',7,TRUE,
 '{"users":{"create":false,"read":false,"update":false,"delete":false},
   "roles":{"create":false,"read":false,"update":false,"delete":false},
   "products":{"create":false,"read":true,"update":false,"delete":false},
   "categories":{"create":false,"read":true,"update":false,"delete":false},
   "warehouse":{"read":true,"write":false},
   "kp_requests":{"read":true,"delete":false},
   "settings":{"read":false,"update":false}}'::jsonb)
ON CONFLICT (name) DO UPDATE SET
  display_name_ru = EXCLUDED.display_name_ru,
  level           = EXCLUDED.level,
  permissions     = EXCLUDED.permissions;

SELECT 'Schema created successfully' AS status;
