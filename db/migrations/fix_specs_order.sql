-- Migration: products.specs was `jsonb`, which does not preserve object key
-- order — Postgres stores jsonb object keys in its own internal sorted
-- order, so the technical-specs rows silently reshuffled themselves on every
-- save/reload regardless of the order staff entered them in. Switching to
-- plain `json` keeps the exact key order as written, so the admin's new
-- up/down reorder arrows actually stick.
--
-- Existing rows already went through at least one jsonb round-trip, so this
-- one-time conversion recovers whatever order Postgres currently has, not
-- necessarily what was originally typed — from this point on, order stays
-- put and the reorder arrows in the product form are the way to fix it.
-- Run on VPS: bash scripts/migrate.sh fix_specs_order

ALTER TABLE products ALTER COLUMN specs TYPE json USING specs::json;
