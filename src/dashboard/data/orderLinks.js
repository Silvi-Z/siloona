// Which of this account's events have a paid order behind them. Only the
// server links an order to an event (api/_lib/orderEvents.js); the
// dashboard reads the account's own orders (RLS «orders: owner read») to
// know which events guests can actually open — publishing an event with
// no paid order changes nothing for guests, so the dashboard says so.
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export const LINKS = new Map(); // event id → { orderNumber, designId, live }

export async function loadLinks(userId) {
  LINKS.clear();
  if (!isSupabaseConfigured || !userId) return;
  const { data, error } = await supabase
    .from('orders')
    .select('order_number, design_id, event_id, payment_status, order_status')
    .eq('owner_id', userId)
    .not('event_id', 'is', null);
  // before supabase/order-events.sql has run there's no event_id column:
  // then simply nothing is linked yet
  if (error) return;
  for (const o of data || []) {
    LINKS.set(o.event_id, {
      orderNumber: o.order_number,
      designId: o.design_id,
      live: o.payment_status === 'paid' && o.order_status !== 'cancelled',
    });
  }
}

export const linkedOrder = (ev) => (ev ? LINKS.get(ev.id) || null : null);
export const isLive = (ev) => !!linkedOrder(ev)?.live;

export const NOT_LINKED = 'Հյուրերը հրավերը կտեսնեն դիզայնը պատվիրելուց և վճարելուց հետո։ Ընտրեք դիզայն կայքում, ապա պատվերի էջից բացեք Ձեր վահանակը։';
