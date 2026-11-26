import { supabase } from '../../lib/supabaseClient'
import { langOf } from '../i18n'

// Browser side of the checkout. The browser only ever asks the server to
// do things; it never decides a price or whether a payment went through.

// Messages made here in the browser follow the page's language (the
// server's own messages stay Armenian).
const MSG = {
  hy: {
    network: 'Կապի խնդիր։ Ստուգեք ինտերնետ կապը և փորձեք կրկին։',
    generic: 'Ինչ-որ բան այնպես չգնաց։ Խնդրում ենք փորձել կրկին։',
    upload: 'Չհաջողվեց վերբեռնել լուսանկարը։ Փորձեք կրկին։',
  },
  ru: {
    network: 'Проблема со связью. Проверьте подключение к интернету и попробуйте ещё раз.',
    generic: 'Что-то пошло не так. Пожалуйста, попробуйте ещё раз.',
    upload: 'Не удалось загрузить фотографию. Попробуйте ещё раз.',
  },
  en: {
    network: 'Connection problem. Check your internet connection and try again.',
    generic: 'Something went wrong. Please try again.',
    upload: 'Couldn’t upload the photo. Please try again.',
  },
}
const msg = (k) => (MSG[langOf(window.location.pathname)] || MSG.hy)[k]

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
    throw Object.assign(new Error(msg('network')), { code: 'network' })
  }
  let data = null
  try { data = await r.json() } catch { /* empty or non-JSON body */ }
  if (!r.ok) {
    throw Object.assign(new Error(data?.message || msg('generic')), {
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
      throw Object.assign(new Error(msg('network')), { code: 'network' })
    }
    const data = await r.json().catch(() => null)
    if (!r.ok || !data?.url) throw new Error(data?.message || msg('upload'))
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

// With the simulator on, the customer chooses between the two ways they'll
// really pay — card or Idram — and the test page plays either one.
// 'test-idram' is only a choice here; the server knows one method, 'test'.
export const paymentChoices = (methods) => methods.flatMap((m) => (m === 'test' ? ['test', 'test-idram'] : [m]))
export const isTestChoice = (c) => c === 'test' || c === 'test-idram'

export async function startPayment(orderId, token, choice) {
  const r = await call('/api/payments/start', { method: 'POST', body: { orderId, token, method: isTestChoice(choice) ? 'test' : choice } })
  if (isTestChoice(choice) && r.redirectUrl) {
    const u = new URL(r.redirectUrl, window.location.origin)
    u.searchParams.set('via', choice === 'test-idram' ? 'idram' : 'card')
    u.searchParams.set('lang', langOf(window.location.pathname))
    r.redirectUrl = u.pathname + u.search
  }
  return r
}

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

const METHOD_INFO_I18N = {
  hy: {
    arca: { label: 'Բանկային քարտ', sub: 'ArCa, Visa, Mastercard' },
    idram: { label: 'Idram', sub: 'Idram դրամապանակ կամ Idram&IDBank' },
    manual: { label: 'Փոխանցում', sub: '' },
    test: { label: 'Թեստային վճարում', sub: 'Սիմուլյացիա · իրական գումար չի գանձվում' },
    // the simulator's two choices at checkout (paymentChoices)
    'test:card': { label: 'Բանկային քարտ', sub: 'ArCa, Visa, Mastercard' },
    'test-idram': { label: 'Idram', sub: 'Idram դրամապանակ' },
  },
  ru: {
    arca: { label: 'Банковская карта', sub: 'ArCa, Visa, Mastercard' },
    idram: { label: 'Idram', sub: 'Кошелёк Idram или Idram&IDBank' },
    manual: { label: 'Перевод', sub: '' },
    test: { label: 'Тестовая оплата', sub: 'Симуляция · реальные деньги не списываются' },
    'test:card': { label: 'Банковская карта', sub: 'ArCa, Visa, Mastercard' },
    'test-idram': { label: 'Idram', sub: 'Кошелёк Idram' },
  },
  en: {
    arca: { label: 'Bank card', sub: 'ArCa, Visa, Mastercard' },
    idram: { label: 'Idram', sub: 'Idram wallet or Idram&IDBank' },
    manual: { label: 'Bank transfer', sub: '' },
    test: { label: 'Test payment', sub: 'Simulation · no real money is charged' },
    'test:card': { label: 'Bank card', sub: 'ArCa, Visa, Mastercard' },
    'test-idram': { label: 'Idram', sub: 'Idram wallet' },
  },
}

const OPTION_INFO_I18N = {
  hy: {
    diy: { label: 'Խմբագրում', text: 'Հրավերը լրացնում և խմբագրում եք ինքներդ՝ կայքում։' },
    assisted: { label: 'Պատվեր', text: 'Siloona-ն պատրաստում է հրավերը Ձեր տվյալներով։' },
  },
  ru: {
    diy: { label: 'Самостоятельно', text: 'Вы сами заполняете и редактируете приглашение — прямо на сайте.' },
    assisted: { label: 'Под ключ', text: 'Siloona готовит приглашение по Вашим данным.' },
  },
  en: {
    diy: { label: 'Do it yourself', text: 'You fill in and edit the invitation yourself, right on the site.' },
    assisted: { label: 'Done for you', text: 'Siloona prepares the invitation with your details.' },
  },
}

export const methodInfo = (lang = 'hy') => METHOD_INFO_I18N[lang] || METHOD_INFO_I18N.hy
export const optionInfo = (lang = 'hy') => OPTION_INFO_I18N[lang] || OPTION_INFO_I18N.hy
// Armenian, as before.
export const METHOD_INFO = METHOD_INFO_I18N.hy
export const OPTION_INFO = OPTION_INFO_I18N.hy
