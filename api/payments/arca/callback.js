import { allow, getQuery, handler, readBody, sendText } from '../../_lib/http.js'
import { getStore } from '../../_lib/store.js'
import { verifyTransaction } from '../../_lib/orders.js'

// GET|POST /api/payments/arca/callback — optional notification the bank can
// enable for the merchant (params mdOrder, orderNumber, operation, status).
// It is treated only as a nudge: we look the attempt up by our own number
// and ask ArCa for the real status, so a forged callback changes nothing.
// Repeats are harmless (apply_payment_status is idempotent).
export default handler(async (req, res) => {
  allow(req, ['GET', 'POST'])
  const store = getStore()
  const p = { ...getQuery(req), ...(req.method === 'POST' ? await readBody(req) : {}) }
  const tx = p.orderNumber ? await store.findTransaction('arca', String(p.orderNumber)) : null
  if (tx && (!p.mdOrder || p.mdOrder === tx.provider_payment_id)) {
    await store.logEvent({ order_id: tx.order_id, transaction_id: tx.id, source: 'callback', kind: 'arca_callback', payload: { operation: p.operation, status: p.status } })
    await verifyTransaction(store, tx, { source: 'callback' })
  }
  sendText(res, 200, 'OK')
})
