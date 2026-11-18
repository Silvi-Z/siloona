import { allow, handler, readBody, sendJson } from '../_lib/http.js'
import { getStore } from '../_lib/store.js'
import { loadOrderForCustomer, startPayment } from '../_lib/orders.js'

// POST /api/payments/start { orderId, token, method } — opens a payment
// attempt. Returns { redirectUrl } (ArCa hosted page), { form } (Idram:
// the browser posts it), or { alreadyPaid: true }.
export default handler(async (req, res) => {
  allow(req, ['POST'])
  const store = getStore()
  const body = await readBody(req)
  const order = await loadOrderForCustomer(store, body.orderId, body.token)
  sendJson(res, 200, await startPayment(store, order, String(body.method || ''), req))
})
