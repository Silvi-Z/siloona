-- Siloona: paid add-ons (src/site/addons.js, prices in src/site/prices.js).
-- Run after schema.sql, payments.sql, guest-links.sql, seating.sql and
-- order-events.sql, in the Supabase SQL editor. It only ADDS columns and
-- fills them in; safe to re-run.
--
--   orders.addons        what the customer chose at checkout, with each
--                        price as it was then: [{"id":"seating","price":4000}].
--                        orders.amount already includes them (the server
--                        works it out; the browser's total is never used).
--   invitations.features features Siloona turned on for one invitation by
--                        hand, on top of what its order paid for:
--                        ["seating"]. The page shows a feature only when
--                        the invitation has it (api/_lib/orders.js).

alter table orders add column if not exists addons jsonb not null default '[]'::jsonb;
alter table orders drop constraint if exists orders_addons_array;
alter table orders add constraint orders_addons_array check (jsonb_typeof(addons) = 'array');

alter table invitations add column if not exists features jsonb not null default '[]'::jsonb;
alter table invitations drop constraint if exists invitations_features_array;
alter table invitations add constraint invitations_features_array check (jsonb_typeof(features) = 'array');

-- «Ձեր սեղանը» lists imported before add-ons existed keep their section:
-- the invitation (or the dashboard event's order's invitation) gets the
-- seating feature.
update invitations i set features = i.features || '["seating"]'::jsonb
where not (i.features ? 'seating')
  and exists (select 1 from seating_plans p where p.invitation_id = i.id and p.enabled);

update invitations i set features = i.features || '["seating"]'::jsonb
where not (i.features ? 'seating')
  and exists (
    select 1 from seating_plans p join orders o on o.event_id = p.event_id
    where o.id = i.order_id and p.enabled
  );
