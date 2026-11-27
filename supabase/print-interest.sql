-- Siloona: «Ինձ հետաքրքրում են նաև տպագիր հրավերներ…» from the checkout.
-- Run after wishes.sql, in the Supabase SQL editor. It only ADDS a
-- column; safe to re-run.
--
-- Not a sale and not a price: only a note that this customer would like
-- to hear about printed invitations, thank-you cards and favour boxes in
-- the same style, so Siloona can offer them in person. The order's amount
-- never depends on it.

alter table orders add column if not exists print_interest boolean not null default false;
