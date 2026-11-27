import { randomBytes, timingSafeEqual } from 'node:crypto'
import { DESIGN_PRICES, PRICE_OPTIONS, pricesFor } from '../../src/site/prices.js'
import { CUSTOM_DESIGN_ID, CUSTOM_EVENT_TYPES, CUSTOM_KINDS } from '../../src/site/customRequest.js'
import { invitationFeatures, priceAddons } from '../../src/site/addons.js'
import { cleanAnswers, cleanQuestions } from '../../src/site/rsvpQuestions.js'
import { wishesView } from './wishes.js'
import { thankYouSettings, thankYouView } from './thankYou.js'
import { HttpError, siteUrl } from './http.js'
import { notify, orderText, paymentText } from './notify.js'
import { availableMethods, getProvider } from './providers/index.js'
import { arca } from './providers/arca.js'
import { seatingPlan, seatingView } from './seating.js'
import { idram } from './providers/idram.js'

// Order and payment rules, shared by every /api endpoint. Nothing in here
// trusts the browser about money: prices come from prices.js, and a payment
// counts as made only when the provider says so server-to-server.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export function isUuid(v) { return typeof v === 'string' && UUID.test(v) }

// ---------------------------------------------------------------------------
// Creating an order
// ---------------------------------------------------------------------------

// «Ինչպես կապվել Ձեզ հետ» in the checkout — required there. The order
// keeps it as one readable line (customer_contact): «Viber», «Telegram · @anna».
export const CONTACT_VIA = { telegram: 'Telegram', viber: 'Viber', whatsapp: 'WhatsApp', call: 'Զանգ' }
// Telegram usernames: letters, digits and _, 4–32 (the @ is optional).
export const TG_USERNAME = /^@?[A-Za-z0-9_]{4,32}$/

export function validateOrderInput(body) {
  const fields = {}
  const designId = str(body.designId, 60)
  const option = str(body.option, 20)
  const c = body.customer || {}
  const name = str(c.name, 120)
  const phoneRaw = str(c.phone, 32)
  const phone = phoneRaw.replace(/[\s()-]/g, '')
  const email = str(c.email, 200)
  let contact = str(c.contact, 120)

  // A custom-design request: always prepared by Siloona, priced later.
  const custom = designId === CUSTOM_DESIGN_ID
  if (!custom && !Object.hasOwn(DESIGN_PRICES, designId)) fields.designId = 'Ընտրված դիզայնը չի գտնվել։'
  if (!custom && !PRICE_OPTIONS.includes(option)) fields.option = 'Ընտրեք տարբերակը։'
  if (name.length < 2) fields.name = 'Նշեք Ձեր անունը։'
  if (!/^\+?\d{8,15}$/.test(phone)) fields.phone = 'Նշեք ճիշտ հեռախոսահամար, օրինակ՝ +374 99 123456։'
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fields.email = 'Էլ. հասցեն սխալ է։'
  // The checkout asks how to reach the customer (the custom-design request
  // form keeps its own free «Telegram կամ Instagram» field).
  if (!custom) {
    const via = str(c.contactVia, 20)
    const tg = via === 'telegram' ? str(c.tg, 60) : ''
    if (!Object.hasOwn(CONTACT_VIA, via)) fields.contactVia = 'Ընտրեք, թե ինչպես կապվենք Ձեզ հետ։'
    else if (tg && !TG_USERNAME.test(tg)) fields.tg = 'Telegram username-ը սխալ է (տառեր, թվեր և _)։'
    else contact = tg ? `${CONTACT_VIA[via]} · @${tg.replace(/^@/, '')}` : CONTACT_VIA[via]
  }
  if (body.consent !== true) fields.consent = 'Անհրաժեշտ է համաձայնել պայմաններին։'

  const customization = custom ? validateCustomRequest(body.customization, fields) : validateCustomization(body.customization, fields)

  // Add-ons (src/site/addons.js): only ones this design + option can have.
  let addons = { items: [], total: 0 }
  if (!custom && !fields.designId && !fields.option) {
    try {
      addons = priceAddons(designId, option, Array.isArray(body.addons) ? body.addons.slice(0, 20) : [])
    } catch {
      fields.addons = 'Ընտրված հավելումներից մեկը հասանելի չէ այս դիզայնի համար։'
    }
  }
  if (Object.keys(fields).length) throw new HttpError(422, 'invalid', 'Խնդրում ենք ստուգել նշված դաշտերը։', fields)

  const clientRef = isUuid(body.clientRef) ? body.clientRef : null
  // «Ինձ հետաքրքրում են նաև տպագիր…» — a note only, never a price
  const printInterest = !custom && body.printInterest === true
  return { designId, option: custom ? 'assisted' : option, name, phone, email: email || null, contact: contact || null, customization, clientRef, addons, printInterest }
}

// The customer's own edits from the design's web editor: only the fields
// they changed (a diff against the design's content). It ends up rendered
// on a public page, so it's cleaned here: plain JSON only, bounded size and
// depth, no script/data URLs (a link field could otherwise run code), no
// prototype keys. Text is rendered by React, which escapes it.
const BAD_URL = /^(javascript|vbscript|data):/i
const BAD_KEYS = new Set(['__proto__', 'constructor', 'prototype'])
function cleanContent(v, depth = 0) {
  if (depth > 8) return undefined
  if (typeof v === 'string') return BAD_URL.test(v.replace(/[\s\u0000-\u001f]/g, '')) ? undefined : v.slice(0, 2000)
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined
  if (typeof v === 'boolean' || v === null) return v
  if (Array.isArray(v)) return v.slice(0, 50).map((x) => cleanContent(x, depth + 1)).filter((x) => x !== undefined)
  if (typeof v === 'object') {
    const out = {}
    for (const [k, x] of Object.entries(v).slice(0, 100)) {
      if (BAD_KEYS.has(k) || k.length > 60) continue
      const c = cleanContent(x, depth + 1)
      if (c !== undefined) out[k] = c
    }
    return out
  }
  return undefined
}

// What goes on the invitation. Names and date are required: they appear on
// the shareable invitation the moment the order is paid.
export function validateCustomization(z = {}, fields = {}) {
  const c = {
    names: str(z.names, 160),
    eventDate: str(z.eventDate, 10),
    eventTime: /^\d{2}:\d{2}$/.test(str(z.eventTime, 5)) ? str(z.eventTime, 5) : '',
    venue: str(z.venue, 300),
    notes: str(z.notes, 2000),
  }
  if (z.content && typeof z.content === 'object' && !Array.isArray(z.content)) {
    const content = cleanContent(z.content)
    if (JSON.stringify(content).length > 20000) fields.content = 'Խմբագրումները չափազանց մեծ են։'
    else if (Object.keys(content).length) c.content = content
  }
  // The design's own details as the customer filled them in
  // (src/site/invitationDetails.js) — same cleaning as the edits.
  if (z.details && typeof z.details === 'object' && !Array.isArray(z.details)) {
    const details = cleanContent(z.details)
    if (JSON.stringify(details).length > 12000) fields.details = 'Մանրամասները չափազանց երկար են։'
    else if (Object.keys(details).length) c.details = details
  }
  if (c.names.length < 2) fields.names = 'Նշեք անունները, որոնք կերևան հրավերում։'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.eventDate) || Number.isNaN(Date.parse(c.eventDate))) fields.eventDate = 'Նշեք միջոցառման ամսաթիվը։'
  return c
}

// What a custom-design request asks for. Only the event type and a few
// words about the idea are required — the rest is often not decided yet.
export function validateCustomRequest(z = {}, fields = {}) {
  const c = {
    request: 'custom',
    eventType: str(z.eventType, 30),
    kind: str(z.kind, 10),
    basedOn: str(z.basedOn, 60),
    names: str(z.names, 160),
    eventDate: str(z.eventDate, 10),
    notes: str(z.notes, 2000),
    references: str(z.references, 1000),
  }
  if (!Object.hasOwn(CUSTOM_EVENT_TYPES, c.eventType)) fields.eventType = 'Ընտրեք միջոցառման տեսակը։'
  if (!Object.hasOwn(CUSTOM_KINDS, c.kind)) c.kind = 'new'
  if (c.kind !== 'adapt' || !Object.hasOwn(DESIGN_PRICES, c.basedOn)) c.basedOn = ''
  if (c.eventDate && (!/^\d{4}-\d{2}-\d{2}$/.test(c.eventDate) || Number.isNaN(Date.parse(c.eventDate)))) fields.eventDate = 'Ամսաթիվը սխալ է։'
  if (c.notes.length < 10) fields.notes = 'Պատմեք մի փոքր Ձեր գաղափարի մասին։'
  return c
}

export async function createOrder(store, body, user) {
  // Honeypot: a hidden field real visitors never fill in.
  if (str(body.website, 200)) throw new HttpError(400, 'rejected', 'Հարցումը մերժվեց։')
  const v = validateOrderInput(body)

  if (v.clientRef) {
    const existing = await store.getOrderByClientRef(v.clientRef)
    if (existing) return createdView(existing)
  }

  // The design's price plus the add-ons, both from prices.js; null = price on request.
  const base = pricesFor(v.designId)[v.option]
  const amount = base == null ? null : base + v.addons.total
  const row = {
    access_token: randomBytes(24).toString('hex'),
    client_ref: v.clientRef,
    owner_id: user?.id || null,
    customer_name: v.name,
    customer_phone: v.phone,
    customer_email: v.email,
    customer_contact: v.contact,
    design_id: v.designId,
    design_option: v.option,
    customization: v.customization,
    addons: v.addons.items,
    // only when ticked, so databases without print-interest.sql keep working for everyone else
    ...(v.printInterest ? { print_interest: true } : {}),
    amount,
    currency: 'AMD',
  }
  const r = await store.insertOrder(row)
  const order = r.conflict ? await store.getOrderByClientRef(v.clientRef) : r.order
  if (!r.conflict) {
    await store.logEvent({ order_id: order.id, source: 'init', kind: 'order_created', payload: { amount, design_id: v.designId, option: v.option, addons: v.addons.items } })
    let site = ''
    try { site = siteUrl() } catch { /* not set */ }
    await notify(orderText(order, site))
  }
  return createdView(order)
}

const createdView = (o) => ({ orderId: o.id, token: o.access_token, orderNumber: o.order_number, amount: o.amount })

// ---------------------------------------------------------------------------
// Reading an order with its secret link
// ---------------------------------------------------------------------------

export async function loadOrderForCustomer(store, id, token) {
  const notFound = new HttpError(404, 'not_found', 'Պատվերը չի գտնվել։ Ստուգեք հղումը։')
  if (!isUuid(id) || typeof token !== 'string' || !token) throw notFound
  const order = await store.getOrder(id)
  if (!order) throw notFound
  const a = Buffer.from(order.access_token)
  const b = Buffer.from(token)
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw notFound
  return order
}

// What the customer's order page may see. No internal ids, no other
// customers' data, no raw provider responses.
// An online payment counts as «being checked» only this long after its
// attempt last changed: one left on the bank's page (the customer came
// back without paying) is not shown as in progress forever.
export const PAYING_FOR_MS = 15 * 60 * 1000

export function customerView(order, txs, invitation = null, now = Date.now()) {
  const last = [...txs].reverse().find((t) => t.status !== 'created') || null
  const paying = order.payment_status === 'pending' && txs.some((t) => ['created', 'pending'].includes(t.status) &&
    now - Date.parse(t.updated_at || t.created_at) < PAYING_FOR_MS)
  const paidTx = txs.find((t) => t.status === 'paid') || null
  return {
    orderNumber: order.order_number,
    designId: order.design_id,
    option: order.design_option,
    amount: order.amount,
    currency: order.currency,
    addons: Array.isArray(order.addons) ? order.addons : [],
    customerName: order.customer_name,
    paymentStatus: order.payment_status,
    // a payment really going on right now (the page shows «Ստուգում ենք» only then)
    payingNow: paying,
    orderStatus: order.order_status,
    provider: order.payment_provider,
    transactionId: order.transaction_id,
    cardMask: paidTx?.card_mask || null,
    paidAt: order.paid_at,
    createdAt: order.created_at,
    lastError: last && ['failed', 'cancelled'].includes(last.status) ? last.error_message : null,
    methods: availableMethods(),
    invitationCode: order.payment_status === 'paid' && invitation ? invitation.code : null,
    // linked to the customer's dashboard event (orderEvents.js): guests'
    // answers from now on are in the dashboard
    linked: !!order.event_id,
    // Guests' answers to the shareable invitation — the order link is the
    // customer's key to them (there's no account at checkout).
    rsvps: order.payment_status === 'paid' && invitation && Array.isArray(invitation.rsvps)
      ? invitation.rsvps.map((r) => ({ name: r.guest_name, status: r.status, plus: r.plus, note: r.note, at: r.created_at, answers: r.answers || null }))
      : [],
    // «Լրացուցիչ հարց RSVP-ում»: the couple sets their questions on this page
    rsvpQuestions: invitation && featuresOf(order, invitation).includes('extra_rsvp_question') ? rsvpQuestionsOf(invitation) : null,
    // «Մաղթանքների գիրք»: a link to the couple's own page with the wishes
    wishesBook: !!invitation && featuresOf(order, invitation).includes('wishes'),
    // «Շնորհակալական էջ»: what the couple has set (null without the add-on)
    thankYou: thankYouSettings(order, invitation),
    // add-ons whose data the couple fills in on this page (coupleSetup.js)
    setup: invitation ? setupOf(featuresOf(order, invitation)) : null,
    canPay: order.amount != null && order.order_status !== 'cancelled' && !['paid', 'refunded'].includes(order.payment_status),
    // What the invitation will show, for the preview on the order page
    // (with a «Նախադիտում» mark until it's paid). The customer's own data;
    // guests can't open the invitation before payment (loadInvitation).
    preview: order.customization?.request === 'custom' ? null : previewOf(order),
  }
}

const setupOf = (f) => ({ seating: f.includes('seating'), guests: f.includes('personal_greeting'), liveSchedule: f.includes('live_schedule') })

function previewOf(order) {
  const { names, eventDate, eventTime, venue, details, content } = order.customization || {}
  return { customization: { names, eventDate, eventTime, venue }, details: details || null, content: content || null }
}

// The paid order's shareable invitation. The database creates it when the
// order becomes paid; this covers the rare code collision and orders paid
// before invitations existed.
export async function invitationForOrder(store, order) {
  if (order.payment_status !== 'paid') return null
  return (await store.getInvitationByOrder(order.id)) ||
    store.createInvitation({ code: randomBytes(6).toString('hex'), order_id: order.id, design_id: order.design_id })
}

// ---------------------------------------------------------------------------
// The public invitation page (/i/:code) and its RSVP form
// ---------------------------------------------------------------------------

export async function loadInvitation(store, code) {
  const inv = typeof code === 'string' && /^[0-9a-f]{12}$/.test(code) ? await store.getInvitationByCode(code) : null
  if (!inv) throw new HttpError(404, 'not_found', 'Հրավերը չի գտնվել։ Ստուգեք հղումը։')
  const order = await store.getOrder(inv.order_id)
  if (order.payment_status !== 'paid' || order.order_status === 'cancelled') {
    throw new HttpError(410, 'unavailable', 'Այս հրավերն այլևս հասանելի չէ։')
  }
  return { inv, order }
}

// The features (src/site/addons.js) a purchased invitation shows: the
// free ones, the ones its order paid for, and any turned on by hand.
export const featuresOf = (order, inv) => invitationFeatures(order?.addons, inv?.features)

// «Ձեր սեղանը» of a purchased invitation — only with the seating feature.
export async function invitationSeatingPlan(store, inv, order) {
  return featuresOf(order, inv).includes('seating') ? seatingPlan(store, { invitation_id: inv.id }) : null
}

// Only what the page renders — no customer contact details or notes.
export async function publicInvitation(store, code) {
  const { inv, order } = await loadInvitation(store, code)
  const { names, eventDate, eventTime, venue, details, content } = order.customization || {}
  const features = featuresOf(order, inv)
  const rsvpQuestions = features.includes('extra_rsvp_question') ? rsvpQuestionsOf(inv) : []
  // «Մաղթանքների գիրք»: only whether it's there and open — never the wishes
  const wishes = wishesView(order, inv)
  // «Շնորհակալական էջ»: the note and photos, once written (thankYou.js)
  const thankYou = await thankYouView(store, order, inv)
  // «Ձեր սեղանը»: only whether / from when — the table itself is asked separately
  const seating = seatingView(await invitationSeatingPlan(store, inv, order))
  return { designId: order.design_id, customization: { names, eventDate, eventTime, venue }, details: details || null, content: content || null, seating, features, ...(rsvpQuestions.length ? { rsvpQuestions } : {}), ...(wishes ? { wishes } : {}), ...(thankYou ? { thankYou } : {}) }
}

// «Անհատական դիմում հյուրին» (supabase/personal-links.sql): the guest a
// personal link /i/<code>/<token> is for — only on an invitation with the
// personal_greeting feature. Anything else (no such token, the feature
// off) is null: the general invitation opens, with no error.
export const GUEST_TOKEN = /^[A-Za-z0-9]{20,40}$/
export async function invitationGuest(store, inv, order, token) {
  if (typeof token !== 'string' || !GUEST_TOKEN.test(token) || !store.getInvitationGuest) return null
  if (!featuresOf(order, inv).includes('personal_greeting')) return null
  try {
    return await store.getInvitationGuest(inv.id, token)
  } catch (e) {
    console.error('[invitations] personal link not read:', e.message)
    return null
  }
}

// What the page gets for a personal link: only that guest's name.
export async function personalGreeting(store, code, token) {
  const { inv, order } = await loadInvitation(store, code)
  const g = await invitationGuest(store, inv, order, token)
  return g ? { name: g.display_name } : null
}

export async function submitRsvp(store, code, body) {
  const { inv, order } = await loadInvitation(store, code)
  // from a personal link: remembered with the answer
  const guest = await invitationGuest(store, inv, order, str(body.t, 40))
  const name = str(body.name, 120)
  const status = ['confirmed', 'declined'].includes(body.status) ? body.status : null
  const n = Number(body.plus)
  const plus = Number.isInteger(n) ? Math.min(20, Math.max(0, n)) : 0
  if (!name) throw new HttpError(422, 'invalid', 'Նշեք Ձեր անունը։')
  if (!status) throw new HttpError(422, 'invalid', 'Նշեք՝ կգա՞ք, թե՞ ոչ։')
  // the couple's own questions (only with the add-on); unknown answers are dropped
  const questions = featuresOf(order, inv).includes('extra_rsvp_question') ? rsvpQuestionsOf(inv) : []
  const { answers, missing } = cleanAnswers(questions, body.answers)
  if (missing.length) throw new HttpError(422, 'invalid', `Պատասխանեք՝ «${missing[0]}»։`)
  await store.insertRsvp({
    invitation_id: inv.id, guest_name: name, status, plus, note: str(body.note, 500) || null,
    ...(guest ? { guest_id: guest.id } : {}),
    ...(Object.keys(answers).length ? { answers } : {}),
  })
}

// The couple's RSVP questions on an invitation (supabase/rsvp-questions.sql).
export const rsvpQuestionsOf = (inv) => (Array.isArray(inv?.settings?.rsvpQuestions) ? inv.settings.rsvpQuestions : [])

// The couple saves their questions from the order page (its secret link is
// their key, as for the guests' answers): only on a paid order whose
// invitation has the add-on. 1–3 questions, cleaned (src/site/rsvpQuestions.js).
export async function saveRsvpQuestions(store, body) {
  const order = await loadOrderForCustomer(store, body.id, body.t)
  const inv = await invitationForOrder(store, order)
  if (!inv) throw new HttpError(409, 'not_paid', 'Հարցերը կարելի է ավելացնել վճարումից հետո։')
  if (!featuresOf(order, inv).includes('extra_rsvp_question')) throw new HttpError(403, 'no_addon', 'Այս հրավերը չունի «Լրացուցիչ հարց RSVP-ում» հավելումը։')
  let questions
  try { questions = cleanQuestions(body.questions) } catch (e) { throw new HttpError(422, 'invalid', e.message) }
  await store.updateInvitationSettings(inv.id, { ...(inv.settings || {}), rsvpQuestions: questions })
  return { rsvpQuestions: questions }
}

// Every payment status change goes through here: the SQL state machine
// decides (supabase/payments.sql), and when a payment really became paid
// or refunded just now (not a repeated callback), Siloona gets told.
export async function applyStatus(store, txId, status, patch, source, actor = null) {
  const watch = status === 'paid' || status === 'refunded'
  const before = watch ? await store.getTransaction(txId) : null
  const result = await store.applyStatus(txId, status, patch, source, actor)
  if (before && before.status !== status) {
    const after = await store.getTransaction(txId)
    if (after?.status === status) {
      const order = await store.getOrder(after.order_id)
      if (order) await notify(paymentText(order, after, status))
    }
  }
  return result
}

// ---------------------------------------------------------------------------
// Verifying with the provider
// ---------------------------------------------------------------------------

const OPEN = ['created', 'pending']

// Asks the provider for the real state of one attempt and applies it.
// hint 'fail' = the customer came back through the gateway's fail URL;
// it can turn "not paid yet" into "cancelled", never into "paid".
export async function verifyTransaction(store, tx, { hint = null, source = 'verify', actor = null } = {}) {
  if (tx.provider !== 'arca' || !tx.provider_payment_id) return null
  let r
  try {
    r = await arca.status(tx)
  } catch (e) {
    await store.logEvent({ order_id: tx.order_id, transaction_id: tx.id, source, kind: 'verify_error', payload: { message: String(e.message || e) } })
    return null
  }
  if (r.error) {
    await store.logEvent({ order_id: tx.order_id, transaction_id: tx.id, source, kind: 'verify_error', payload: { code: r.errorCode, message: r.errorMessage } })
    return null
  }

  let status = r.status
  const patch = { card_mask: r.cardMask, raw: r.raw }
  if (status === 'mismatch') {
    await store.logEvent({ order_id: tx.order_id, transaction_id: tx.id, source, kind: 'amount_mismatch_needs_review', payload: r.raw })
    status = 'failed'
    patch.error_code = 'amount_mismatch'
    patch.error_message = 'Վճարված գումարը չի համապատասխանում պատվերին'
  } else if (status === null) {
    if (hint === 'fail') status = 'cancelled'
    else if (tx.status === 'created') status = 'pending'
    else return null // still on the payment page — nothing to change
  }
  if (status === 'failed' || status === 'cancelled') {
    patch.error_code = patch.error_code || r.errorCode
    patch.error_message = patch.error_message || r.errorMessage || (status === 'cancelled' ? 'Վճարումը չեղարկվել է' : 'Վճարումը մերժվել է')
  }
  return applyStatus(store, tx.id, status, patch, source, actor)
}

// Checks every still-open ArCa attempt of an order.
export async function settleOpenAttempts(store, orderId, opts) {
  const txs = await store.listTransactions(orderId)
  for (const tx of txs) {
    if (tx.provider === 'arca' && OPEN.includes(tx.status)) await verifyTransaction(store, tx, opts)
  }
}

// ---------------------------------------------------------------------------
// Starting a payment
// ---------------------------------------------------------------------------

export async function startPayment(store, order, method, req) {
  const provider = getProvider(method)
  if (!provider || !provider.configured()) {
    throw new HttpError(400, 'method_unavailable', 'Վճարման այս եղանակը հասանելի չէ։')
  }
  if (order.amount == null) throw new HttpError(409, 'order_has_no_amount', 'Այս պատվերի գինը դեռ ճշտվում է։')

  // Before opening a new attempt, make sure an earlier one didn't already
  // go through — otherwise a customer who comes back could pay twice.
  await settleOpenAttempts(store, order.id, { source: 'verify' })
  const fresh = await store.getOrder(order.id)
  if (fresh.payment_status === 'paid') return { alreadyPaid: true }

  const tx = await store.createAttempt(order.id, method)
  const description = `Siloona order ${fresh.order_number}`

  if (method === 'arca') {
    const back = `${siteUrl(req)}/api/payments/arca/return?tx=${tx.id}`
    let reg
    try {
      reg = await arca.register({ merchantRef: tx.merchant_ref, amount: tx.amount, description, returnUrl: back, failUrl: `${back}&r=fail` })
    } catch (e) {
      reg = { ok: false, errorCode: 'network', errorMessage: String(e.message || e) }
    }
    if (!reg.ok) {
      await applyStatus(store, tx.id, 'failed', { error_code: reg.errorCode, error_message: reg.errorMessage }, 'init')
      throw new HttpError(502, 'gateway_error', 'Չհաջողվեց կապ հաստատել բանկի հետ։ Խնդրում ենք փորձել մի քանի րոպեից։')
    }
    await store.updateTransaction(tx.id, { provider_payment_id: reg.providerPaymentId, redirect_url: reg.redirectUrl })
    await applyStatus(store, tx.id, 'pending', {}, 'init')
    return { redirectUrl: reg.redirectUrl }
  }

  if (method === 'test') {
    // Simulator: our own "hosted page" stands in for the bank's. The link
    // carries the order's secret so only this customer can complete it.
    await store.updateTransaction(tx.id, {
      provider_payment_id: `SIM-${tx.merchant_ref}`,
      redirect_url: `/checkout/simulate?tx=${tx.id}&k=${fresh.access_token}`,
    })
    await applyStatus(store, tx.id, 'pending', {}, 'init')
    return { redirectUrl: `/checkout/simulate?tx=${tx.id}&k=${fresh.access_token}` }
  }

  // idram
  const form = idram.buildForm({ merchantRef: tx.merchant_ref, amount: tx.amount, description, email: fresh.customer_email })
  await store.updateTransaction(tx.id, { redirect_url: form.action })
  return { form }
}

// ---------------------------------------------------------------------------
// Idram RESULT_URL (server-to-server). Returns the plain-text reply Idram
// expects: "OK" accepts, anything else refuses.
// ---------------------------------------------------------------------------

export async function handleIdramResult(store, p) {
  if (!idram.configured()) return 'Not configured'
  const tx = await store.findTransaction('idram', String(p.EDP_BILL_NO || ''))
  if (!tx) return 'Unknown bill'
  const log = (kind, payload = {}) => store.logEvent({ order_id: tx.order_id, transaction_id: tx.id, source: p.EDP_PRECHECK === 'YES' ? 'precheck' : 'callback', kind, payload })

  if (String(p.EDP_REC_ACCOUNT || '') !== String(idram.account())) { await log('account_mismatch'); return 'Wrong account' }
  if (!idram.amountMatches(p, tx)) { await log('amount_mismatch', { amount: p.EDP_AMOUNT }); return 'Wrong amount' }

  if (p.EDP_PRECHECK === 'YES') {
    const order = await store.getOrder(tx.order_id)
    if (order.payment_status === 'paid' || order.order_status === 'cancelled' || !OPEN.includes(tx.status)) {
      await log('precheck_rejected', { order_payment_status: order.payment_status, tx_status: tx.status })
      return 'Order cannot be paid'
    }
    if (tx.status === 'created') await applyStatus(store, tx.id, 'pending', {}, 'precheck')
    else await log('precheck_repeat')
    return 'OK'
  }

  if (!idram.checksumValid(p)) { await log('bad_checksum'); return 'Invalid checksum' }
  try {
    await applyStatus(store, tx.id, 'paid', {
      provider_payment_id: String(p.EDP_TRANS_ID || ''),
      raw: { EDP_TRANS_ID: p.EDP_TRANS_ID, EDP_TRANS_DATE: p.EDP_TRANS_DATE, EDP_AMOUNT: p.EDP_AMOUNT, EDP_PAYER_ACCOUNT: p.EDP_PAYER_ACCOUNT },
    }, 'callback')
  } catch (e) {
    // The unique index refuses an Idram transaction already booked on another bill.
    if (/provider_ref_uidx|duplicate key/.test(String(e.message))) { await log('transaction_reused', { trans_id: p.EDP_TRANS_ID }); return 'Duplicate transaction' }
    throw e
  }
  return 'OK'
}

// ---------------------------------------------------------------------------
// Admin actions (dashboard). Every one is logged with the admin's id.
// ---------------------------------------------------------------------------

const ORDER_STATUSES = ['new', 'in_progress', 'delivered', 'cancelled']
const MANUAL_METHODS = ['bank_transfer', 'cash', 'other']

export async function adminAction(store, order, body, actor) {
  const log = (kind, payload = {}, txId = null) => store.logEvent({ order_id: order.id, transaction_id: txId, source: 'admin', kind, payload, actor })
  const txs = await store.listTransactions(order.id)
  const findTx = () => {
    const tx = txs.find((t) => t.id === body.txId)
    if (!tx) throw new HttpError(404, 'tx_not_found', 'Գործարքը չի գտնվել։')
    return tx
  }

  switch (body.action) {
    case 'verify': {
      for (const tx of txs) {
        if (tx.provider === 'arca' && tx.provider_payment_id && tx.status !== 'refunded') {
          await verifyTransaction(store, tx, { source: 'admin', actor })
        }
      }
      await log('verified')
      return
    }

    case 'refund': {
      const tx = findTx()
      if (tx.status !== 'paid') throw new HttpError(409, 'not_paid', 'Վերադարձել կարելի է միայն վճարված գործարքը։')
      if (tx.provider === 'arca') {
        const r = await arca.refund(tx)
        if (!r.ok) {
          await log('refund_failed', { code: r.errorCode, message: r.errorMessage }, tx.id)
          throw new HttpError(502, 'refund_failed', `Բանկը մերժեց վերադարձը${r.errorMessage ? `․ ${r.errorMessage}` : ''}`)
        }
        await applyStatus(store, tx.id, 'refunded', {}, 'admin', actor)
        return
      }
      if (tx.provider === 'test') {
        await applyStatus(store, tx.id, 'refunded', { note: 'Թեստային վերադարձ (սիմուլյացիա)' }, 'admin', actor)
        return
      }
      if (tx.provider === 'manual') {
        // Money was handed over outside the system; recording it needs a note.
        const note = str(body.note, 500)
        if (note.length < 3) throw new HttpError(422, 'note_required', 'Նշեք, թե ինչպես է կատարվել վերադարձը։')
        await applyStatus(store, tx.id, 'refunded', { note }, 'admin', actor)
        return
      }
      throw new HttpError(400, 'refund_unsupported', 'Idram-ի վճարումները վերադարձվում են Idram-ի վաճառողի անձնական էջից։')
    }

    case 'manual_payment': {
      // The one authorised way to book money that arrived outside the online
      // checkout (bank transfer, cash). Needs a reference and is tied to the
      // admin who recorded it; the amount is always the order's amount.
      const method = str(body.method, 20)
      const reference = str(body.reference, 120)
      const note = str(body.note, 500)
      if (!MANUAL_METHODS.includes(method)) throw new HttpError(422, 'invalid', 'Ընտրեք վճարման եղանակը։')
      if (reference.length < 3) throw new HttpError(422, 'invalid', 'Նշեք վճարման հղման համարը (փոխանցման համար, անդորրագիր և այլն)։')
      if (order.payment_status === 'paid') throw new HttpError(409, 'order_already_paid', 'Այս պատվերն արդեն վճարված է։')
      await settleOpenAttempts(store, order.id, { source: 'admin', actor })
      if ((await store.getOrder(order.id)).payment_status === 'paid') throw new HttpError(409, 'order_already_paid', 'Պատվերն արդեն վճարվել է առցանց։')
      const tx = await store.createAttempt(order.id, 'manual')
      await store.updateTransaction(tx.id, { provider_payment_id: `${method}:${reference}`, note: note || null, recorded_by: actor })
      await applyStatus(store, tx.id, 'paid', { provider_payment_id: `${method}:${reference}` }, 'admin', actor)
      return
    }

    case 'update_details': {
      // What the shareable invitation shows; contact details stay as ordered.
      const fields = {}
      // The customer's design edits aren't part of this form — keep them.
      const customization = validateCustomization({
        ...body.customization,
        details: body.customization?.details ?? order.customization?.details,
        content: order.customization?.content,
      }, fields)
      if (Object.keys(fields).length) throw new HttpError(422, 'invalid', Object.values(fields)[0], fields)
      await store.updateOrder(order.id, { customization })
      await log('details_updated', { from: order.customization, to: customization })
      return
    }

    case 'set_status': {
      const status = str(body.status, 20)
      if (!ORDER_STATUSES.includes(status)) throw new HttpError(422, 'invalid', 'Անհայտ կարգավիճակ։')
      await store.updateOrder(order.id, { order_status: status })
      await log('order_status', { from: order.order_status, to: status })
      return
    }

    case 'set_amount': {
      // Only for designs whose catalog price isn't set yet (order requests).
      if (pricesFor(order.design_id)[order.design_option] != null) {
        throw new HttpError(409, 'catalog_priced', 'Այս դիզայնի գինը սահմանված է կատալոգում (prices.js)։')
      }
      if (['paid', 'pending', 'refunded'].includes(order.payment_status)) throw new HttpError(409, 'locked', 'Գինը հնարավոր չէ փոխել այս փուլում։')
      const amount = Number(body.amount)
      if (!Number.isInteger(amount) || amount < 100 || amount > 10_000_000) throw new HttpError(422, 'invalid', 'Նշեք գինը ամբողջ դրամով։')
      await store.updateOrder(order.id, { amount })
      await log('amount_set', { from: order.amount, to: amount })
      return
    }

    default:
      throw new HttpError(400, 'unknown_action', 'Անհայտ գործողություն։')
  }
}
