-- Migration: repair products that were filed under the "Комплектующие"
-- category while the admin form still left "Тип товара" on its default
-- "Серийный" — the form now keeps the two in sync going forward, but
-- anything created before that fix needs a one-time correction so it
-- shows up on the "Комплектующие" tab in the catalog instead of hiding
-- inside "Серийные → Комплектующие".
-- Run on VPS: bash scripts/migrate.sh fix_accessories_product_type

UPDATE products p
SET product_type = 'PA'
FROM categories c
WHERE p.category_id = c.id
  AND c.slug = 'pa'
  AND p.product_type IS DISTINCT FROM 'PA';
