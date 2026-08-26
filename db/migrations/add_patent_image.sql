-- Migration: patents can carry a scan/photo like achievements already do,
-- so the "Патенты и авторские права" tab can render as a photo grid instead
-- of a plain text list. Also adds a free-text description, shown when the
-- card is clicked open, same as projects/individual developments.
-- Run on VPS: bash scripts/migrate.sh add_patent_image

ALTER TABLE science_patents ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE science_patents ADD COLUMN IF NOT EXISTS description TEXT;
