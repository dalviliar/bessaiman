-- Migration: separate Instagram link field for products
-- (previously staff were pasting Instagram links into the YouTube video_url field)
-- Run on VPS: psql $DATABASE_URL -f /var/www/bes-saiman.kz/db/migrations/add_product_instagram_url.sql

ALTER TABLE products ADD COLUMN IF NOT EXISTS instagram_url TEXT;
