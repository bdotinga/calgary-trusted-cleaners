-- seed-contacts.sql
-- Paste into the Supabase SQL Editor and click Run.
-- Inserts 16 verified GC contacts (Ledcor, Axiom, Stuart Olson, Astra skipped — no verified contact).

INSERT INTO public.contacts
  (name, title, company, office_phone, mobile, email, best_time)
VALUES
  -- ── TIER 1 ──────────────────────────────────────────────────────────────────
  ('Padraig McCarthy', 'VP & District Manager',  'Chandos Construction',           '403-640-0101', NULL, NULL,                        'Anytime'),
  ('Jeremy Boldt',     'VP & District Manager',  'Bird Construction',              '403-685-7777', NULL, NULL,                        'Anytime'),
  -- Ledcor skipped — no verified contact
  ('Andy Trewick',     'President & CEO',         'Graham Construction',            '403-570-5000', NULL, NULL,                        'Anytime'),
  ('Jordan Clouthier', 'VP & District Manager',  'PCL Construction',               '403-769-1680', NULL, NULL,                        'Anytime'),
  ('Michael Wood',     'Operations Manager',      'Scott Builders',                 '403-274-9393', NULL, 'calgary@scottbuilders.com', 'Anytime'),
  ('Jamie Stephens',   'Contact',                 'Traugott Building Contractors',  '403-276-6444', NULL, NULL,                        'Anytime'),
  ('Peter Kuipers',    'Contact',                 'Maple Reinders',                 '403-216-1455', NULL, NULL,                        'Anytime'),
  ('Sean Dekoning',    'VP & Area Manager',       'EllisDon Construction Services', '403-259-6627', NULL, 'inquiries@ellisdon.com',    'Anytime'),
  ('Hannes Kovac',     'President & CEO',         'Opus Construction',              '403-209-5555', NULL, 'info@opuscorp.ca',          'Anytime'),
  -- ── TIER 2 ──────────────────────────────────────────────────────────────────
  ('Fabrizio Carinelli', 'President, Construction',        'Cana Construction',        '403-255-5521', NULL, 'info@cana.ca',                   'Anytime'),
  ('Andrew Ross',        'CEO',                            'Clark Builders',            '403-253-0565', NULL, 'calgary@clarkbuilders.com',      'Anytime'),
  ('Rich Lee',           'President',                      'Greenstone Construction',   '403-300-1191', NULL, 'info@greenstoneconstruction.ca', 'Anytime'),
  ('Bob Jarvis',         'VP Business Development',        'Seko Construction',         '403-212-0800', NULL, NULL,                             'Anytime'),
  -- Axiom Builders, Stuart Olson, Astra Construction Management skipped — no verified contact
  ('David Carlton',      'Director, Business Development', 'ITC Construction Group',    '403-718-0510', NULL, NULL,                             'Anytime'),
  ('Peter Trutina',      'VP Land Development',            'Truman Homes',              '403-240-3246', NULL, 'info@trumanhomes.com',           'Anytime'),
  ('Kent Sillars',       'Founder & President',            'Vesta Properties',          NULL,           NULL, 'info@vestaproperties.com',       'Anytime');

-- Verify count and contents
SELECT
  name,
  title,
  company,
  office_phone,
  email
FROM public.contacts
ORDER BY company;

SELECT COUNT(*) AS total_inserted FROM public.contacts;
