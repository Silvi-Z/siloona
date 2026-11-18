import { allow, bearerToken, handler, HttpError, readBody, sendJson } from '../_lib/http.js'
import { getStore } from '../_lib/store.js'
import { adminAction, isUuid } from '../_lib/orders.js'

// POST /api/admin/orders { orderId, action, ... } — dashboard actions on an
// order (verify with provider, refund, record a manual payment, change the
// production status, set the price of an order request). Admins read
// orders directly through Supabase RLS; every change comes through here.
export default handler(async (req, res) => {
  allow(req, ['POST'])
  const store = getStore()
  const token = bearerToken(req)
  const user = token ? await store.getUser(token) : null
  if (!user || !(await store.isAdmin(user.id))) throw new HttpError(403, 'forbidden', 'Մուտքն արգելված է։')
  const body = await readBody(req)
  const order = isUuid(body.orderId) ? await store.getOrder(body.orderId) : null
  if (!order) throw new HttpError(404, 'not_found', 'Պատվերը չի գտնվել։')
  await adminAction(store, order, body, user.id)
  sendJson(res, 200, { ok: true })
})
