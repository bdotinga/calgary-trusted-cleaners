-- seed-contacts-placeholders.sql
-- Inserts 4 placeholder contacts for GC companies with no verified contact.
-- name = 'TBD' because the contacts.name column is NOT NULL.

INSERT INTO public.contacts
  (name, title, company, office_phone, mobile, email, best_time)
VALUES
  ('TBD', 'Key Contact TBD', 'Ledcor Group',                NULL, NULL, NULL, 'Anytime'),
  ('TBD', 'Key Contact TBD', 'Axiom Builders',              NULL, NULL, NULL, 'Anytime'),
  ('TBD', 'Key Contact TBD', 'Stuart Olson',                NULL, NULL, NULL, 'Anytime'),
  ('TBD', 'Key Contact TBD', 'Astra Construction Management', NULL, NULL, NULL, 'Anytime');

-- Verify
SELECT name, title, company FROM public.contacts WHERE name = 'TBD' ORDER BY company;
SELECT COUNT(*) AS placeholders_inserted FROM public.contacts WHERE name = 'TBD';
