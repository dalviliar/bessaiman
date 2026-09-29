-- Migration: technical specs were only ever entered in Russian, so the table
-- on the product page stayed Russian when the visitor switched the site to
-- Қазақша / English. Translations live next to the Russian rows, keyed by the
-- Russian parameter name: { "Мощность": { "key_kk": "Қуаты", "value_kk": "...",
-- "key_en": "Power", "value_en": "5 kW" } }. Empty translation falls back to
-- Russian. Run on VPS: bash scripts/migrate.sh add_product_specs_i18n

ALTER TABLE products ADD COLUMN IF NOT EXISTS specs_i18n JSON;
