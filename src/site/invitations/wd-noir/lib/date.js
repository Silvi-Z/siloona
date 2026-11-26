const MONTHS_OF = ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի']
const MONTHS = ['Հունվար', 'Փետրվար', 'Մարտ', 'Ապրիլ', 'Մայիս', 'Հունիս', 'Հուլիս', 'Օգոստոս', 'Սեպտեմբեր', 'Հոկտեմբեր', 'Նոյեմբեր', 'Դեկտեմբեր']
const WEEKDAYS = ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ']
// Calendar header, Monday first.
export const WEEK_SHORT = ['Եր', 'Եք', 'Չո', 'Հի', 'Ու', 'Շա', 'Կի']

const pad = (n) => String(n).padStart(2, '0')

// Everything the design derives from eventDate.
export function formatEventDate(iso) {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const y = d.getFullYear()
  const m = d.getMonth()
  // Leading blanks so the 1st falls on its weekday (Monday first).
  const lead = (new Date(y, m, 1).getDay() + 6) % 7
  const days = new Date(y, m + 1, 0).getDate()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  while (cells.length % 7) cells.push(null)
  return {
    date: d,
    day: d.getDate(),
    long: `${d.getDate()} ${MONTHS_OF[m]} ${y}`,
    numeric: `${pad(d.getDate())} · ${pad(m + 1)} · ${y}`,
    month: `${MONTHS[m]} ${y}`,
    weekday: WEEKDAYS[d.getDay()],
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    cells,
  }
}

// Capitals for display. «և» has no single capital: toUpperCase() gives
// «ԵՒ», so it is written «ԵՎ» as in modern spelling.
export function caps(s) {
  return String(s || '').replace(/և/g, 'եվ').toUpperCase()
}

// The first letter of a name, for the monogram.
export const initial = (s) => caps(String(s || '').trim().charAt(0))

// "Add to calendar" (Google Calendar template link), in Yerevan time.
export function calendarUrl({ title, iso, hours = 10, location = '' }) {
  const start = new Date(iso)
  if (Number.isNaN(start.getTime())) return null
  const end = new Date(start.getTime() + hours * 36e5)
  const st = (x) => `${x.getFullYear()}${pad(x.getMonth() + 1)}${pad(x.getDate())}T${pad(x.getHours())}${pad(x.getMinutes())}00`
  const q = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${st(start)}/${st(end)}`, ctz: 'Asia/Yerevan', location })
  return `https://calendar.google.com/calendar/render?${q}`
}
