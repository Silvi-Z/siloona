import { allow, getQuery, handler, readBody, sendJson } from '../_lib/http.js'
import { getStore } from '../_lib/store.js'
import { publicInvitation, submitRsvp } from '../_lib/orders.js'
import { publicEventInvitation, rateLimit, submitEventRsvp } from '../_lib/guestLinks.js'

// Public invitation pages, /i/…:
//   /i/<12-hex code>            a purchased invitation (orders)
//   /i/<event slug>[/<token>]   a dashboard event, general or a guest's own
//                               link (guestLinks.js)
//   GET  ?code=…[&t=…]          what the page renders
//   POST { code, name, status, plus, note }        RSVP to a purchased one
//   POST { slug, t?, name, status, plus, note }    RSVP to a dashboard event
const ORDER_CODE = /^[0-9a-f]{12}$/

export default handler(async (req, res) => {
  allow(req, ['GET', 'POST'])
  const store = getStore()
  if (req.method === 'GET') {
    await rateLimit(store, req, 'open')
    const q = getQuery(req)
    const code = String(q.code || '')
    if (ORDER_CODE.test(code) && !q.t) return sendJson(res, 200, { kind: 'order', ...(await publicInvitation(store, code)) })
    return sendJson(res, 200, await publicEventInvitation(store, code, q.t ? String(q.t) : null))
  }
  await rateLimit(store, req, 'rsvp')
  const body = await readBody(req)
  if (body.slug) await submitEventRsvp(store, body)
  else await submitRsvp(store, body.code, body)
  sendJson(res, 201, { ok: true })
})
