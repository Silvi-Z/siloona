import { allow, getQuery, handler, sendJson } from '../_lib/http.js'
import { getStore } from '../_lib/store.js'
import { customerView, invitationForOrder, loadOrderForCustomer, settleOpenAttempts } from '../_lib/orders.js'

// GET /api/orders/status?id=…&t=… — the customer's order page.
// While a card payment is still open it re-asks ArCa (at most every few
// seconds per attempt), so the page settles even if the redirect back
// from the bank was lost.
export default handler(async (req, res) => {
  allow(req, ['GET'])
  const store = getStore()
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
