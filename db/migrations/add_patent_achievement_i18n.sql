-- Migration: patents and achievements get the same multi-language title +
-- description + text-align setup already used by projects/individual
-- developments, instead of a single Russian-only field.
-- Run on VPS: bash scripts/migrate.sh add_patent_achievement_i18n

ALTER TABLE science_patents RENAME COLUMN title TO title_ru;
ALTER TABLE science_patents ADD COLUMN IF NOT EXISTS title_kk TEXT;
ALTER TABLE science_patents ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE science_patents RENAME COLUMN description TO description_ru;
ALTER TABLE science_patents ADD COLUMN IF NOT EXISTS description_kk TEXT;
ALTER TABLE science_patents ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE science_patents ADD COLUMN IF NOT EXISTS text_align TEXT NOT NULL DEFAULT 'left';

-- full_name is a person's name and stays as-is; award_name is a title like
-- a project's, so it gets the same treatment.
ALTER TABLE science_achievements RENAME COLUMN award_name TO award_name_ru;
ALTER TABLE science_achievements ADD COLUMN IF NOT EXISTS award_name_kk TEXT;
ALTER TABLE science_achievements ADD COLUMN IF NOT EXISTS award_name_en TEXT;
ALTER TABLE science_achievements RENAME COLUMN description TO description_ru;
ALTER TABLE science_achievements ADD COLUMN IF NOT EXISTS description_kk TEXT;
ALTER TABLE science_achievements ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE science_achievements ADD COLUMN IF NOT EXISTS text_align TEXT NOT NULL DEFAULT 'left';
