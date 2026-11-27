import { HttpError } from './http.js'
import { featuresOf, invitationForOrder, invitationGuest, loadInvitation, loadOrderForCustomer } from './orders.js'
import { cleanText } from '../../src/site/rsvpQuestions.js'

// «Մաղթանքների գիրք» (the wishes add-on, supabase/wishes.sql). Guests
// leave a wish on the invitation; only the couple reads them, on their own
// page, with the order's secret link. Nothing here ever gives one guest's
// wish to another.

export const MAX_WISH = 500
export const MAX_WISH_NAME = 80
const DAY = 24 * 3600 * 1000

const event = (order) => {
  const d = /^(\d{4}-\d{2}-\d{2})/.exec(order?.customization?.eventDate || order?.customization?.details?.eventDate || '')
  return d ? Date.parse(`${d[1]}T23:59:59+04:00`) : null
}

// Still taking wishes? With wishesCloseDays set, until that many days
// after the event's day (Yerevan); otherwise always.
export function wishesOpen(order, inv, now = Date.now()) {
  const days = inv?.settings?.wishesCloseDays
  if (!Number.isInteger(days) || days < 0) return true
  const at = event(order)
  return at == null || now <= at + days * DAY
}

// What the invitation page gets: whether the book is there and open.
export function wishesView(order, inv) {
  if (!featuresOf(order, inv).includes('wishes')) return null
  return { open: wishesOpen(order, inv) }
}

// A guest's wish. Plain text (no HTML), bounded, a honeypot for bots; the
// endpoint is rate-limited per address (guestLinks.js LIMITS.wish).
export async function submitWish(store, body) {
  if (cleanText(body.website, 200)) throw new HttpError(400, 'rejected', 'Հարցումը մերժվեց։')
  const { inv, order } = await loadInvitation(store, String(body.code || ''))
  if (!featuresOf(order, inv).includes('wishes')) throw new HttpError(404, 'wishes_off', 'Այս հրավերում մաղթանքների գիրք չկա։')
  if (!wishesOpen(order, inv)) throw new HttpError(409, 'wishes_closed', 'Մաղթանքների ընդունումն ավարտվել է։')
  const name = cleanText(body.name, MAX_WISH_NAME)
  const raw = String(body.text ?? '')
  // the text keeps its line breaks, nothing else
  const text = raw.replace(/<[^>]*>/g, '').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  const fields = {}
  if (name.length < 2) fields.name = 'Գրեք Ձեր անունը։'
  if (text.length < 2) fields.text = 'Գրեք Ձեր մաղթանքը։'
  if (text.length > MAX_WISH) fields.text = `Մաղթանքը պետք է լինի մինչև ${MAX_WISH} նիշ։`
  if (Object.keys(fields).length) throw new HttpError(422, 'invalid', Object.values(fields)[0], fields)
  const guest = await invitationGuest(store, inv, order, cleanText(body.t, 40))
  await store.insertWish({ invitation_id: inv.id, guest_name: name, body: text, ...(guest ? { guest_id: guest.id } : {}) })
}

// ---------------------------------------------------------------------------
// The couple's page (POST /api/orders/status, actions below)
// ---------------------------------------------------------------------------

async function coupleBook(store, body) {
  const order = await loadOrderForCustomer(store, body.id, body.t)
  const inv = await invitationForOrder(store, order)
  if (!inv || !featuresOf(order, inv).includes('wishes')) throw new HttpError(404, 'wishes_off', 'Այս պատվերում մաղթանքների գիրք չկա։')
  return { order, inv }
}

const view = (w) => ({ id: w.id, name: w.guest_name, text: w.body, hidden: !!w.hidden, at: w.created_at })

//   { action: 'wishes', id, t }                      the book
//   { action: 'wish_hide', id, t, wishId, hidden }   hide / show one
//   { action: 'wishes_close', id, t, days }          close N days after (null = never)
export async function coupleWishes(store, body) {
  const { order, inv } = await coupleBook(store, body)
  if (body.action === 'wish_hide') {
    const wishId = Number(body.wishId)
    if (!Number.isInteger(wishId)) throw new HttpError(422, 'invalid', 'Սխալ հարցում։')
    const done = await store.hideWish(inv.id, wishId, body.hidden !== false)
    if (!done) throw new HttpError(404, 'not_found', 'Մաղթանքը չի գտնվել։')
  } else if (body.action === 'wishes_close') {
    const days = body.days == null || body.days === '' ? null : Number(body.days)
    if (days != null && (!Number.isInteger(days) || days < 0 || days > 365)) throw new HttpError(422, 'invalid', 'Նշեք օրերի քանակը (0–365)։')
    inv.settings = { ...(inv.settings || {}), wishesCloseDays: days }
    await store.updateInvitationSettings(inv.id, inv.settings)
  }
  const wishes = await store.listWishes(inv.id)
  const { names, eventDate } = order.customization || {}
  return {
    names: names || '',
    eventDate: eventDate || '',
    designId: order.design_id,
    open: wishesOpen(order, inv),
    closeDays: Number.isInteger(inv.settings?.wishesCloseDays) ? inv.settings.wishesCloseDays : null,
    wishes: wishes.map(view),
  }
}

// For the thank-you page (Prompt 9): how many visible wishes there are.
export async function wishesCount(store, inv) {
  if (!store.listWishes) return 0
  return (await store.listWishes(inv.id)).filter((w) => !w.hidden).length
}
