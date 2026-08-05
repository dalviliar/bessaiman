-- Migration: photo for the two fixed "recognition" cards on the science page
-- (company achievement diploma, accreditation certificate) so staff can
-- attach an actual scan instead of a placeholder icon.
-- Run on VPS: psql $DATABASE_URL -f /var/www/bes-saiman.kz/db/migrations/add_science_recognition.sql

CREATE TABLE IF NOT EXISTS science_recognition (
  kind         TEXT PRIMARY KEY,
  image_url    TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
