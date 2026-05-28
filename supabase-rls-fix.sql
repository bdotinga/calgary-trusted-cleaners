-- ══════════════════════════════════════════════════════════════
--  RLS FIX — Run this in Supabase SQL Editor
--  Replaces JWT-based role check with simple auth check.
--  Viewer restriction is enforced by the React UI.
-- ══════════════════════════════════════════════════════════════

-- ── Drop old role-checking policies ───────────────────────────
drop policy if exists "Admins can insert gc_pipeline"       on public.gc_pipeline;
drop policy if exists "Admins can update gc_pipeline"       on public.gc_pipeline;
drop policy if exists "Admins can delete gc_pipeline"       on public.gc_pipeline;

drop policy if exists "Admins can insert communication_log" on public.communication_log;
drop policy if exists "Admins can update communication_log" on public.communication_log;
drop policy if exists "Admins can delete communication_log" on public.communication_log;

drop policy if exists "Admins can insert working_log"       on public.working_log;
drop policy if exists "Admins can update working_log"       on public.working_log;
drop policy if exists "Admins can delete working_log"       on public.working_log;

drop policy if exists "Admins can insert tenders"           on public.tenders;
drop policy if exists "Admins can update tenders"           on public.tenders;
drop policy if exists "Admins can delete tenders"           on public.tenders;

drop policy if exists "Admins can insert contacts"          on public.contacts;
drop policy if exists "Admins can update contacts"          on public.contacts;
drop policy if exists "Admins can delete contacts"          on public.contacts;

-- ── New policies: any authenticated user can write ────────────

-- gc_pipeline
create policy "Authenticated users can insert gc_pipeline"
  on public.gc_pipeline for insert to authenticated with check (true);
create policy "Authenticated users can update gc_pipeline"
  on public.gc_pipeline for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete gc_pipeline"
  on public.gc_pipeline for delete to authenticated using (true);

-- communication_log
create policy "Authenticated users can insert communication_log"
  on public.communication_log for insert to authenticated with check (true);
create policy "Authenticated users can update communication_log"
  on public.communication_log for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete communication_log"
  on public.communication_log for delete to authenticated using (true);

-- working_log
create policy "Authenticated users can insert working_log"
  on public.working_log for insert to authenticated with check (true);
create policy "Authenticated users can update working_log"
  on public.working_log for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete working_log"
  on public.working_log for delete to authenticated using (true);

-- tenders
create policy "Authenticated users can insert tenders"
  on public.tenders for insert to authenticated with check (true);
create policy "Authenticated users can update tenders"
  on public.tenders for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete tenders"
  on public.tenders for delete to authenticated using (true);

-- contacts
create policy "Authenticated users can insert contacts"
  on public.contacts for insert to authenticated with check (true);
create policy "Authenticated users can update contacts"
  on public.contacts for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete contacts"
  on public.contacts for delete to authenticated using (true);
