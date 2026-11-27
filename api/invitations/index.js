import { HttpError, allow, getQuery, handler, readBody, sendJson, siteUrl } from '../_lib/http.js'
import { icsText } from '../../src/site/invitations/shared/calendarEvent.js'
import { getStore } from '../_lib/store.js'
import { invitationSeatingPlan, loadInvitation, personalGreeting, publicInvitation, submitRsvp } from '../_lib/orders.js'
import { loadPublished, publicEventInvitation, rateLimit, seatingPlanForEvent, submitEventRsvp } from '../_lib/guestLinks.js'
import { findSeat } from '../_lib/seating.js'

// Public invitation pages, /i/…:
//   /i/<12-hex code>            a purchased invitation (orders); once its
//                               order is linked to the customer's dashboard
//                               event (orderEvents.js), that event's version
//   /i/<event slug>[/<token>]   a dashboard event, general or a guest's own
//                               link (guestLinks.js)
//   GET  ?code=…[&t=…]          what the page renders
//   /i/<code>/<token>           a guest's personal link to a purchased one
//                               (personal-links.sql): { …, personal: { name } };
//                               an unknown token opens the general page
//   POST { code, t?, name, status, plus, note }    RSVP to a purchased one
//   POST { slug, t?, name, status, plus, note }    RSVP to a dashboard event
//   GET  ?ics=1&t=…&d=…&h=…     «Ավելացնել օրացույցում»: the event as an
//                               .ics file (Apple / other calendars)
//   POST { seat: true, code, name }                «Ձեր սեղանը»: the guest's
//        table (seating.js) — { status: found|ambiguous|not_found|empty, table? }
// (One function for all of it: the free Vercel plan allows 12.)
const ORDER_CODE = /^[0-9a-f]{12}$/

// The seating plan behind a link, checked the same way as the page itself.
async function planForLink(store, code) {
  if (ORDER_CODE.test(code)) {
    const { inv, order } = await loadInvitation(store, code)
    const own = await invitationSeatingPlan(store, inv, order)
    if (own) return own
    const linked = await loadPublished(store, code).catch(() => null)
    return linked ? seatingPlanForEvent(store, linked) : null
  }
  return seatingPlanForEvent(store, await loadPublished(store, code))
}

// The linked event's page for a purchased invitation's code, or null when
// there is none (not linked, not published, links off) — then the order's
// own page is shown, as before.
const linkedEventPage = (store, code) => publicEventInvitation(store, code, null)
  .catch((e) => { if (e instanceof HttpError && [404, 410].includes(e.status)) return null; throw e })

// GET ?ics=1&t=…&d=YYYY-MM-DD&h=HH:MM[&e=HH:MM][&l=…][&u=…][&lang=…]
// «Ավելացնել օրացույցում» → Apple / other calendar: the event as an .ics
// file (shared/calendarEvent.js). Only plain text goes in, escaped, and
// the invitation link only if it is on this site.
function sendIcs(req, res, q) {
  const s = (v, max) => String(v || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max)
  let url = s(q.u, 300)
  try {
    const host = new URL(siteUrl(req)).host
    if (url && new URL(url).host !== host) url = ''
  } catch { url = '' }
  const ev = { title: s(q.t, 160), date: s(q.d, 10), time: s(q.h, 5), endTime: s(q.e, 5), location: s(q.l, 300), url, lang: s(q.lang, 2) }
  const text = ev.title ? icsText(ev) : null
  if (!text) throw new HttpError(422, 'invalid', 'Սխալ հարցում։')
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.setHeader('Content-Disposition', 'inline; filename="invitation.ics"')
  res.setHeader('Cache-Control', 'public, max-age=300')
  res.end(text)
}

export default handler(async (req, res) => {
  allow(req, ['GET', 'POST'])
  if (req.method === 'GET') {
    const q = getQuery(req)
    if (q.ics) return sendIcs(req, res, q)
  }
  const store = getStore()
  if (req.method === 'GET') {
    await rateLimit(store, req, 'open')
    const q = getQuery(req)
    const code = String(q.code || '')
    if (ORDER_CODE.test(code)) {
      const t = q.t ? String(q.t) : null
      // a guest's personal link to the purchased invitation (personal-links.sql)
      const personal = t ? await personalGreeting(store, code, t) : null
      if (t && !personal) {
        // a guest's link from the linked dashboard event, as before
        const ev = await publicEventInvitation(store, code, t)
          .catch((e) => { if (e instanceof HttpError && [404, 410].includes(e.status)) return null; throw e })
        if (ev) return sendJson(res, 200, ev)
        // an unknown link: the general invitation, no error
      }
      const page = (await linkedEventPage(store, code)) || { kind: 'order', ...(await publicInvitation(store, code)) }
      return sendJson(res, 200, personal ? { ...page, personal } : page)
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
