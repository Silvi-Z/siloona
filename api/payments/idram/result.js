import { allow, handler, readBody, sendText } from '../../_lib/http.js'
import { getStore } from '../../_lib/store.js'
import { handleIdramResult } from '../../_lib/orders.js'

// POST /api/payments/idram/result — Idram's RESULT_URL (precheck + signed
// payment confirmation). Replies "OK" or a refusal, as Idram expects.
export default handler(async (req, res) => {
  allow(req, ['POST'])
  const p = await readBody(req)
  sendText(res, 200, await handleIdramResult(getStore(), p))
})
