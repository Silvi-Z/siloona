import { HttpError } from './http.js'
import { featuresOf, invitationForOrder, loadOrderForCustomer } from './orders.js'
import { wishesCount } from './wishes.js'

// «Շնորհակալական էջ» (the thank_you_page add-on). After the moment the
// couple chooses, the same invitation link opens their thank-you note and
// photos (src/site/invitations/shared/ThankYou.jsx); the invitation is one
// tap away. Kept in invitations.settings.thankYou = { from, text, photos }.

export const MAX_THANKS = 2000
export const MAX_PHOTOS = 10
const FROM = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/ // Yerevan wall-clock time

// Photos: only addresses our own upload endpoint gave back (Supabase
// Storage's public bucket, or the local demo's /api/uploads).
const ownPhoto = (u) => typeof u === 'string' && u.length <= 500 &&
  (/^\/api\/uploads\?id=[a-z0-9]+$/i.test(u) || /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/invitation-photos\/[\w./-]+\.(jpg|png|webp)$/i.test(u))

export function cleanThankYou(body = {}) {
  const from = typeof body.from === 'string' && FROM.test(body.from) ? body.from : ''
  const text = String(body.text ?? '').replace(/<[^>]*>/g, '').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, MAX_THANKS)
  const photos = [...new Set((Array.isArray(body.photos) ? body.photos : []).filter(ownPhoto))]
  if (photos.length > MAX_PHOTOS) throw new HttpError(422, 'invalid', `Առավելագույնը ${MAX_PHOTOS} լուսանկար։`)
  if (text && !from) throw new HttpError(422, 'invalid', 'Նշեք, երբից բացվի շնորհակալական էջը։')
  return { from, text, photos }
}

const settingsOf = (inv) => inv?.settings?.thankYou || null

// What the invitation page gets — only with the add-on and a written note
// (with no note yet the invitation stays as it is, even after the date).
export async function thankYouView(store, order, inv) {
  const features = featuresOf(order, inv)
  const ty = settingsOf(inv)
  if (!features.includes('thank_you_page') || !ty?.text || !ty.from) return null
  return {
    from: ty.from,
    text: ty.text,
    photos: ty.photos || [],
    // how many wishes, never what they say
    ...(features.includes('wishes') ? { wishes: await wishesCount(store, inv) } : {}),
  }
}

// The couple saves it from the order page (POST /api/orders/status,
// { action: 'thank_you', id, t, from, text, photos }).
export async function saveThankYou(store, body) {
  const order = await loadOrderForCustomer(store, body.id, body.t)
  const inv = await invitationForOrder(store, order)
  if (!inv) throw new HttpError(409, 'not_paid', 'Շնորհակալական էջը կարելի է պատրաստել վճարումից հետո։')
  if (!featuresOf(order, inv).includes('thank_you_page')) throw new HttpError(403, 'no_addon', 'Այս հրավերը չունի «Շնորհակալական էջ» հավելումը։')
  const thankYou = cleanThankYou(body)
  await store.updateInvitationSettings(inv.id, { ...(inv.settings || {}), thankYou })
  return { thankYou }
}

// For the order page: what is set, when the add-on is there.
export function thankYouSettings(order, inv) {
  if (!inv || !featuresOf(order, inv).includes('thank_you_page')) return null
  const ty = settingsOf(inv) || {}
  return { from: ty.from || '', text: ty.text || '', photos: ty.photos || [] }
}

