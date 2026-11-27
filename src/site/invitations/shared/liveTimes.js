// «Կենդանի ծրագիր + տաքսի» (the `live_schedule` add-on) — plain functions,
// no React: which part of the day is on now, which is next, and the links
// to get there. Used by useLiveSchedule (LiveSchedule.jsx) and the tests.
//
// Time is always Yerevan time (UTC+4 all year), whatever the guest's phone
// says. The schedule is live only on the event's day; before and after it
// shows as usual.

export const YEREVAN_OFFSET_H = 4
// A last part with no end time lasts this long.
export const LAST_PART_HOURS = 3

const TIME = /^(\d{1,2})[:.](\d{2})/
const DATE = /^(\d{4})-(\d{2})-(\d{2})/

// ms of a Yerevan wall-clock date + time
export function yerevanMs(date, time) {
  const d = DATE.exec(date || '')
  const t = TIME.exec(String(time || '').trim())
  if (!d || !t) return null
  return Date.UTC(+d[1], +d[2] - 1, +d[3], +t[1] - YEREVAN_OFFSET_H, +t[2])
}

// 'YYYY-MM-DD' of an instant, in Yerevan
export function yerevanDay(ms) {
  return new Date(ms + YEREVAN_OFFSET_H * 36e5).toISOString().slice(0, 10)
}

// Coordinates written into a place — its own `coords` ("40.1772, 44.5035"),
// or an address that is coordinates or a Google / Apple / Yandex maps link
// with them in it. null when there are none.
export function coordsOf(...values) {
  for (const v of values) {
    if (!v) continue
    if (typeof v === 'object' && Number.isFinite(+v.lat) && Number.isFinite(+(v.lng ?? v.lon))) return { lat: +v.lat, lng: +(v.lng ?? v.lon) }
    const s = String(v)
    const m = /@(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/.exec(s) || // google …/@40.17,44.51,17z
      /[?&](?:q|ll|daddr|destination|query)=(-?\d{1,2}\.\d+)(?:,|%2C)\s*(-?\d{1,3}\.\d+)/i.exec(s) ||
      /^\s*(-?\d{1,2}\.\d{3,})\s*[,;]\s*(-?\d{1,3}\.\d{3,})\s*$/.exec(s)
    if (m) {
      const lat = +m[1]; const lng = +m[2]
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng }
    }
    // Yandex: …?ll=44.51,40.17 (longitude first)
    const y = /yandex\.[a-z]+\/maps.*[?&](?:pt|ll)=(-?\d{1,3}\.\d+)(?:,|%2C)(-?\d{1,2}\.\d+)/i.exec(s)
    if (y) return { lat: +y[2], lng: +y[1] }
  }
  return null
}

const isLink = (s) => /^https?:\/\//i.test(String(s || '').trim())

// The day's parts with their places. A schedule row may carry its own
// place (`place`/`name`, `address`, `coords`, `end`); otherwise it takes
// the place whose time is the row's time, else — an event in one venue —
// that venue.
export function scheduleParts(data = {}) {
  const rows = Array.isArray(data.schedule) ? data.schedule : []
  const places = Array.isArray(data.places) ? data.places : data.venue ? [data.venue] : []
  const date = (DATE.exec(data.eventDate || '') || [])[0]
  const parts = rows.map((r, i) => {
    const byTime = places.find((p) => p?.time && TIME.exec(p.time)?.[0] === TIME.exec(r?.time || '')?.[0])
    const one = places.length === 1 ? places[0] : null
    const p = r?.address || r?.place || r?.coords ? { name: r.place || r.name, address: r.address, coords: r.coords } : byTime || one || null
    return {
      i,
      start: yerevanMs(date, r?.time),
      end: r?.end ? yerevanMs(date, r.end) : null,
      place: p ? { name: p.name || '', address: isLink(p.address) ? '' : p.address || '', link: isLink(p.address) ? p.address : '', coords: coordsOf(p.coords, p.address, p.map) } : null,
    }
  })
  const timed = parts.filter((p) => p.start != null).sort((a, b) => a.start - b.start)
  timed.forEach((p, k) => {
    if (p.end == null || p.end <= p.start) p.end = timed[k + 1]?.start ?? p.start + LAST_PART_HOURS * 36e5
  })
  return { date, parts, timed }
}

// What each row is at `now`: { active, day, now: i|null, next: i|null,
// past: Set<i> }. `active` only on the event's day (Yerevan).
export function liveState(data, now = Date.now()) {
  const { date, timed } = scheduleParts(data)
  const off = { active: false, now: null, next: null, past: new Set() }
  if (!date || !timed.length || yerevanDay(now) !== date) return off
  const past = new Set(timed.filter((p) => p.end <= now).map((p) => p.i))
  const cur = timed.find((p) => p.start <= now && now < p.end)
  const nxt = timed.find((p) => p.start > now)
  return { active: true, now: cur ? cur.i : null, next: nxt ? nxt.i : null, past }
}

const q = (s) => encodeURIComponent(s || '')

// «Ճանապարհ»: directions to the place — Apple Maps on iPhone / iPad,
// Google Maps elsewhere (it opens the app when there is one).
export function directionsUrl(place, apple = false) {
  if (!place) return null
  const c = place.coords
  const text = [place.name, place.address].filter(Boolean).join(', ')
  if (!c && !text) return place.link || null
  if (apple) return c ? `https://maps.apple.com/?daddr=${c.lat},${c.lng}&q=${q(place.name)}` : `https://maps.apple.com/?daddr=${q(text)}`
  return `https://www.google.com/maps/dir/?api=1&destination=${c ? `${c.lat},${c.lng}` : q(text)}`
}

// «Տաքսի»: Yandex Go with the destination filled in. The link format is
// Yandex's own (yandex.com/support/taxi-distr/en/api/deeplinks): app code 3
// is Yandex Go; it opens the app when installed, and with tracking id
// 25395763362139037 a phone without the app gets Yandex Go's website
// instead. The destination needs coordinates; without them the link opens
// Yandex Go with no destination set.
export const YANDEX_GO_WEB = '25395763362139037'
export function taxiUrl(place, lang = 'hy') {
  const p = new URLSearchParams()
  if (place?.coords) {
    p.set('end-lat', String(place.coords.lat))
    p.set('end-lon', String(place.coords.lng))
  }
  p.set('ref', 'siloona')
  p.set('appmetrica_tracking_id', YANDEX_GO_WEB)
  p.set('lang', ['hy', 'ru', 'en'].includes(lang) ? lang : 'hy')
  return `https://3.redirect.appmetrica.yandex.com/route?${p}`
}
