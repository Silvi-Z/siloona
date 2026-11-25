import { timingSafeEqual } from 'node:crypto'
import { allow, getQuery, handler, HttpError, readBody, sendJson } from '../../_lib/http.js'
import { getStore } from '../../_lib/store.js'
import { applyStatus, isUuid } from '../../_lib/orders.js'
import { simulator, SIM_CARDS, simOutcome } from '../../_lib/providers/simulator.js'

// The simulator's "gateway".
//   GET  ?tx=…&k=…   what the test payment page shows (and its test cards)
//   POST { tx, k, outcome: paid|failed|cancelled, via?: card|idram,
//          card?: a test card number, reason?: funds|declined|3ds }
//        finish the test payment
// k is the order's secret, so only the customer's own link works.
async function load(store, txId, k) {
  if (!simulator.configured()) throw new HttpError(404, 'simulation_off', 'Թեստային վճարումն անջատված է։')
  const notFound = new HttpError(404, 'not_found', 'Թեստային վճարումը չի գտնվել։')
  const tx = isUuid(txId) ? await store.getTransaction(txId) : null
  if (!tx || tx.provider !== 'test') throw notFound
  const order = await store.getOrder(tx.order_id)
  const a = Buffer.from(order.access_token)
  const b = Buffer.from(String(k || ''))
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw notFound
  return { tx, order }
}

export default handler(async (req, res) => {
  allow(req, ['GET', 'POST'])
  const store = getStore()

  if (req.method === 'GET') {
    const q = getQuery(req)
    const { tx, order } = await load(store, q.tx, q.k)
    return sendJson(res, 200, { orderNumber: order.order_number, merchantRef: tx.merchant_ref, amount: tx.amount, status: tx.status, orderId: order.id, cards: SIM_CARDS })
  }

  const body = await readBody(req)
  const { tx, order } = await load(store, body.tx, body.k)
  const via = body.via || 'card'
  const outcome = simOutcome({ outcome: body.outcome, via, card: body.card, reason: body.reason })
  if (!outcome) throw new HttpError(422, 'invalid', 'Անհայտ արդյունք։')
  // Same path as a verified gateway result; repeats are no-ops. Only the
  // test card's masked number is kept, never the number itself.
  await applyStatus(store, tx.id, outcome.status, { ...outcome.patch, raw: { simulated: true, via, outcome: body.outcome, reason: body.reason || null } }, 'callback')
  sendJson(res, 200, { redirect: `/checkout/result?order=${order.id}&t=${order.access_token}` })
})
