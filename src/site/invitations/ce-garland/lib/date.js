// Short month capitals for the «ԴԵԿ | 24 | 19:00» row (written in
// capitals here, not via CSS text-transform, which turns «և» into «ԵՒ»).
const MONTHS_SHORT = ['ՀՆՎ', 'ՓՏՎ', 'ՄՐՏ', 'ԱՊՐ', 'ՄՅՍ', 'ՀՆՍ', 'ՀԼՍ', 'ՕԳՍ', 'ՍԵՊ', 'ՀՈԿ', 'ՆՈՅ', 'ԴԵԿ']
const MONTHS_G = ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի']
const WEEKDAYS = ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ']

// Everything the design derives from eventDate.
export function formatEventDate(iso) {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return {
    date: d,
    mon: MONTHS_SHORT[d.getMonth()],
    day: d.getDate(),
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    long: `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS_G[d.getMonth()]} ${d.getFullYear()}`,
  }
}

// "Add to calendar" (Google Calendar template link), in Yerevan time.
export function calendarUrl({ title, iso, hours = 5, location = '' }) {
  const start = new Date(iso)
  if (Number.isNaN(start.getTime())) return null
  const end = new Date(start.getTime() + hours * 36e5)
  const p = (n) => String(n).padStart(2, '0')
  const st = (d) => `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`
  const q = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${st(start)}/${st(end)}`, ctz: 'Asia/Yerevan', location })
  return `https://calendar.google.com/calendar/render?${q}`
}

// Capitals for display. «և» has no single capital (toUpperCase() gives
// «ԵՒ»), so it is written «ԵՎ».
export function caps(s) {
  return String(s || '').replace(/և/g, 'եվ').toUpperCase()
}
