-- Siloona: the wishes book (the `wishes` add-on, src/site/addons.js).
-- Run after rsvp-questions.sql, in the Supabase SQL editor. It only ADDS a
-- table; safe to re-run.
--
-- Guests leave a wish on the invitation (name + up to 500 characters). The
-- wishes are for the couple only: no guest ever reads them — the page has
-- no way to, and the table has no policy for anyone but Siloona's admins.
-- The couple reads them, hides one, and downloads them on their own page
-- (/checkout/wishes, with the order's secret link) through the server.
-- Acceptance may close N days after the event (invitations.settings.wishesCloseDays).

create table if not exists invitation_wishes (
  id bigint generated always as identity primary key,
  invitation_id uuid not null references invitations (id) on delete cascade,
  -- from a guest's personal link (personal-links.sql), else null
  guest_id uuid references invitation_guests (id) on delete set null,
  guest_name text not null check (char_length(guest_name) between 1 and 80),
  -- plain text, no HTML (api/_lib/wishes.js)
  body text not null check (char_length(body) between 1 and 500),
  -- hidden by the couple: kept, but out of their book and downloads
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists invitation_wishes_invitation_idx on invitation_wishes (invitation_id, created_at);

alter table invitation_wishes enable row level security;
drop policy if exists "invitation_wishes: admins read" on invitation_wishes;
create policy "invitation_wishes: admins read" on invitation_wishes for select using (is_admin());
-- No other policies: guests write and the couple reads only through the
-- server (service role), never straight from the browser.
