-- Migration: hero photos of the public pages become editable from the admin
-- panel instead of being baked into the source.
-- Run on VPS: bash scripts/migrate.sh page_images

CREATE TABLE IF NOT EXISTS page_images (
  page       TEXT PRIMARY KEY,
  image_url  TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO page_images (page, image_url) VALUES
  ('nauka',   '/images/nauka-hero-lab.jpg'),
  ('catalog', '/images/catalog-hero-lab.jpg'),
  ('about',   '/images/about-hero.jpg')
ON CONFLICT (page) DO NOTHING;
