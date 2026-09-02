-- Migration: "Под заказ" products can carry an individually prepared
-- questionnaire (опросный лист) that customers download from the product
-- page, fill out, and send back. Also tracks the filled-out submissions
-- customers send back through the product page.
-- Run on VPS: bash scripts/migrate.sh add_product_questionnaire

ALTER TABLE products ADD COLUMN IF NOT EXISTS questionnaire_url TEXT;

CREATE TABLE IF NOT EXISTS questionnaire_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  company       TEXT,
  position      TEXT,
  phone         TEXT,
  email         TEXT NOT NULL,
  file_url      TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_questionnaire_submissions_created ON questionnaire_submissions(created_at DESC);
