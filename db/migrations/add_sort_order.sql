-- Migration: manual ordering for categories and products
-- Run on VPS: psql $DATABASE_URL -f /var/www/bes-saiman.kz/db/migrations/add_sort_order.sql

ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products   ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);

-- Seed sort_order from current alphabetical/creation order so existing
-- rows keep their present display order until someone reorders them.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name_ru) * 10 AS rn FROM categories
)
UPDATE categories SET sort_order = ranked.rn FROM ranked WHERE categories.id = ranked.id AND categories.sort_order = 0;

WITH ranked AS (
  SELECT id, category_id, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY created_at) * 10 AS rn FROM products
)
UPDATE products SET sort_order = ranked.rn FROM ranked WHERE products.id = ranked.id AND products.sort_order = 0;
