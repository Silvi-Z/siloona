import { HttpError, allow, getQuery, handler, readBody, sendJson } from '../_lib/http.js'
import { getStore } from '../_lib/store.js'
import { loadInvitation, publicInvitation, submitRsvp } from '../_lib/orders.js'
import { loadPublished, publicEventInvitation, rateLimit, seatingPlanForEvent, submitEventRsvp } from '../_lib/guestLinks.js'
import { findSeat, seatingPlan } from '../_lib/seating.js'

// Public invitation pages, /i/…:
//   /i/<12-hex code>            a purchased invitation (orders); once its
//                               order is linked to the customer's dashboard
//                               event (orderEvents.js), that event's version
//   /i/<event slug>[/<token>]   a dashboard event, general or a guest's own
//                               link (guestLinks.js)
//   GET  ?code=…[&t=…]          what the page renders
//   POST { code, name, status, plus, note }        RSVP to a purchased one
//   POST { slug, t?, name, status, plus, note }    RSVP to a dashboard event
//   POST { seat: true, code, name }                «Ձեր սեղանը»: the guest's
//        table (seating.js) — { status: found|ambiguous|not_found|empty, table? }
// (One function for all of it: the free Vercel plan allows 12.)
const ORDER_CODE = /^[0-9a-f]{12}$/

// The seating plan behind a link, checked the same way as the page itself.
async function planForLink(store, code) {
  if (ORDER_CODE.test(code)) {
    const own = await seatingPlan(store, { invitation_id: (await loadInvitation(store, code)).inv.id })
    if (own) return own
    const linked = await loadPublished(store, code).catch(() => null)
    return linked ? seatingPlan(store, { event_id: linked.id }) : null
  }
  return seatingPlanForEvent(store, await loadPublished(store, code))
}

// The linked event's page for a purchased invitation's code, or null when
// there is none (not linked, not published, links off) — then the order's
// own page is shown, as before.
const linkedEventPage = (store, code) => publicEventInvitation(store, code, null)
  .catch((e) => { if (e instanceof HttpError && [404, 410].includes(e.status)) return null; throw e })

export default handler(async (req, res) => {
  allow(req, ['GET', 'POST'])
  const store = getStore()
  if (req.method === 'GET') {
    await rateLimit(store, req, 'open')
    const q = getQuery(req)
    const code = String(q.code || '')
    if (ORDER_CODE.test(code) && !q.t) {
      return sendJson(res, 200, (await linkedEventPage(store, code)) || { kind: 'order', ...(await publicInvitation(store, code)) })
    }
    return sendJson(res, 200, await publicEventInvitation(store, code, q.t ? String(q.t) : null))
  }
  const body = await readBody(req)
  if (body.seat) {
    await rateLimit(store, req, 'seat')
    const plan = await planForLink(store, String(body.code || ''))
    return sendJson(res, 200, await findSeat(store, plan, body.name))
  }
  await rateLimit(store, req, 'rsvp')
  if (body.slug) await submitEventRsvp(store, body)
  else await submitRsvp(store, body.code, body)
  sendJson(res, 201, { ok: true })
})
