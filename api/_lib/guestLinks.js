import { createHash } from 'node:crypto'
import { HttpError } from './http.js'

// Guests' links to a dashboard event's invitation:
//   siloona.am/i/<event slug>             the general link
//   siloona.am/i/<event slug>/<token>     one guest's own link
// The page asks GET /api/invitations?code=<slug>&t=<token>; the answer is
// only what the invitation shows — never the guest list, phones or notes.
// A guest's RSVP (and each open) is stored as its own row in
// event_replies; the owner's dashboard folds those into its guest list.

const SLUG = /^[A-Za-z0-9_-]{1,80}$/
const TOKEN = /^[A-Za-z0-9]{10,40}$/
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o?.[k] !== undefined).map((k) => [k, o[k]]))

const notFound = () => new HttpError(404, 'not_found', 'Հրավերը չի գտնվել։ Ստուգեք հղումը։')

// ---------------------------------------------------------------------------
// Rate limiting (supabase/guest-links.sql → hit_rate_limit)
// ---------------------------------------------------------------------------

// The caller's address, hashed — only used as a rate-limit key.
export function clientKey(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  const ip = fwd || String(req.headers['x-real-ip'] || '') || req.socket?.remoteAddress || 'unknown'
  return createHash('sha256').update(ip).digest('hex').slice(0, 20)
}

export const LIMITS = {
  order: [3600, 12], // orders + custom-design requests, per hour
  upload: [3600, 40], // photos, per hour
  rsvp: [600, 20], // RSVP answers, per 10 minutes
  open: [600, 120], // invitation page loads, per 10 minutes
}

// RATE_LIMITS=off turns it off (the local test suite and demo, which make
// many requests from one address). Never set it on the live site.
export async function rateLimit(store, req, scope) {
  if (!store.rateLimit || process.env.RATE_LIMITS === 'off') return
  const [windowSeconds, max] = LIMITS[scope]
  const ok = await store.rateLimit(`${scope}:${clientKey(req)}`, windowSeconds, max)
  if (!ok) throw new HttpError(429, 'rate_limited', 'Չափազանց շատ հարցումներ։ Խնդրում ենք փորձել մի քանի րոպեից։')
}

// ---------------------------------------------------------------------------
// The public invitation of a dashboard event
// ---------------------------------------------------------------------------

async function loadPublished(store, slug) {
  if (!SLUG.test(slug || '')) throw notFound()
  const row = await store.getEventBySlug(slug)
  if (!row) throw notFound()
  if (row.data?.inv?.status !== 'published') {
    throw new HttpError(410, 'not_published', 'Հրավերը դեռ հրապարակված չէ կամ այլևս հասանելի չէ։')
  }
  return row
}

function findGuest(row, token) {
  if (!token) return null
  if (!TOKEN.test(token)) throw notFound()
  const g = (row.data.guests || []).find((x) => x.inviteToken === token)
  if (!g) throw notFound()
  return g
}

const person = (p) => (p && typeof p === 'object' ? pick(p, ['first', 'last', 'age']) : undefined)

export async function publicEventInvitation(store, slug, token) {
  const row = await loadPublished(store, slug)
  const d = row.data
  const inv = d.inv || {}
  const guest = findGuest(row, token)
  // Counted for the dashboard («բացել է»); never blocks the page.
  try { await store.insertReply({ event_id: row.id, guest_token: guest ? token : null, kind: 'open' }) } catch (e) { console.error('[invitations] open not logged:', e.message) }
  return {
    kind: 'event',
    designId: inv.design || null,
    // the user's edits per design (keyed by the design's page slug)
    designContent: inv.designContent || {},
    event: {
      type: row.type || null,
      title: row.title || '',
      date: row.event_date || d.date || null,
      time: d.time || '',
      person1: person(d.person1), person2: person(d.person2),
      celebrant: person(d.celebrant), child: person(d.child),
      parents: d.parents ? pick(d.parents, ['father', 'mother']) : undefined,
      company: typeof d.company === 'string' ? d.company : undefined,
      locations: (d.locations || []).map((l) => pick(l, ['id', 'kind', 'name', 'address', 'time'])),
      schedule: (d.schedule || []).map((x) => pick(x, ['id', 'time', 'title'])),
      info: pick(d.info || {}, ['maxPlus']),
      inv: pick(inv, ['deadline', 'personalize', 'greeting', 'message', 'rsvp']),
    },
    guest: guest ? { first: guest.first || '', last: guest.last || '', companions: guest.companions || 0 } : null,
  }
}

export async function submitEventRsvp(store, body) {
  const row = await loadPublished(store, str(body.slug, 80))
  if (row.data.inv?.rsvp === false) throw new HttpError(409, 'rsvp_closed', 'Այս հրավերով պատասխաններ չեն ընդունվում։')
  const token = str(body.t, 40)
  const guest = findGuest(row, token || null)
  const name = guest ? `${guest.first || ''} ${guest.last || ''}`.trim() : str(body.name, 120)
  const fields = {}
  if (name.length < 2) fields.name = 'Նշեք Ձեր անունը։'
  const status = body.status === 'confirmed' || body.status === 'declined' ? body.status : null
  if (!status) fields.status = 'Ընտրեք պատասխանը։'
  if (Object.keys(fields).length) throw new HttpError(422, 'invalid', Object.values(fields)[0], fields)
  const maxPlus = Math.min(20, Math.max(0, Number(row.data.info?.maxPlus ?? 2) || 0))
  const plus = status === 'confirmed' ? Math.min(maxPlus, Math.max(0, Math.floor(Number(body.plus) || 0))) : 0
  await store.insertReply({
    event_id: row.id, guest_token: guest ? token : null, kind: 'rsvp',
    guest_name: name, status, plus, note: str(body.note, 500) || null,
  })
}
