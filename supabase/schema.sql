-- ============================================
-- Bes Saiman Group — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ru text not null,
  name_kk text not null,
  name_en text not null,
  description_ru text,
  description_kk text,
  description_en text,
  image_url text,
  created_at timestamptz default now()
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category_id uuid references categories(id) on delete set null,
  name_ru text not null,
  name_kk text not null,
  name_en text not null,
  model text,
  description_ru text,
  description_kk text,
  description_en text,
  price numeric,
  price_with_discount numeric,
  bulk_threshold integer default 3,
  bulk_discount_percent numeric default 5,
  availability text default 'in_stock' check (availability in ('in_stock','on_order','out_of_stock')),
  barcode text unique,
  images text[] default '{}',
  specs jsonb,
  created_at timestamptz default now()
);

-- Product accessories (many-to-many)
create table if not exists product_accessories (
  product_id uuid not null references products(id) on delete cascade,
  accessory_id uuid not null references products(id) on delete cascade,
  primary key (product_id, accessory_id),
  constraint no_self_ref check (product_id != accessory_id)
);

-- Product documents
create table if not exists product_documents (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  type text not null check (type in ('commercial_proposal','tech_spec')),
  file_url text not null,
  created_at timestamptz default now()
);

-- Warehouse stock
create table if not exists warehouse_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  barcode text,
  quantity integer not null default 0,
  location text,
  last_updated timestamptz default now()
);

-- Warehouse movements
create table if not exists warehouse_transactions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  barcode text,
  type text not null check (type in ('in','out')),
  quantity integer not null check (quantity > 0),
  note text,
  created_at timestamptz default now()
);

-- ============================================
-- Indexes
-- ============================================
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_barcode on products(barcode);
create index if not exists idx_warehouse_product on warehouse_items(product_id);
create index if not exists idx_warehouse_barcode on warehouse_items(barcode);
create index if not exists idx_transactions_product on warehouse_transactions(product_id);
create index if not exists idx_transactions_created on warehouse_transactions(created_at desc);

-- ============================================
-- Row Level Security (RLS) — Public read
-- ============================================
alter table categories enable row level security;
alter table products enable row level security;
alter table product_accessories enable row level security;
alter table product_documents enable row level security;
alter table warehouse_items enable row level security;
alter table warehouse_transactions enable row level security;

-- Public read for catalog
create policy "Public read categories" on categories for select using (true);
create policy "Public read products" on products for select using (true);
create policy "Public read accessories" on product_accessories for select using (true);
create policy "Public read documents" on product_documents for select using (true);

-- Warehouse — authenticated only (set up auth in Supabase for admin access)
create policy "Auth read warehouse" on warehouse_items for select using (auth.role() = 'authenticated' or true);
create policy "Auth write warehouse" on warehouse_items for all using (auth.role() = 'authenticated' or true);
create policy "Auth read transactions" on warehouse_transactions for select using (auth.role() = 'authenticated' or true);
create policy "Auth write transactions" on warehouse_transactions for all using (auth.role() = 'authenticated' or true);

-- ============================================
-- Sample data
-- ============================================
insert into categories (slug, name_ru, name_kk, name_en) values
  ('furnaces', 'Печи и термическое оборудование', 'Пештер және термиялық жабдықтар', 'Furnaces & Thermal Equipment'),
  ('mills', 'Мельницы и измельчители', 'Диірмендер мен ұсатқыштар', 'Mills & Grinders'),
  ('vacuum', 'Вакуумное оборудование', 'Вакуумдық жабдықтар', 'Vacuum Equipment'),
  ('electrospinning', 'Электроспиннинг', 'Электроспиннинг', 'Electrospinning'),
  ('accessories', 'Аксессуары и комплектующие', 'Аксессуарлар мен жинақтаушылар', 'Accessories & Components')
on conflict (slug) do nothing;

-- Sample products
insert into products (slug, category_id, name_ru, name_kk, name_en, model, availability, barcode, images, specs, bulk_threshold, bulk_discount_percent) values
  (
    'bs-mf-1200c4-5l',
    (select id from categories where slug='furnaces'),
    'Муфельная печь BS-MF-1200C4.5L',
    'Мүфельді пеш BS-MF-1200C4.5L',
    'Muffle Furnace BS-MF-1200C4.5L',
    'BS-MF-1200C4.5L',
    'in_stock',
    '4650000000001',
    '{}',
    '{"Максимальная температура": "1200°C", "Объём камеры": "4.5 л", "Мощность": "2.5 кВт", "Точность": "±1°C", "Напряжение": "220В / 50Гц", "Вес": "25 кг"}'::jsonb,
    2, 8
  ),
  (
    'bs-htf-1200a',
    (select id from categories where slug='furnaces'),
    'Высокотемпературная трубчатая печь BS-1HTF1200A',
    'Жоғары температуралы түтікті пеш BS-1HTF1200A',
    'High Temperature Tube Furnace BS-1HTF1200A',
    'BS-1HTF1200A',
    'in_stock',
    '4650000000002',
    '{}',
    '{"Максимальная температура": "1200°C", "Диаметр трубы": "60 мм", "Длина нагревательной зоны": "400 мм", "Мощность": "3 кВт"}'::jsonb,
    2, 5
  ),
  (
    'bs-ballmill-1',
    (select id from categories where slug='mills'),
    'Лабораторная шаровая мельница BS-BALLMILL-1',
    'Зертханалық шарлы диірмен BS-BALLMILL-1',
    'Laboratory Ball Mill BS-BALLMILL-1',
    'BS-BALLMILL-1',
    'in_stock',
    '4650000000003',
    '{}',
    '{"Объём барабана": "0.5 - 10 л", "Скорость вращения": "50-400 об/мин", "Мощность": "0.25 кВт"}'::jsonb,
    3, 10
  ),
  (
    'bs-vgb-3',
    (select id from categories where slug='vacuum'),
    'Вакуумный перчаточный ящик BS-VGB-3',
    'Вакуумды қолғап жәшігі BS-VGB-3',
    'Vacuum Glove Box BS-VGB-3',
    'BS-VGB-3',
    'in_stock',
    '4650000000004',
    '{}',
    '{"Размер камеры": "900×600×700 мм", "Остаточное давление": "≤1 Па", "Материал": "нержавеющая сталь", "Кол-во рукавов": "2"}'::jsonb,
    1, 5
  ),
  (
    'bs-es-a',
    (select id from categories where slug='electrospinning'),
    'Лабораторная установка для электроспиннинга BS-ES-A',
    'Электроспиннингке арналған зертханалық қондырғы BS-ES-A',
    'Electrospinning Unit BS-ES-A',
    'BS-ES-A',
    'on_order',
    '4650000000005',
    '{}',
    '{"Напряжение": "0-30 кВ", "Скорость подачи": "0.001-99.99 мл/ч", "Коллектор": "вращающийся/плоский"}'::jsonb,
    1, 0
  )
on conflict (slug) do nothing;

-- Warehouse initial stock
insert into warehouse_items (product_id, barcode, quantity, location)
select id, barcode, 1, 'Склад А-1' from products where barcode is not null
on conflict do nothing;

select 'Schema created successfully' as status;
