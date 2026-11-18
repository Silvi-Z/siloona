import http from 'node:http'
import { randomUUID } from 'node:crypto'

// A local stand-in for the ArCa vPOS REST gateway (register.do,
// getOrderStatusExtended.do, refund.do) plus a bare "hosted payment page"
// with Pay / Decline / Cancel buttons. It exists only so the real adapter
// code (api/_lib/providers/arca.js) can be exercised end-to-end without
// bank credentials. It is never used by the app itself.

export function startFakeArca({ user = 'test-api', pass = 'test-pass' } = {}) {
  const orders = new Map()
  const byNumber = new Set()
  let base = ''

  const readForm = (req) => new Promise((res) => {
    let s = ''
    req.on('data', (c) => { s += c })
    req.on('end', () => res(Object.fromEntries(new URLSearchParams(s))))
  })
  const json = (res, obj) => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)) }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, base)
    if (req.method === 'POST' && url.pathname.startsWith('/payment/rest/')) {
      const p = await readForm(req)
      if (p.userName !== user || p.password !== pass) return json(res, { errorCode: '5', errorMessage: 'Access denied' })
      const method = url.pathname.split('/').pop()
      if (method === 'register.do') {
        if (byNumber.has(p.orderNumber)) return json(res, { errorCode: '1', errorMessage: 'Order number is duplicated' })
        const id = randomUUID()
        byNumber.add(p.orderNumber)
        orders.set(id, { orderNumber: p.orderNumber, amount: Number(p.amount), currency: p.currency, returnUrl: p.returnUrl, failUrl: p.failUrl, orderStatus: 0 })
        return json(res, { orderId: id, formUrl: `${base}/pay?mdOrder=${id}` })
      }
      const o = orders.get(p.orderId)
      if (!o) return json(res, { errorCode: '6', errorMessage: 'Order not found' })
      if (method === 'getOrderStatusExtended.do') {
        return json(res, {
          errorCode: '0', orderNumber: o.orderNumber, orderStatus: o.orderStatus, amount: o.reportAmount ?? o.amount, currency: o.currency,
          actionCode: o.actionCode ?? 0, actionCodeDescription: o.actionCodeDescription ?? '',
          ...(o.orderStatus >= 2 ? { cardAuthInfo: { maskedPan: '408306**1234', cardholderName: 'TEST CARDHOLDER', approvalCode: '123456' } } : {}),
        })
      }
      if (method === 'refund.do') {
        if (o.orderStatus !== 2) return json(res, { errorCode: '7', errorMessage: 'Payment must be in a correct state' })
        o.orderStatus = 4
        return json(res, { errorCode: '0' })
      }
      return json(res, { errorCode: '7', errorMessage: 'Unknown method' })
    }

    if (url.pathname === '/pay') {
      const id = url.searchParams.get('mdOrder')
      if (!orders.has(id)) { res.writeHead(404); return res.end('no order') }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      return res.end(`<!doctype html><meta name=viewport content="width=device-width"><title>FAKE ArCa</title>
        <h1>FAKE ArCa test page</h1><p>Amount: ${orders.get(id).amount}</p>
        <a id=pay href="/pay/act?a=pay&mdOrder=${id}">Pay</a> <a id=decline href="/pay/act?a=decline&mdOrder=${id}">Decline</a> <a id=cancel href="/pay/act?a=cancel&mdOrder=${id}">Cancel</a>`)
    }
    if (url.pathname === '/pay/act') {
      const id = url.searchParams.get('mdOrder')
      const o = orders.get(id)
      const a = url.searchParams.get('a')
      if (a === 'pay') o.orderStatus = 2
      if (a === 'decline') { o.orderStatus = 6; o.actionCode = 116; o.actionCodeDescription = 'Insufficient funds' }
      const to = new URL(a === 'pay' ? o.returnUrl : o.failUrl)
      to.searchParams.set('orderId', id)
      res.writeHead(302, { Location: to.toString() })
      return res.end()
    }
    res.writeHead(404)
    res.end()
  })

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      base = `http://127.0.0.1:${server.address().port}`
      resolve({
        base,
        restBase: `${base}/payment/rest`,
        orders,
        set: (id, patch) => Object.assign(orders.get(id), patch),
        close: () => new Promise((r) => server.close(r)),
      })
    })
  })
}
