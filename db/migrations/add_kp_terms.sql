-- Migration: the delivery/payment terms printed on every КП become an
-- editable record instead of text hardcoded into the two PDF generators.
-- Run on VPS: bash scripts/migrate.sh add_kp_terms

CREATE TABLE IF NOT EXISTS kp_terms (
  id                 TEXT PRIMARY KEY DEFAULT 'main',
  delivery_in_stock  TEXT NOT NULL DEFAULT '',
  delivery_on_order  TEXT NOT NULL DEFAULT '',
  warranty           TEXT NOT NULL DEFAULT '',
  payment_in_stock   TEXT NOT NULL DEFAULT '',
  payment_on_order   TEXT NOT NULL DEFAULT '',
  validity           TEXT NOT NULL DEFAULT '',
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO kp_terms (
  id, delivery_in_stock, delivery_on_order, warranty, payment_in_stock, payment_on_order, validity
) VALUES (
  'main',
  'Товар в наличии на складе — отгрузка в течение 1–3 рабочих дней',
  'По согласованию, в зависимости от наличия на складе',
  '12 месяцев с момента поставки',
  'Оплата 100% по факту выставления счёта',
  'Предоплата 50%, остаток — по факту готовности товара',
  '30 календарных дней с даты выставления'
)
ON CONFLICT (id) DO NOTHING;
