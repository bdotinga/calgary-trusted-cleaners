-- add-contacts-sort-order.sql
-- 1. Adds sort_order column to contacts (not in original schema)
-- 2. Sets sort_order for all 20 GC contacts to match the GC Pipeline list order
-- 3. Verifies all 20 rows

-- ── Step 1: Add column ────────────────────────────────────────────────────────
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- ── Step 2: Set sort_order by company ────────────────────────────────────────
UPDATE public.contacts SET sort_order = 1  WHERE company = 'Chandos Construction';
UPDATE public.contacts SET sort_order = 2  WHERE company = 'Bird Construction';
UPDATE public.contacts SET sort_order = 3  WHERE company = 'Ledcor Group';
UPDATE public.contacts SET sort_order = 4  WHERE company = 'Graham Construction';
UPDATE public.contacts SET sort_order = 5  WHERE company = 'PCL Construction';
UPDATE public.contacts SET sort_order = 6  WHERE company = 'Scott Builders';
UPDATE public.contacts SET sort_order = 7  WHERE company = 'Traugott Building Contractors';
UPDATE public.contacts SET sort_order = 8  WHERE company = 'Maple Reinders';
UPDATE public.contacts SET sort_order = 9  WHERE company = 'EllisDon Construction Services';
UPDATE public.contacts SET sort_order = 10 WHERE company = 'Opus Construction';
UPDATE public.contacts SET sort_order = 11 WHERE company = 'Cana Construction';
UPDATE public.contacts SET sort_order = 12 WHERE company = 'Clark Builders';
UPDATE public.contacts SET sort_order = 13 WHERE company = 'Greenstone Construction';
UPDATE public.contacts SET sort_order = 14 WHERE company = 'Seko Construction';
UPDATE public.contacts SET sort_order = 15 WHERE company = 'Axiom Builders';
UPDATE public.contacts SET sort_order = 16 WHERE company = 'Stuart Olson';
UPDATE public.contacts SET sort_order = 17 WHERE company = 'Astra Construction Management';
UPDATE public.contacts SET sort_order = 18 WHERE company = 'ITC Construction Group';
UPDATE public.contacts SET sort_order = 19 WHERE company = 'Truman Homes';
UPDATE public.contacts SET sort_order = 20 WHERE company = 'Vesta Properties';

-- ── Step 3: Verify ────────────────────────────────────────────────────────────
SELECT sort_order, name, company
FROM public.contacts
ORDER BY sort_order;

SELECT COUNT(*) AS contacts_with_sort_order
FROM public.contacts
WHERE sort_order > 0;
