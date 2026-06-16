-- ============================================================
-- Bes Saiman Group — Reclassification of imported product data
-- Run AFTER importing the real `products` rows (with category_id
-- set to NULL, see deploy notes) from the old Supabase database
-- into the new VPS Postgres (which already has db/schema.sql
-- applied, including the 8 classification categories).
--
--   psql "$DATABASE_URL" -f db/data_migration.sql
-- ============================================================

BEGIN;

-- ── product_type ────────────────────────────────────────────
UPDATE products SET product_type = 'S';

UPDATE products SET product_type = 'PA'
WHERE model IN ('BS-HP-1','BS-ATCU-40А','BS-BTCU-20А','BS-GSS-2');

-- ── classification_code ─────────────────────────────────────
UPDATE products SET classification_code = 'SFM'
WHERE model LIKE 'BS-MF%';

UPDATE products SET classification_code = 'SFTH'
WHERE model IN ('BS-1HTF1200A','BS-3HTF1200B','BS-1HTF1100D','BS-2HTF1100E');

UPDATE products SET classification_code = 'SFTV'
WHERE model = 'BS-VTF-1200A';

UPDATE products SET classification_code = 'SFTM'
WHERE model = 'BS-MPTF-1200A';

UPDATE products SET classification_code = 'SM'
WHERE model IN ('BS-BALLMILL-1','BS-BALLMILL-2','BS-PBALLMILL');

UPDATE products SET classification_code = 'SV'
WHERE model = 'BS-VIBSIEVE-1';

UPDATE products SET classification_code = 'SS'
WHERE model IN ('BS-ES-A','BS-VGB-3','BS-AGB','BS-PLAST18CC');

UPDATE products SET classification_code = 'FUR'
WHERE model IN (
  'BS-FH1.5','BS-FH1.8','BS-GC1','BS-GC2','BS-DO80L',
  'BS-LT-1.5A','BS-LT-1.5B','BS-LT-1.5SA','BS-LT-1.5SB',
  'BS-AVT-1','BS-T-GMS1','BS-ILT1.5A'
);

UPDATE products SET classification_code = 'PA'
WHERE model IN ('BS-HP-1','BS-ATCU-40А','BS-BTCU-20А','BS-GSS-2');

-- ── compatible_with (accessories → which serial types they fit) ─
UPDATE products SET compatible_with = ARRAY['SFM','SFTH','SFTV','SFTM']
WHERE model IN ('BS-ATCU-40А','BS-BTCU-20А');

UPDATE products SET compatible_with = ARRAY['SFM','SFTH','SFTV','SFTM']
WHERE model = 'BS-HP-1';

UPDATE products SET compatible_with = ARRAY['SFTH','SFTV','SFTM','SS']
WHERE model = 'BS-GSS-2';

-- ── Drop BS-VTF-1200C (not in the Excel catalog) ─────────────
DO $$
DECLARE v_id uuid;
BEGIN
  SELECT id INTO v_id FROM products WHERE model = 'BS-VTF-1200C';
  IF v_id IS NOT NULL THEN
    DELETE FROM warehouse_transactions WHERE product_id = v_id;
    DELETE FROM warehouse_items        WHERE product_id = v_id;
    DELETE FROM product_accessories    WHERE product_id = v_id OR accessory_id = v_id;
    DELETE FROM products WHERE id = v_id;
    RAISE NOTICE 'BS-VTF-1200C removed';
  END IF;
END $$;

-- ── Re-link products to the new classification categories ──
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'sfm')       WHERE classification_code = 'SFM';
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'sfth')      WHERE classification_code = 'SFTH';
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'sftv')      WHERE classification_code = 'SFTV';
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'sftm')      WHERE classification_code = 'SFTM';
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'sm')        WHERE classification_code IN ('SM','SV');
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'ss')        WHERE classification_code = 'SS';
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'furniture') WHERE classification_code = 'FUR';
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'pa')        WHERE classification_code = 'PA';

-- ── Verification ─────────────────────────────────────────────
SELECT c.slug, c.name_ru, COUNT(p.id) AS товаров
FROM categories c LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.slug, c.name_ru ORDER BY c.slug;

SELECT model, product_type, classification_code, array_length(compatible_with,1) AS совместимых
FROM products WHERE product_type = 'PA';

SELECT model FROM products WHERE classification_code IS NULL;

COMMIT;
