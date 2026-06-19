-- Migration: add video_url to products + create partners table
-- Run on VPS: psql $DATABASE_URL -f /var/www/bes-saiman/db/migrations/add_video_url_and_partners.sql

ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;

CREATE TABLE IF NOT EXISTS partners (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  logo_url     TEXT,
  website_url  TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_sort ON partners(sort_order);
