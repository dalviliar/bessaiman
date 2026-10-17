-- Migration: second try of fix_category_desc_i18n, which updated nothing -
-- the description apparently differs from the name in punctuation, spacing
-- or case. Compare letters only. Prints the result so it can be checked.
-- Run on VPS: bash scripts/migrate.sh fix_category_desc_i18n_2

UPDATE categories SET description_kk = name_kk
WHERE regexp_replace(lower(coalesce(description_ru, '')), '[^а-яёa-z]', '', 'g')
    = regexp_replace(lower(name_ru), '[^а-яёa-z]', '', 'g')
  AND (coalesce(trim(description_kk), '') = ''
       OR regexp_replace(lower(description_kk), '[^а-яёa-z]', '', 'g')
        = regexp_replace(lower(description_ru), '[^а-яёa-z]', '', 'g'));

UPDATE categories SET description_en = name_en
WHERE regexp_replace(lower(coalesce(description_ru, '')), '[^а-яёa-z]', '', 'g')
    = regexp_replace(lower(name_ru), '[^а-яёa-z]', '', 'g')
  AND (coalesce(trim(description_en), '') = ''
       OR regexp_replace(lower(description_en), '[^а-яёa-z]', '', 'g')
        = regexp_replace(lower(description_ru), '[^а-яёa-z]', '', 'g'));

SELECT name_ru, left(description_ru, 40) AS desc_ru, left(description_kk, 30) AS desc_kk, left(description_en, 30) AS desc_en
FROM categories ORDER BY sort_order;
