-- Siloona: a paid order ↔ the couple's dashboard event.
-- Run after schema.sql, payments.sql and guest-links.sql, in the Supabase
-- SQL editor. It only ADDS a column and an index; safe to re-run.
--
-- After paying, the customer opens their dashboard from the order page
-- and the order is linked to their event (api/_lib/orderEvents.js). Only
-- then do the event's guest links (/i/<event>[/<guest>]) open — an event
-- without a paid order is never shown to guests, whatever its own data
-- says (the browser can write its event, but never this column: orders
-- have no insert/update policy, only the server writes them).

alter table orders add column if not exists event_id text references events (id) on delete set null;
-- one order per event, one event per order
create unique index if not exists orders_event_id_uidx on orders (event_id) where event_id is not null;
