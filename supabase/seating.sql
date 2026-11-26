-- Siloona: «Ձեր սեղանը» — a guest finds their table on the invitation.
-- Run after schema.sql, payments.sql and guest-links.sql, in the Supabase
-- SQL editor. It only ADDS tables and functions (nothing existing is
-- changed) and is safe to re-run.
--
-- How it works:
--   * One seating plan per invitation: a purchased one (invitations) or a
--     dashboard event (events). A plan says whether seating is on and from
--     when guests may see their table (reveal_at).
--   * The couple's list (guest name → table) is in `seating`. It is filled
--     from a CSV with scripts/import-seating.js, which calls
--     import_seating() below — the list is replaced as a whole each time.
--   * Guests never read these tables. The page asks /api/invitations,
--     which (server side, service role) answers with ONE table or "not
--     found", and nothing at all before reveal_at.

create table if not exists seating_plans (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid unique references invitations (id) on delete cascade,
  event_id text unique references events (id) on delete cascade,
  enabled boolean not null default true,
  reveal_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(invitation_id, event_id) = 1)
);

create table if not exists seating (
  id bigint generated always as identity primary key,
  plan_id uuid not null references seating_plans (id) on delete cascade,
  -- as the couple wrote it
  guest_name text not null check (char_length(guest_name) between 1 and 160),
  -- the same name made comparable (api/_lib/seating.js → nameKey); one
  -- row per name, so a re-import updates instead of duplicating
  normalized_name text not null check (normalized_name <> ''),
  -- «7», «VIP», «Ընտանիք»
  table_label text not null check (char_length(table_label) between 1 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, normalized_name)
);

drop trigger if exists seating_plans_set_updated_at on seating_plans;
create trigger seating_plans_set_updated_at before update on seating_plans
  for each row execute function set_updated_at();
drop trigger if exists seating_set_updated_at on seating;
create trigger seating_set_updated_at before update on seating
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Access: no public policies at all. Admins read everything; a dashboard
-- event's owner reads their own event's plan. Only the server writes.
-- ---------------------------------------------------------------------------
alter table seating_plans enable row level security;
alter table seating enable row level security;

drop policy if exists "seating_plans: admins read" on seating_plans;
create policy "seating_plans: admins read" on seating_plans for select using (is_admin());
drop policy if exists "seating_plans: event owner reads" on seating_plans;
create policy "seating_plans: event owner reads" on seating_plans
  for select using (event_id is not null and exists (select 1 from events e where e.id = event_id and e.owner_id = auth.uid()));

drop policy if exists "seating: admins read" on seating;
create policy "seating: admins read" on seating for select using (is_admin());
drop policy if exists "seating: event owner reads" on seating;
create policy "seating: event owner reads" on seating
  for select using (exists (
    select 1 from seating_plans p join events e on e.id = p.event_id
    where p.id = plan_id and e.owner_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- Import (scripts/import-seating.js). In one transaction:
--   * creates the plan, or updates its reveal time / on-off switch (a null
--     argument keeps the current value);
--   * when p_rows is given, makes the list exactly p_rows: new names are
--     added, changed tables updated, names no longer there deleted.
-- p_rows: [{ "name": "...", "key": "<normalized>", "table": "7" }, ...]
-- ---------------------------------------------------------------------------
create or replace function import_seating(
  p_invitation uuid, p_event text, p_reveal_at timestamptz, p_enabled boolean, p_rows jsonb
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_plan seating_plans;
  v_deleted int := 0;
  v_added int := 0;
  v_updated int := 0;
  v_total int := 0;
begin
  if num_nonnulls(p_invitation, p_event) <> 1 then
    raise exception 'seating_target';
  end if;

  select * into v_plan from seating_plans
    where (p_invitation is not null and invitation_id = p_invitation)
       or (p_event is not null and event_id = p_event)
    for update;

  if v_plan.id is null then
    if p_reveal_at is null then raise exception 'seating_reveal_required'; end if;
    insert into seating_plans (invitation_id, event_id, reveal_at, enabled)
    values (p_invitation, p_event, p_reveal_at, coalesce(p_enabled, true))
    returning * into v_plan;
  elsif p_reveal_at is not null or p_enabled is not null then
    update seating_plans set
      reveal_at = coalesce(p_reveal_at, reveal_at),
      enabled = coalesce(p_enabled, enabled)
    where id = v_plan.id
    returning * into v_plan;
  end if;

  if p_rows is not null then
    if jsonb_typeof(p_rows) <> 'array' then raise exception 'seating_rows'; end if;

    delete from seating s
      where s.plan_id = v_plan.id
        and not exists (select 1 from jsonb_array_elements(p_rows) r where r->>'key' = s.normalized_name);
    get diagnostics v_deleted = row_count;

    with src as (
      select r->>'name' as n, r->>'key' as k, r->>'table' as t from jsonb_array_elements(p_rows) r
    ), up as (
      insert into seating (plan_id, guest_name, normalized_name, table_label)
      select v_plan.id, n, k, t from src
      on conflict (plan_id, normalized_name) do update
        set guest_name = excluded.guest_name, table_label = excluded.table_label
        where seating.guest_name is distinct from excluded.guest_name
           or seating.table_label is distinct from excluded.table_label
      returning (xmax = 0) as added
    )
    select count(*) filter (where added), count(*) filter (where not added) into v_added, v_updated from up;
  end if;

  select count(*) into v_total from seating where plan_id = v_plan.id;
  return jsonb_build_object(
    'plan', v_plan.id, 'enabled', v_plan.enabled, 'reveal_at', v_plan.reveal_at,
    'added', v_added, 'updated', v_updated, 'deleted', v_deleted, 'total', v_total
  );
end;
$$;

revoke all on function import_seating(uuid, text, timestamptz, boolean, jsonb) from public, anon, authenticated;
grant execute on function import_seating(uuid, text, timestamptz, boolean, jsonb) to service_role;
