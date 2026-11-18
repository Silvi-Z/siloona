import { allow, bearerToken, handler, readBody, sendJson } from '../_lib/http.js'
import { getStore } from '../_lib/store.js'
import { createOrder } from '../_lib/orders.js'
import { rateLimit } from '../_lib/guestLinks.js'

// POST /api/orders — create an order from the checkout form.
// The price is looked up on the server; an amount in the body is ignored.
export default handler(async (req, res) => {
  allow(req, ['POST'])
  const store = getStore()
  await rateLimit(store, req, 'order')
  const body = await readBody(req)
  const token = bearerToken(req)
  const user = token ? await store.getUser(token) : null
  sendJson(res, 201, await createOrder(store, body, user))
})
