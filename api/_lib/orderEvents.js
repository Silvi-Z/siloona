import { HttpError } from './http.js'
import { loadOrderForCustomer } from './orders.js'

// A paid order and the customer's dashboard event (supabase/order-events.sql).
//
// From their order page the customer opens /dashboard?claim=…; once signed
// in, the dashboard asks here twice:
//   1. { action: 'claim', id, t }            → the order's details, to fill
//                                              their event with
//   2. { action: 'claim', id, t, eventId }   → links the order to that event
// Only the order's secret link (t) and the signed-in account together can
// do it, and an order belongs to one account and one event, for good.
// From then on the event's guest links open (guestLinks.js → loadPublished),
// and so does the order's own /i/<code> link with the event's content.

const paid = (o) => o && o.payment_status === 'paid' && o.order_status !== 'cancelled'

export async function claimOrder(store, user, body = {}) {
  if (!user) throw new HttpError(401, 'sign_in', 'Մուտք գործեք Ձեր հաշիվ։')
  const order = await loadOrderForCustomer(store, body.id, body.t)
  if (!paid(order)) throw new HttpError(409, 'not_paid', 'Պատվերը դեռ վճարված չէ։')

  if (order.event_id) {
    const ev = await store.getEventBySlug(order.event_id)
    if (ev && ev.owner_id === user.id) return { linked: true, eventId: ev.id, orderNumber: order.order_number }
    if (ev) throw new HttpError(409, 'claimed', 'Այս պատվերն արդեն կապված է մեկ այլ հաշվի հետ։ Գրեք մեզ, եթե դա սխալ է։')
    // the event was deleted: the order may be linked again
  }

  if (!body.eventId) {
    const { names, eventDate, eventTime, venue, details, content } = order.customization || {}
    return {
      linked: false,
      orderNumber: order.order_number,
      designId: order.design_id,
      customization: { names, eventDate, eventTime, venue },
      details: details || null,
      content: content || null,
    }
  }

  const eventId = typeof body.eventId === 'string' ? body.eventId.slice(0, 80) : ''
  const ev = eventId ? await store.getEventBySlug(eventId) : null
  if (!ev || ev.id !== eventId || ev.owner_id !== user.id) throw new HttpError(404, 'no_event', 'Միջոցառումը չի գտնվել։')
  const other = await store.getOrderByEvent(eventId)
  if (other && other.id !== order.id) throw new HttpError(409, 'event_taken', 'Այս միջոցառումն արդեն կապված է մեկ այլ պատվերի հետ։')
  try {
    await store.updateOrder(order.id, { event_id: eventId, owner_id: user.id })
  } catch (e) {
    if (String(e.message || e).includes('orders_event_id_uidx')) throw new HttpError(409, 'event_taken', 'Այս միջոցառումն արդեն կապված է մեկ այլ պատվերի հետ։')
    throw e
  }
  await store.logEvent({ order_id: order.id, source: 'admin', kind: 'linked_to_event', payload: { event_id: eventId }, actor: user.id })
  return { linked: true, eventId, orderNumber: order.order_number }
}

// The paid order behind an event, or null — what decides whether guests
// may open the event's invitation at all.
export async function liveOrderForEvent(store, eventId) {
  const order = await store.getOrderByEvent(eventId)
  return paid(order) ? order : null
}

// The event a purchased invitation's code now stands for, if its order
// was linked to one (the code's link then shows the dashboard version).
export async function eventIdForInvitationCode(store, code) {
  const inv = await store.getInvitationByCode(code)
  if (!inv) return null
  const order = await store.getOrder(inv.order_id)
  return order?.event_id || null
}
