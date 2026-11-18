// ArCa vPOS — card payments (ArCa, Visa, Mastercard) through the ArCa
// e-commerce gateway that most Armenian acquiring banks issue merchants
// (ipay.arca.am). The customer types card details on ArCa's own hosted
// page; Siloona only ever sees the result.
//
// Flow:
//   register.do                 -> ArCa orderId + formUrl; we redirect there
//   customer pays on ArCa       -> ArCa redirects back to returnUrl/failUrl
//   getOrderStatusExtended.do   -> the ONLY thing that decides the result
//   refund.do                   -> full refund of a paid order
//
// Credentials come from the acquiring bank (the API user is usually the
// merchant login with an "-api" suffix). Env:
//   ARCA_USERNAME, ARCA_PASSWORD  required
//   ARCA_MODE        "test" (ipaytest.arca.am:8445) | "live" (ipay.arca.am)
//   ARCA_API_BASE    optional full override of the REST base URL
//   ARCA_AMOUNT_MULTIPLIER  minor units per dram, default 100 — confirm
//                    with the bank during test-mode certification.

const BASES = {
  test: 'https://ipaytest.arca.am:8445/payment/rest',
  live: 'https://ipay.arca.am/payment/rest',
}
const AMD = '051' // ISO 4217 numeric

function cfg() {
  const env = process.env
  const mode = env.ARCA_MODE === 'live' ? 'live' : 'test'
  return {
    user: env.ARCA_USERNAME,
    pass: env.ARCA_PASSWORD,
    base: (env.ARCA_API_BASE || BASES[mode]).replace(/\/+$/, ''),
    mult: Number(env.ARCA_AMOUNT_MULTIPLIER || 100),
    mode,
  }
}

async function call(method, params) {
  const c = cfg()
  const body = new URLSearchParams({ userName: c.user, password: c.pass, ...params })
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15000)
  try {
    const r = await fetch(`${c.base}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: ctrl.signal,
    })
    const text = await r.text()
    let json
    try { json = JSON.parse(text) } catch { throw new Error(`ArCa ${method}: non-JSON response (HTTP ${r.status})`) }
    return json
  } finally {
    clearTimeout(timer)
  }
}

const isErr = (j) => j.errorCode != null && String(j.errorCode) !== '0'

// getOrderStatusExtended orderStatus -> our transaction status.
// 0 = registered, not paid yet (customer still on the page, or left).
const STATUS = { 1: 'pending', 2: 'paid', 3: 'cancelled', 4: 'refunded', 5: 'pending', 6: 'failed' }

export const arca = {
  id: 'arca',
  configured() {
    const c = cfg()
    return Boolean(c.user && c.pass)
  },
  mode: () => cfg().mode,

  async register({ merchantRef, amount, description, returnUrl, failUrl, language = 'hy' }) {
    const j = await call('register.do', {
      orderNumber: merchantRef,
      amount: String(Math.round(amount * cfg().mult)),
      currency: AMD,
      returnUrl,
      failUrl,
      description,
      language,
    })
    if (isErr(j) || !j.orderId || !j.formUrl) {
      return { ok: false, errorCode: String(j.errorCode ?? ''), errorMessage: j.errorMessage || 'register failed' }
    }
    return { ok: true, providerPaymentId: j.orderId, redirectUrl: j.formUrl }
  },

  // Asks ArCa what happened. Returns status null while the order is still
  // just registered (0) — the caller decides whether that means "still
  // paying" or "customer cancelled".
  async status(tx) {
    const j = await call('getOrderStatusExtended.do', { orderId: tx.provider_payment_id, language: 'hy' })
    if (isErr(j) && j.orderStatus == null) {
      return { status: null, error: true, errorCode: String(j.errorCode), errorMessage: j.errorMessage, raw: sanitize(j) }
    }
    let status = j.orderStatus == null ? null : (STATUS[j.orderStatus] ?? null)
    // Never accept a "paid" that doesn't match what we asked for.
    const expected = Math.round(tx.amount * cfg().mult)
    const mismatch = status === 'paid' && (
      Number(j.amount) !== expected ||
      (j.currency != null && String(j.currency) !== AMD) ||
      (j.orderNumber != null && String(j.orderNumber) !== tx.merchant_ref)
    )
    if (mismatch) status = 'mismatch'
    return {
      status,
      cardMask: j.cardAuthInfo?.maskedPan || j.cardAuthInfo?.pan || null,
      errorCode: j.actionCode != null ? String(j.actionCode) : null,
      errorMessage: j.actionCodeDescription || j.errorMessage || null,
      raw: sanitize(j),
    }
  },

  async refund(tx) {
    const j = await call('refund.do', { orderId: tx.provider_payment_id, amount: String(Math.round(tx.amount * cfg().mult)) })
    return isErr(j) ? { ok: false, errorCode: String(j.errorCode), errorMessage: j.errorMessage } : { ok: true }
  },
}

// Keep only what's useful for support; drop cardholder name and anything
// card-related beyond the masked number.
function sanitize(j) {
  const keep = ['errorCode', 'errorMessage', 'orderNumber', 'orderStatus', 'actionCode', 'actionCodeDescription',
    'amount', 'currency', 'date', 'ip', 'authRefNum', 'paymentAmountInfo']
  const out = {}
  for (const k of keep) if (j[k] !== undefined) out[k] = j[k]
  if (j.cardAuthInfo) out.card = { maskedPan: j.cardAuthInfo.maskedPan || j.cardAuthInfo.pan || null, approvalCode: j.cardAuthInfo.approvalCode || null }
  return out
}
