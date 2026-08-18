-- Migration: accreditation block on the science page becomes an editable
-- single record instead of text baked into the page source.
-- Run on VPS: bash scripts/migrate.sh science_accreditation

CREATE TABLE IF NOT EXISTS science_accreditation (
  id              TEXT PRIMARY KEY DEFAULT 'main',
  title_ru        TEXT NOT NULL DEFAULT '',
  title_kk        TEXT,
  title_en        TEXT,
  description_ru  TEXT,
  description_kk  TEXT,
  description_en  TEXT,
  issuer          TEXT,
  valid_until     TEXT,
  image_url       TEXT,
  pdf_url         TEXT,
  text_align      TEXT NOT NULL DEFAULT 'left',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO science_accreditation (
  id, title_ru, title_kk, title_en, description_ru, description_kk, description_en,
  issuer, valid_until, image_url, pdf_url
) VALUES (
  'main',
  'Аккредитация научной деятельности',
  'Ғылыми қызметтің аккредитациясы',
  'Scientific activity accreditation',
  E'ТОО «Bes Saiman Group» аккредитовано Министерством науки и высшего образования Республики Казахстан в качестве субъекта научной и/или научно-технической деятельности.\n\nСвидетельство об аккредитации подтверждает право компании участвовать в конкурсах научных, научно-технических проектов и программ, финансируемых из государственного бюджета.',
  E'«Bes Saiman Group» ЖШС Қазақстан Республикасының Ғылым және жоғары білім министрлігімен ғылыми және/немесе ғылыми-техникалық қызмет субъектісі ретінде аккредиттелген.\n\nАккредитация куәлігі компанияның мемлекеттік бюджет және заңнамамен тыйым салынбаған өзге де көздерден қаржыландырылатын ғылыми, ғылыми-техникалық жобалар мен бағдарламалардың байқауларына қатысу құқығын растайды.',
  E'Bes Saiman Group LLP is accredited by the Ministry of Science and Higher Education of the Republic of Kazakhstan as a subject of scientific and/or scientific-technical activity.\n\nThe accreditation certificate confirms the company''s right to participate in competitions for scientific and scientific-technical projects and programs funded from the state budget.',
  'МОН РК',
  'до 09.02.2029',
  '/docs/svidetelstvo-akkreditacii-preview.jpg',
  '/docs/svidetelstvo-akkreditacii.pdf'
)
ON CONFLICT (id) DO NOTHING;
