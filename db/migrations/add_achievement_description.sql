-- Migration: achievements can carry a description too, same as patents,
-- shown when the card is clicked open on the public science page.
-- Run on VPS: bash scripts/migrate.sh add_achievement_description

ALTER TABLE science_achievements ADD COLUMN IF NOT EXISTS description TEXT;
