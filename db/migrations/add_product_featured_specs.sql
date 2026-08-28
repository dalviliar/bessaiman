-- Migration: staff pick which spec rows show as the little badges on the
-- product card in the catalog, instead of it being auto-picked by a
-- hardcoded priority list (which just showed the first 1-2 specs entered).
-- Run on VPS: bash scripts/migrate.sh add_product_featured_specs

ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_specs TEXT[] DEFAULT '{}';
