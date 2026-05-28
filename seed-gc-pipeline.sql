-- seed-gc-pipeline.sql
-- Paste this into the Supabase SQL Editor and click Run.
-- Inserts 20 GC contractors into gc_pipeline.

INSERT INTO public.gc_pipeline
  (tier, sort_order, company, address, phone, email, key_contact, status, relationship, active_tender)
VALUES
  -- ── TIER 1 ──────────────────────────────────────────────────────────────
  (1, 0, 'Chandos Construction',           '375, 7220 Fisher Street SE, Calgary, AB T2H 2H8',         '403-640-0101', NULL,                           NULL,              'Prospecting', 'Cold', NULL),
  (1, 0, 'Bird Construction',              'Suite 600, 4820 Richard Road SW, Calgary, AB T3E 6L1',    '403-685-7777', NULL,                           NULL,              'Prospecting', 'Cold', NULL),
  (1, 0, 'Ledcor Group',                   'Suite 400, 1100 1st Street SE, Calgary, AB T2G 1B1',      '403-264-9155', NULL,                           NULL,              'Prospecting', 'Cold', NULL),
  (1, 0, 'Graham Construction',            '10840 27 Street SE, Calgary, AB T2Z 3R6',                 '403-570-5000', NULL,                           NULL,              'Prospecting', 'Cold', NULL),
  (1, 0, 'PCL Construction',               '2882 11th Street NE, Calgary, AB T2E 7S7',                '403-769-1680', NULL,                           NULL,              'Prospecting', 'Cold', NULL),
  (1, 0, 'Scott Builders',                 '1224 34 Avenue NE, Calgary, AB T2E 6L9',                  '403-274-9393', 'calgary@scottbuilders.com',     'Michael Wood',    'Prospecting', 'Cold', NULL),
  (1, 0, 'Traugott Building Contractors',  'Unit 101B, 3740 11A Street NE, Calgary, AB T2E 6M6',      '403-276-6444', NULL,                           'Jamie Stephens',  'Prospecting', 'Cold', NULL),
  (1, 0, 'Maple Reinders',                 '200, 5414 11 Street NE, Calgary, AB T2E 7E9',             '403-216-1455', NULL,                           'Peter Kuipers',   'Prospecting', 'Cold', NULL),
  (1, 0, 'EllisDon Construction Services', '310, 140 Quarry Park Boulevard SE, Calgary, AB T2C 3G3', '403-259-6627', 'inquiries@ellisdon.com',        NULL,              'Prospecting', 'Cold', NULL),
  (1, 0, 'Opus Construction',              '#500, 5119 Elbow Drive SW, Calgary, AB T2V 1H2',          '403-209-5555', 'construction@opuscorp.ca',      NULL,              'Prospecting', 'Cold', NULL),
  -- ── TIER 2 ──────────────────────────────────────────────────────────────
  (2, 0, 'Cana Construction',              '100, 5720 4th Street SE, Calgary, AB T2H 1K7',            '403-255-5521', 'info@cana.ca',                  NULL,              'Prospecting', 'Cold', NULL),
  (2, 0, 'Clark Builders',                 '7535 Flint Road SE, Calgary, AB T2H 1G3',                 '403-253-0565', 'calgary@clarkbuilders.com',     NULL,              'Prospecting', 'Cold', NULL),
  (2, 0, 'Greenstone Construction',        'Calgary, AB T3R 1L3',                                     '403-300-1191', 'info@greenstoneconstruction.ca','Rich Lee',        'Prospecting', 'Cold', NULL),
  (2, 0, 'Seko Construction',              'Suite 139, 808 42 Avenue SE, Calgary, AB T2G 1Y9',        '403-212-0800', NULL,                           NULL,              'Prospecting', 'Cold', NULL),
  (2, 0, 'Axiom Builders',                 'Suite 200, 927 10th Avenue SW, Calgary, AB T2R 1A8',      '587-390-2100', 'inquiries@axiombuilders.ca',    NULL,              'Prospecting', 'Cold', NULL),
  (2, 0, 'Stuart Olson',                   'Calgary, AB',                                             NULL,           NULL,                           NULL,              'Prospecting', 'Cold', NULL),
  (2, 0, 'Astra Construction Management', '200, 638 11 Avenue SW, Calgary, AB T2R 0E2',              '403-770-6463', 'info@astra-management.ca',      NULL,              'Prospecting', 'Cold', NULL),
  (2, 0, 'ITC Construction Group',         '#770, 340 12th Avenue SW, Calgary, AB T2R 1L5',           '403-718-0510', NULL,                           'David Carlton',   'Prospecting', 'Cold', NULL),
  (2, 0, 'Truman Homes',                   '#700, 780 78th Street SW, Calgary, AB',                   '403-240-3246', NULL,                           NULL,              'Prospecting', 'Cold', NULL),
  (2, 0, 'Vesta Properties',               '220, 1702 4 Street SW, Calgary, AB T2S 3A8',              NULL,           'info@vestaproperties.com',      NULL,              'Prospecting', 'Cold', NULL);

-- Verify
SELECT tier, company, phone, email, key_contact
FROM public.gc_pipeline
ORDER BY tier, company;
