import { allow, bearerToken, getQuery, handler, readBody, sendJson } from '../_lib/http.js'
import { getStore } from '../_lib/store.js'
import { customerView, invitationForOrder, loadOrderForCustomer, saveRsvpQuestions, settleOpenAttempts } from '../_lib/orders.js'
import { claimOrder } from '../_lib/orderEvents.js'
import { coupleWishes } from '../_lib/wishes.js'
import { saveThankYou } from '../_lib/thankYou.js'

// GET /api/orders/status?id=…&t=… — the customer's order page.
// While a card payment is still open it re-asks ArCa (at most every few
// seconds per attempt), so the page settles even if the redirect back
// from the bank was lost.
// POST { action: 'claim', id, t[, eventId] } + the signed-in customer's
// token — links the paid order to their dashboard event (orderEvents.js).
// (Here rather than in a file of its own: the free Vercel plan allows 12.)
export default handler(async (req, res) => {
  allow(req, ['GET', 'POST'])
  const store = getStore()
  if (req.method === 'POST') {
    const body = await readBody(req)
    // «Լրացուցիչ հարց RSVP-ում»: the couple's questions (orders.js saveRsvpQuestions)
    if (body.action === 'rsvp_questions') return sendJson(res, 200, await saveRsvpQuestions(store, body))
    // «Մաղթանքների գիրք»: the couple's own page (wishes.js)
    if (['wishes', 'wish_hide', 'wishes_close'].includes(body.action)) return sendJson(res, 200, await coupleWishes(store, body))
    // «Շնորհակալական էջ» (thankYou.js)
    if (body.action === 'thank_you') return sendJson(res, 200, await saveThankYou(store, body))
    if (body.action !== 'claim') return sendJson(res, 400, { error: 'bad_action', message: 'Սխալ հարցում։' })
    const token = bearerToken(req)
    const user = token ? await store.getUser(token) : null
    return sendJson(res, 200, await claimOrder(store, user, body))
  }
  const q = getQuery(req)
  let order = await loadOrderForCustomer(store, q.id, q.t)
  let txs = await store.listTransactions(order.id)
  const stale = txs.some((t) => t.provider === 'arca' && ['created', 'pending'].includes(t.status) &&
    Date.now() - new Date(t.updated_at).getTime() > 4000)
  if (stale) {
    await settleOpenAttempts(store, order.id, { source: 'verify' })
    order = await store.getOrder(order.id)
    txs = await store.listTransactions(order.id)
  }
  const invitation = await invitationForOrder(store, order)
  // the guests' answers so far, for the customer's order page
  if (invitation && store.listRsvps) invitation.rsvps = await store.listRsvps(invitation.id)
  sendJson(res, 200, customerView(order, txs, invitation))
})
