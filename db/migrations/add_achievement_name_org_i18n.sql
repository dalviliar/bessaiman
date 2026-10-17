-- Migration: employee name and organization on "Достижения сотрудников" were
-- Russian-only, so the English/Kazakh /nauka page showed them in Cyrillic
-- (e.g. "Елеуов Мухтар Ауезович", "ҚР ҒжЖБМ"). Empty = Russian is shown.
-- Run on VPS: bash scripts/migrate.sh add_achievement_name_org_i18n

ALTER TABLE science_achievements ADD COLUMN IF NOT EXISTS full_name_kk TEXT;
ALTER TABLE science_achievements ADD COLUMN IF NOT EXISTS full_name_en TEXT;
ALTER TABLE science_achievements ADD COLUMN IF NOT EXISTS organization_kk TEXT;
ALTER TABLE science_achievements ADD COLUMN IF NOT EXISTS organization_en TEXT;
