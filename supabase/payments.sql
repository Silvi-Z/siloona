-- Siloona orders & online payments.
--
-- Run AFTER schema.sql, in the Supabase SQL editor. Safe to re-run.
--
-- Who can touch what:
--   * The browser never writes to these tables. Every write goes through
--     the server functions in /api, which use the service-role key, and
--     every money-related change goes through apply_payment_status() below.
--   * Admins (rows in admin_users) can READ every order, transaction and
--     event from the dashboard. A signed-in customer can read their own
--     orders. Nobody else can read anything.
--   * Card numbers / CVV never reach Siloona: the customer types them on
--     the bank's (ArCa) or Idram's own hosted page. A transaction only
--     keeps the masked card number the gateway sends back (e.g. 4083**1234).
--
-- To make yourself an admin (once, in the SQL editor):
--   insert into admin_users (user_id)
--   select id from auth.users where email = 'you@example.com';

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------
create table if not exists admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table admin_users enable row level security;
drop policy if exists "admin_users: read own row" on admin_users;
create policy "admin_users: read own row" on admin_users
  for select using (auth.uid() = user_id);

create or replace function is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from admin_users where user_id = auth.uid()) $$;

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create sequence if not exists order_number_seq start with 1001;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  -- The number customers and Siloona refer to (Պատվեր №1001).
  order_number bigint not null unique default nextval('order_number_seq'),
  -- Random secret in the customer's order link (/checkout/result?t=...).
  -- It is the only way to view an order without signing in.
  access_token text not null,
  -- Idempotency key the checkout page generates once; a double-submitted
  -- form returns the same order instead of creating a second one.
  client_ref text unique,
  owner_id uuid references auth.users (id) on delete set null,

  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_phone text not null check (char_length(customer_phone) between 6 and 32),
  customer_email text check (customer_email is null or char_length(customer_email) <= 200),
  customer_contact text check (customer_contact is null or char_length(customer_contact) <= 120),

  design_id text not null,
  design_option text not null check (design_option in ('diy', 'assisted')),
  customization jsonb not null default '{}'::jsonb,

  -- Whole drams, worked out by the server from src/site/prices.js.
  -- null = the design has no confirmed price yet (an order request).
  amount integer check (amount is null or amount > 0),
  currency text not null default 'AMD' check (currency = 'AMD'),

  -- Everything below is DERIVED from payment_transactions by
  -- recompute_order_payment(). Never update these columns by hand.
  payment_provider text,
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'cancelled', 'refunded')),
  transaction_id text,
  paid_at timestamptz,

  -- Siloona's own production workflow, separate from the money.
  order_status text not null default 'new'
    check (order_status in ('new', 'in_progress', 'delivered', 'cancelled')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_payment_status_idx on orders (payment_status);
create index if not exists orders_owner_id_idx on orders (owner_id);

-- One row per payment ATTEMPT. A customer whose card is declined can try
-- again; each try gets its own row and its own merchant_ref, because the
-- gateways refuse a reused order number.
create table if not exists payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete restrict,
  -- 'test' = the payment simulator (PAYMENTS_SIMULATION=1): no money moves.
  provider text not null check (provider in ('arca', 'idram', 'manual', 'test')),
  -- The number we send the provider: order number + 2-digit attempt
  -- (100101, 100102, ...). Digits only, which every gateway accepts.
  merchant_ref text not null unique,
  -- The provider's own id: ArCa orderId, Idram EDP_TRANS_ID, or the bank
  -- transfer / receipt reference for a manual payment.
  provider_payment_id text,
  amount integer not null check (amount > 0),
  currency text not null default 'AMD' check (currency = 'AMD'),
  status text not null default 'created'
    check (status in ('created', 'pending', 'paid', 'failed', 'cancelled', 'refunded')),
  redirect_url text,
  card_mask text,
  error_code text,
  error_message text,
  raw jsonb,                    -- last verified provider response (no card data)
  recorded_by uuid references auth.users (id), -- manual payments: the admin
  note text,
  paid_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Databases created before the simulator existed: widen the provider check.
alter table payment_transactions drop constraint if exists payment_transactions_provider_check;
alter table payment_transactions add constraint payment_transactions_provider_check
  check (provider in ('arca', 'idram', 'manual', 'test'));
create index if not exists payment_transactions_order_id_idx on payment_transactions (order_id);
-- The same provider payment can never be booked twice (e.g. a replayed
-- Idram callback pointed at a different bill).
create unique index if not exists payment_transactions_provider_ref_uidx
  on payment_transactions (provider, provider_payment_id)
  where provider_payment_id is not null;

-- Append-only audit trail: every callback, return, verification and admin
-- action, including the repeated and ignored ones.
create table if not exists payment_events (
  id bigserial primary key,
  order_id uuid references orders (id) on delete cascade,
  transaction_id uuid references payment_transactions (id) on delete cascade,
  source text not null,   -- init | return | callback | verify | admin | precheck
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  actor uuid references auth.users (id),
  created_at timestamptz not null default now()
);
create index if not exists payment_events_order_id_idx on payment_events (order_id, created_at);

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at before update on orders
  for each row execute function set_updated_at();
drop trigger if exists payment_transactions_set_updated_at on payment_transactions;
create trigger payment_transactions_set_updated_at before update on payment_transactions
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Shareable invitations
-- ---------------------------------------------------------------------------
-- One public invitation per paid order, at /i/<code>. Created by
-- recompute_order_payment() the moment the order becomes paid, whichever
-- way the payment arrived. The page shows the purchased design filled in
-- with the order's customization (names, date, venue); Siloona corrects
-- those details from the dashboard. The link works only while the order
-- is paid and not cancelled.
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  order_id uuid not null unique references orders (id) on delete cascade,
  design_id text not null,
  created_at timestamptz not null default now()
);

-- Guests' answers from the invitation's RSVP form.
create table if not exists invitation_rsvps (
  id bigserial primary key,
  invitation_id uuid not null references invitations (id) on delete cascade,
  guest_name text not null check (char_length(guest_name) between 1 and 120),
  status text not null check (status in ('confirmed', 'declined')),
  plus integer not null default 0 check (plus between 0 and 20),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now()
);
create index if not exists invitation_rsvps_invitation_idx on invitation_rsvps (invitation_id, created_at);

-- ---------------------------------------------------------------------------
-- Payment state machine
-- ---------------------------------------------------------------------------

-- Re-derives an order's payment columns from its transactions:
--   any paid attempt            -> paid
--   else any refunded attempt   -> refunded
--   else latest started attempt -> its status (pending / failed / cancelled)
--   else                        -> unpaid
create or replace function recompute_order_payment(p_order uuid)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  paid_tx payment_transactions;
  ref_tx payment_transactions;
  last_tx payment_transactions;
  s text;
begin
  select * into paid_tx from payment_transactions
    where order_id = p_order and status = 'paid'
    order by paid_at nulls last, created_at limit 1;
  if paid_tx.id is not null then
    s := 'paid';
  else
    select * into ref_tx from payment_transactions
      where order_id = p_order and status = 'refunded'
      order by refunded_at desc nulls last limit 1;
    select * into last_tx from payment_transactions
      where order_id = p_order and status <> 'created'
      order by created_at desc limit 1;
    if ref_tx.id is not null then s := 'refunded';
    elsif last_tx.id is not null then s := last_tx.status;
    else s := 'unpaid';
    end if;
  end if;

  update orders set
    payment_status = s,
    payment_provider = coalesce(paid_tx.provider, ref_tx.provider, last_tx.provider, payment_provider),
    transaction_id = coalesce(
      coalesce(paid_tx.provider_payment_id, paid_tx.merchant_ref),
      coalesce(ref_tx.provider_payment_id, ref_tx.merchant_ref),
      transaction_id),
    paid_at = coalesce(paid_tx.paid_at, ref_tx.paid_at, paid_at)
  where id = p_order;

  -- First time paid: give the order its shareable invitation link. A code
  -- collision (12 hex chars, practically never) must not undo the payment,
  -- so it's skipped here and the server creates the link on next read.
  if s = 'paid' then
    insert into invitations (code, order_id, design_id)
    select substr(md5(gen_random_uuid()::text), 1, 12), o.id, o.design_id from orders o where o.id = p_order
    on conflict do nothing;
  end if;
  return s;
end;
$$;

-- Opens a new payment attempt for an order. Locks the order row, so two
-- clicks on "Pay" can't race each other into two attempts with one number.
create or replace function create_payment_attempt(p_order uuid, p_provider text)
returns payment_transactions
language plpgsql security definer set search_path = public
as $$
declare
  o orders;
  n integer;
  t payment_transactions;
begin
  select * into o from orders where id = p_order for update;
  if o.id is null then raise exception 'order_not_found'; end if;
  if o.payment_status = 'paid' then raise exception 'order_already_paid'; end if;
  if o.amount is null then raise exception 'order_has_no_amount'; end if;
  if o.order_status = 'cancelled' then raise exception 'order_cancelled'; end if;

  select count(*) + 1 into n from payment_transactions where order_id = p_order;
  if n > 99 then raise exception 'too_many_attempts'; end if;

  insert into payment_transactions (order_id, provider, merchant_ref, amount, currency, status)
  values (p_order, p_provider, o.order_number::text || lpad(n::text, 2, '0'), o.amount, o.currency, 'created')
  returning * into t;

  insert into payment_events (order_id, transaction_id, source, kind, payload)
  values (p_order, t.id, 'init', 'attempt_created',
          jsonb_build_object('provider', p_provider, 'merchant_ref', t.merchant_ref, 'amount', t.amount));
  return t;
end;
$$;

-- The ONLY way a transaction's status changes. Idempotent: repeating the
-- same result (a gateway retrying its callback, a customer reloading the
-- return page) changes nothing and is just logged as a duplicate.
-- Allowed moves:
--   created/pending -> pending | paid | failed | cancelled
--   failed/cancelled -> paid      (provider later confirms the money was taken)
--   paid -> refunded
-- Anything else (e.g. paid -> failed) is refused and logged.
create or replace function apply_payment_status(
  p_tx uuid, p_status text, p_patch jsonb, p_source text, p_actor uuid default null
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_order uuid;
  o orders;
  t payment_transactions;
  prev text;
  ok boolean;
  kind text;
  order_status_now text;
begin
  if p_status not in ('pending', 'paid', 'failed', 'cancelled', 'refunded') then
    raise exception 'bad_status %', p_status;
  end if;
  p_patch := coalesce(p_patch, '{}'::jsonb);

  -- Lock order first, then the transaction — the same order every caller
  -- uses, so concurrent callbacks can't deadlock.
  select order_id into v_order from payment_transactions where id = p_tx;
  if v_order is null then raise exception 'tx_not_found'; end if;
  select * into o from orders where id = v_order for update;
  select * into t from payment_transactions where id = p_tx for update;
  prev := t.status;

  ok := case
    when p_status = prev then false
    when prev in ('created', 'pending') then p_status in ('pending', 'paid', 'failed', 'cancelled')
    when prev in ('failed', 'cancelled') then p_status = 'paid'
    when prev = 'paid' then p_status = 'refunded'
    else false
  end;

  if ok then
    update payment_transactions set
      status = p_status,
      provider_payment_id = coalesce(p_patch->>'provider_payment_id', provider_payment_id),
      card_mask = coalesce(p_patch->>'card_mask', card_mask),
      error_code = case when p_status in ('failed', 'cancelled') then p_patch->>'error_code' else error_code end,
      error_message = case when p_status in ('failed', 'cancelled') then p_patch->>'error_message' else error_message end,
      raw = coalesce(p_patch->'raw', raw),
      paid_at = case when p_status = 'paid' then now() else paid_at end,
      refunded_at = case when p_status = 'refunded' then now() else refunded_at end
    where id = p_tx;

    -- Two different attempts both took money. Keep both as paid so the
    -- dashboard shows it, and flag it so an admin refunds one.
    if p_status = 'paid' and o.payment_status = 'paid' then
      insert into payment_events (order_id, transaction_id, source, kind, payload, actor)
      values (o.id, p_tx, p_source, 'duplicate_payment_needs_refund', '{}'::jsonb, p_actor);
    end if;
    perform recompute_order_payment(o.id);
    kind := 'status_' || p_status;
  elsif p_status = prev then
    kind := 'repeat_' || p_status;
  else
    kind := 'ignored_' || prev || '_to_' || p_status;
  end if;

  insert into payment_events (order_id, transaction_id, source, kind, payload, actor)
  values (o.id, p_tx, p_source, kind, p_patch - 'raw', p_actor);

  select payment_status into order_status_now from orders where id = o.id;
  return jsonb_build_object(
    'applied', ok,
    'previous', prev,
    'status', case when ok then p_status else prev end,
    'order_payment_status', order_status_now
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Access
-- ---------------------------------------------------------------------------
alter table orders enable row level security;
alter table payment_transactions enable row level security;
alter table payment_events enable row level security;

drop policy if exists "orders: admins read" on orders;
create policy "orders: admins read" on orders for select using (is_admin());
drop policy if exists "orders: owner read" on orders;
create policy "orders: owner read" on orders for select using (auth.uid() = owner_id);
drop policy if exists "payment_transactions: admins read" on payment_transactions;
create policy "payment_transactions: admins read" on payment_transactions for select using (is_admin());
alter table invitations enable row level security;
alter table invitation_rsvps enable row level security;
drop policy if exists "invitations: admins read" on invitations;
create policy "invitations: admins read" on invitations for select using (is_admin());
drop policy if exists "invitation_rsvps: admins read" on invitation_rsvps;
create policy "invitation_rsvps: admins read" on invitation_rsvps for select using (is_admin());
-- Guests read an invitation and send RSVPs only through /api/invitations.
drop policy if exists "payment_events: admins read" on payment_events;
create policy "payment_events: admins read" on payment_events for select using (is_admin());
-- No insert/update/delete policies: only the server (service role) writes.

-- The state-machine functions are SECURITY DEFINER, so they must not be
-- callable from the browser through the public API.
revoke all on function recompute_order_payment(uuid) from public, anon, authenticated;
revoke all on function create_payment_attempt(uuid, text) from public, anon, authenticated;
revoke all on function apply_payment_status(uuid, text, jsonb, text, uuid) from public, anon, authenticated;
grant execute on function recompute_order_payment(uuid) to service_role;
grant execute on function create_payment_attempt(uuid, text) to service_role;
grant execute on function apply_payment_status(uuid, text, jsonb, text, uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Customer photos (designs with photos, e.g. wd-mono). Uploaded by the
-- server (/api/uploads, service role), readable by anyone with the link —
-- they appear on the customer's public invitation. Re-runnable.
-- ---------------------------------------------------------------------------
do $$
begin
  -- Only where Supabase Storage exists (the local test database has none).
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('invitation-photos', 'invitation-photos', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
    on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
  end if;
end $$;
