-- Migration: split science_projects into "individual developments" vs "projects",
-- give them a full description for the detail view, and add a hoz-dogovor (contract) list.
-- Run on VPS: psql $DATABASE_URL -f /var/www/bes-saiman.kz/db/migrations/add_science_projects_kind_and_contracts.sql

ALTER TABLE science_projects ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'individual';
ALTER TABLE science_projects ADD COLUMN IF NOT EXISTS description_ru TEXT;
ALTER TABLE science_projects ADD COLUMN IF NOT EXISTS description_kk TEXT;
ALTER TABLE science_projects ADD COLUMN IF NOT EXISTS description_en TEXT;
CREATE INDEX IF NOT EXISTS idx_science_projects_kind ON science_projects(kind);

CREATE TABLE IF NOT EXISTS science_contracts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  customer     TEXT,
  year         INTEGER,
  description  TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_science_contracts_sort ON science_contracts(sort_order);
