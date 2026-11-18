-- Siloona: guests' personal links (dashboard events) + rate limiting.
-- Run after schema.sql (and payments.sql). Re-runnable.
--
-- The dashboard sends every guest `siloona.am/i/<event slug>/<guest token>`.
-- A guest opening it, and answering the RSVP, goes through the server
-- (/api/invitations, service role) — never straight from the browser into
-- `events`, whose `data` (the whole guest list with phones and notes) must
-- stay private to its owner. What guests do is written here instead, as
-- separate rows, and the owner's dashboard folds them into its guest list
-- when it loads (src/dashboard/data/replies.js). Keeping them apart from
-- `events.data` also means a guest's answer can never be lost to the
-- owner's next save of the event document (it's saved whole).

create table if not exists event_replies (
  id bigint generated always as identity primary key,
  event_id text not null references events (id) on delete cascade,
  -- the guest's own token; null = the event's general link
  guest_token text,
  kind text not null check (kind in ('open', 'rsvp')),
  guest_name text,
  status text check (status in ('confirmed', 'declined')),
  plus int check (plus between 0 and 20),
  note text,
  created_at timestamptz not null default now(),
  check (kind = 'open' or (status is not null and guest_name is not null))
);
create index if not exists event_replies_event_idx on event_replies (event_id, created_at);

alter table event_replies enable row level security;
-- The event's owner reads their guests' replies (the dashboard). Nobody
-- writes from the browser: only the server, with the service role.
drop policy if exists "event_replies: owner reads" on event_replies;
create policy "event_replies: owner reads" on event_replies
  for select using (exists (select 1 from events e where e.id = event_id and e.owner_id = auth.uid()));

-- Published events are looked up by their link slug.
create index if not exists events_inv_slug_idx on events ((data -> 'inv' ->> 'slug'));

-- ---------------------------------------------------------------------------
-- Rate limiting for the public endpoints (orders, photo uploads, RSVPs,
-- link opens). `p_key` is e.g. 'rsvp:<hashed ip>'. Returns true while the
-- caller is within p_max hits per p_window_seconds, false once over.
-- ---------------------------------------------------------------------------
create table if not exists api_hits (
  key text not null,
  at timestamptz not null default now()
);
create index if not exists api_hits_key_at_idx on api_hits (key, at);
alter table api_hits enable row level security; -- no policies: server only

create or replace function hit_rate_limit(p_key text, p_window_seconds int, p_max int)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  n int;
begin
  delete from api_hits where key = p_key and at < now() - make_interval(secs => p_window_seconds);
  -- now and then, sweep everyone's old hits
  if random() < 0.01 then
    delete from api_hits where at < now() - interval '1 day';
  end if;
  select count(*) into n from api_hits where key = p_key;
  if n >= p_max then
    return false;
  end if;
  insert into api_hits (key) values (p_key);
  return true;
end;
$$;

revoke all on function hit_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function hit_rate_limit(text, int, int) to service_role;
