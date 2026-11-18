import { allow, getQuery, handler, redirect } from '../../_lib/http.js'
import { getStore } from '../../_lib/store.js'
import { isUuid, verifyTransaction } from '../../_lib/orders.js'

// GET /api/payments/arca/return?tx=…[&r=fail]&orderId=… — where ArCa sends
// the customer back. The query string decides nothing: the result is read
// from ArCa server-to-server, then the customer lands on their order page.
export default handler(async (req, res) => {
  allow(req, ['GET', 'POST'])
  const store = getStore()
  const q = getQuery(req)
  const tx = isUuid(q.tx) ? await store.getTransaction(q.tx) : null
  if (!tx || tx.provider !== 'arca') return redirect(res, '/checkout/result?e=not_found')
  if (q.orderId && tx.provider_payment_id && q.orderId !== tx.provider_payment_id) {
    await store.logEvent({ order_id: tx.order_id, transaction_id: tx.id, source: 'return', kind: 'return_order_id_mismatch', payload: { orderId: q.orderId } })
  } else {
    await verifyTransaction(store, tx, { hint: q.r === 'fail' ? 'fail' : null, source: 'return' })
  }
  const order = await store.getOrder(tx.order_id)
  redirect(res, `/checkout/result?order=${order.id}&t=${order.access_token}`)
})
