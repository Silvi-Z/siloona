const MONTHS = ['Հունվար', 'Փետրվար', 'Մարտ', 'Ապրիլ', 'Մայիս', 'Հունիս', 'Հուլիս', 'Օգոստոս', 'Սեպտեմբեր', 'Հոկտեմբեր', 'Նոյեմբեր', 'Դեկտեմբեր']
// Genitive month names, for "24 ապրիլի 2027".
const MONTHS_G = ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի']
const WEEKDAYS = ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ']

// Everything the design derives from eventDate.
export function formatEventDate(iso) {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return {
    date: d,
    short: `${pad(d.getDate())} · ${pad(d.getMonth() + 1)} · ${d.getFullYear()}`,
    weekday: WEEKDAYS[d.getDay()],
    day: d.getDate(),
    monthYear: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    long: `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS_G[d.getMonth()]} ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

// "Add to calendar" (Google Calendar template link), in Yerevan time.
export function calendarUrl({ title, iso, hours = 10, location = '' }) {
  const start = new Date(iso)
  if (Number.isNaN(start.getTime())) return null
  const end = new Date(start.getTime() + hours * 36e5)
  const p = (n) => String(n).padStart(2, '0')
  const st = (d) => `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`
  const q = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${st(start)}/${st(end)}`, ctz: 'Asia/Yerevan', location })
  return `https://calendar.google.com/calendar/render?${q}`
}
