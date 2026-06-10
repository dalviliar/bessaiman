-- ============================================================
-- Таблица запросов КП (коммерческих предложений)
-- Запускать в Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS kp_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid REFERENCES products(id) ON DELETE SET NULL,
  product_model   text,
  product_name    text,
  kp_number       text,
  client_name     text NOT NULL,
  client_company  text,
  client_email    text,
  client_phone    text,
  quantity        int NOT NULL DEFAULT 1,
  note            text,
  lang            text DEFAULT 'ru',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- RLS: публичная вставка (форма на сайте), чтение только для авторизованных
ALTER TABLE kp_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert kp_requests"
  ON kp_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read kp_requests"
  ON kp_requests FOR SELECT USING (auth.role() = 'authenticated');

-- Индекс для поиска по дате
CREATE INDEX IF NOT EXISTS kp_requests_created_at_idx ON kp_requests (created_at DESC);
