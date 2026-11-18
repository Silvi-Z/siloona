import { supabase } from '../../lib/supabaseClient'

// Browser side of the checkout. The browser only ever asks the server to
// do things; it never decides a price or whether a payment went through.

const NETWORK_MSG = 'Կապի խնդիր։ Ստուգեք ինտերնետ կապը և փորձեք կրկին։'

async function call(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (auth && supabase) {
    const { data } = await supabase.auth.getSession()
    if (data.session) headers.Authorization = `Bearer ${data.session.access_token}`
  }
  let r
  try {
    r = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch {
    throw Object.assign(new Error(NETWORK_MSG), { code: 'network' })
  }
  let data = null
  try { data = await r.json() } catch { /* empty or non-JSON body */ }
  if (!r.ok) {
    throw Object.assign(new Error(data?.message || 'Ինչ-որ բան այնպես չգնաց։ Խնդրում ենք փորձել կրկին։'), {
      code: data?.error || `http_${r.status}`,
      fields: data?.fields || null,
      status: r.status,
    })
  }
  return data
}

// Photos the customer put into the design (kept as data URLs while
// editing, see shared/EditablePhoto) are uploaded and replaced with their
// stored address before the order is sent. `cache` (a Map) keeps a retry
// from uploading the same photo twice.
export async function uploadPhotos(content, cache = new Map()) {
  if (typeof content === 'string') {
    if (!content.startsWith('data:image/')) return content
    if (cache.has(content)) return cache.get(content)
    const blob = await (await fetch(content)).blob()
    let r
    try {
      r = await fetch('/api/uploads', { method: 'POST', headers: { 'Content-Type': blob.type || 'image/jpeg' }, body: blob })
    } catch {
      throw Object.assign(new Error(NETWORK_MSG), { code: 'network' })
    }
    const data = await r.json().catch(() => null)
    if (!r.ok || !data?.url) throw new Error(data?.message || 'Չհաջողվեց վերբեռնել լուսանկարը։ Փորձեք կրկին։')
    cache.set(content, data.url)
    return data.url
  }
  if (Array.isArray(content)) return Promise.all(content.map((x) => uploadPhotos(x, cache)))
  if (content && typeof content === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(content)) out[k] = await uploadPhotos(v, cache)
    return out
  }
  return content
}

export const getCheckoutConfig = () => call('/api/checkout/config')
export const createOrder = (payload) => call('/api/orders', { method: 'POST', body: payload, auth: true })
export const getOrderStatus = (id, token) => call(`/api/orders/status?id=${encodeURIComponent(id)}&t=${encodeURIComponent(token)}`)
export const startPayment = (orderId, token, method) => call('/api/payments/start', { method: 'POST', body: { orderId, token, method } })

// Leaves the site for the provider's own payment page.
export function goToProvider(result) {
  if (result.redirectUrl) {
    window.location.assign(result.redirectUrl)
    return true
  }
  if (result.form) {
    const f = document.createElement('form')
    f.method = 'POST'
    f.action = result.form.action
    for (const [name, value] of Object.entries(result.form.fields)) {
      const i = document.createElement('input')
      i.type = 'hidden'
      i.name = name
      i.value = value
      f.appendChild(i)
    }
    document.body.appendChild(f)
    f.submit()
    return true
  }
  return false
}

// Idram sends customers back to one fixed address with no order in it,
// so the last order is remembered on this device. A convenience only —
// the order link itself always works.
const LAST = 'siloona:last-order'
// Every order placed (or opened by its link) on this device, newest first —
// what the «Իմ պատվերները» page lists (pages/MyOrders.jsx).
const ALL = 'siloona:orders'
export function listOrders() {
  try { return JSON.parse(localStorage.getItem(ALL) || '[]').filter((o) => o?.orderId && o?.token) } catch { return [] }
}
export function rememberOrder(orderId, token) {
  try {
    localStorage.setItem(LAST, JSON.stringify({ orderId, token }))
    const rest = listOrders().filter((o) => o.orderId !== orderId)
    localStorage.setItem(ALL, JSON.stringify([{ orderId, token }, ...rest].slice(0, 50)))
  } catch { /* storage blocked */ }
}
export function forgetOrder(orderId) {
  try { localStorage.setItem(ALL, JSON.stringify(listOrders().filter((o) => o.orderId !== orderId))) } catch { /* storage blocked */ }
}
export function recallOrder() {
  try { return JSON.parse(localStorage.getItem(LAST) || 'null') } catch { return null }
}

export function orderLink(orderId, token) {
  return `/checkout/result?order=${encodeURIComponent(orderId)}&t=${encodeURIComponent(token)}`
}

export const METHOD_INFO = {
  arca: { label: 'Բանկային քարտ', sub: 'ArCa, Visa, Mastercard' },
  idram: { label: 'Idram', sub: 'Idram դրամապանակ կամ Idram&IDBank' },
  manual: { label: 'Փոխանցում', sub: '' },
  test: { label: 'Թեստային վճարում', sub: 'Սիմուլյացիա · իրական գումար չի գանձվում' },
}

export const OPTION_INFO = {
  diy: { label: 'Խմբագրում', text: 'Հրավերը լրացնում և խմբագրում եք ինքներդ՝ կայքում։' },
  assisted: { label: 'Պատվեր', text: 'Siloona-ն պատրաստում է հրավերը Ձեր տվյալներով։' },
}
