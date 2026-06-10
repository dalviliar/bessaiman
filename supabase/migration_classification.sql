-- ============================================================
-- Bes Saiman Group — Классификация продукции
-- Запускать в Supabase SQL Editor ПОСЛЕ schema.sql + seed.sql
-- ============================================================

-- 1. Тип товара: S=серийный, PP=расходник для сборки, PA=расходник для продажи, I=под заказ
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'S'
  CONSTRAINT products_type_check CHECK (product_type IN ('S', 'PP', 'PA', 'I'));

-- 2. Код классификации: SFM, SFTH, SFTV, SFTM, SM, SV, SGB, SES, SLF
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS classification_code text;

-- 3. Расставляем типы -----------------------------------------------

-- Все товары в категории accessories → PA (расходники для продажи)
UPDATE products SET product_type = 'PA'
WHERE category_id = (SELECT id FROM categories WHERE slug = 'accessories');

-- 4. Расставляем коды классификации --------------------------------

-- Муфельные печи (SFM)
UPDATE products SET classification_code = 'SFM'
WHERE model LIKE 'BS-MF%'
   OR model LIKE 'SFM%';

-- Горизонтальные трубчатые печи (SFTH)
UPDATE products SET classification_code = 'SFTH'
WHERE (model LIKE '%HTF%' OR model LIKE 'SFTH%')
  AND model NOT LIKE 'BS-MPTF%'
  AND model NOT LIKE 'BS-VTF%'
  AND model NOT LIKE 'BS-DO%';

-- Вертикальные трубчатые печи (SFTV)
UPDATE products SET classification_code = 'SFTV'
WHERE model LIKE 'BS-VTF%'
   OR model LIKE 'SFTV%';

-- Мультипозиционные трубчатые печи (SFTM)
UPDATE products SET classification_code = 'SFTM'
WHERE model LIKE 'BS-MPTF%'
   OR model LIKE 'SFTM%';

-- Прочие печи (SFO - other furnaces)
UPDATE products SET classification_code = 'SFO'
WHERE category_id = (SELECT id FROM categories WHERE slug = 'furnaces')
  AND classification_code IS NULL;

-- Шаровые мельницы горизонтальные (SM)
UPDATE products SET classification_code = 'SM'
WHERE model LIKE 'BS-BALLMILL%'
   OR model LIKE 'SM%';

-- Планетарные мельницы (SMP)
UPDATE products SET classification_code = 'SMP'
WHERE model LIKE 'BS-PBALLMILL%'
   OR model LIKE 'SMP%';

-- Вибросита (SV)
UPDATE products SET classification_code = 'SV'
WHERE model LIKE 'BS-VIBSIEVE%'
   OR model LIKE 'SV%';

-- Вакуумные боксы (SGB)
UPDATE products SET classification_code = 'SGB'
WHERE category_id = (SELECT id FROM categories WHERE slug = 'vacuum')
  AND classification_code IS NULL;

-- Электроспиннинг (SES)
UPDATE products SET classification_code = 'SES'
WHERE category_id = (SELECT id FROM categories WHERE slug = 'electrospinning')
  AND classification_code IS NULL;

-- Лабораторная мебель (SLF)
UPDATE products SET classification_code = 'SLF'
WHERE category_id = (SELECT id FROM categories WHERE slug = 'furniture')
  AND classification_code IS NULL;

-- Расходники для продажи (PA)
UPDATE products SET classification_code = 'PA'
WHERE product_type = 'PA'
  AND classification_code IS NULL;

-- 5. Индексы --------------------------------------------------------
CREATE INDEX IF NOT EXISTS products_type_idx ON products(product_type);
CREATE INDEX IF NOT EXISTS products_classification_idx ON products(classification_code);

-- 6. Представление для публичного каталога (только S и PA) ----------
CREATE OR REPLACE VIEW catalog_products AS
  SELECT * FROM products
  WHERE product_type IN ('S', 'PA', 'I');

-- Проверка
SELECT
  product_type,
  classification_code,
  COUNT(*) AS cnt
FROM products
GROUP BY product_type, classification_code
ORDER BY product_type, classification_code;
