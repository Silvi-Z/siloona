// «Ավելացնել օրացույցում» — the event as a calendar entry. Plain functions
// with no React: the invitation's button (AddToCalendar.jsx) builds the
// Google Calendar link with them, and the server (/api/invitations?ics=1)
// writes the .ics file Apple Calendar and the others open.
//
// Times are Yerevan time (Asia/Yerevan, UTC+4 all year since 2012) whatever
// the guest's phone is set to. With no end time the event lasts 5 hours.

export const YEREVAN_OFFSET_H = 4
export const DEFAULT_HOURS = 5
export const CAL_LANGS = ['hy', 'ru', 'en']

const pad = (n) => String(n).padStart(2, '0')
const DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^\d{2}:\d{2}$/

// Armenian genitive, as invitationPrefill.js forms it: «Միքայելի», «Աննայի».
const genitive = (n) => n && (n.endsWith('ա') ? `${n}յի` : `${n}ի`)

// What the event is, from the design's id: wd- wedding, bd- birthday, …
export function eventKind(slug = '') {
  const p = String(slug).split('-')[0]
  return { wd: 'wedding', bd: 'birthday', bp: 'baptism', gp: 'genderReveal' }[p] || 'celebration'
}

const TITLES = {
  hy: {
    wedding: ({ p1, p2 }) => (p1 && p2 ? `${p1} և ${genitive(p2)} հարսանիք` : 'Հարսանիք'),
    birthday: ({ one }) => (one ? `${genitive(one)} ծննդյան տոն` : 'Ծննդյան տոն'),
    baptism: ({ child }) => (child ? `${genitive(child)} մկրտություն` : 'Մկրտություն'),
    genderReveal: () => 'Սեռի բացահայտում',
    celebration: ({ company, title }) => title || company || 'Տոնական երեկո',
    newYear: ({ company }) => (company ? `Ամանորյա երեկույթ · ${company}` : 'Ամանորյա երեկույթ'),
  },
  ru: {
    wedding: ({ p1, p2 }) => (p1 && p2 ? `Свадьба: ${p1} и ${p2}` : 'Свадьба'),
    birthday: ({ one }) => (one ? `День рождения: ${one}` : 'День рождения'),
    baptism: ({ child }) => (child ? `Крестины: ${child}` : 'Крестины'),
    genderReveal: () => 'Гендер-пати',
    celebration: ({ company, title }) => title || company || 'Праздничный вечер',
    newYear: ({ company }) => (company ? `Новогодняя вечеринка · ${company}` : 'Новогодняя вечеринка'),
  },
  en: {
    wedding: ({ p1, p2 }) => (p1 && p2 ? `${p1} & ${p2}’s wedding` : 'Wedding'),
    birthday: ({ one }) => (one ? `${one}’s birthday` : 'Birthday'),
    baptism: ({ child }) => (child ? `${child}’s christening` : 'Christening'),
    genderReveal: () => 'Gender reveal',
    celebration: ({ company, title }) => title || company || 'Celebration',
    newYear: ({ company }) => (company ? `New Year party · ${company}` : 'New Year party'),
  },
}

export const calLang = (lang) => (CAL_LANGS.includes(lang) ? lang : 'hy')

export function eventTitle(kind, names = {}, lang = 'hy') {
  const clean = Object.fromEntries(Object.entries(names).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : '']))
  const t = TITLES[calLang(lang)]
  return (t[kind] || t.celebration)(clean)
}

const WORDS = {
  hy: { invitation: 'Հրավերը՝ ', tomorrow: 'Վաղը՝ ' },
  ru: { invitation: 'Приглашение: ', tomorrow: 'Завтра: ' },
  en: { invitation: 'Invitation: ', tomorrow: 'Tomorrow: ' },
}

// { date 'YYYY-MM-DD', time 'HH:MM', endTime?, title, location, url, lang }
// → start/end as Yerevan wall-clock parts and as UTC instants.
export function eventTimes(ev) {
  if (!DATE.test(ev?.date || '')) return null
  const time = TIME.test(ev.time || '') ? ev.time : '12:00'
  const [y, m, d] = ev.date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const start = Date.UTC(y, m - 1, d, hh - YEREVAN_OFFSET_H, mm)
  let end = start + DEFAULT_HOURS * 36e5
  if (TIME.test(ev.endTime || '')) {
    const [eh, em] = ev.endTime.split(':').map(Number)
    let e = Date.UTC(y, m - 1, d, eh - YEREVAN_OFFSET_H, em)
    if (e <= start) e += 24 * 36e5 // ends after midnight
    end = e
  }
  return { start, end }
}

// 20270612T160000 in Yerevan time (Google's `ctz` reads it as such).
function wall(ms) {
  const x = new Date(ms + YEREVAN_OFFSET_H * 36e5)
  return `${x.getUTCFullYear()}${pad(x.getUTCMonth() + 1)}${pad(x.getUTCDate())}T${pad(x.getUTCHours())}${pad(x.getUTCMinutes())}00`
}
// 20270612T120000Z
function utc(ms) {
  const x = new Date(ms)
  return `${x.getUTCFullYear()}${pad(x.getUTCMonth() + 1)}${pad(x.getUTCDate())}T${pad(x.getUTCHours())}${pad(x.getUTCMinutes())}${pad(x.getUTCSeconds())}Z`
}

const description = (ev) => (ev.url ? `${WORDS[calLang(ev.lang)].invitation}${ev.url}` : '')

// Google Calendar's "add event" page, filled in. (A reminder can't be set
// through the link: Google uses the guest's own default reminder.)
export function googleCalendarUrl(ev) {
  const t = eventTimes(ev)
  if (!t) return null
  const q = new URLSearchParams({ action: 'TEMPLATE', text: ev.title || '', dates: `${wall(t.start)}/${wall(t.end)}`, ctz: 'Asia/Yerevan' })
  if (ev.location) q.set('location', ev.location)
  const d = description(ev)
  if (d) q.set('details', d)
  return `https://calendar.google.com/calendar/render?${q}`
}

// Where the .ics file comes from (api/invitations/index.js): the same
// fields as query parameters.
export function icsUrl(ev) {
  const q = new URLSearchParams({ ics: '1', t: ev.title || '', d: ev.date || '', h: ev.time || '', lang: calLang(ev.lang) })
  if (ev.endTime) q.set('e', ev.endTime)
  if (ev.location) q.set('l', ev.location)
  if (ev.url) q.set('u', ev.url)
  return `/api/invitations?${q}`
}

// RFC 5545 text: escape \ ; , and new lines.
const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

const utf8 = new TextEncoder()
// A short stable id from text (for the event's UID).
function hash(s) {
  let h = 2166136261
  for (const b of utf8.encode(s)) { h ^= b; h = Math.imul(h, 16777619) >>> 0 }
  return h.toString(16)
}

// Lines are folded at 75 bytes (UTF-8), never inside a character.
function fold(line) {
  const out = []
  let cur = ''
  let bytes = 0
  for (const ch of line) {
    const b = utf8.encode(ch).length
    if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0 }
    cur += ch
    bytes += b
  }
  out.push(cur)
  return out.join('\r\n ')
}

// The whole .ics file. `uid` keeps re-adding the same invitation from
// making a second event; `now` is the file's timestamp.
export function icsText(ev, { uid, now = Date.now() } = {}) {
  const t = eventTimes(ev)
  if (!t) return null
  const w = WORDS[calLang(ev.lang)]
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Siloona//Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid || `${t.start}-${hash(`${ev.title}|${ev.url || ''}`)}`}@siloona.am`,
    `DTSTAMP:${utc(now)}`,
    `DTSTART:${utc(t.start)}`,
    `DTEND:${utc(t.end)}`,
    `SUMMARY:${esc(ev.title)}`,
    ...(ev.location ? [`LOCATION:${esc(ev.location)}`] : []),
    ...(description(ev) ? [`DESCRIPTION:${esc(description(ev))}`] : []),
    ...(ev.url ? [`URL:${ev.url}`] : []),
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(`${w.tomorrow}${ev.title || ''}`)}`,
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return `${lines.map(fold).join('\r\n')}\r\n`
}
