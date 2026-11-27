// End-to-end tests of the order/payment API against a fake ArCa gateway
// and an in-memory Postgres running the real migrations.
// Run: npm run test:payments
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { startFakeArca } from './fakeArca.js'
import { createPgStore, USERS } from './pgStore.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const IDRAM = { account: '110000601', secret: 'idram-test-secret' }
let arca, store, api, base
// Prices come from the real price list; one extra test-only design has no
// price, to exercise order requests whatever the catalog currently says.
const { DESIGN_PRICES } = await import(pathToFileURL(path.join(ROOT, 'src/site/prices.js')).href)
const P = DESIGN_PRICES['bd-animals']
const REQ = '__test-unpriced'
DESIGN_PRICES[REQ] = { diy: null, assisted: null }

// Same routing rule as Vercel / the dev plugin in vite.config.js.
function startApi() {
  const server = http.createServer(async (req, res) => {
    const p = req.url.split('?')[0].replace(/\/+$/, '')
    for (const rel of [`${p}.js`, `${p}/index.js`]) {
      const file = path.join(ROOT, rel)
      if (p.startsWith('/api/') && !p.includes('/_') && fs.existsSync(file)) {
        return (await import(pathToFileURL(file).href)).default(req, res)
      }
    }
    res.writeHead(404); res.end()
  })
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r(server)))
}

async function call(method, url, { body, form, token } = {}) {
  const headers = {}
  let payload
  if (body) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body) }
  if (form) { headers['Content-Type'] = 'application/x-www-form-urlencoded'; payload = new URLSearchParams(form).toString() }
  if (token) headers.Authorization = `Bearer ${token}`
  const r = await fetch(url.startsWith('http') ? url : base + url, { method, headers, body: payload, redirect: 'manual' })
  const text = await r.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* text reply */ }
  return { status: r.status, json, text, location: r.headers.get('location') }
}

const orderBody = (over = {}) => ({
  clientRef: randomUUID(),
  designId: 'bd-animals',
  option: 'diy',
  consent: true,
  amount: 1, // must be ignored: the server prices the order itself
  customer: { name: 'Աննա Պետրոսյան', phone: '+374 99 123456', email: 'anna@example.com', contactVia: 'viber' },
  customization: { names: 'Նարե', eventDate: '2027-03-14', eventTime: '17:00', venue: 'Երևան', notes: 'Վարդագույն' },
  ...over,
})

async function newOrder(over) {
  const r = await call('POST', '/api/orders', { body: orderBody(over) })
  assert.equal(r.status, 201, r.text)
  return r.json
}
const status = (o) => call('GET', `/api/orders/status?id=${o.orderId}&t=${o.token}`)
const start = (o, method) => call('POST', '/api/payments/start', { body: { orderId: o.orderId, token: o.token, method } })
const arcaIdFrom = (url) => new URL(url).searchParams.get('mdOrder')
// What a customer's browser does on the bank page: the fake bank redirects
// to our return URL; we follow that one hop.
async function payOnBank(redirectUrl, action) {
  const r = await fetch(`${arca.base}/pay/act?a=${action}&mdOrder=${arcaIdFrom(redirectUrl)}`, { redirect: 'manual' })
  return call('GET', r.headers.get('location'))
}
function idramSign(p) {
  const src = [IDRAM.account, p.EDP_AMOUNT, IDRAM.secret, p.EDP_BILL_NO, p.EDP_PAYER_ACCOUNT, p.EDP_TRANS_ID, p.EDP_TRANS_DATE].join(':')
  return createHash('md5').update(src).digest('hex').toUpperCase()
}

before(async () => {
  arca = await startFakeArca()
  store = await createPgStore()
  api = await startApi()
  base = `http://127.0.0.1:${api.address().port}`
  Object.assign(process.env, {
    ARCA_USERNAME: 'test-api', ARCA_PASSWORD: 'test-pass', ARCA_API_BASE: arca.restBase,
    IDRAM_ACCOUNT_ID: IDRAM.account, IDRAM_SECRET_KEY: IDRAM.secret,
    PUBLIC_SITE_URL: base, SUPABASE_URL: 'http://unused', SUPABASE_SERVICE_ROLE_KEY: 'unused',
    RATE_LIMITS: 'off', // one test below turns it back on
    EVENT_LINKS: 'on', // one test below turns it off
  })
  const { setStore } = await import(pathToFileURL(path.join(ROOT, 'api/_lib/store.js')).href)
  setStore(store)
})
after(async () => { await arca.close(); api.close(); await store.db.close() })

test('config lists only methods whose credentials are set', async () => {
  const r = await call('GET', '/api/checkout/config')
  assert.deepEqual(r.json, { ordersEnabled: true, methods: ['arca', 'idram'] })
})

test('order: server sets the price, validates input, and is idempotent', async () => {
  const body = orderBody()
  const a = await call('POST', '/api/orders', { body })
  assert.equal(a.status, 201)
  assert.equal(a.json.amount, P.diy, 'price comes from prices.js, not from the body')
  const again = await call('POST', '/api/orders', { body })
  assert.equal(again.json.orderId, a.json.orderId, 'same clientRef → same order')

  const assisted = await newOrder({ option: 'assisted' })
  assert.equal(assisted.amount, P.assisted)
  const request = await newOrder({ designId: REQ })
  assert.equal(request.amount, null, 'no confirmed price → order request')

  const bad = await call('POST', '/api/orders', { body: orderBody({ designId: 'nope', consent: false, customer: { name: 'A', phone: '12' } }) })
  assert.equal(bad.status, 422)
  assert.deepEqual(Object.keys(bad.json.fields).sort(), ['consent', 'contactVia', 'designId', 'name', 'phone'])
  assert.match(bad.json.fields.phone, /հեռախոս/)

  const st = await status(a.json)
  assert.equal(st.json.paymentStatus, 'unpaid')
  assert.equal(st.json.canPay, true)
  assert.equal((await call('GET', `/api/orders/status?id=${a.json.orderId}&t=wrong`)).status, 404)

  const noPay = await start(request, 'arca')
  assert.equal(noPay.status, 409, 'cannot pay an order with no price')
})

test('ArCa: successful payment is confirmed server-side', async () => {
  const o = await newOrder()
  const s = await start(o, 'arca')
  assert.equal(s.status, 200, s.text)
  assert.ok(s.json.redirectUrl.startsWith(arca.base))
  const reg = arca.orders.get(arcaIdFrom(s.json.redirectUrl))
  assert.equal(reg.amount, P.diy * 100, 'AMD sent in minor units')
  assert.equal(reg.currency, '051')

  assert.equal((await status(o)).json.paymentStatus, 'pending')
  const back = await payOnBank(s.json.redirectUrl, 'pay')
  assert.equal(back.status, 303)
  assert.match(back.location, new RegExp(`/checkout/result\\?order=${o.orderId}&t=${o.token}`))

  const st = (await status(o)).json
  assert.equal(st.paymentStatus, 'paid')
  assert.equal(st.provider, 'arca')
  assert.equal(st.transactionId, arcaIdFrom(s.json.redirectUrl))
  assert.equal(st.cardMask, '408306**1234')
  assert.ok(st.paidAt)
  assert.equal(st.canPay, false)

  const again = await start(o, 'arca')
  assert.deepEqual(again.json, { alreadyPaid: true }, 'paid order is not charged again')
  assert.equal((await store.listTransactions(o.orderId)).length, 1)
})

test('ArCa: a forged return URL cannot mark an order paid', async () => {
  const o = await newOrder()
  const s = await start(o, 'arca')
  const tx = (await store.listTransactions(o.orderId))[0]
  // Customer hits the success return URL without paying (or edits the query).
  const r = await call('GET', `/api/payments/arca/return?tx=${tx.id}&orderId=${arcaIdFrom(s.json.redirectUrl)}&status=paid`)
  assert.equal(r.status, 303)
  assert.equal((await status(o)).json.paymentStatus, 'pending')
  // A forged callback is only a nudge to re-check with ArCa.
  await call('GET', `/api/payments/arca/callback?mdOrder=${arcaIdFrom(s.json.redirectUrl)}&orderNumber=${tx.merchant_ref}&operation=deposited&status=1`)
  assert.equal((await status(o)).json.paymentStatus, 'pending')
})

test('ArCa: declined card → failed, then a retry can succeed', async () => {
  const o = await newOrder()
  const s1 = await start(o, 'arca')
  await payOnBank(s1.json.redirectUrl, 'decline')
  let st = (await status(o)).json
  assert.equal(st.paymentStatus, 'failed')
  assert.equal(st.lastError, 'Insufficient funds')
  assert.equal(st.canPay, true)

  const s2 = await start(o, 'arca')
  const txs = await store.listTransactions(o.orderId)
  assert.deepEqual(txs.map((t) => t.merchant_ref.slice(-2)), ['01', '02'], 'each attempt gets its own number')
  await payOnBank(s2.json.redirectUrl, 'pay')
  st = (await status(o)).json
  assert.equal(st.paymentStatus, 'paid')
})

test('ArCa: leaving the bank page → cancelled', async () => {
  const o = await newOrder()
  const s = await start(o, 'arca')
  await payOnBank(s.json.redirectUrl, 'cancel')
  assert.equal((await status(o)).json.paymentStatus, 'cancelled')
})

test('ArCa: repeated callbacks/returns never double-process', async () => {
  const o = await newOrder()
  const s = await start(o, 'arca')
  await payOnBank(s.json.redirectUrl, 'pay')
  const tx = (await store.listTransactions(o.orderId))[0]
  const paidAt = tx.paid_at
  const cb = `/api/payments/arca/callback?mdOrder=${tx.provider_payment_id}&orderNumber=${tx.merchant_ref}&operation=deposited&status=1`
  const ret = `/api/payments/arca/return?tx=${tx.id}&orderId=${tx.provider_payment_id}`
  await Promise.all([call('GET', cb), call('GET', cb), call('POST', cb), call('GET', ret)])
  await call('GET', ret) // customer reloads the return page
  const ev = await store.events(o.orderId)
  assert.equal(ev.filter((e) => e.kind === 'status_paid').length, 1, 'paid exactly once')
  assert.ok(ev.filter((e) => e.kind === 'repeat_paid').length >= 3, 'repeats are logged as repeats')
  const after = (await store.listTransactions(o.orderId))[0]
  assert.equal(after.paid_at, paidAt, 'paid_at unchanged by repeats')
  assert.equal((await store.listTransactions(o.orderId)).length, 1)
})

test('ArCa: a payment that went through is found before a second attempt opens', async () => {
  const o = await newOrder()
  const s = await start(o, 'arca')
  arca.set(arcaIdFrom(s.json.redirectUrl), { orderStatus: 2 }) // paid, but the redirect back was lost
  const again = await start(o, 'arca')
  assert.deepEqual(again.json, { alreadyPaid: true })
  assert.equal((await store.listTransactions(o.orderId)).length, 1, 'no second charge opened')
})

test('ArCa: amount mismatch is never accepted as paid', async () => {
  const o = await newOrder()
  const s = await start(o, 'arca')
  arca.set(arcaIdFrom(s.json.redirectUrl), { orderStatus: 2, reportAmount: 100 })
  const tx = (await store.listTransactions(o.orderId))[0]
  await call('GET', `/api/payments/arca/return?tx=${tx.id}&orderId=${tx.provider_payment_id}`)
  assert.equal((await status(o)).json.paymentStatus, 'failed')
  assert.ok((await store.events(o.orderId)).some((e) => e.kind === 'amount_mismatch_needs_review'))
})

test('Idram: precheck, signed confirmation, repeats and forgeries', async () => {
  const o = await newOrder()
  const s = await start(o, 'idram')
  assert.equal(s.json.form.action, 'https://banking.idram.am/Payment/GetPayment')
  const f = s.json.form.fields
  assert.equal(f.EDP_REC_ACCOUNT, IDRAM.account)
  assert.equal(f.EDP_AMOUNT, String(P.diy))

  const R = '/api/payments/idram/result'
  const pre = { EDP_PRECHECK: 'YES', EDP_BILL_NO: f.EDP_BILL_NO, EDP_REC_ACCOUNT: IDRAM.account, EDP_AMOUNT: `${P.diy}.00` }
  assert.equal((await call('POST', R, { form: { ...pre, EDP_AMOUNT: '10.00' } })).text, 'Wrong amount')
  assert.equal((await call('POST', R, { form: { ...pre, EDP_BILL_NO: '999' } })).text, 'Unknown bill')
  assert.equal((await call('POST', R, { form: pre })).text, 'OK')
  assert.equal((await status(o)).json.paymentStatus, 'pending')

  const pay = { EDP_BILL_NO: f.EDP_BILL_NO, EDP_REC_ACCOUNT: IDRAM.account, EDP_PAYER_ACCOUNT: '100000001', EDP_AMOUNT: `${P.diy}.00`, EDP_TRANS_ID: '000123456789', EDP_TRANS_DATE: '13/11/2026' }
  const forged = await call('POST', R, { form: { ...pay, EDP_CHECKSUM: 'ABCDEF' } })
  assert.equal(forged.text, 'Invalid checksum')
  assert.equal((await status(o)).json.paymentStatus, 'pending')

  const good = { ...pay, EDP_CHECKSUM: idramSign(pay) }
  assert.equal((await call('POST', R, { form: good })).text, 'OK')
  assert.equal((await call('POST', R, { form: good })).text, 'OK', 'Idram retrying is acknowledged')
  const st = (await status(o)).json
  assert.equal(st.paymentStatus, 'paid')
  assert.equal(st.transactionId, '000123456789')
  const ev = await store.events(o.orderId)
  assert.equal(ev.filter((e) => e.kind === 'status_paid').length, 1)
  assert.ok(ev.some((e) => e.kind === 'repeat_paid'))
  assert.ok(ev.some((e) => e.kind === 'bad_checksum'))

  // The same Idram transaction can't be booked against another bill.
  const o2 = await newOrder()
  const s2 = await start(o2, 'idram')
  await call('POST', R, { form: { ...pre, EDP_BILL_NO: s2.json.form.fields.EDP_BILL_NO } })
  const replay = { ...pay, EDP_BILL_NO: s2.json.form.fields.EDP_BILL_NO }
  const rr = await call('POST', R, { form: { ...replay, EDP_CHECKSUM: idramSign(replay) } })
  assert.equal(rr.text, 'Duplicate transaction')
  assert.notEqual((await status(o2)).json.paymentStatus, 'paid')

  // A new precheck on an already-paid order is refused (no double payment).
  assert.equal((await call('POST', R, { form: pre })).text, 'Order cannot be paid')
})

test('admin: access control, refund, manual payment, price for requests', async () => {
  const o = await newOrder()
  const A = '/api/admin/orders'
  assert.equal((await call('POST', A, { body: { orderId: o.orderId, action: 'verify' } })).status, 403)
  assert.equal((await call('POST', A, { body: { orderId: o.orderId, action: 'verify' }, token: USERS.customer.token })).status, 403)

  // manual payment needs a reference; then the order is paid and locked
  let r = await call('POST', A, { token: USERS.admin.token, body: { orderId: o.orderId, action: 'manual_payment', method: 'bank_transfer', reference: '' } })
  assert.equal(r.status, 422)
  r = await call('POST', A, { token: USERS.admin.token, body: { orderId: o.orderId, action: 'manual_payment', method: 'bank_transfer', reference: 'AMERIA-778812', note: 'Փոխանցում' } })
  assert.equal(r.status, 200, r.text)
  let st = (await status(o)).json
  assert.equal(st.paymentStatus, 'paid')
  assert.equal(st.provider, 'manual')
  r = await call('POST', A, { token: USERS.admin.token, body: { orderId: o.orderId, action: 'manual_payment', method: 'cash', reference: 'X-1' } })
  assert.equal(r.status, 409)
  const manualTx = (await store.listTransactions(o.orderId))[0]
  assert.equal(manualTx.recorded_by, USERS.admin.id)

  // card refund goes to ArCa
  const c = await newOrder()
  const s = await start(c, 'arca')
  await payOnBank(s.json.redirectUrl, 'pay')
  const tx = (await store.listTransactions(c.orderId))[0]
  r = await call('POST', A, { token: USERS.admin.token, body: { orderId: c.orderId, action: 'refund', txId: tx.id } })
  assert.equal(r.status, 200, r.text)
  assert.equal(arca.orders.get(tx.provider_payment_id).orderStatus, 4)
  st = (await status(c)).json
  assert.equal(st.paymentStatus, 'refunded')
  r = await call('POST', A, { token: USERS.admin.token, body: { orderId: c.orderId, action: 'refund', txId: tx.id } })
  assert.equal(r.status, 409, 'cannot refund twice')

  // production status
  r = await call('POST', A, { token: USERS.admin.token, body: { orderId: o.orderId, action: 'set_status', status: 'in_progress' } })
  assert.equal((await status(o)).json.orderStatus, 'in_progress')
  assert.equal((await call('POST', A, { token: USERS.admin.token, body: { orderId: o.orderId, action: 'set_status', status: 'paid' } })).status, 422)

  // price for an order request, only when the catalog has none
  assert.equal((await call('POST', A, { token: USERS.admin.token, body: { orderId: c.orderId, action: 'set_amount', amount: 5000 } })).status, 409)
  const req = await newOrder({ designId: REQ })
  r = await call('POST', A, { token: USERS.admin.token, body: { orderId: req.orderId, action: 'set_amount', amount: 25000 } })
  assert.equal(r.status, 200, r.text)
  st = (await status(req)).json
  assert.equal(st.amount, 25000)
  assert.equal(st.canPay, true)
  const sp = await start(req, 'arca')
  assert.equal(arca.orders.get(arcaIdFrom(sp.json.redirectUrl)).amount, 2500000)
})

test('SQL state machine refuses illegal moves', async () => {
  const o = await newOrder()
  const s = await start(o, 'arca')
  await payOnBank(s.json.redirectUrl, 'pay')
  const tx = (await store.listTransactions(o.orderId))[0]
  const r = await store.applyStatus(tx.id, 'failed', {}, 'test')
  assert.equal(r.applied, false)
  assert.equal(r.status, 'paid')
  assert.equal((await status(o)).json.paymentStatus, 'paid')
})

test('simulator: off by default, then paid / declined / cancelled through the state machine', async () => {
  const o = await newOrder()
  assert.equal((await start(o, 'test')).status, 400, 'not offered unless PAYMENTS_SIMULATION=1')

  process.env.PAYMENTS_SIMULATION = '1'
  try {
    assert.deepEqual((await call('GET', '/api/checkout/config')).json.methods, ['arca', 'idram', 'test'])
    const S = '/api/payments/simulator/complete'

    // declined, then cancelled, then paid — each a separate attempt
    for (const [outcome, expected] of [['failed', 'failed'], ['cancelled', 'cancelled'], ['paid', 'paid']]) {
      const s = await start(o, 'test')
      const u = new URL(s.json.redirectUrl, base)
      assert.equal(u.pathname, '/checkout/simulate')
      const tx = u.searchParams.get('tx')
      const info = await call('GET', `${S}?tx=${tx}&k=${o.token}`)
      assert.equal(info.json.amount, P.diy)
      assert.equal((await call('POST', S, { body: { tx, k: 'wrong', outcome: 'paid' } })).status, 404, 'needs the order secret')
      const done = await call('POST', S, { body: { tx, k: o.token, outcome } })
      assert.equal(done.json.redirect, `/checkout/result?order=${o.orderId}&t=${o.token}`)
      assert.equal((await status(o)).json.paymentStatus, expected)
    }
    const st = (await status(o)).json
    assert.equal(st.provider, 'test')
    assert.equal(st.cardMask, '411111**1111')

    // repeating the last completion changes nothing; a paid order can't be "re-declined"
    const txs = await store.listTransactions(o.orderId)
    const last = txs.at(-1)
    await call('POST', S, { body: { tx: last.id, k: o.token, outcome: 'paid' } })
    await call('POST', S, { body: { tx: last.id, k: o.token, outcome: 'failed' } })
    assert.equal((await status(o)).json.paymentStatus, 'paid')
    const ev = await store.events(o.orderId)
    assert.equal(ev.filter((e) => e.kind === 'status_paid').length, 1)
    assert.deepEqual((await start(o, 'test')).json, { alreadyPaid: true })

    // admin can refund a test payment
    const r = await call('POST', '/api/admin/orders', { token: USERS.admin.token, body: { orderId: o.orderId, action: 'refund', txId: last.id } })
    assert.equal(r.status, 200, r.text)
    assert.equal((await status(o)).json.paymentStatus, 'refunded')
  } finally {
    delete process.env.PAYMENTS_SIMULATION
  }
  const off = await newOrder()
  assert.equal((await start(off, 'test')).status, 400, 'switched off again')
})

test('simulator page: only test cards, masked card kept, Idram and decline reasons', async () => {
  process.env.PAYMENTS_SIMULATION = '1'
  try {
    const S = '/api/payments/simulator/complete'
    const begin = async (o) => new URL((await start(o, 'test')).json.redirectUrl, base).searchParams.get('tx')
    const o = await newOrder()

    let tx = await begin(o)
    const info = await call('GET', `${S}?tx=${tx}&k=${o.token}`)
    assert.ok(info.json.cards.some((c) => c.number === '4111111111111111' && c.result === 'paid'), 'lists its test cards')

    // a card that isn't a test card is refused, and nothing changes
    const real = await call('POST', S, { body: { tx, k: o.token, outcome: 'paid', card: '4242424242424242' } })
    assert.equal(real.status, 422)
    assert.equal((await status(o)).json.paymentStatus, 'pending')
    assert.equal((await call('POST', S, { body: { tx, k: o.token, outcome: 'failed', reason: 'nonsense' } })).status, 422)
    assert.equal((await call('POST', S, { body: { tx, k: o.token, outcome: 'paid', via: 'bitcoin' } })).status, 422)

    // decline reasons are kept on the attempt
    for (const [reason, code] of [['funds', 'SIM-116'], ['declined', 'SIM-05'], ['3ds', 'SIM-3DS']]) {
      if (reason !== 'funds') tx = await begin(o)
      await call('POST', S, { body: { tx, k: o.token, outcome: 'failed', reason, card: '4000000000000002' } })
      assert.equal((await status(o)).json.paymentStatus, 'failed')
      assert.equal((await store.getTransaction(tx)).error_code, code)
    }

    // paid on the Mastercard test card: only its masked number is stored
    tx = await begin(o)
    await call('POST', S, { body: { tx, k: o.token, outcome: 'paid', via: 'card', card: '5555555555554444' } })
    assert.equal((await status(o)).json.cardMask, '555555**4444')
    assert.ok(!JSON.stringify(await store.getTransaction(tx)).includes('5555555555554444'), 'the full test number is not kept')

    // Idram: paid with no card on it
    const w = await newOrder()
    const wtx = await begin(w)
    await call('POST', S, { body: { tx: wtx, k: w.token, outcome: 'paid', via: 'idram' } })
    assert.equal((await status(w)).json.paymentStatus, 'paid')
    assert.ok(!(await status(w)).json.cardMask)
  } finally {
    delete process.env.PAYMENTS_SIMULATION
  }
})

test('shareable invitation: created on payment, public page data, RSVP, disabled on refund', async () => {
  const o = await newOrder({ customization: { names: 'Աննա & Միքայել', eventDate: '2027-06-12', eventTime: '16:00', venue: 'Արարատ դահլիճ', notes: 'գաղտնի ցանկություն' } })
  assert.equal((await status(o)).json.invitationCode, null, 'no link before payment')

  const s = await start(o, 'arca')
  await payOnBank(s.json.redirectUrl, 'pay')
  const st = (await status(o)).json
  assert.match(st.invitationCode, /^[0-9a-f]{12}$/)
  assert.equal((await status(o)).json.invitationCode, st.invitationCode, 'same link every time')

  const page = await call('GET', `/api/invitations?code=${st.invitationCode}`)
  assert.equal(page.status, 200)
  assert.equal(page.json.designId, 'bd-animals')
  assert.deepEqual(page.json.customization, { names: 'Աննա & Միքայել', eventDate: '2027-06-12', eventTime: '16:00', venue: 'Արարատ դահլիճ' })
  assert.ok(!JSON.stringify(page.json).includes('anna@example.com') && !JSON.stringify(page.json).includes('գաղտնի'), 'no private order data on the public page')
  assert.equal((await call('GET', '/api/invitations?code=000000000000')).status, 404)
  assert.equal((await call('GET', '/api/invitations?code=../../etc')).status, 404)

  const R = (body) => call('POST', '/api/invitations', { body: { code: st.invitationCode, ...body } })
  assert.equal((await R({ name: 'Լիլիթ', status: 'confirmed', plus: 2, note: 'Կգանք' })).status, 201)
  assert.equal((await R({ name: 'Արամ', status: 'declined' })).status, 201)
  assert.equal((await R({ name: '', status: 'confirmed' })).status, 422)
  assert.equal((await R({ name: 'X', status: 'maybe' })).status, 422)
  const inv = await store.getInvitationByCode(st.invitationCode)
  assert.deepEqual((await store.rsvps(inv.id)).map((r) => [r.guest_name, r.status, r.plus]), [['Լիլիթ', 'confirmed', 2], ['Արամ', 'declined', 0]])

  // Siloona corrects the details; the same link shows them
  const A = '/api/admin/orders'
  let r = await call('POST', A, { token: USERS.admin.token, body: { orderId: o.orderId, action: 'update_details', customization: { names: 'Աննա և Միքայել', eventDate: '2027-06-13', venue: 'Նոր վայր' } } })
  assert.equal(r.status, 200, r.text)
  assert.equal((await call('GET', `/api/invitations?code=${st.invitationCode}`)).json.customization.eventDate, '2027-06-13')
  r = await call('POST', A, { token: USERS.admin.token, body: { orderId: o.orderId, action: 'update_details', customization: { names: '', eventDate: 'x' } } })
  assert.equal(r.status, 422)

  // refunded → the link stops working and RSVPs are refused
  const tx = (await store.listTransactions(o.orderId))[0]
  await call('POST', A, { token: USERS.admin.token, body: { orderId: o.orderId, action: 'refund', txId: tx.id } })
  assert.equal((await call('GET', `/api/invitations?code=${st.invitationCode}`)).status, 410)
  assert.equal((await R({ name: 'Ուշ', status: 'confirmed' })).status, 410)
  assert.equal((await status(o)).json.invitationCode, null)
})

test('checkout requires the names and date that go on the invitation', async () => {
  const r = await call('POST', '/api/orders', { body: orderBody({ customization: { names: '', eventDate: '' } }) })
  assert.equal(r.status, 422)
  assert.deepEqual(Object.keys(r.json.fields).sort(), ['eventDate', 'names'])
})

test('manual and simulated payments also create the link', async () => {
  const o = await newOrder()
  await call('POST', '/api/admin/orders', { token: USERS.admin.token, body: { orderId: o.orderId, action: 'manual_payment', method: 'cash', reference: 'RCPT-9' } })
  assert.match((await status(o)).json.invitationCode, /^[0-9a-f]{12}$/)
})

test('web edits ride along: cleaned, shown on the invitation, kept when admin edits details', async () => {
  const content = {
    child: { name: 'Դավիթ' },
    subtitle: 'Եկեք միասին նշենք',
    venue: { name: 'Իմ այգին', mapUrl: 'java\nscript:alert(1)' },
    link: 'data:text/html,<script>x</script>',
    __proto__bad: 1,
    deep: JSON.parse('{"__proto__": {"polluted": true}, "ok": 1}'),
  }
  const o = await newOrder({ designId: 'card-mouse', customization: { names: 'Դավիթ', eventDate: '2027-05-01', content } })
  const s = await start(o, 'arca')
  await payOnBank(s.json.redirectUrl, 'pay')
  const code = (await status(o)).json.invitationCode
  const page = (await call('GET', `/api/invitations?code=${code}`)).json
  assert.equal(page.designId, 'card-mouse')
  assert.equal(page.content.child.name, 'Դավիթ')
  assert.equal(page.content.venue.name, 'Իմ այգին')
  assert.equal(page.content.venue.mapUrl, undefined, 'script URL dropped')
  assert.equal(page.content.link, undefined, 'data URL dropped')
  assert.deepEqual(page.content.deep, { ok: 1 }, 'prototype key dropped')
  assert.equal({}.polluted, undefined)

  await call('POST', '/api/admin/orders', { token: USERS.admin.token, body: { orderId: o.orderId, action: 'update_details', customization: { names: 'Դավիթ', eventDate: '2027-05-02' } } })
  const after = (await call('GET', `/api/invitations?code=${code}`)).json
  assert.equal(after.customization.eventDate, '2027-05-02')
  assert.equal(after.content.child.name, 'Դավիթ', 'customer edits survive an admin details fix')

  const huge = await call('POST', '/api/orders', { body: orderBody({ customization: { names: 'Ա Բ', eventDate: '2027-01-01', content: { t: Array.from({ length: 12 }, () => 'x'.repeat(1999)) } } }) })
  assert.equal(huge.status, 422)
})

test('the design\'s own details are stored, served to the invitation, and replaced by an admin fix', async () => {
  const details = {
    p1: 'Աննա', p2: 'Միքայել', eventDate: '2027-06-12', eventTime: '15:00',
    'place0.name': 'Սուրբ Գայանե', 'place0.time': '13:00', 'place1.name': 'Իմ սրահ', 'place1.address': 'javascript:alert(1)',
    schedule: [{ time: '13:00', title: 'Պսակադրություն' }], extra: {},
  }
  const o = await newOrder({ designId: 'wd-cherry', customization: { names: 'Աննա & Միքայել', eventDate: '2027-06-12', details } })
  const s = await start(o, 'arca')
  await payOnBank(s.json.redirectUrl, 'pay')
  const code = (await status(o)).json.invitationCode
  const page = (await call('GET', `/api/invitations?code=${code}`)).json
  assert.equal(page.details.p2, 'Միքայել')
  assert.equal(page.details['place0.name'], 'Սուրբ Գայանե')
  assert.equal(page.details['place1.address'], undefined, 'script URL dropped')
  assert.deepEqual(page.details.schedule, [{ time: '13:00', title: 'Պսակադրություն' }])

  const fixed = { ...details, p2: 'Միքո' }
  await call('POST', '/api/admin/orders', { token: USERS.admin.token, body: { orderId: o.orderId, action: 'update_details', customization: { names: 'Աննա & Միքո', eventDate: '2027-06-12', details: fixed } } })
  assert.equal((await call('GET', `/api/invitations?code=${code}`)).json.details.p2, 'Միքո')
  // An admin fix without details (older orders' form) keeps them.
  await call('POST', '/api/admin/orders', { token: USERS.admin.token, body: { orderId: o.orderId, action: 'update_details', customization: { names: 'Աննա & Միքո', eventDate: '2027-06-13' } } })
  const kept = (await call('GET', `/api/invitations?code=${code}`)).json
  assert.equal(kept.details.p2, 'Միքո')
  assert.equal(kept.customization.eventDate, '2027-06-13')
})

test('custom-design request: stored with no price, then priced by the admin and payable', async () => {
  const body = (customization) => orderBody({ designId: 'custom', option: 'diy', customization })
  const bad = await call('POST', '/api/orders', { body: body({ eventType: 'party', notes: 'կարճ' }) })
  assert.equal(bad.status, 422)
  assert.ok(bad.json.fields.eventType && bad.json.fields.notes)

  const r = await call('POST', '/api/orders', { body: body({ eventType: 'wedding', kind: 'adapt', basedOn: 'wd-cherry', notes: 'Ուզում ենք կանաչ գույներով, պարզ ու նուրբ', references: 'https://pin.it/x' }) })
  assert.equal(r.status, 201, JSON.stringify(r.json))
  assert.equal(r.json.amount, null)
  const st = await status({ orderId: r.json.orderId, token: r.json.token })
  assert.equal(st.json.paymentStatus, 'unpaid')
  const row = await store.getOrder(r.json.orderId)
  assert.equal(row.design_option, 'assisted', 'always prepared by Siloona')
  assert.equal(row.customization.basedOn, 'wd-cherry')
  assert.equal(row.customization.request, 'custom')

  const priced = await call('POST', '/api/admin/orders', { token: USERS.admin.token, body: { orderId: r.json.orderId, action: 'set_amount', amount: 45000 } })
  assert.equal(priced.status, 200, JSON.stringify(priced.json))
  const s = await start({ orderId: r.json.orderId, token: r.json.token }, 'arca')
  assert.ok(s.json.redirectUrl, 'payable once priced')
})

test('photo uploads: real images only, size-limited, served back', async () => {
  const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(2000, 7)])
  const up = await fetch(base + '/api/uploads', { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: jpeg })
  assert.equal(up.status, 201)
  const { url } = await up.json()
  const got = await fetch(base + url)
  assert.equal(got.status, 200)
  assert.equal(got.headers.get('content-type'), 'image/jpeg')
  assert.equal(Buffer.from(await got.arrayBuffer()).length, jpeg.length)

  const fake = await fetch(base + '/api/uploads', { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: '<script>alert(1)</script>' })
  assert.equal(fake.status, 415, 'not an image, whatever the header says')
  // Refused unread: either a 413 or the connection is closed on the sender.
  const big = await fetch(base + '/api/uploads', { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: Buffer.concat([jpeg, Buffer.alloc(3.2 * 1024 * 1024)]) })
    .then((r) => r.status, () => 'closed')
  assert.ok(big === 413 || big === 'closed', String(big))

  // an order carries the stored address; a data: URL never gets through
  const o = await newOrder({ designId: 'wd-mono', option: 'diy', customization: { names: 'Լիանա & Հայկ', eventDate: '2027-09-25', content: { photos: { hero: url, story: 'data:image/jpeg;base64,AAAA' } } } })
  const row = await store.getOrder(o.orderId)
  assert.equal(row.customization.content.photos.hero, url)
  assert.equal(row.customization.content.photos.story, undefined)
})

// ---------------------------------------------------------------------------
// Dashboard events: guests' links, replies, limits, notifications
// ---------------------------------------------------------------------------

// A paid order (customer USERS.customer, secret link token 'tok-<tag>'),
// optionally linked to an event the way the dashboard links it.
async function paidOrder(tag, { eventId = null, design = 'wd-cherry', payment = 'paid', orderStatus = 'new' } = {}) {
  const { rows: [o] } = await store.db.query(
    `insert into orders (access_token, customer_name, customer_phone, design_id, design_option, customization, amount, payment_status, order_status, event_id)
     values ($1, 'Աննա Պետրոսյան', '+37499000000', $2, 'diy', $3::jsonb, 15000, $4, $5, $6) returning id, order_number`,
    ['tok-' + tag, design, JSON.stringify({ names: 'Աննա & Արամ', eventDate: '2027-09-18', eventTime: '16:00', venue: 'Երևան', content: { hero: { line: 'մեր օրը' } } }), payment, orderStatus, eventId])
  return { id: o.id, token: 'tok-' + tag, number: Number(o.order_number) }
}

// A dashboard event; by default with a paid order linked, as only those open.
async function addEvent(id, { status = 'published', rsvp = true, paid = true } = {}) {
  const data = {
    inv: { slug: `event-${id}`, status, design: 'wd-cherry', rsvp, personalize: true, greeting: 'Սիրով, {name}', message: 'Հրավիրում ենք', deadline: '2027-08-01T00:00:00.000Z', designContent: { 'wd-cherry': { hero: { kicker: 'Մեր օրը' } } } },
    person1: { first: 'Աննա', last: 'Պետրոսյան', phone: '+37499000001' },
    person2: { first: 'Արամ', last: 'Սարգսյան' },
    locations: [{ id: 'l1', kind: 'Եկեղեցի', name: 'Սուրբ Գայանե', address: 'Էջմիածին', time: '15:00', notes: 'գաղտնի' }],
    schedule: [{ id: 's1', time: '15:00', title: 'Պսակադրություն' }],
    info: { maxPlus: 2, parking: 'x' },
    guests: [{ id: 'g1', first: 'Լուսինե', last: 'Հակոբյան', phone: '+37491111111', notes: 'մասնավոր', inviteToken: 'AbCdEfGhJk23mnPq', rsvp: 'pending' }],
  }
  await store.db.query(`insert into events (id, owner_id, owner_mode, type, title, event_date, data) values ($1, $2, 'org', 'wedding', 'Հարսանիք', '2027-09-18', $3::jsonb)`, [id, USERS.customer.id, JSON.stringify(data)])
  if (paid) await paidOrder('ev-' + id, { eventId: id })
  return data
}

test('guest links: published event, personal token, nothing private leaks', async () => {
  await addEvent('E1')
  const r = await call('GET', '/api/invitations?code=event-E1&t=AbCdEfGhJk23mnPq')
  assert.equal(r.status, 200, r.text)
  assert.equal(r.json.kind, 'event')
  assert.equal(r.json.designId, 'wd-cherry')
  assert.equal(r.json.guest.first, 'Լուսինե')
  assert.equal(r.json.event.person1.first, 'Աննա')
  assert.equal(r.json.designContent['wd-cherry'].hero.kicker, 'Մեր օրը')
  const raw = JSON.stringify(r.json)
  for (const secret of ['+37491111111', 'մասնավոր', '+37499000001', 'գաղտնի', 'parking']) assert.ok(!raw.includes(secret), `leaked ${secret}`)
  assert.equal(raw.includes('guests'), false, 'no guest list')

  // the general link works too; by id as well as by slug
  assert.equal((await call('GET', '/api/invitations?code=event-E1')).json.guest, null)
  assert.equal((await call('GET', '/api/invitations?code=E1')).status, 200)
  // a wrong token, a malformed slug, an unknown event
  assert.equal((await call('GET', '/api/invitations?code=event-E1&t=WrongToken12345')).status, 404)
  assert.equal((await call('GET', '/api/invitations?code=..%2F..%2Fetc')).status, 404)
  assert.equal((await call('GET', '/api/invitations?code=event-nope')).status, 404)
  // not published → gone
  await addEvent('E2', { status: 'draft' })
  assert.equal((await call('GET', '/api/invitations?code=event-E2')).status, 410)
  // opens are counted for the dashboard
  const opens = (await store.replies('E1')).filter((x) => x.kind === 'open')
  assert.equal(opens.length, 3)
})

test('guest links: RSVP is stored as a reply, companions capped by the event', async () => {
  await addEvent('E3')
  const ok = await call('POST', '/api/invitations', { body: { slug: 'event-E3', t: 'AbCdEfGhJk23mnPq', status: 'confirmed', plus: 9, note: 'Կգանք ամուսնուս հետ', name: 'ignored' } })
  assert.equal(ok.status, 201, ok.text)
  const general = await call('POST', '/api/invitations', { body: { slug: 'event-E3', name: 'Կարեն Մուրադյան', status: 'declined', plus: 3 } })
  assert.equal(general.status, 201)
  const rsvps = (await store.replies('E3')).filter((x) => x.kind === 'rsvp')
  assert.deepEqual(rsvps.map((x) => [x.guest_token, x.guest_name, x.status, x.plus]), [
    ['AbCdEfGhJk23mnPq', 'Լուսինե Հակոբյան', 'confirmed', 2], // the guest's own name, max 2 companions
    [null, 'Կարեն Մուրադյան', 'declined', 0],
  ])
  assert.equal((await call('POST', '/api/invitations', { body: { slug: 'event-E3', name: 'Ա', status: 'confirmed' } })).status, 422)
  assert.equal((await call('POST', '/api/invitations', { body: { slug: 'event-E3', name: 'Աննա Ա', status: 'maybe' } })).status, 422)
  await addEvent('E4', { rsvp: false })
  assert.equal((await call('POST', '/api/invitations', { body: { slug: 'event-E4', name: 'Աննա Ա', status: 'confirmed' } })).status, 409)
})

test('guest links open only for an event with a paid order linked', async () => {
  // published in the dashboard, but never paid for
  await addEvent('F1', { paid: false })
  assert.equal((await call('GET', '/api/invitations?code=event-F1&t=AbCdEfGhJk23mnPq')).status, 410)
  assert.equal((await call('POST', '/api/invitations', { body: { slug: 'event-F1', name: 'Աննա Ա', status: 'confirmed' } })).status, 410)
  // the order is cancelled / refunded later: the links close
  await addEvent('F2', { paid: false })
  const o = await paidOrder('F2', { eventId: 'F2', orderStatus: 'cancelled' })
  assert.equal((await call('GET', '/api/invitations?code=event-F2')).status, 410)
  await store.db.query("update orders set order_status = 'new', payment_status = 'refunded' where id = $1", [o.id])
  assert.equal((await call('GET', '/api/invitations?code=event-F2')).status, 410)
  await store.db.query("update orders set payment_status = 'paid' where id = $1", [o.id])
  assert.equal((await call('GET', '/api/invitations?code=event-F2')).status, 200)
  // the design shown is the one paid for, whatever the event says
  await addEvent('F3', { paid: false })
  await paidOrder('F3', { eventId: 'F3', design: 'wd-portrait' })
  assert.equal((await call('GET', '/api/invitations?code=event-F3')).json.designId, 'wd-portrait')
})

test('claiming a paid order into the dashboard', async () => {
  const claim = (body, token = USERS.customer.token) => call('POST', '/api/orders/status', { body: { action: 'claim', ...body }, token })
  const o = await paidOrder('C1')
  await store.db.query("insert into invitations (code, order_id, design_id) values ('c1c1c1c1c1c1', $1, 'wd-cherry')", [o.id])
  await addEvent('G1', { paid: false })

  // signed in, with the order's secret link
  assert.equal((await claim({ id: o.id, t: o.token }, null)).status, 401)
  assert.equal((await claim({ id: o.id, t: 'wrong' })).status, 404)
  const info = await claim({ id: o.id, t: o.token })
  assert.equal(info.status, 200, info.text)
  assert.equal(info.json.linked, false)
  assert.equal(info.json.designId, 'wd-cherry')
  assert.equal(info.json.customization.names, 'Աննա & Արամ')
  assert.equal(info.json.content.hero.line, 'մեր օրը')
  assert.equal(JSON.stringify(info.json).includes('+37499000000'), false)

  // only into one's own event
  await store.db.query("insert into events (id, owner_id, owner_mode, type, title, data) values ('G2', $1, 'org', 'wedding', 'x', '{}')", [USERS.admin.id])
  assert.equal((await claim({ id: o.id, t: o.token, eventId: 'G2' })).status, 404)
  assert.equal((await claim({ id: o.id, t: o.token, eventId: 'nope' })).status, 404)

  // before linking, the order's link shows the order; the event is closed
  assert.equal((await call('GET', '/api/invitations?code=c1c1c1c1c1c1')).json.kind, 'order')
  assert.equal((await call('GET', '/api/invitations?code=event-G1')).status, 410)

  const linked = await claim({ id: o.id, t: o.token, eventId: 'G1' })
  assert.equal(linked.status, 200, linked.text)
  assert.deepEqual([linked.json.linked, linked.json.eventId], [true, 'G1'])
  const row = (await store.db.query('select event_id, owner_id from orders where id = $1', [o.id])).rows[0]
  assert.deepEqual([row.event_id, row.owner_id], ['G1', USERS.customer.id])
  // again: the same answer; the order page knows
  assert.deepEqual((await claim({ id: o.id, t: o.token })).json, { linked: true, eventId: 'G1', orderNumber: o.number })
  assert.equal((await status({ orderId: o.id, token: o.token })).json.linked, true)

  // now the event opens, and the order's own link shows the event's version
  assert.equal((await call('GET', '/api/invitations?code=event-G1')).status, 200)
  const page = await call('GET', '/api/invitations?code=c1c1c1c1c1c1')
  assert.equal(page.json.kind, 'event')
  assert.equal(page.json.event.person1.first, 'Աննա')
  // and an RSVP through it reaches the dashboard's replies
  assert.equal((await call('POST', '/api/invitations', { body: { slug: 'c1c1c1c1c1c1', name: 'Կարեն Մուրադյան', status: 'confirmed' } })).status, 201)
  assert.deepEqual((await store.replies('G1')).filter((x) => x.kind === 'rsvp').map((x) => x.guest_name), ['Կարեն Մուրադյան'])

  // another account can't take it; another order can't take the event
  assert.equal((await claim({ id: o.id, t: o.token }, USERS.admin.token)).status, 409)
  const o2 = await paidOrder('C2')
  assert.equal((await claim({ id: o2.id, t: o2.token, eventId: 'G1' })).status, 409)

  // unpaid orders can't be claimed
  const o3 = await paidOrder('C3', { payment: 'unpaid' })
  assert.equal((await claim({ id: o3.id, t: o3.token })).status, 409)
})

test('with event links off, a published dashboard event is not public', async () => {
  await addEvent('E6')
  delete process.env.EVENT_LINKS
  try {
    assert.equal((await call('GET', '/api/invitations?code=event-E6')).status, 404)
    assert.equal((await call('POST', '/api/invitations', { body: { slug: 'event-E6', name: 'Աննա Ա', status: 'confirmed' } })).status, 404)
  } finally {
    process.env.EVENT_LINKS = 'on'
  }
})

test('the payment simulator never runs on Vercel production', async () => {
  Object.assign(process.env, { PAYMENTS_SIMULATION: '1', VERCEL_ENV: 'production' })
  try {
    assert.ok(!(await call('GET', '/api/checkout/config')).json.methods.includes('test'))
    process.env.VERCEL_ENV = 'preview'
    assert.ok((await call('GET', '/api/checkout/config')).json.methods.includes('test'))
  } finally {
    delete process.env.PAYMENTS_SIMULATION
    delete process.env.VERCEL_ENV
  }
})

test('rate limits refuse a flood from one address', async () => {
  process.env.RATE_LIMITS = 'on'
  try {
    await addEvent('E5')
    const codes = []
    for (let i = 0; i < 22; i++) codes.push((await call('POST', '/api/invitations', { body: { slug: 'event-E5', name: 'Սպամ Սպամ', status: 'confirmed' } })).status)
    assert.equal(codes.filter((c) => c === 201).length, 20)
    assert.equal(codes.at(-1), 429)
  } finally {
    process.env.RATE_LIMITS = 'off'
  }
})

test('Telegram: told about new orders and real payments only, when configured', async () => {
  const sent = []
  const realFetch = globalThis.fetch
  globalThis.fetch = async (url, opts) => {
    if (String(url).startsWith('https://api.telegram.org/')) { sent.push(JSON.parse(opts.body).text); return new Response('{"ok":true}', { status: 200 }) }
    return realFetch(url, opts)
  }
  Object.assign(process.env, { TELEGRAM_BOT_TOKEN: 'test-bot', TELEGRAM_CHAT_ID: '42' })
  try {
    const o = await newOrder({ designId: 'wd-cherry', customization: { names: 'Աննա & Արամ', eventDate: '2027-06-12' } })
    assert.ok(sent.some((t) => t.includes(`№ ${o.orderNumber}`) && t.includes('Նոր պատվեր')), sent.join('|'))
    const s = await start(o, 'arca')
    await payOnBank(s.json.redirectUrl, 'pay')
    await status(o); await status(o) // looking again must not notify again
    assert.equal(sent.filter((t) => t.includes('Վճարված') && t.includes(`№ ${o.orderNumber}`)).length, 1, sent.join('|'))
    const req = await call('POST', '/api/orders', { body: orderBody({ designId: 'custom', customization: { eventType: 'birthday', notes: 'Ուզում ենք տիեզերական թեմա' } }) })
    assert.ok(sent.some((t) => t.includes('անհատական դիզայն') && t.includes(`№ ${req.json.orderNumber}`)), sent.join('|'))
  } finally {
    globalThis.fetch = realFetch
    delete process.env.TELEGRAM_BOT_TOKEN
    delete process.env.TELEGRAM_CHAT_ID
  }
})

test('the customer sees the guests answers on the order page', async () => {
  const o = await newOrder({ designId: 'wd-cherry', customization: { names: 'Աննա & Արամ', eventDate: '2027-06-12' } })
  assert.deepEqual((await status(o)).json.rsvps, [], 'none before payment')
  const s = await start(o, 'arca')
  await payOnBank(s.json.redirectUrl, 'pay')
  const code = (await status(o)).json.invitationCode
  await call('POST', '/api/invitations', { body: { code, name: 'Գոհար Մելիքյան', status: 'confirmed', plus: 1, note: 'Սիրով' } })
  const st = (await status(o)).json
  assert.equal(st.rsvps.length, 1)
  assert.equal(st.rsvps[0].name, 'Գոհար Մելիքյան')
  assert.equal(st.rsvps[0].plus, 1)
  assert.ok(st.rsvps[0].at)
})

test('deleted cards can no longer be ordered', async () => {
  for (const id of ['card-gender-reveal', 'card-birthday']) {
    const r = await call('POST', '/api/orders', { body: orderBody({ designId: id }) })
    assert.equal(r.status, 422)
    assert.ok(r.json.fields.designId)
  }
})

test('checkout: how to contact the customer is required, and written by the server', async () => {
  const cust = (c) => ({ name: 'Աննա Պետրոսյան', phone: '+374 99 123456', ...c })
  const none = await call('POST', '/api/orders', { body: orderBody({ customer: cust({}) }) })
  assert.equal(none.status, 422)
  assert.deepEqual(Object.keys(none.json.fields), ['contactVia'])
  const odd = await call('POST', '/api/orders', { body: orderBody({ customer: cust({ contactVia: 'pigeon' }) }) })
  assert.equal(odd.status, 422)
  const badTg = await call('POST', '/api/orders', { body: orderBody({ customer: cust({ contactVia: 'telegram', tg: '@a b<script>' }) }) })
  assert.deepEqual(Object.keys(badTg.json.fields), ['tg'])

  const tg = await newOrder({ customer: cust({ contactVia: 'telegram', tg: 'anna_p', contact: 'ignored' }) })
  assert.equal((await store.getOrder(tg.orderId)).customer_contact, 'Telegram · @anna_p')
  const call1 = await newOrder({ customer: cust({ contactVia: 'call', tg: '@ignored_here' }) })
  assert.equal((await store.getOrder(call1.orderId)).customer_contact, 'Զանգ')
  const plainTg = await newOrder({ customer: cust({ contactVia: 'telegram' }) })
  assert.equal((await store.getOrder(plainTg.orderId)).customer_contact, 'Telegram')
})

test('order page: a preview of the invitation before payment; guests only after it', async () => {
  const o = await newOrder({ customization: { names: 'Լիանա & Դավիթ', eventDate: '2027-06-12', eventTime: '16:00', venue: 'Երևան', notes: 'գաղտնի նշում' } })
  const st = await status(o)
  assert.deepEqual(st.json.preview.customization, { names: 'Լիանա & Դավիթ', eventDate: '2027-06-12', eventTime: '16:00', venue: 'Երևան' })
  assert.equal(st.json.invitationCode, null, 'no guest link before payment')
  assert.equal(JSON.stringify(st.json.preview).includes('գաղտնի'), false, 'notes stay out of the preview')
  const req = await newOrder({ designId: 'custom', option: 'diy', customization: { eventType: 'wedding', notes: 'Ուզում ենք կանաչ գույներով, պարզ ու նուրբ' } })
  assert.equal((await status(req)).json.preview, null, 'a custom request has nothing to preview')

  await call('POST', '/api/admin/orders', { token: USERS.admin.token, body: { orderId: o.orderId, action: 'manual_payment', method: 'cash', reference: 'R-77' } })
  const paid = await status(o)
  assert.equal(paid.json.paymentStatus, 'paid')
  assert.ok(paid.json.preview, 'still shown after payment (without the mark)')
  const guest = await call('GET', `/api/invitations?code=${paid.json.invitationCode}`)
  assert.equal(guest.status, 200)
  assert.equal(guest.json.customization.names, 'Լիանա & Դավիթ')
})
