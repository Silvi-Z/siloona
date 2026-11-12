-- Siloona dashboard backend schema.
--
-- Scope (per product decision): persists dashboard data (events, guests,
-- groups, locations, schedule, milestones, invitation/personalization
-- settings) and real per-account auth. Deliberately NOT in scope here:
-- the public guest-facing RSVP endpoint and the marketing site's order
-- form — both still need their own design pass before they touch this
-- database.
--
-- Shape: each event is one row with most of its content in a single
-- `data` jsonb column (guests, groups, locations, schedule, milestones,
-- info, inv, and the type-specific identity fields — person1/person2,
-- child, parents, celebrant, company — exactly as the dashboard's
-- existing in-memory event object already shapes them). type/title/date
-- are pulled out to real columns because the dashboard lists/sorts/filters
-- by them; everything else only ever gets read and written as a whole
-- document by the one account that owns it, so normalizing it into a dozen
-- join tables would add real complexity for no actual query benefit here.
--
-- Run this once in the Supabase SQL editor (or `supabase db push` if using
-- the CLI) on a fresh project.

create extension if not exists pgcrypto;

-- One row per auth user. Created by the app right after sign-up.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  mode text not null check (mode in ('couple', 'org')),
  data jsonb not null default '{}'::jsonb, -- name1/name2 or name/company/role, email, phone, lang/notif settings
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per event. id is text (not uuid) so it stays compatible with the
-- dashboard's existing id scheme (e.g. the couple's fixed 'C1' event and
-- client-generated ids via crypto.randomUUID()).
create table if not exists events (
  id text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  owner_mode text not null check (owner_mode in ('couple', 'org')),
  type text,
  title text not null default '',
  event_date date,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_owner_id_idx on events (owner_id);

-- updated_at bookkeeping
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
drop trigger if exists events_set_updated_at on events;
create trigger events_set_updated_at before update on events
  for each row execute function set_updated_at();

-- Row Level Security: every account only ever sees and changes its own
-- rows. There is no "public" policy here on purpose — the guest-facing
-- RSVP flow is out of scope for this pass (see header comment) and must
-- not be able to read or write this table directly from the browser with
-- the anon key once it's built; it will need its own narrow, token-scoped
-- access path (a SECURITY DEFINER function or an Edge Function), not a
-- blanket RLS policy that could let anyone enumerate every guest.
alter table profiles enable row level security;
alter table events enable row level security;

drop policy if exists "profiles: owner full access" on profiles;
create policy "profiles: owner full access" on profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "events: owner full access" on events;
create policy "events: owner full access" on events
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Provisions a profile (and, for a couple account, their one personal
-- event shell — see mockEvents.js's addEvent({id:'C1', type:null, ...}, 0))
-- the moment a Supabase auth user is created. Runs as SECURITY DEFINER so
-- it works through RLS and regardless of whether "confirm email" is on —
-- the client only ever needs to call auth.signUp(); it never inserts
-- these rows itself. `mode` and the profile fields come through
-- auth.signUp's `options.data` (stored on auth.users.raw_user_meta_data).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  acct_mode text := coalesce(new.raw_user_meta_data->>'mode', 'couple');
begin
  insert into public.profiles (id, mode, data)
  values (new.id, acct_mode, coalesce(new.raw_user_meta_data->'profile', '{}'::jsonb));

  if acct_mode = 'couple' then
    insert into public.events (id, owner_id, owner_mode, type, title, data)
    values (gen_random_uuid()::text, new.id, 'couple', null, '', '{}'::jsonb);
  end if;

  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
