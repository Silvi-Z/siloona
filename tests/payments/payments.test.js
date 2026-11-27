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

test('add-ons: priced on the server from prices.js, stored with the order, charged in full', async () => {
  const { ADDON_PRICES } = await import(pathToFileURL(path.join(ROOT, 'src/site/prices.js')).href)
  const { priceAddons, orderableAddons } = await import(pathToFileURL(path.join(ROOT, 'src/site/addons.js')).href)
  const base = DESIGN_PRICES['wd-portrait'].assisted
  const want = ['seating', 'extra_language', 'rush']
  const extra = want.reduce((s, id) => s + ADDON_PRICES[id], 0)

  // the config itself
  assert.equal(priceAddons('wd-portrait', 'assisted', want).total, extra)
  assert.ok(!orderableAddons('wd-portrait', 'diy').some((a) => a.id === 'rush'), 'rush only with «Հարմարեցված դիզայն»')
  assert.ok(!orderableAddons('bd-animals', 'diy').some((a) => a.id === 'seating'), 'seating only in designs that have it')
  assert.ok(!orderableAddons('wd-portrait', 'assisted').some((a) => a.id === 'calendar'), 'the free calendar is never a checkbox')

  // an order with three add-ons: the amount browser says is ignored
  const o = await newOrder({ designId: 'wd-portrait', option: 'assisted', addons: [...want, 'rush'], amount: 1 })
  assert.equal(o.amount, base + extra)
  const row = await store.getOrder(o.orderId)
  assert.deepEqual(row.addons.map((a) => a.id).sort(), [...want].sort())
  assert.equal(row.addons.find((a) => a.id === 'seating').price, ADDON_PRICES.seating, 'the price at the time of the order is kept')
  const st = await status(o)
  assert.equal(st.json.amount, base + extra)
  assert.equal(st.json.addons.length, 3)
  const pay = await start(o, 'arca')
  assert.ok(pay.json.redirectUrl)
  const tx = (await store.listTransactions(o.orderId)).at(-1)
  assert.equal(tx.amount, base + extra, 'the bank is asked for the full amount')

  // without add-ons: as before
  const plain = await newOrder({ designId: 'wd-portrait', option: 'assisted' })
  assert.equal(plain.amount, base)
  assert.deepEqual((await store.getOrder(plain.orderId)).addons, [])

  // forged or unavailable add-ons are refused, never priced
  for (const [designId, addons] of [['wd-portrait', ['free_money']], ['wd-portrait', ['rush']], ['bd-animals', ['wishes']], ['wd-portrait', ['calendar']]]) {
    const bad = await call('POST', '/api/orders', { body: orderBody({ designId, option: 'diy', addons }) })
    assert.equal(bad.status, 422, JSON.stringify(addons))
    assert.ok(bad.json.fields.addons)
  }
  // the seating add-on turns the feature on for the paid invitation
  await call('POST', '/api/admin/orders', { token: USERS.admin.token, body: { orderId: o.orderId, action: 'manual_payment', method: 'cash', reference: 'R-90' } })
  const page = await call('GET', `/api/invitations?code=${(await status(o)).json.invitationCode}`)
  assert.ok(page.json.features.includes('seating') && page.json.features.includes('calendar'))
  const plainPage = await call('GET', `/api/invitations?code=${(await status(plain)).json.invitationCode ?? 'none'}`)
  assert.notEqual(plainPage.status, 200, 'unpaid: no page')
})

test('Telegram: the new-order notice lists the add-ons', async () => {
  const { orderText } = await import(pathToFileURL(path.join(ROOT, 'api/_lib/notify.js')).href)
  const text = orderText({ order_number: 1, customer_name: 'Ա', customer_phone: '+1', design_id: 'wd-portrait', design_option: 'assisted', customization: {}, amount: 29000, addons: [{ id: 'seating', price: 4000 }, { id: 'rush', price: 3000 }] }, '')
  assert.match(text, /Հավելումներ/)
  assert.match(text, /Ձեր սեղանը — 4\s000 ֏/)
  assert.match(text, /Շտապ պատրաստում/)
  assert.doesNotMatch(orderText({ order_number: 2, customer_name: 'Ա', customer_phone: '+1', design_id: 'x', design_option: 'diy', customization: {}, amount: 1, addons: [] }, ''), /Հավելումներ/)
})

test('calendar: title, Yerevan times, 5 hours by default, .ics with a reminder', async () => {
  const c = await import(pathToFileURL(path.join(ROOT, 'src/site/invitations/shared/calendarEvent.js')).href)
  assert.equal(c.eventTitle('wedding', { p1: 'Աննա', p2: 'Միքայել' }, 'hy'), 'Աննա և Միքայելի հարսանիք')
  assert.equal(c.eventTitle('birthday', { one: 'Նարե' }, 'hy'), 'Նարեի ծննդյան տոն')
  assert.equal(c.eventTitle('wedding', { p1: 'Anna', p2: 'Mike' }, 'en'), 'Anna & Mike’s wedding')
  assert.equal(c.eventKind('wd-noir'), 'wedding')

  const ev = { title: 'Աննա և Միքայելի հարսանիք', date: '2027-06-12', time: '16:00', location: 'Երևան, Աբովյան 1', url: 'https://siloona.am/i/abc', lang: 'hy' }
  const g = new URL(c.googleCalendarUrl(ev))
  assert.equal(g.searchParams.get('dates'), '20270612T160000/20270612T210000', 'no end time → start + 5 hours')
  assert.equal(g.searchParams.get('ctz'), 'Asia/Yerevan')
  assert.match(g.searchParams.get('details'), /siloona\.am\/i\/abc/)
  assert.equal(new URL(c.googleCalendarUrl({ ...ev, endTime: '01:30' })).searchParams.get('dates'), '20270612T160000/20270613T013000', 'ends after midnight')

  const ics = c.icsText(ev, { now: Date.UTC(2026, 10, 27) })
  assert.match(ics, /DTSTART:20270612T120000Z\r\n/, '16:00 in Yerevan is 12:00 UTC, whatever the phone says')
  assert.match(ics, /DTEND:20270612T170000Z\r\n/)
  assert.match(ics, /TRIGGER:-P1D/)
  assert.ok(ics.includes('LOCATION:Երևան\\, Աբովյան 1'), 'commas escaped')
  for (const line of ics.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75, `folded: ${line}`)
  assert.equal(c.icsText({ ...ev, date: 'nope' }), null)
})

test('calendar: the .ics file from /api/invitations, only with links to this site', async () => {
  const q = (o) => `/api/invitations?${new URLSearchParams({ ics: '1', ...o })}`
  const r = await fetch(base + q({ t: 'Աննա և Միքայելի հարսանիք', d: '2027-06-12', h: '16:00', l: 'Երևան', u: `${base}/i/abc`, lang: 'hy' }))
  assert.equal(r.status, 200)
  assert.match(r.headers.get('content-type'), /^text\/calendar/)
  const text = await r.text()
  assert.match(text, /SUMMARY:Աննա և Միքայելի հարսանիք/)
  assert.match(text, /\/i\/abc/)
  const evil = await (await fetch(base + q({ t: 'x', d: '2027-06-12', h: '16:00', u: 'https://evil.example/x' }))).text()
  assert.doesNotMatch(evil, /evil/, 'a link to another site is dropped')
  assert.equal((await fetch(base + q({ t: 'x', d: 'tomorrow' }))).status, 422)
  assert.equal((await fetch(base + q({ d: '2027-06-12' }))).status, 422)
})

test('personal links: the guest list CSV, long random tokens, the links file', async () => {
  const g = await import(pathToFileURL(path.join(ROOT, 'scripts/guests-csv.js')).href)
  const { rows, skipped } = g.prepareGuests('﻿display_name;phone;note\r\nԱրամ և Անի;+374 99 111111;\r\n;;\r\nAni Petrosyan;;\r\nԱնի Պետրոսյան;;կրկնություն\r\n"Կարեն, Մարիամ";;\r\n')
  assert.deepEqual(rows.map((r) => r.name), ['Արամ և Անի', 'Ani Petrosyan', 'Կարեն, Մարիամ'])
  assert.equal(rows[0].phone, '+374 99 111111')
  assert.equal(skipped.length, 1, 'the same name in another script is a duplicate')
  assert.throws(() => g.prepareGuests('guest,table\nԱնի,1'), /display_name/)
  const tokens = new Set(Array.from({ length: 200 }, () => g.newGuestToken()))
  assert.equal(tokens.size, 200)
  for (const t of tokens) assert.match(t, /^[A-Za-z0-9]{24}$/)
  assert.equal(g.linksCsv('https://siloona.am', 'abcdef123456', [{ display_name: 'Կարեն, Մարիամ', token: 'T'.repeat(24) }]),
    `display_name,link\r\n"Կարեն, Մարիամ",https://siloona.am/i/abcdef123456/${'T'.repeat(24)}\r\n`)
})

test('personal links: the guest is greeted by name, nothing else leaks, unknown links open the general page', async () => {
  const { nameKey } = await import(pathToFileURL(path.join(ROOT, 'api/_lib/seating.js')).href)
  const paid = async (addons) => {
    const o = await newOrder({ designId: 'wd-noir', addons })
    await call('POST', '/api/admin/orders', { token: USERS.admin.token, body: { orderId: o.orderId, action: 'manual_payment', method: 'cash', reference: `P-${o.orderNumber}` } })
    const code = (await status(o)).json.invitationCode
    return { o, code, inv: await store.getInvitationByCode(code) }
  }
  const withIt = await paid(['personal_greeting'])
  const aram = 'AramAniToken0000000000001'
  const other = 'PetrosyanToken00000000002'
  await store.addInvitationGuest({ invitation_id: withIt.inv.id, token: aram, display_name: 'Արամ և Անի', name_key: nameKey('Արամ և Անի') })
  await store.addInvitationGuest({ invitation_id: withIt.inv.id, token: other, display_name: 'Պետրոսյանների ընտանիք', name_key: nameKey('Պետրոսյանների ընտանիք') })

  const general = await call('GET', `/api/invitations?code=${withIt.code}`)
  assert.equal(general.status, 200)
  assert.equal(general.json.personal, undefined, 'the general link is as before')
  const mine = await call('GET', `/api/invitations?code=${withIt.code}&t=${aram}`)
  assert.deepEqual(mine.json.personal, { name: 'Արամ և Անի' })
  assert.ok(!JSON.stringify(mine.json).includes('Պետրոսյան'), 'never another guest’s name')
  for (const t of ['NoSuchGuestToken00000000', 'bad', 'x'.repeat(60)]) {
    const unknown = await call('GET', `/api/invitations?code=${withIt.code}&t=${t}`)
    assert.equal(unknown.status, 200, `unknown link ${t} opens the general invitation`)
    assert.equal(unknown.json.personal, undefined)
  }
  // a token of one invitation doesn't work on another
  const without = await paid([])
  await store.addInvitationGuest({ invitation_id: without.inv.id, token: 'NoFeatureToken0000000003', display_name: 'Լիլիթ', name_key: nameKey('Լիլիթ') })
  assert.equal((await call('GET', `/api/invitations?code=${without.code}&t=${aram}`)).json.personal, undefined)
  assert.equal((await call('GET', `/api/invitations?code=${without.code}&t=NoFeatureToken0000000003`)).json.personal, undefined, 'without the add-on: no greeting')

  // the RSVP from a personal link is remembered with that guest
  assert.equal((await call('POST', '/api/invitations', { body: { code: withIt.code, t: aram, name: 'Արամ և Անի', status: 'confirmed', plus: 1 } })).status, 201)
  assert.equal((await call('POST', '/api/invitations', { body: { code: withIt.code, name: 'Գոհար', status: 'declined' } })).status, 201)
  const answers = await store.rsvps(withIt.inv.id)
  const guest = await store.getInvitationGuest(withIt.inv.id, aram)
  assert.equal(answers.find((r) => r.guest_name === 'Արամ և Անի').guest_id, guest.id)
  assert.equal(answers.find((r) => r.guest_name === 'Գոհար').guest_id, null)
})

test('seating add-on: offered in every wedding design that has the section', async () => {
  const { orderableAddons, SEATING_DESIGNS } = await import(pathToFileURL(path.join(ROOT, 'src/site/addons.js')).href)
  for (const id of ['wd-calla', 'wd-chateau', 'wd-cherry', 'wd-line', 'wd-meadow', 'wd-mono', 'wd-rouge', 'wd-velvet', 'wd-portrait', 'wd-noir', 'wd-noir-lite']) {
    assert.ok(SEATING_DESIGNS.includes(id), id)
    assert.ok(orderableAddons(id, 'diy').some((a) => a.id === 'seating'), `${id} offers «Ձեր սեղանը»`)
  }
  // every design listed really renders the section
  for (const id of SEATING_DESIGNS) {
    const dir = path.join(ROOT, 'src/site/invitations', id)
    const src = fs.readdirSync(dir, { recursive: true }).filter((f) => /\.jsx$/.test(f)).map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n')
    const viaShared = /NewYearParty|from '\.\.\/ce-sparkle/.test(src)
    assert.ok(viaShared || /useSeatFinder\(\)/.test(src), `${id} has a seating section`)
  }
})

test('live schedule: on the day only, Yerevan time, now / next / past, directions and Yandex Go', async () => {
  const L = await import(pathToFileURL(path.join(ROOT, 'src/site/invitations/shared/liveTimes.js')).href)
  const data = {
    eventDate: '2027-06-12T13:00:00',
    places: [
      { label: 'Փեսայի տուն', time: '13:00', name: 'Սարգսյաններ', address: 'Երևան, Սայաթ-Նովա 10' },
      { label: 'Պսակադրություն', time: '15:00', name: 'Սուրբ Գայանե', address: '40.1580, 44.2930' },
      { label: 'Խնջույք', time: '18:00', name: '«Վարդենի»', address: 'https://www.google.com/maps/place/x/@40.1772,44.5035,17z' },
    ],
    schedule: [
      { time: '13:00', label: 'Փեսայի տուն' },
      { time: '15:00', label: 'Պսակադրություն', end: '16:00' },
      { time: '18:00', label: 'Խնջույք' },
      { time: '21:00', label: 'Տորթ' },
    ],
  }
  const at = (d, t) => L.yerevanMs(d, t)
  const s = (d, t) => { const x = L.liveState(data, at(d, t)); return { active: x.active, now: x.now, next: x.next, past: [...x.past].sort() } }
  assert.deepEqual(s('2027-06-11', '20:00'), { active: false, now: null, next: null, past: [] }, 'the day before: as usual')
  assert.deepEqual(s('2027-06-12', '10:00'), { active: true, now: null, next: 0, past: [] }, 'before the first part')
  assert.deepEqual(s('2027-06-12', '13:30'), { active: true, now: 0, next: 1, past: [] }, 'during a part')
  assert.deepEqual(s('2027-06-12', '16:30'), { active: true, now: null, next: 2, past: [0, 1] }, 'between parts (the 2nd ended at 16:00)')
  assert.deepEqual(s('2027-06-12', '23:30'), { active: true, now: 3, next: null, past: [0, 1, 2] }, 'the last part lasts 3 hours')
  assert.deepEqual(s('2027-06-13', '00:30'), { active: false, now: null, next: null, past: [] }, 'the next day: as usual')
  // a phone set to another time zone changes nothing: the instant is what counts
  assert.equal(L.yerevanMs('2027-06-12', '13:00'), Date.UTC(2027, 5, 12, 9, 0))

  const parts = L.scheduleParts(data).parts
  assert.deepEqual(parts[1].place.coords, { lat: 40.158, lng: 44.293 }, 'coordinates written as the address')
  assert.deepEqual(parts[2].place.coords, { lat: 40.1772, lng: 44.5035 }, 'coordinates from a Google Maps link')
  assert.equal(parts[2].place.address, '', 'a link is not shown as an address')
  assert.equal(parts[3].place, null, 'a row without its own place and no place at its time')
  assert.match(L.directionsUrl(parts[0].place), /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/)
  assert.match(L.directionsUrl(parts[1].place, true), /^https:\/\/maps\.apple\.com\/\?daddr=40\.158,44\.293/)
  const taxi = new URL(L.taxiUrl(parts[2].place, 'hy'))
  assert.equal(taxi.origin + taxi.pathname, 'https://3.redirect.appmetrica.yandex.com/route')
  assert.equal(taxi.searchParams.get('end-lat'), '40.1772')
  assert.equal(taxi.searchParams.get('end-lon'), '44.5035')
  assert.equal(taxi.searchParams.get('appmetrica_tracking_id'), '25395763362139037', 'no app → Yandex Go website')
  assert.equal(new URL(L.taxiUrl(parts[0].place)).searchParams.get('end-lat'), null, 'no coordinates → no made-up destination')
  // one venue for the whole event: every part is there
  const party = { eventDate: '2027-05-15', venue: { name: '«Փուչիկ»', address: 'Երևան' }, schedule: [{ time: '12:00', label: 'a' }, { time: '13:00', label: 'b' }] }
  assert.equal(L.scheduleParts(party).parts[1].place.name, '«Փուչիկ»')
})

test('live schedule: the ?now= test mode never runs on the live site', async () => {
  const src = fs.readFileSync(path.join(ROOT, 'src/site/invitations/shared/LiveSchedule.jsx'), 'utf8')
  assert.match(src, /import\.meta\.env\?\.DEV/)
  const allowed = (host) => /^(localhost|127\.\d+\.\d+\.\d+)$/.test(host) || host.endsWith('.vercel.app')
  assert.equal(allowed('siloona.am'), false)
  assert.equal(allowed('www.siloona.am'), false)
  assert.equal(allowed('invitations-git-x.vercel.app'), true)
  assert.match(src, /host\.endsWith\('\.vercel\.app'\)/, 'the same rule as in the component')
})

test('RSVP questions: cleaned questions and answers', async () => {
  const Q = await import(pathToFileURL(path.join(ROOT, 'src/site/rsvpQuestions.js')).href)
  const qs = Q.cleanQuestions([
    { type: 'text', text: '  Ո՞ր <b>երգը</b>  ' },
    { type: 'choice', text: 'Ուտեստ', options: ['Միս', 'Ձուկ', 'Միս', ''] },
    { type: 'yesno', text: 'Տրանսպորտ պե՞տք է', required: true },
  ])
  assert.equal(qs[0].text, 'Ո՞ր երգը', 'no HTML, single spaces')
  assert.deepEqual(qs[1].options, ['Միս', 'Ձուկ'])
  assert.equal(new Set(qs.map((q) => q.id)).size, 3)
  assert.throws(() => Q.cleanQuestions([1, 2, 3, 4].map(() => ({ text: 'Հարց' }))), /3/)
  assert.throws(() => Q.cleanQuestions([{ type: 'choice', text: 'Ուտեստ', options: ['Միս'] }]), /2/)
  assert.throws(() => Q.cleanQuestions([{ text: ' ' }]), /հարց/i)
  const a = Q.cleanAnswers(qs, { [qs[0].id]: '<script>x</script>Hallelujah'.padEnd(400, '!'), [qs[1].id]: 'Խոզ', [qs[2].id]: 'yes', zzz: 'other' })
  assert.equal(a.answers[qs[0].id].length, 300)
  assert.ok(!a.answers[qs[0].id].includes('<'))
  assert.equal(a.answers[qs[1].id], undefined, 'not one of the options')
  assert.equal(a.answers.zzz, undefined)
  assert.deepEqual(Q.cleanAnswers(qs, {}).missing, ['Տրանսպորտ պե՞տք է'])
})

test('RSVP questions: the couple sets them on the order page, guests answer, answers come back', async () => {
  const paid = async (addons) => {
    const o = await newOrder({ designId: 'wd-noir', addons })
    await call('POST', '/api/admin/orders', { token: USERS.admin.token, body: { orderId: o.orderId, action: 'manual_payment', method: 'cash', reference: `Q-${o.orderNumber}` } })
    return { o, code: (await status(o)).json.invitationCode }
  }
  const save = (o, questions) => call('POST', '/api/orders/status', { body: { action: 'rsvp_questions', id: o.orderId, t: o.token, questions } })
  const { o, code } = await paid(['extra_rsvp_question'])
  assert.deepEqual((await status(o)).json.rsvpQuestions, [], 'the add-on: an empty list to fill')
  // as before: no questions → the RSVP is the same
  assert.equal((await call('POST', '/api/invitations', { body: { code, name: 'Առաջին', status: 'confirmed' } })).status, 201)
  assert.equal((await save({ ...o, token: 'wrong' }, [{ text: 'x y' }])).status, 404)
  const set = await save(o, [{ type: 'choice', text: 'Ուտեստ', options: ['Միս', 'Ձուկ', 'Բուսական'] }, { type: 'yesno', text: 'Տրանսպորտ', required: true }, { type: 'text', text: 'Երգ' }])
  assert.equal(set.status, 200, JSON.stringify(set.json))
  const [food, bus, song] = set.json.rsvpQuestions
  const page = await call('GET', `/api/invitations?code=${code}`)
  assert.equal(page.json.rsvpQuestions.length, 3)
  const missing = await call('POST', '/api/invitations', { body: { code, name: 'Գոհար', status: 'confirmed', answers: { [food.id]: 'Ձուկ' } } })
  assert.equal(missing.status, 422, 'a required question')
  assert.equal((await call('POST', '/api/invitations', { body: { code, name: 'Գոհար', status: 'confirmed', answers: { [food.id]: 'Ձուկ', [bus.id]: 'no', [song.id]: 'Սիրուն աղջիկ <i>' } } })).status, 201)
  const answers = (await status(o)).json.rsvps
  const g = answers.find((r) => r.name === 'Գոհար')
  assert.deepEqual(g.answers, { [food.id]: 'Ձուկ', [bus.id]: 'no', [song.id]: 'Սիրուն աղջիկ' })
  assert.equal(answers.find((r) => r.name === 'Առաջին').answers, null)

  // without the add-on: nothing to set, nothing shown, answers ignored
  const plain = await paid([])
  assert.equal((await status(plain.o)).json.rsvpQuestions, null)
  assert.equal((await save(plain.o, [{ text: 'Հարց' }])).status, 403)
  assert.equal((await call('GET', `/api/invitations?code=${plain.code}`)).json.rsvpQuestions, undefined)
})

test('wishes book: guests write, only the couple reads, hides and closes it', async () => {
  const paid = async (addons, customization) => {
    const o = await newOrder({ designId: 'wd-noir', addons, ...(customization ? { customization } : {}) })
    await call('POST', '/api/admin/orders', { token: USERS.admin.token, body: { orderId: o.orderId, action: 'manual_payment', method: 'cash', reference: `W-${o.orderNumber}` } })
    return { o, code: (await status(o)).json.invitationCode }
  }
  const wish = (code, w) => call('POST', '/api/invitations', { body: { wish: true, code, ...w } })
  const book = (o, extra = {}) => call('POST', '/api/orders/status', { body: { action: 'wishes', id: o.orderId, t: o.token, ...extra } })
  const { o, code } = await paid(['wishes'], { names: 'Միլենա & Ալեն', eventDate: '2020-06-12', eventTime: '16:00', venue: 'Երևան' })

  const page = await call('GET', `/api/invitations?code=${code}`)
  assert.deepEqual(page.json.wishes, { open: true }, 'the page knows only that the book is open')
  assert.equal((await wish(code, { name: 'Գոհար', text: 'Երջանկություն <script>alert(1)</script>ձեզ\n\n\n\nսիրով' })).status, 201)
  assert.equal((await wish(code, { name: 'Արամ', text: 'Շնորհավոր' })).status, 201)
  assert.equal((await wish(code, { name: '', text: '' })).status, 422, 'empty fields')
  assert.equal((await wish(code, { name: 'Ա Բ', text: 'x'.repeat(501) })).status, 422, 'too long')
  assert.equal((await wish(code, { name: 'Bot', text: 'spam', website: 'http://x' })).status, 400, 'honeypot')
  assert.ok(!JSON.stringify((await call('GET', `/api/invitations?code=${code}`)).json).includes('Երջանկություն'), 'other guests never see a wish')

  const b = await book(o)
  assert.equal(b.status, 200)
  assert.deepEqual(b.json.wishes.map((w) => w.name), ['Գոհար', 'Արամ'])
  assert.equal(b.json.wishes[0].text, 'Երջանկություն alert(1)ձեզ\n\nսիրով', 'no HTML; line breaks kept')
  assert.equal((await book({ ...o, token: 'nope' })).status, 404)
  const hidden = await book(o, { action: 'wish_hide', wishId: b.json.wishes[1].id, hidden: true })
  assert.equal(hidden.json.wishes[1].hidden, true)

  // closing N days after the event (2020-06-12 is long past)
  const closed = await book(o, { action: 'wishes_close', days: 30 })
  assert.equal(closed.json.open, false)
  assert.equal((await wish(code, { name: 'Ուշացած', text: 'Ներողություն' })).status, 409)
  assert.deepEqual((await call('GET', `/api/invitations?code=${code}`)).json.wishes, { open: false })
  assert.equal((await book(o, { action: 'wishes_close', days: null })).json.open, true, 'never close')

  // without the add-on: no book at all
  const plain = await paid([])
  assert.equal((await call('GET', `/api/invitations?code=${plain.code}`)).json.wishes, undefined)
  assert.equal((await wish(plain.code, { name: 'Գոհար', text: 'Բարև' })).status, 404)
  assert.equal((await book(plain.o)).status, 404)
})

test('wishes book: a fast flood from one address is refused', async () => {
  const o = await newOrder({ designId: 'wd-noir', addons: ['wishes'] })
  await call('POST', '/api/admin/orders', { token: USERS.admin.token, body: { orderId: o.orderId, action: 'manual_payment', method: 'cash', reference: `F-${o.orderNumber}` } })
  const code = (await status(o)).json.invitationCode
  process.env.RATE_LIMITS = 'on'
  try {
    const codes = []
    for (let i = 0; i < 7; i++) codes.push((await call('POST', '/api/invitations', { body: { wish: true, code, name: 'Արագ', text: `Մաղթանք ${i}` } })).status)
    assert.deepEqual(codes.slice(0, 5), [201, 201, 201, 201, 201])
    assert.equal(codes[6], 429)
  } finally { process.env.RATE_LIMITS = 'off' }
})

test('thank-you page: set by the couple, sent to the page only with the add-on and a note', async () => {
  const paid = async (addons) => {
    const o = await newOrder({ designId: 'wd-noir', addons })
    await call('POST', '/api/admin/orders', { token: USERS.admin.token, body: { orderId: o.orderId, action: 'manual_payment', method: 'cash', reference: `T-${o.orderNumber}` } })
    return { o, code: (await status(o)).json.invitationCode }
  }
  const save = (o, body) => call('POST', '/api/orders/status', { body: { action: 'thank_you', id: o.orderId, t: o.token, ...body } })
  const { o, code } = await paid(['thank_you_page', 'wishes'])
  assert.deepEqual((await status(o)).json.thankYou, { from: '', text: '', photos: [] })
  assert.equal((await call('GET', `/api/invitations?code=${code}`)).json.thankYou, undefined, 'no note yet: the invitation stays')

  assert.equal((await save(o, { text: 'Շնորհակալություն', from: '' })).status, 422, 'a note needs its date')
  assert.equal((await save(o, { text: 'x', from: '2027-06-13T10:00', photos: Array.from({ length: 11 }, (_, i) => `/api/uploads?id=a${i}`) })).status, 422, 'at most 10 photos')
  const ok = await save(o, { from: '2027-06-13T10:00', text: 'Շնորհակալ ենք <b>բոլորիդ</b>։\n\nՍիրով՝ Միլենա և Ալեն', photos: ['/api/uploads?id=abc1', 'javascript:alert(1)', 'https://evil.example/x.jpg', '/api/uploads?id=abc1'] })
  assert.equal(ok.status, 200, JSON.stringify(ok.json))
  assert.deepEqual(ok.json.thankYou.photos, ['/api/uploads?id=abc1'], 'only our own uploads, once')
  assert.equal(ok.json.thankYou.text, 'Շնորհակալ ենք բոլորիդ։\n\nՍիրով՝ Միլենա և Ալեն')

  await call('POST', '/api/invitations', { body: { wish: true, code, name: 'Գոհար', text: 'Սեր' } })
  const page = (await call('GET', `/api/invitations?code=${code}`)).json.thankYou
  assert.deepEqual(page, { from: '2027-06-13T10:00', text: 'Շնորհակալ ենք բոլորիդ։\n\nՍիրով՝ Միլենա և Ալեն', photos: ['/api/uploads?id=abc1'], wishes: 1 })
  assert.equal((await save({ ...o, token: 'bad' }, { text: 'x', from: '2027-06-13T10:00' })).status, 404)

  const plain = await paid([])
  assert.equal((await status(plain.o)).json.thankYou, null)
  assert.equal((await save(plain.o, { text: 'x', from: '2027-06-13T10:00' })).status, 403)
})

test('print interest: a note on the order, never in the price, in Telegram only when ticked', async () => {
  const { orderText } = await import(pathToFileURL(path.join(ROOT, 'api/_lib/notify.js')).href)
  const yes = await newOrder({ printInterest: true })
  const no = await newOrder({})
  const odd = await newOrder({ printInterest: 'yes', amount: 1 })
  assert.equal(yes.amount, P.diy, 'the price does not change')
  assert.equal(no.amount, P.diy)
  assert.equal((await store.getOrder(yes.orderId)).print_interest, true)
  assert.equal((await store.getOrder(no.orderId)).print_interest, false, 'not ticked by default')
  assert.equal((await store.getOrder(odd.orderId)).print_interest, false, 'only a real true counts')
  assert.match(orderText(await store.getOrder(yes.orderId), ''), /🖨 Հետաքրքրված է տպագրով և տարոսիկներով/)
  assert.doesNotMatch(orderText(await store.getOrder(no.orderId), ''), /🖨/)
})

test('order page: «checking the payment» only while a payment is really going on', async () => {
  const { customerView } = await import(pathToFileURL(path.join(ROOT, 'api/_lib/orders.js')).href)
  const o = await newOrder()
  assert.equal((await status(o)).json.payingNow, false, 'nothing started: not paying')
  await start(o, 'arca')
  const now = await status(o)
  assert.equal(now.json.paymentStatus, 'pending')
  assert.equal(now.json.payingNow, true, 'just sent to the bank')
  const order = await store.getOrder(o.orderId)
  const txs = await store.listTransactions(o.orderId)
  const later = customerView(order, txs, null, Date.now() + 16 * 60 * 1000)
  assert.equal(later.payingNow, false, 'left on the bank page: no longer «in progress»')
  assert.equal(later.canPay, true, 'and it can be paid again')
})
