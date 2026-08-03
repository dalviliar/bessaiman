-- Migration: admin-manageable science page content
-- (publications, patents, projects, employee achievements)
-- Run on VPS: psql $DATABASE_URL -f /var/www/bes-saiman.kz/db/migrations/add_science_content.sql

CREATE TABLE IF NOT EXISTS science_publications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  authors      TEXT,
  journal      TEXT,
  year         INTEGER,
  doi          TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_science_publications_sort ON science_publications(sort_order);

CREATE TABLE IF NOT EXISTS science_patents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  patent_number  TEXT,
  badge_label    TEXT NOT NULL DEFAULT 'Патент',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_science_patents_sort ON science_patents(sort_order);

CREATE TABLE IF NOT EXISTS science_projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ru     TEXT NOT NULL,
  title_kk     TEXT,
  title_en     TEXT,
  period       TEXT,
  tags         TEXT,
  image_url    TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_science_projects_sort ON science_projects(sort_order);

CREATE TABLE IF NOT EXISTS science_achievements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         TEXT NOT NULL,
  award_name        TEXT NOT NULL,
  year              INTEGER,
  organization      TEXT,
  certificate_url   TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_science_achievements_sort ON science_achievements(sort_order);
