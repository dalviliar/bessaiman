-- Migration: a product can carry its own "УСЛОВИЯ ПОСТАВКИ" for its КП,
-- overriding the shared kp_terms default. Null means "use the default".
-- Run on VPS: bash scripts/migrate.sh add_product_kp_terms_override

ALTER TABLE products ADD COLUMN IF NOT EXISTS kp_terms_override JSONB;
