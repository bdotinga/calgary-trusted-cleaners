-- ══════════════════════════════════════════════════════════════
--  Calgary Trusted Cleaners · Sales Funnel App · Supabase Schema
--  Run this entire file in the Supabase SQL Editor (one shot)
-- ══════════════════════════════════════════════════════════════

-- ── 1. GC Pipeline ────────────────────────────────────────────
create table if not exists public.gc_pipeline (
  id               uuid primary key default gen_random_uuid(),
  tier             integer not null default 1 check (tier in (1, 2)),
  sort_order       integer not null default 0,
  company          text not null,
  address          text,
  phone            text,
  email            text,
  key_contact      text,
  status           text not null default 'Prospecting'
                   check (status in ('Prospecting','Contacted','Bid Submitted','Active','Won','Lost','On Hold')),
  relationship     text not null default 'Cold'
                   check (relationship in ('Cold','Warm','Hot')),
  active_tender    text,
  due_date         date,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── 2. Communication Log ──────────────────────────────────────
create table if not exists public.communication_log (
  id                uuid primary key default gen_random_uuid(),
  date              date not null,
  time              time,
  contact_name      text not null,
  company           text,
  type              text not null default 'Phone Call'
                    check (type in ('Phone Call','Email','In-Person','Text','Meeting')),
  outcome           text not null default 'Neutral'
                    check (outcome in ('Positive','Neutral','Follow-Up Required','No Answer','Left Voicemail')),
  what_discussed    text,
  next_action       text,
  next_action_date  date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── 3. Working Log ────────────────────────────────────────────
create table if not exists public.working_log (
  id                  uuid primary key default gen_random_uuid(),
  date                date not null,
  time                time,
  category            text not null default 'Research'
                      check (category in ('Research','Outreach','Proposal','Admin','Meeting','Other')),
  description         text,
  notes               text,
  funnel_hours        numeric(6,2) not null default 0,
  non_billable_hours  numeric(6,2) not null default 0,
  who                 text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── 4. Tenders ────────────────────────────────────────────────
create table if not exists public.tenders (
  id                  uuid primary key default gen_random_uuid(),
  project_name        text not null,
  general_contractor  text,
  bid_due_date        date,
  bid_time            time,
  est_value           numeric(12,2) default 0,
  scope               text,
  our_bid             numeric(12,2) default 0,
  status              text not null default 'Preparing'
                      check (status in ('Preparing','Submitted','Under Review','Awarded','Lost','Cancelled')),
  result              text not null default 'Pending'
                      check (result in ('Pending','Won','Lost','Withdrawn')),
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── 5. Contacts ───────────────────────────────────────────────
create table if not exists public.contacts (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  title             text,
  company           text,
  office_phone      text,
  mobile            text,
  email             text,
  best_time         text not null default 'Anytime'
                    check (best_time in ('Morning','Afternoon','Evening','Anytime')),
  last_contact_date date,
  next_followup     date,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ══════════════════════════════════════════════════════════════
--  Row Level Security (RLS)
--  Strategy: authenticated users can read everything.
--  Writes (insert/update/delete) only if role = 'admin'
--  (role stored in auth.users.raw_user_meta_data->>'role')
-- ══════════════════════════════════════════════════════════════

alter table public.gc_pipeline      enable row level security;
alter table public.communication_log enable row level security;
alter table public.working_log      enable row level security;
alter table public.tenders          enable row level security;
alter table public.contacts         enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ── gc_pipeline policies ──────────────────────────────────────
create policy "All authenticated users can read gc_pipeline"
  on public.gc_pipeline for select
  to authenticated using (true);

create policy "Admins can insert gc_pipeline"
  on public.gc_pipeline for insert
  to authenticated with check (public.is_admin());

create policy "Admins can update gc_pipeline"
  on public.gc_pipeline for update
  to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins can delete gc_pipeline"
  on public.gc_pipeline for delete
  to authenticated using (public.is_admin());

-- ── communication_log policies ────────────────────────────────
create policy "All authenticated users can read communication_log"
  on public.communication_log for select
  to authenticated using (true);

create policy "Admins can insert communication_log"
  on public.communication_log for insert
  to authenticated with check (public.is_admin());

create policy "Admins can update communication_log"
  on public.communication_log for update
  to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins can delete communication_log"
  on public.communication_log for delete
  to authenticated using (public.is_admin());

-- ── working_log policies ──────────────────────────────────────
create policy "All authenticated users can read working_log"
  on public.working_log for select
  to authenticated using (true);

create policy "Admins can insert working_log"
  on public.working_log for insert
  to authenticated with check (public.is_admin());

create policy "Admins can update working_log"
  on public.working_log for update
  to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins can delete working_log"
  on public.working_log for delete
  to authenticated using (public.is_admin());

-- ── tenders policies ──────────────────────────────────────────
create policy "All authenticated users can read tenders"
  on public.tenders for select
  to authenticated using (true);

create policy "Admins can insert tenders"
  on public.tenders for insert
  to authenticated with check (public.is_admin());

create policy "Admins can update tenders"
  on public.tenders for update
  to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins can delete tenders"
  on public.tenders for delete
  to authenticated using (public.is_admin());

-- ── contacts policies ─────────────────────────────────────────
create policy "All authenticated users can read contacts"
  on public.contacts for select
  to authenticated using (true);

create policy "Admins can insert contacts"
  on public.contacts for insert
  to authenticated with check (public.is_admin());

create policy "Admins can update contacts"
  on public.contacts for update
  to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins can delete contacts"
  on public.contacts for delete
  to authenticated using (public.is_admin());

-- ══════════════════════════════════════════════════════════════
--  Updated_at auto-trigger
-- ══════════════════════════════════════════════════════════════
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_gc_pipeline_updated_at
  before update on public.gc_pipeline
  for each row execute function public.set_updated_at();

create trigger set_communication_log_updated_at
  before update on public.communication_log
  for each row execute function public.set_updated_at();

create trigger set_working_log_updated_at
  before update on public.working_log
  for each row execute function public.set_updated_at();

create trigger set_tenders_updated_at
  before update on public.tenders
  for each row execute function public.set_updated_at();

create trigger set_contacts_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();
