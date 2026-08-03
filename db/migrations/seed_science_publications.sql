-- Seed: migrate the previously hardcoded publications list (app/nauka/page.tsx)
-- into the new admin-manageable science_publications table.
-- Run on VPS AFTER add_science_content.sql:
-- psql $DATABASE_URL -f /var/www/bes-saiman.kz/db/migrations/seed_science_publications.sql
-- Safe to re-run: skips rows whose DOI already exists.

INSERT INTO science_publications (title, authors, journal, year, doi, sort_order)
SELECT * FROM (VALUES
  ('Recent advances and challenges of current collectors for supercapacitors', 'Abdisattar A., Yeleuov M., Daulbayev Ch., Askaruly K., Taurbekov A., Prikhodko N.', 'Electrochemistry Communications', 2022, '10.1016/j.elecom.2022.107373', 10),
  ('Enhancing supercapacitor performance through graphene flame synthesis on nickel current collectors and active carbon material from plant biomass', 'Prikhodko N., Yeleuov M., Abdisattar A., Askaruly K., Taurbekov A., Tolynbekov A., Rakhymzhan N., Daulbayev Ch.', 'Journal of Energy Storage', 2023, '10.1016/j.est.2023.108853', 20),
  ('A facile synthesis of graphite-coated amorphous SiO₂ from biosources as anode material for LIBs', 'Askaruly K., Yeleuov M., Taurbekov A., Sarsembayeva B., Tolynbekov A., Zhylybayeva N., Azat S., Abdisattar A., Daulbayev Ch.', 'Materials Today Communications', 2023, '10.1016/j.mtcomm.2022.105136', 30),
  ('Biomass Derived High Porous Carbon via CO₂ Activation for Supercapacitor Electrodes', 'Taurbekov A., Abdisattar A., Atamanov M., Yeleuov M., Daulbayev Ch., Askaruly K., Kaidar B. et al.', 'Journal of Composites Science (MDPI)', 2023, '10.3390/jcs7100444', 40),
  ('Characterization of Activated Carbon from Rice Husk for Enhanced Energy Storage Devices', 'Yerdauletov M., Nazarov K., Mukhametuly B., Yeleuov M., Daulbayev Ch., Abdulkarimova R. et al.', 'Molecules (MDPI)', 2023, '10.3390/molecules28155818', 50),
  ('Investigations of Activated Carbon from Different Natural Sources for Preparation of Binder-Free CNTs/Activated Carbon Electrodes', 'Taurbekov A., Abdisattar A., Atamanov M., Kaidar B., Yeleuov M., Joia R., Amrousse R., Atamanova T.', 'Journal of Composites Science', 2023, '10.3390/jcs7110452', 60),
  ('The Impact of Biowaste Composition and Activated Carbon Structure on the Electrochemical Performance of Supercapacitors', 'Yerdauletov M., Napolskiy F., Abdisattar A., Rudnykh A., Nazarov K., Kenessarin M., Yeleuov M. et al.', 'Molecules (MDPI)', 2024, '10.3390/molecules29215029', 70),
  ('Utilizing rice husk-derived Si/C composites to enhance energy capacity and cycle sustainability of lithium-ion batteries', 'Askaruly K., Idrissov N., Abdisattar A., Azat S., Kuli Zh., Yeleuov M., Malchik F., Daulbayev Ch. et al.', 'Diamond and Related Materials', 2024, '10.1016/j.diamond.2024.111631', 80),
  ('Effective photocatalytic degradation of sulfamethoxazole using PAN/SrTiO₃ nanofibers', 'Serik A., Kuspanov Zh., Bissenova M., Idrissov N., Yeleuov M., Umirzakov A., Daulbayev Ch.', 'Journal of Water Process Engineering', 2024, '10.1016/j.jwpe.2024.106052', 90),
  ('Efficient photocatalytic degradation of methylene blue via synergistic dual co-catalyst on SrTiO₃@Al under visible light', 'Kuspanov Zh., Serik A., Matsko N., Bissenova M., Issadykov A., Yeleuov M., Daulbayev Ch.', 'Taiwan Institute of Chemical Engineers', 2025, '10.1016/j.jtice.2024.105806', 100),
  ('MXene-Integrated Porous Carbon–Silicon Composite as a Stable and High-Capacity Anode for Lithium-Ion Batteries', 'Saitova N., Askaruly K., Idrissov N., Kuli Zh., Shakenov K., Azat S., Sultakhan Sh.', 'Engineered Science Publisher', 2025, '10.30919/es1804', 110),
  ('Cost-effective strategies and technologies for green hydrogen production', 'Serik A., Kuspanov Zh., Daulbayev Ch.', 'Renewable and Sustainable Energy Reviews', 2026, '10.1016/j.rser.2025.116242', 120),
  ('Biomass-derived activated carbon/MXene composites as supercapacitor electrodes', 'Liu J., Kuli Zh., Toshtay K., Lee J., Askaruly K., Azat S.', 'Electrochemistry Communications', 2026, '10.1016/j.elecom.2026.108166', 130)
) AS v(title, authors, journal, year, doi, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM science_publications WHERE science_publications.doi = v.doi);
