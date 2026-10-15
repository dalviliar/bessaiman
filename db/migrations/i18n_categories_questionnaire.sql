-- Migration: 1) kk/en category names supplied by Bes Saiman (until now
-- categories were created with Russian only, and the admin had no way to
-- add translations to an existing category). Matched by the Russian name,
-- so a category that was renamed in the meantime is simply left alone.
-- 2) The "Разработка по ТЗ" questionnaire file can now be uploaded per
-- language; an empty kk/en file falls back to the Russian one.
-- Run on VPS: bash scripts/migrate.sh i18n_categories_questionnaire

UPDATE categories c SET name_kk = t.kk, name_en = t.en
FROM (VALUES
  ('Муфельные печи',              'Муфельді пештер',                      'Muffle Furnaces'),
  ('Вертикальные трубчатые печи', 'Тік құбырлы пештер',                   'Vertical Tube Furnaces'),
  ('Горизонтальные трубчатые печи','Горизонталды құбырлы пештер',         'Horizontal Tube Furnaces'),
  ('Сушильные шкафы',             'Кептіру шкафтары',                     'Drying Ovens'),
  ('Мультипозиционные печи',      'Көп позициялы пештер',                 'Multi-Position Furnaces'),
  ('Измельчение и разделение',    'Ұнтақтау және бөлу',                   'Grinding and Separation'),
  ('Перчаточные боксы',           'Қолғапты бокстар',                     'Glove Boxes'),
  ('Другие товары',               'Басқа тауарлар',                       'Other Products'),
  ('Комплектующие',               'Құрамдас бөлшектер',                   'Components'),
  ('Разработка по ТЗ',            'Техникалық тапсырма бойынша әзірлеу',  'Custom Development Based on Technical Specifications'),
  ('Разработки по ТЗ',            'Техникалық тапсырма бойынша әзірлеу',  'Custom Development Based on Technical Specifications'),
  ('Лабораторная мебель',         'Зертханалық жиһаз',                    'Laboratory Furniture')
) AS t(ru, kk, en)
WHERE lower(replace(trim(c.name_ru), 'ё', 'е')) = lower(replace(t.ru, 'ё', 'е'));

-- Home page cards show the category description under the name. Where the
-- Russian description is just the name again (e.g. "Сушильные шкафы") and
-- there's no kk/en description, use the translated name instead of Russian.
UPDATE categories SET description_kk = name_kk, description_en = name_en
WHERE description_kk IS NULL AND trim(description_ru) = trim(name_ru);

SELECT name_ru, name_kk, name_en FROM categories ORDER BY sort_order;

ALTER TABLE products ADD COLUMN IF NOT EXISTS questionnaire_url_kk TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS questionnaire_url_en TEXT;
