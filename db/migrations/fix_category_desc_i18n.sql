-- Migration: new categories got their Russian description copied into the
-- kk/en description, so i18n_categories_questionnaire (which only filled
-- empty ones) skipped them - the home page cards for e.g. "Сушильные шкафы"
-- kept a Russian description on the kk/en site. Where the description is
-- just the Russian name, show the translated name instead.
-- Run on VPS: bash scripts/migrate.sh fix_category_desc_i18n

UPDATE categories SET description_kk = name_kk
WHERE trim(description_ru) = trim(name_ru)
  AND (description_kk IS NULL OR trim(description_kk) = trim(description_ru));

UPDATE categories SET description_en = name_en
WHERE trim(description_ru) = trim(name_ru)
  AND (description_en IS NULL OR trim(description_en) = trim(description_ru));
