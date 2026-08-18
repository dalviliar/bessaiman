-- Migration: staff can choose left / center / justify for the long free-text
-- fields that render as prose on the public site (news body, science
-- descriptions, contract descriptions).
-- Run on VPS: bash scripts/migrate.sh text_align

ALTER TABLE news_posts       ADD COLUMN IF NOT EXISTS text_align TEXT NOT NULL DEFAULT 'left';
ALTER TABLE science_projects ADD COLUMN IF NOT EXISTS text_align TEXT NOT NULL DEFAULT 'left';
ALTER TABLE science_contracts ADD COLUMN IF NOT EXISTS text_align TEXT NOT NULL DEFAULT 'left';
