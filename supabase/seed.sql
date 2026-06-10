-- ============================================================
-- Bes Saiman Group — Full Product Seed
-- Данные из: Серийные товары 6 февраль.xlsx + Классификация.docx
-- Запускать ПОСЛЕ schema.sql в Supabase SQL Editor
-- ============================================================

-- Очищаем старые тестовые данные
DELETE FROM warehouse_transactions;
DELETE FROM warehouse_items;
DELETE FROM product_accessories;
DELETE FROM product_documents;
DELETE FROM products;
DELETE FROM categories;

-- ============================================================
-- КАТЕГОРИИ (6 штук)
-- ============================================================
INSERT INTO categories (slug, name_ru, name_kk, name_en, description_ru, description_kk, description_en) VALUES
  ('furnaces',
   'Высокотемпературные печи',
   'Жоғары температуралы пештер',
   'High-Temperature Furnaces',
   'Муфельные, трубчатые, вертикальные и мультипозиционные печи до 1800°C. Серийное производство под маркой BS.',
   'Муфельді, түтікті, тік және көпұясты пештер 1800°C дейін.',
   'Muffle, tube, vertical and multi-position furnaces up to 1800°C.'),

  ('mills',
   'Измельчение и разделение',
   'Ұсату және бөлу',
   'Milling & Separation',
   'Шаровые мельницы горизонтальные и планетарные, вибрационные ситовые анализаторы.',
   'Горизонтальды және планеталық шарлы диірмендер, вибрациялық елеуіш анализаторлар.',
   'Horizontal and planetary ball mills, vibratory sieve analyzers.'),

  ('vacuum',
   'Вакуумное оборудование',
   'Вакуумдық жабдықтар',
   'Vacuum Equipment',
   'Вакуумные перчаточные боксы из нержавеющей стали и акрила для работы в инертной атмосфере.',
   'Инертті атмосферада жұмыс жасауға арналған болат және акрил вакуумды қолғап жәшіктері.',
   'Stainless steel and acrylic vacuum glove boxes for inert atmosphere work.'),

  ('electrospinning',
   'Электроспиннинг',
   'Электроспиннинг',
   'Electrospinning',
   'Лабораторные установки электроспиннинга для получения нановолокон полимеров и керамик.',
   'Полимерлер мен керамиканың нанотолқындарын алуға арналған электроспиннинг қондырғылары.',
   'Laboratory electrospinning units for polymer and ceramic nanofiber production.'),

  ('furniture',
   'Лабораторная мебель',
   'Зертханалық жиhаз',
   'Laboratory Furniture',
   'Вытяжные и газовые шкафы, лабораторные столы, островные столы, антивибрационные столы.',
   'Сорғыш және газ шкафтары, зертханалық үстелдер, арал үстелдер, антивибрациялық үстелдер.',
   'Fume hoods, gas cabinets, lab tables, island tables, anti-vibration tables.'),

  ('accessories',
   'Комплектующие и аксессуары',
   'Жинақтаушылар мен аксессуарлар',
   'Components & Accessories',
   'Нагревательные плиты, блоки управления температурой, системы подачи газа, термопласты.',
   'Жылыту плиталары, температура басқару блоктары, газ беру жүйелері.',
   'Heating plates, temperature controllers, gas supply systems, thermoplasters.');

-- ============================================================
-- ПЕЧИ — Муфельные (SFM)
-- ============================================================
INSERT INTO products (slug, category_id, name_ru, name_kk, name_en, model, description_ru, description_en, availability, barcode, images, specs, bulk_threshold, bulk_discount_percent) VALUES

('bs-mf1000c-1l',
 (SELECT id FROM categories WHERE slug='furnaces'),
 'Муфельная печь BS-MF1000C1L',
 'Муфельді пеш BS-MF1000C1L',
 'Muffle Furnace BS-MF1000C1L',
 'BS-MF1000C1L',
 'Лабораторная муфельная печь с максимальной температурой 1000°C и объёмом камеры 1 литр. Корпус из нержавеющей стали. Идеальна для озоления, отжига и термической обработки малых образцов.',
 'Laboratory muffle furnace with maximum temperature 1000°C and 1L chamber volume. Stainless steel body.',
 'in_stock', '4650100000001', '{}',
 '{"Макс. температура": "1000°C", "Объём камеры": "1 л", "Размер рабочей зоны": "100×100×100 мм", "Материал камеры": "Керамика Al₂O₃", "Мощность": "1.5 кВт", "Напряжение": "220В / 50Гц", "Точность регулировки": "±1°C", "Тип контроллера": "PID", "Вес": "15 кг"}',
 2, 5),

('bs-mf1200c-2l',
 (SELECT id FROM categories WHERE slug='furnaces'),
 'Муфельная печь BS-MF1200C2L',
 'Муфельді пеш BS-MF1200C2L',
 'Muffle Furnace BS-MF1200C2L',
 'BS-MF1200C2L',
 'Муфельная печь с максимальной температурой 1200°C и объёмом камеры 2 литра. Рабочая зона 200×120×80 мм. Нержавеющий корпус, керамическая камера.',
 'Muffle furnace 1200°C, 2L chamber. Working zone 200×120×80 mm.',
 'in_stock', '4650100000002', '{}',
 '{"Макс. температура": "1200°C", "Объём камеры": "2 л", "Размер рабочей зоны": "200×120×80 мм", "Материал камеры": "Керамика Al₂O₃", "Мощность": "2 кВт", "Напряжение": "220В / 50Гц", "Точность регулировки": "±1°C", "Вес": "20 кг"}',
 2, 5),

('bs-mf1200c-4-5l',
 (SELECT id FROM categories WHERE slug='furnaces'),
 'Муфельная печь BS-MF1200C4.5L',
 'Муфельді пеш BS-MF1200C4.5L',
 'Muffle Furnace BS-MF1200C4.5L',
 'BS-MF1200C4.5L',
 'Муфельная печь 1200°C объёмом 4.5 литра — наиболее популярная модель для лабораторий. Рабочая зона 200×150×150 мм. Мощность 2.5 кВт.',
 'Most popular lab muffle furnace, 1200°C, 4.5L, working zone 200×150×150 mm.',
 'in_stock', '4650100000003', '{}',
 '{"Макс. температура": "1200°C", "Объём камеры": "4.5 л", "Размер рабочей зоны": "200×150×150 мм", "Материал камеры": "Керамика Al₂O₃", "Мощность": "2.5 кВт", "Напряжение": "220В / 50Гц", "Точность регулировки": "±1°C", "Тип контроллера": "PID 30-сегментный", "Вес": "25 кг"}',
 2, 8),

('bs-mf1200c-7-2l',
 (SELECT id FROM categories WHERE slug='furnaces'),
 'Муфельная печь BS-MF1200C7.2L',
 'Муфельді пеш BS-MF1200C7.2L',
 'Muffle Furnace BS-MF1200C7.2L',
 'BS-MF1200C7.2L',
 'Лабораторная муфельная печь 1200°C объёмом 7.2 литра. Рабочая зона 300×200×120 мм — для обработки крупных образцов.',
 'Muffle furnace 1200°C, 7.2L. Working zone 300×200×120 mm for large samples.',
 'in_stock', '4650100000004', '{}',
 '{"Макс. температура": "1200°C", "Объём камеры": "7.2 л", "Размер рабочей зоны": "300×200×120 мм", "Материал камеры": "Керамика Al₂O₃", "Мощность": "3 кВт", "Напряжение": "220В / 50Гц", "Точность регулировки": "±1°C", "Вес": "35 кг"}',
 2, 5),

('bs-mf1200c-10l',
 (SELECT id FROM categories WHERE slug='furnaces'),
 'Муфельная печь BS-MF-1200C10L',
 'Муфельді пеш BS-MF-1200C10L',
 'Muffle Furnace BS-MF-1200C10L',
 'BS-MF-1200C10L',
 'Муфельная печь 1200°C объёмом 10 литров. Рабочая зона 250×200×200 мм. Оснащена 30-сегментным PID контроллером.',
 'Muffle furnace 1200°C, 10L. Working zone 250×200×200 mm.',
 'in_stock', '4650100000005', '{}',
 '{"Макс. температура": "1200°C", "Объём камеры": "10 л", "Размер рабочей зоны": "250×200×200 мм", "Материал камеры": "Керамика Al₂O₃", "Мощность": "4 кВт", "Напряжение": "220В / 50Гц", "Точность регулировки": "±1°C", "Тип контроллера": "PID 30-сегментный", "Вес": "45 кг"}',
 1, 5),

('bs-mf1200c-12l',
 (SELECT id FROM categories WHERE slug='furnaces'),
 'Муфельная печь BS-MF1200C12L',
 'Муфельді пеш BS-MF1200C12L',
 'Muffle Furnace BS-MF1200C12L',
 'BS-MF1200C12L',
 'Самая объёмная модель в линейке муфельных печей — 12 литров при температуре до 1200°C. Рабочая зона 300×200×200 мм.',
 'Largest muffle furnace in the lineup — 12L at up to 1200°C. Working zone 300×200×200 mm.',
 'in_stock', '4650100000006', '{}',
 '{"Макс. температура": "1200°C", "Объём камеры": "12 л", "Размер рабочей зоны": "300×200×200 мм", "Материал камеры": "Керамика Al₂O₃", "Мощность": "5 кВт", "Напряжение": "220В / 50Гц", "Точность регулировки": "±1°C", "Вес": "55 кг"}',
 1, 5),

-- ============================================================
-- ПЕЧИ — Трубчатые горизонтальные (SFTH)
-- ============================================================
('bs-1htf1200a',
 (SELECT id FROM categories WHERE slug='furnaces'),
 'Трубчатая печь BS-1HTF1200A (1 зона, D60–100мм)',
 'Түтікті пеш BS-1HTF1200A (1 аймақ, D60–100мм)',
 'Tube Furnace BS-1HTF1200A (1 zone, D60–100mm)',
 'BS-1HTF1200A',
 'Горизонтальная однозонная трубчатая печь 1200°C с диаметром рабочей трубы 60–100 мм и длиной зоны нагрева 440 мм. Кварцевая или глинозёмная труба опционально.',
 'Horizontal single-zone tube furnace 1200°C, tube diameter 60–100mm, heating zone length 440mm.',
 'in_stock', '4650100000007', '{}',
 '{"Макс. температура": "1200°C", "Кол-во зон": "1", "Диаметр трубы": "60–100 мм", "Длина зоны нагрева": "440 мм", "Тип трубы": "Кварц / Al₂O₃", "Мощность": "3 кВт", "Точность": "±1°C", "Вес": "40 кг"}',
 1, 5),

('bs-1htf1100d',
 (SELECT id FROM categories WHERE slug='furnaces'),
 'Трубчатая печь BS-1HTF1100D (1 зона, D25–40мм)',
 'Түтікті пеш BS-1HTF1100D (1 аймақ, D25–40мм)',
 'Tube Furnace BS-1HTF1100D (1 zone, D25–40mm)',
 'BS-1HTF1100D',
 'Горизонтальная однозонная трубчатая печь 1100°C с трубой малого диаметра (25–40 мм) и зоной нагрева 210 мм. Компактная, для прецизионных процессов.',
 'Single-zone tube furnace 1100°C, small tube D25–40mm, heating zone 210mm.',
 'in_stock', '4650100000008', '{}',
 '{"Макс. температура": "1100°C", "Кол-во зон": "1", "Диаметр трубы": "25–40 мм", "Длина зоны нагрева": "210 мм", "Мощность": "1.5 кВт", "Точность": "±1°C", "Вес": "22 кг"}',
 2, 5),

('bs-2htf1100e',
 (SELECT id FROM categories WHERE slug='furnaces'),
 'Трубчатая печь BS-2HTF1100E (2 зоны, D25–40мм)',
 'Түтікті пеш BS-2HTF1100E (2 аймақ)',
 'Tube Furnace BS-2HTF1100E (2 zones, D25–40mm)',
 'BS-2HTF1100E',
 'Горизонтальная двухзонная трубчатая печь 1100°C с диаметром трубы 25–40 мм и суммарной длиной зоны нагрева 430 мм. Независимое управление двумя зонами.',
 'Dual-zone tube furnace 1100°C, tube D25–40mm, total heating length 430mm.',
 'in_stock', '4650100000009', '{}',
 '{"Макс. температура": "1100°C", "Кол-во зон": "2", "Диаметр трубы": "25–40 мм", "Длина зоны нагрева": "430 мм", "Мощность": "2.5 кВт", "Точность": "±1°C", "Управление зонами": "Независимое", "Вес": "32 кг"}',
 1, 5),

('bs-3htf1200b',
 (SELECT id FROM categories WHERE slug='furnaces'),
 'Трубчатая печь BS-3HTF1200B (3 зоны, D70–100мм)',
 'Түтікті пеш BS-3HTF1200B (3 аймақ)',
 'Tube Furnace BS-3HTF1200B (3 zones, D70–100mm)',
 'BS-3HTF1200B',
 'Горизонтальная трёхзонная трубчатая печь 1200°C с трубой большого диаметра (70–100 мм) и длиной зоны нагрева 690 мм. Три независимых PID-контроллера.',
 'Three-zone tube furnace 1200°C, D70–100mm, 690mm heating length. Three independent PIDs.',
 'on_order', '4650100000010', '{}',
 '{"Макс. температура": "1200°C", "Кол-во зон": "3", "Диаметр трубы": "70–100 мм", "Длина зоны нагрева": "690 мм", "Мощность": "6 кВт", "Точность": "±1°C", "Вес": "80 кг"}',
 1, 5),

('bs-mptf-1200a',
 (SELECT id FROM categories WHERE slug='furnaces'),
 'Мультипозиционная трубчатая печь BS-MPTF-1200A',
 'Көпұясты түтікті пеш BS-MPTF-1200A',
 'Multi-Position Tube Furnace BS-MPTF-1200A',
 'BS-MPTF-1200A',
 'Мультипозиционная трубчатая печь 1200°C с реактором среднего диаметра D60мм. Позволяет одновременно обрабатывать несколько образцов в разных атмосферах.',
 'Multi-position tube furnace 1200°C, medium reactor D60mm. Process multiple samples simultaneously.',
 'on_order', '4650100000011', '{}',
 '{"Макс. температура": "1200°C", "Тип": "Мультипозиционная", "Диаметр реактора": "60 мм", "Мощность": "4 кВт", "Точность": "±1°C"}',
 1, 0),

('bs-vtf-1200a',
 (SELECT id FROM categories WHERE slug='furnaces'),
 'Вертикальная трубчатая печь BS-VTF-1200A',
 'Тік түтікті пеш BS-VTF-1200A',
 'Vertical Tube Furnace BS-VTF-1200A',
 'BS-VTF-1200A',
 'Вертикальная трубчатая печь 1200°C с диаметром зоны нагрева 120 мм и длиной 700 мм. Используется для синтеза и отжига в вертикальном положении.',
 'Vertical tube furnace 1200°C, D120mm heating zone, 700mm length.',
 'on_order', '4650100000012', '{}',
 '{"Макс. температура": "1200°C", "Ориентация": "Вертикальная", "Диаметр зоны нагрева": "120 мм", "Длина зоны нагрева": "700 мм", "Мощность": "4 кВт"}',
 1, 0),

('bs-do80l',
 (SELECT id FROM categories WHERE slug='furnaces'),
 'Сушильный шкаф BS-DO80L',
 'Кептіру шкафы BS-DO80L',
 'Drying Oven BS-DO80L',
 'BS-DO80L',
 'Лабораторный сушильный шкаф с принудительной конвекцией. Объём 80 литров. Диапазон температур до 300°C. Цифровое управление.',
 'Lab drying oven with forced convection, 80L, up to 300°C.',
 'in_stock', '4650100000013', '{}',
 '{"Объём": "80 л", "Макс. температура": "300°C", "Тип циркуляции": "Принудительная конвекция", "Точность": "±1°C", "Мощность": "2 кВт", "Напряжение": "220В / 50Гц"}',
 2, 5),

-- ============================================================
-- ИЗМЕЛЬЧЕНИЕ И РАЗДЕЛЕНИЕ
-- ============================================================
('bs-ballmill-1',
 (SELECT id FROM categories WHERE slug='mills'),
 'Шаровая мельница BS-BALLMILL-1 (открытая)',
 'Шарлы диірмен BS-BALLMILL-1 (ашық)',
 'Ball Mill BS-BALLMILL-1 (open)',
 'BS-BALLMILL-1',
 'Горизонтальная лабораторная шаровая мельница открытого типа. Габариты 828×570×667 мм. Объём барабанов от 0.5 до 10 литров.',
 'Horizontal open-type laboratory ball mill. Dimensions 828×570×667mm, drum volume 0.5–10L.',
 'in_stock', '4650200000001', '{}',
 '{"Тип": "Горизонтальная открытая", "Объём барабана": "0.5–10 л", "Габариты": "828×570×667 мм", "Скорость вращения": "50–400 об/мин", "Мощность": "0.25 кВт", "Вес": "60 кг"}',
 2, 8),

('bs-ballmill-2',
 (SELECT id FROM categories WHERE slug='mills'),
 'Шаровая мельница BS-BALLMILL-2 (закрытая)',
 'Шарлы диірмен BS-BALLMILL-2 (жабық)',
 'Ball Mill BS-BALLMILL-2 (closed)',
 'BS-BALLMILL-2',
 'Горизонтальная лабораторная шаровая мельница закрытого типа. Габариты 1000×430×350 мм. Защищённый корпус для работы с пылящими материалами.',
 'Horizontal closed-type ball mill. Dimensions 1000×430×350mm.',
 'in_stock', '4650200000002', '{}',
 '{"Тип": "Горизонтальная закрытая", "Объём барабана": "1–20 л", "Габариты": "1000×430×350 мм", "Скорость вращения": "50–400 об/мин", "Мощность": "0.37 кВт", "Вес": "75 кг"}',
 2, 8),

('bs-pballmill',
 (SELECT id FROM categories WHERE slug='mills'),
 'Планетарная шаровая мельница BS-PBALLMILL',
 'Планеталық шарлы диірмен BS-PBALLMILL',
 'Planetary Ball Mill BS-PBALLMILL',
 'BS-PBALLMILL',
 'Лабораторная планетарная шаровая мельница для тонкого и сверхтонкого измельчения материалов. Четыре рабочих места, объём чаш 50–500 мл.',
 'Planetary ball mill for fine and ultrafine grinding. 4 working positions, bowl volume 50–500ml.',
 'in_stock', '4650200000003', '{}',
 '{"Тип": "Планетарная", "Кол-во позиций": "4", "Объём чаш": "50–500 мл", "Скорость вращения": "100–650 об/мин", "Мощность": "0.75 кВт", "Макс. крупность питания": "10 мм"}',
 2, 8),

('bs-vibsieve-1',
 (SELECT id FROM categories WHERE slug='mills'),
 'Лабораторный ситовой анализатор BS-VIBSIEVE-1',
 'Зертханалық елеуіш анализатор BS-VIBSIEVE-1',
 'Vibratory Sieve Analyzer BS-VIBSIEVE-1',
 'BS-VIBSIEVE-1',
 'Лабораторный вибрационный ситовой анализатор для гранулометрического анализа порошков и сыпучих материалов. Габариты 385×303×700 мм.',
 'Vibratory sieve analyzer for particle size analysis. Dimensions 385×303×700mm.',
 'in_stock', '4650200000004', '{}',
 '{"Тип": "Вибрационный", "Диаметр сит": "200 мм", "Кол-во сит (макс)": "8", "Амплитуда": "0–3 мм", "Мощность": "0.18 кВт", "Габариты": "385×303×700 мм", "Вес": "25 кг"}',
 3, 5),

-- ============================================================
-- ВАКУУМНОЕ ОБОРУДОВАНИЕ
-- ============================================================
('bs-vgb-3',
 (SELECT id FROM categories WHERE slug='vacuum'),
 'Вакуумный перчаточный бокс BS-VGB-3',
 'Вакуумды қолғап жәшігі BS-VGB-3',
 'Vacuum Glove Box BS-VGB-3',
 'BS-VGB-3',
 'Вакуумный перчаточный бокс из нержавеющей стали 304 с двумя рукавами для работы в инертной атмосфере. Габариты рабочей зоны 780×720×660 мм.',
 'Stainless steel 304 vacuum glove box, 2 glove ports. Working zone 780×720×660mm.',
 'in_stock', '4650300000001', '{}',
 '{"Размер рабочей зоны": "780×720×660 мм", "Материал": "Нержавеющая сталь 304", "Кол-во рукавов": "2", "Остаточное давление": "≤1 Па", "Газ заполнения": "Ar / N₂", "Влажность (норм.)": "<1 ppm", "Кислород (норм.)": "<1 ppm", "Вес": "200 кг"}',
 1, 0),

('bs-agb',
 (SELECT id FROM categories WHERE slug='vacuum'),
 'Акриловый перчаточный ящик BS-AGB',
 'Акрилді қолғап жәшігі BS-AGB',
 'Acrylic Glove Box BS-AGB',
 'BS-AGB',
 'Перчаточный ящик из прозрачного акрила для работы в инертной атмосфере или при пониженном давлении. Лёгкий, компактный, полностью прозрачный.',
 'Transparent acrylic glove box for inert atmosphere work. Lightweight and compact.',
 'in_stock', '4650300000002', '{}',
 '{"Материал": "Акрил прозрачный", "Кол-во рукавов": "2", "Давление": "атмосферное / пониженное", "Прозрачность": "100%"}',
 2, 5),

-- ============================================================
-- ЭЛЕКТРОСПИННИНГ
-- ============================================================
('bs-es-a',
 (SELECT id FROM categories WHERE slug='electrospinning'),
 'Установка электроспиннинга BS-ES-A',
 'Электроспиннинг қондырғысы BS-ES-A',
 'Electrospinning Unit BS-ES-A',
 'BS-ES-A',
 'Лабораторная установка для электроспиннинга и электрораспыления. Высоковольтный источник 0–30 кВ, шприцевый насос 0.001–99.99 мл/ч, коллектор вращающийся/плоский.',
 'Lab electrospinning unit. HV source 0–30kV, syringe pump 0.001–99.99 ml/h, rotating/flat collector.',
 'on_order', '4650400000001', '{}',
 '{"Высокое напряжение": "0–30 кВ", "Скорость подачи": "0.001–99.99 мл/ч", "Тип коллектора": "Вращающийся / Плоский", "Программирование": "Компьютерное управление", "Макс. ток": "5 мА"}',
 1, 0),

-- ============================================================
-- ЛАБОРАТОРНАЯ МЕБЕЛЬ
-- ============================================================
('bs-fh1-5',
 (SELECT id FROM categories WHERE slug='furniture'),
 'Вытяжной шкаф BS-FH1.5 (1500 мм)',
 'Сорғыш шкаф BS-FH1.5 (1500 мм)',
 'Fume Hood BS-FH1.5 (1500mm)',
 'BS-FH1.5',
 'Лабораторный вытяжной шкаф шириной 1500 мм. Габариты 1500×850×2350 мм. Столешница из гранита или полимера. Возможна комплектация раковиной.',
 'Lab fume hood, 1500mm wide. Dimensions 1500×850×2350mm. Granite or polymer worktop. Optional sink.',
 'in_stock', '4650500000001', '{}',
 '{"Ширина": "1500 мм", "Габариты": "1500×850×2350 мм", "Столешница": "Гранит или полимер", "Вытяжная система": "Механическая", "Подсветка": "LED", "Материал корпуса": "Нержавеющая сталь"}',
 1, 0),

('bs-fh1-8',
 (SELECT id FROM categories WHERE slug='furniture'),
 'Вытяжной шкаф BS-FH1.8 (1800 мм)',
 'Сорғыш шкаф BS-FH1.8 (1800 мм)',
 'Fume Hood BS-FH1.8 (1800mm)',
 'BS-FH1.8',
 'Лабораторный вытяжной шкаф шириной 1800 мм. Габариты 1800×850×2350 мм. Расширенное рабочее пространство для двух операторов.',
 'Lab fume hood, 1800mm wide. Dimensions 1800×850×2350mm. Extended workspace for two operators.',
 'in_stock', '4650500000002', '{}',
 '{"Ширина": "1800 мм", "Габариты": "1800×850×2350 мм", "Столешница": "Гранит или полимер", "Вытяжная система": "Механическая", "Подсветка": "LED"}',
 1, 0),

('bs-gc1',
 (SELECT id FROM categories WHERE slug='furniture'),
 'Газовый шкаф BS-GC1 (однобаллонный)',
 'Газ шкафы BS-GC1 (бірбаллонды)',
 'Gas Cabinet BS-GC1 (single cylinder)',
 'BS-GC1',
 'Однобаллонный газовый шкаф для безопасного хранения баллонов со сжатым газом. Габариты 400×450×2000 мм. Вентиляционная система.',
 'Single-cylinder gas cabinet for safe compressed gas storage. 400×450×2000mm.',
 'in_stock', '4650500000003', '{}',
 '{"Тип": "Однобаллонный", "Габариты": "400×450×2000 мм", "Макс. давление баллона": "300 бар", "Материал": "Сталь с порошковым покрытием", "Вентиляция": "Принудительная"}',
 2, 5),

('bs-gc2',
 (SELECT id FROM categories WHERE slug='furniture'),
 'Газовый шкаф BS-GC2 (двухбаллонный)',
 'Газ шкафы BS-GC2 (екібаллонды)',
 'Gas Cabinet BS-GC2 (dual cylinder)',
 'BS-GC2',
 'Двухбаллонный газовый шкаф. Вмещает два стандартных баллона. Аварийная сигнализация утечки газа.',
 'Dual-cylinder gas cabinet. Holds two standard cylinders. Gas leak alarm.',
 'in_stock', '4650500000004', '{}',
 '{"Тип": "Двухбаллонный", "Кол-во баллонов": "2", "Материал": "Сталь с порошковым покрытием", "Сигнализация": "Утечка газа", "Вентиляция": "Принудительная"}',
 2, 5),

('bs-lt-1-5a',
 (SELECT id FROM categories WHERE slug='furniture'),
 'Лабораторный стол BS-LT-1.5A (1500×600, без полок)',
 'Зертханалық үстел BS-LT-1.5A',
 'Lab Table BS-LT-1.5A (1500×600, no shelves)',
 'BS-LT-1.5A',
 'Лабораторный стол без полок. Размеры рабочей поверхности 1500×600 мм, высота 900 мм (регулируемая до 800). Нержавеющая сталь.',
 'Lab table without shelves. Top 1500×600mm, height 900mm (adjustable to 800mm).',
 'in_stock', '4650500000005', '{}',
 '{"Ширина × Глубина": "1500×600 мм", "Высота": "900 мм (регул. до 800 мм)", "Полки": "Нет", "Материал": "Нержавеющая сталь", "Нагрузка": "300 кг"}',
 3, 5),

('bs-lt-1-5b',
 (SELECT id FROM categories WHERE slug='furniture'),
 'Лабораторный стол BS-LT-1.5B (1500×800, без полок)',
 'Зертханалық үстел BS-LT-1.5B',
 'Lab Table BS-LT-1.5B (1500×800, no shelves)',
 'BS-LT-1.5B',
 'Лабораторный стол без полок с увеличенной глубиной 800 мм. Размеры 1500×800 мм, высота 900 мм.',
 'Wide lab table, 1500×800mm, no shelves, height 900mm.',
 'in_stock', '4650500000006', '{}',
 '{"Ширина × Глубина": "1500×800 мм", "Высота": "900 мм", "Полки": "Нет", "Материал": "Нержавеющая сталь", "Нагрузка": "350 кг"}',
 3, 5),

('bs-lt-1-5sa',
 (SELECT id FROM categories WHERE slug='furniture'),
 'Лабораторный стол BS-LT-1.5SA (1500×600, с полками)',
 'Зертханалық үстел BS-LT-1.5SA',
 'Lab Table BS-LT-1.5SA (1500×600, with shelves)',
 'BS-LT-1.5SA',
 'Лабораторный стол с навесными полками. Размеры столешницы 1500×600 мм.',
 'Lab table with overhead shelves. Tabletop 1500×600mm.',
 'in_stock', '4650500000007', '{}',
 '{"Ширина × Глубина": "1500×600 мм", "Высота": "800 мм", "Полки": "Есть (2 ряда)", "Материал": "Нержавеющая сталь"}',
 3, 5),

('bs-lt-1-5sb',
 (SELECT id FROM categories WHERE slug='furniture'),
 'Лабораторный стол BS-LT-1.5SB (1500×800, с полками)',
 'Зертханалық үстел BS-LT-1.5SB',
 'Lab Table BS-LT-1.5SB (1500×800, with shelves)',
 'BS-LT-1.5SB',
 'Лабораторный стол с навесными полками и увеличенной глубиной столешницы 800 мм.',
 'Wide lab table with overhead shelves. Tabletop 1500×800mm.',
 'in_stock', '4650500000008', '{}',
 '{"Ширина × Глубина": "1500×800 мм", "Высота": "800 мм", "Полки": "Есть (2 ряда)", "Материал": "Нержавеющая сталь"}',
 3, 5),

('bs-avt-1',
 (SELECT id FROM categories WHERE slug='furniture'),
 'Антивибрационный стол BS-AVT-1',
 'Антивибрациялық үстел BS-AVT-1',
 'Anti-Vibration Table BS-AVT-1',
 'BS-AVT-1',
 'Антивибрационный лабораторный стол для микроскопии и прецизионных измерений. Размер столешницы 750×600 мм.',
 'Anti-vibration lab table for microscopy and precision measurements. Tabletop 750×600mm.',
 'in_stock', '4650500000009', '{}',
 '{"Размер столешницы": "750×600 мм", "Тип изоляции": "Пневматическая + активная", "Применение": "Микроскопия, АСМ, СЭМ", "Нагрузка": "100 кг"}',
 2, 5),

('bs-t-gms1',
 (SELECT id FROM categories WHERE slug='furniture'),
 'Многофункциональный стол с газовыми подводами BS-T-GMS1',
 'Газ жеткізуі бар көпфункциялы үстел BS-T-GMS1',
 'Multi-Function Table with Gas Supply BS-T-GMS1',
 'BS-T-GMS1',
 'Лабораторный островной стол с встроенными газовыми подводами для Ar, N₂, воздуха и вакуума. Нержавеющая столешница.',
 'Island lab table with built-in gas supplies (Ar, N₂, air, vacuum). Stainless steel top.',
 'on_order', '4650500000010', '{}',
 '{"Тип": "Островной с газовыми подводами", "Газы": "Ar / N₂ / воздух / вакуум", "Столешница": "Нержавеющая сталь", "Размер": "1500×900 мм"}',
 1, 0),

('bs-ilt1-5a',
 (SELECT id FROM categories WHERE slug='furniture'),
 'Островной лабораторный стол BS-ILT1.5A (без полок)',
 'Арал зертханалық үстел BS-ILT1.5A',
 'Island Laboratory Table BS-ILT1.5A (no shelves)',
 'BS-ILT1.5A',
 'Лабораторный островной стол шириной 1500 мм без полок. Двусторонний доступ, нержавеющая столешница.',
 'Island lab table, 1500mm wide, no shelves. Double-sided access, stainless steel top.',
 'in_stock', '4650500000011', '{}',
 '{"Ширина": "1500 мм", "Доступ": "Двусторонний", "Полки": "Нет", "Столешница": "Нержавеющая сталь"}',
 2, 5),

-- ============================================================
-- КОМПЛЕКТУЮЩИЕ И АКСЕССУАРЫ
-- ============================================================
('bs-hp-1',
 (SELECT id FROM categories WHERE slug='accessories'),
 'Нагревательная плита BS-HP-1',
 'Жылыту плитасы BS-HP-1',
 'Heating Plate BS-HP-1',
 'BS-HP-1',
 'Лабораторная нагревательная плита с аналоговым управлением температурой. Поверхность из анодированного алюминия или нержавеющей стали.',
 'Lab heating plate with analog temperature control. Anodized aluminum or stainless steel surface.',
 'in_stock', '4650600000001', '{}',
 '{"Макс. температура": "350°C", "Размер поверхности": "200×200 мм", "Мощность": "0.6 кВт", "Управление": "Аналоговое / цифровое"}',
 5, 10),

('bs-atcu-40a',
 (SELECT id FROM categories WHERE slug='accessories'),
 'Блок управления температурой BS-ATCU-40А (220В / 40А)',
 'Температура басқару блогы BS-ATCU-40А',
 'Temperature Control Unit BS-ATCU-40A (220V / 40A)',
 'BS-ATCU-40А',
 'Блок управления температурой мощностью до 40А (220В). PID-регулятор, термопара типа K. Подходит для управления мощными нагревательными элементами.',
 'Temperature control unit up to 40A (220V). PID controller, type K thermocouple.',
 'in_stock', '4650600000002', '{}',
 '{"Напряжение": "220В", "Макс. ток": "40А", "Тип контроллера": "PID", "Термопара": "Тип K", "Точность": "±0.5°C"}',
 3, 8),

('bs-btcu-20a',
 (SELECT id FROM categories WHERE slug='accessories'),
 'Блок управления температурой BS-BTCU-20А (220В / 20А)',
 'Температура басқару блогы BS-BTCU-20А',
 'Temperature Control Unit BS-BTCU-20A (220V / 20A)',
 'BS-BTCU-20А',
 'Компактный блок управления температурой 20А (220В). PID-регулятор, термопара типа K.',
 'Compact temperature control unit 20A (220V). PID controller, type K thermocouple.',
 'in_stock', '4650600000003', '{}',
 '{"Напряжение": "220В", "Макс. ток": "20А", "Тип контроллера": "PID", "Термопара": "Тип K", "Точность": "±0.5°C"}',
 3, 8),

('bs-gss-2',
 (SELECT id FROM categories WHERE slug='accessories'),
 'Двухканальная система подачи газа BS-GSS-2',
 'Екіканалды газ беру жүйесі BS-GSS-2',
 'Dual-Channel Gas Supply System BS-GSS-2',
 'BS-GSS-2',
 'Двухканальная система подачи и регулирования газа с массовыми расходомерами. Поддерживает два независимых канала.',
 'Dual-channel gas supply system with mass flow controllers. Two independent channels.',
 'in_stock', '4650600000004', '{}',
 '{"Кол-во каналов": "2", "Тип регулятора": "MFC (массовый расходомер)", "Диапазон расхода": "0–1000 мл/мин", "Газы": "Ar, N₂, H₂, воздух", "Точность": "±1%"}',
 2, 5),

('bs-plast18cc',
 (SELECT id FROM categories WHERE slug='accessories'),
 'Ручной термопласт BS-PLAST18CC (18 см³)',
 'Қолды термопласт BS-PLAST18CC',
 'Manual Desktop Thermoplaster BS-PLAST18CC (18cc)',
 'BS-PLAST18CC',
 'Ручной настольный термопласт объёмом 18 см³ для заливки и монтажа образцов при подготовке к металлографическому анализу.',
 'Manual desktop thermoplaster, 18cc volume for metallographic sample mounting.',
 'in_stock', '4650600000005', '{}',
 '{"Объём камеры": "18 см³", "Макс. температура": "180°C", "Давление": "до 30 МПа", "Применение": "Металлография, пробоподготовка"}',
 3, 5);

-- ============================================================
-- СКЛАД — Начальные остатки
-- ============================================================
INSERT INTO warehouse_items (product_id, barcode, quantity, location)
SELECT id, barcode,
  CASE
    WHEN availability = 'in_stock' AND category_id = (SELECT id FROM categories WHERE slug='furnaces')    THEN floor(random()*5+1)::int
    WHEN availability = 'in_stock' AND category_id = (SELECT id FROM categories WHERE slug='mills')       THEN floor(random()*4+1)::int
    WHEN availability = 'in_stock' AND category_id = (SELECT id FROM categories WHERE slug='vacuum')      THEN floor(random()*3+1)::int
    WHEN availability = 'in_stock' AND category_id = (SELECT id FROM categories WHERE slug='furniture')   THEN floor(random()*6+2)::int
    WHEN availability = 'in_stock' AND category_id = (SELECT id FROM categories WHERE slug='accessories') THEN floor(random()*15+3)::int
    ELSE 0
  END,
  CASE
    WHEN category_id = (SELECT id FROM categories WHERE slug='furnaces')    THEN 'Склад А-1 (Печи)'
    WHEN category_id = (SELECT id FROM categories WHERE slug='mills')       THEN 'Склад А-2 (Мельницы)'
    WHEN category_id = (SELECT id FROM categories WHERE slug='vacuum')      THEN 'Склад Б-1 (Вакуум)'
    WHEN category_id = (SELECT id FROM categories WHERE slug='electrospinning') THEN 'Склад Б-2 (Спиннинг)'
    WHEN category_id = (SELECT id FROM categories WHERE slug='furniture')   THEN 'Склад В-1 (Мебель)'
    WHEN category_id = (SELECT id FROM categories WHERE slug='accessories') THEN 'Склад В-2 (Комплект.)'
    ELSE 'Склад A'
  END
FROM products
WHERE barcode IS NOT NULL;

SELECT
  c.name_ru AS категория,
  COUNT(p.id) AS товаров
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.name_ru
ORDER BY c.name_ru;
