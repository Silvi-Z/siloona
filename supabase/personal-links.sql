-- Siloona: guests' personal links to a purchased invitation (the
-- `personal_greeting` add-on, src/site/addons.js).
-- Run after addons.sql, in the Supabase SQL editor. It only ADDS a table
-- and a column; safe to re-run.
--
-- Each guest (or couple, family) gets siloona.am/i/<invitation code>/<token>.
-- Opened from it, the invitation greets them by `display_name`
-- («Սիրելի Արամ և Անի») and their RSVP form starts with that name.
-- scripts/import-guests.js fills this from a CSV and prints each link.
--
-- The token is long and random (24 letters/digits) — never guessable from
-- another guest's link — and the page only ever receives the one name the
-- link is for (api/_lib/orders.js). Nobody reads this table from the
-- browser: only the server, and admins in the dashboard.

create table if not exists invitation_guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations (id) on delete cascade,
  token text not null unique check (token ~ '^[A-Za-z0-9]{20,40}$'),
  -- how the invitation addresses them: «Արամ և Անի», «Պետրոսյանների ընտանիք»
  display_name text not null check (char_length(display_name) between 1 and 120),
  -- the same name made comparable (api/_lib/seating.js → nameKey): one
  -- link per name, so importing the list again doesn't duplicate anyone
  name_key text not null check (name_key <> ''),
  phone text check (phone is null or char_length(phone) <= 40),
  note text check (note is null or char_length(note) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (invitation_id, name_key)
);

drop trigger if exists invitation_guests_set_updated_at on invitation_guests;
create trigger invitation_guests_set_updated_at before update on invitation_guests
  for each row execute function set_updated_at();

alter table invitation_guests enable row level security;
drop policy if exists "invitation_guests: admins read" on invitation_guests;
create policy "invitation_guests: admins read" on invitation_guests for select using (is_admin());
-- No insert/update/delete policies: only the server (service role) writes.

-- Which personal link an RSVP came from (null = the general link).
alter table invitation_rsvps add column if not exists guest_id uuid references invitation_guests (id) on delete set null;
