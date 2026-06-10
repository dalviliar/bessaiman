-- Добавление: Вертикальная трубчатая печь BS-VTF-1200C
-- Запустить в Supabase SQL Editor

INSERT INTO products (
  slug, category_id, name_ru, name_kk, name_en,
  model, classification_code, product_type,
  description_ru, description_en,
  availability, barcode, images, specs,
  bulk_threshold, bulk_discount_percent
) VALUES (
  'bs-vtf-1200c',
  (SELECT id FROM categories WHERE slug = 'furnaces'),

  'Высокотемпературная вертикальная трубчатая печь BS-VTF-1200C',
  'BS-VTF-1200C жоғары температуралы тік түтікті пеш',
  'High Temperature Vertical Tube Furnace BS-VTF-1200C',

  'BS-VTF-1200C',
  'SFTV',
  'S',

  'Вертикальная трубчатая печь с максимальной температурой 1200°C. Рабочая камера: цилиндрическая вертикальная, Ø120 мм, зона нагрева 720 мм (8138 см³). Питание 3-фазное, 6 кВт. Контроллер TMCON-BesSaiman (FT3415) с алгоритмом FUZZY+PID — до 4 программ по 80 шагов. Применение: отжиг, карбонизация, активация, рост кристаллов, дебайдинг, дегазация, сушка, закалка, MIM, пиролиз, спекание, сублимация, синтез.',
  'Vertical tube furnace up to 1200°C. Chamber: Ø120mm, 720mm heating zone (8138 cm³). 3-phase 6kW. TMCON-BesSaiman controller (FT3415) with FUZZY+PID algorithm — up to 4 programs × 80 steps.',

  'in_stock',
  '4650100000101',
  '{}',
  '{
    "Макс. температура":        "1200°C",
    "Ориентация":               "Вертикальная",
    "Диаметр камеры":           "Ø120 мм",
    "Длина зоны нагрева":       "720 мм",
    "Объём рабочей камеры":     "8138 см³",
    "Мощность":                 "6 кВт",
    "Питание":                  "3-фазное, 380В / 50Гц",
    "Контроллер":               "TMCON-BesSaiman FT3415, FUZZY+PID",
    "Количество программ":      "до 4 программ × 80 шагов",
    "Количество сигналов тревоги": "3 + аварийный обрыв цепи",
    "Гарантия":                 "12 месяцев"
  }'::jsonb,
  1, 5
)
ON CONFLICT (slug) DO UPDATE SET
  name_ru             = EXCLUDED.name_ru,
  description_ru      = EXCLUDED.description_ru,
  specs               = EXCLUDED.specs,
  classification_code = EXCLUDED.classification_code,
  product_type        = EXCLUDED.product_type;

SELECT slug, model, classification_code, product_type FROM products WHERE slug = 'bs-vtf-1200c';
