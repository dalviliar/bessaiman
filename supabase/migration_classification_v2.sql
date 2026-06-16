-- ============================================================
-- Bes Saiman Group — Classification Migration v2
-- Запускать в Supabase SQL Editor
-- ============================================================

BEGIN;

-- ── 1. Новые колонки ──────────────────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_type        text DEFAULT 'S'
    CHECK (product_type IN ('S','A','P','PP','PA','I')),
  ADD COLUMN IF NOT EXISTS classification_code text,
  ADD COLUMN IF NOT EXISTS compatible_with     text[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_products_type   ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_class  ON products(classification_code);

-- ── 2. product_type для всех товаров ─────────────────────────
-- По умолчанию все серийные (S)
UPDATE products SET product_type = 'S';

-- Комплектующие для продажи → PA
UPDATE products SET product_type = 'PA'
WHERE model IN ('BS-HP-1','BS-ATCU-40А','BS-BTCU-20А','BS-GSS-2');

-- ── 3. classification_code ────────────────────────────────────

-- Муфельные печи
UPDATE products SET classification_code = 'SFM'
WHERE model LIKE 'BS-MF%';

-- Горизонтальные трубчатые
UPDATE products SET classification_code = 'SFTH'
WHERE model IN ('BS-1HTF1200A','BS-3HTF1200B','BS-1HTF1100D','BS-2HTF1100E');

-- Вертикальные трубчатые
UPDATE products SET classification_code = 'SFTV'
WHERE model = 'BS-VTF-1200A';

-- Мультипозиционные
UPDATE products SET classification_code = 'SFTM'
WHERE model = 'BS-MPTF-1200A';

-- Измельчители
UPDATE products SET classification_code = 'SM'
WHERE model IN ('BS-BALLMILL-1','BS-BALLMILL-2','BS-PBALLMILL');

-- Вибросита (подгруппа SM по документу)
UPDATE products SET classification_code = 'SV'
WHERE model = 'BS-VIBSIEVE-1';

-- Установки синтеза
UPDATE products SET classification_code = 'SS'
WHERE model IN ('BS-ES-A','BS-VGB-3','BS-AGB','BS-PLAST18CC');

-- Лабораторная мебель
UPDATE products SET classification_code = 'FUR'
WHERE model IN (
  'BS-FH1.5','BS-FH1.8','BS-GC1','BS-GC2','BS-DO80L',
  'BS-LT-1.5A','BS-LT-1.5B','BS-LT-1.5SA','BS-LT-1.5SB',
  'BS-AVT-1','BS-T-GMS1','BS-ILT1.5A'
);

-- Комплектующие
UPDATE products SET classification_code = 'PA'
WHERE model IN ('BS-HP-1','BS-ATCU-40А','BS-BTCU-20А','BS-GSS-2');

-- ── 4. compatible_with для аксессуаров ───────────────────────
-- Блоки управления температурой → все типы печей
UPDATE products SET compatible_with = ARRAY['SFM','SFTH','SFTV','SFTM']
WHERE model IN ('BS-ATCU-40А','BS-BTCU-20А');

-- Нагревательная плита → печи
UPDATE products SET compatible_with = ARRAY['SFM','SFTH','SFTV','SFTM']
WHERE model = 'BS-HP-1';

-- Газовая система → трубчатые + синтез
UPDATE products SET compatible_with = ARRAY['SFTH','SFTV','SFTM','SS']
WHERE model = 'BS-GSS-2';

-- ── 5. Удаляем BS-VTF-1200C (нет в Excel) ────────────────────
DO $$
DECLARE v_id uuid;
BEGIN
  SELECT id INTO v_id FROM products WHERE model = 'BS-VTF-1200C';
  IF v_id IS NOT NULL THEN
    DELETE FROM warehouse_transactions WHERE product_id = v_id;
    DELETE FROM warehouse_items        WHERE product_id = v_id;
    DELETE FROM product_accessories
      WHERE product_id = v_id OR accessory_id = v_id;
    DELETE FROM products WHERE id = v_id;
    RAISE NOTICE 'BS-VTF-1200C удалён';
  END IF;
END $$;

-- ── 6. Пересоздаём категории по классификатору ────────────────
UPDATE products SET category_id = NULL;
DELETE FROM categories;

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
 'Heating plates, temperature controllers, gas supply systems.');

-- ── 7. Привязываем товары к категориям ───────────────────────
UPDATE products SET category_id=(SELECT id FROM categories WHERE slug='sfm')       WHERE classification_code='SFM';
UPDATE products SET category_id=(SELECT id FROM categories WHERE slug='sfth')      WHERE classification_code='SFTH';
UPDATE products SET category_id=(SELECT id FROM categories WHERE slug='sftv')      WHERE classification_code='SFTV';
UPDATE products SET category_id=(SELECT id FROM categories WHERE slug='sftm')      WHERE classification_code='SFTM';
UPDATE products SET category_id=(SELECT id FROM categories WHERE slug='sm')        WHERE classification_code IN ('SM','SV');
UPDATE products SET category_id=(SELECT id FROM categories WHERE slug='ss')        WHERE classification_code='SS';
UPDATE products SET category_id=(SELECT id FROM categories WHERE slug='furniture') WHERE classification_code='FUR';
UPDATE products SET category_id=(SELECT id FROM categories WHERE slug='pa')        WHERE classification_code='PA';

-- ── 8. Admin таблицы ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT UNIQUE NOT NULL,
  display_name_ru TEXT NOT NULL,
  display_name_en TEXT,
  level           INTEGER NOT NULL CHECK (level >= 1),
  permissions     JSONB NOT NULL DEFAULT '{}',
  is_system       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id          UUID PRIMARY KEY,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role_id     UUID REFERENCES admin_roles(id) ON DELETE RESTRICT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_by  UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  last_seen   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_role   ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth read roles"        ON admin_roles;
DROP POLICY IF EXISTS "Auth write roles"       ON admin_roles;
DROP POLICY IF EXISTS "Auth read admin_users"  ON admin_users;
DROP POLICY IF EXISTS "Auth write admin_users" ON admin_users;

CREATE POLICY "Auth read roles"        ON admin_roles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth write roles"       ON admin_roles FOR ALL    USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth read admin_users"  ON admin_users FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth write admin_users" ON admin_users FOR ALL    USING (auth.uid() IS NOT NULL);

INSERT INTO admin_roles (name, display_name_ru, display_name_en, level, is_system, permissions) VALUES
('super_admin','Суперадминистратор','Super Administrator',1,TRUE,'{"all":true}'::jsonb),
('admin','Администратор','Administrator',2,TRUE,
 '{"users":{"create":true,"read":true,"update":true,"delete":true},"products":{"create":true,"read":true,"update":true,"delete":true},"categories":{"create":true,"read":true,"update":true,"delete":true},"warehouse":{"read":true,"write":true}}'::jsonb),
('manager','Менеджер','Manager',3,TRUE,
 '{"products":{"create":true,"read":true,"update":true,"delete":false},"warehouse":{"read":true,"write":false}}'::jsonb),
('warehouse_manager','Менеджер склада','Warehouse Manager',4,TRUE,
 '{"products":{"create":false,"read":true,"update":false,"delete":false},"warehouse":{"read":true,"write":true}}'::jsonb),
('viewer','Наблюдатель','Viewer',7,TRUE,
 '{"products":{"read":true},"categories":{"read":true},"warehouse":{"read":true}}'::jsonb)
ON CONFLICT (name) DO UPDATE SET
  display_name_ru = EXCLUDED.display_name_ru,
  level           = EXCLUDED.level,
  permissions     = EXCLUDED.permissions;

-- ── 9. Проверка ───────────────────────────────────────────────
SELECT c.slug, c.name_ru, COUNT(p.id) AS товаров
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.slug, c.name_ru ORDER BY c.slug;

SELECT model, product_type, classification_code,
       array_length(compatible_with,1) AS совместимых
FROM products WHERE product_type = 'PA';

SELECT model FROM products WHERE classification_code IS NULL;

COMMIT;
