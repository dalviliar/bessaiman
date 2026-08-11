-- Migration: science projects carry a photo gallery instead of a single image.
-- Existing covers are moved into the array, then the old column is dropped.
-- Run on VPS AFTER `npm run build`, right before `pm2 restart`:
--   psql $DATABASE_URL -f /var/www/bes-saiman.kz/db/migrations/add_science_project_images.sql

ALTER TABLE science_projects ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';

UPDATE science_projects
   SET images = ARRAY[image_url]
 WHERE image_url IS NOT NULL AND image_url <> '' AND cardinality(images) = 0;

ALTER TABLE science_projects DROP COLUMN IF EXISTS image_url;
