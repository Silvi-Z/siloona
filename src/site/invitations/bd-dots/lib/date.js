// Month and weekday names per invitation language. MONTHS_G: the month as
// in a date (genitive in Armenian and Russian).
const MONTHS_G = {
  hy: ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
}
const WEEKDAYS = {
  hy: ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ'],
  ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
}

const pad = (n) => String(n).padStart(2, '0')
// 13:00 → «1pm», 13:30 → «1:30pm» (English only).
function ampm(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return `${h % 12 || 12}${m ? `:${pad(m)}` : ''}${h < 12 ? 'am' : 'pm'}`
}

// Everything the design derives from eventDate (+ endTime), in the
// invitation's language.
export function formatEventDate(iso, lang = 'hy', endTime = '') {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const L = WEEKDAYS[lang] ? lang : 'hy'
  const start = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  const end = /^\d{1,2}:\d{2}$/.test(endTime || '') ? endTime.padStart(5, '0') : ''
  const wd = WEEKDAYS[L][d.getDay()]
  const day = L === 'en' ? `${MONTHS_G.en[d.getMonth()]} ${d.getDate()}` : `${d.getDate()} ${MONTHS_G[L][d.getMonth()]}`
  const time = L === 'en' ? (end ? `${ampm(start)}–${ampm(end)}` : ampm(start)) : (end ? `${start}–${end}` : start)
  return {
    date: d,
    // «Շաբաթ – 17 ապրիլի – 13:00–15:00» / «Saturday – April 17 – 1pm–3pm»
    line: `${wd} – ${day} – ${time}`,
    long: `${wd}, ${day} ${d.getFullYear()} · ${time}`,
  }
}

// "Add to calendar" (Google Calendar template link), in Yerevan time; it
// ends at endTime when there is one.
export function calendarUrl({ title, iso, endTime, location = '' }) {
  const start = new Date(iso)
  if (Number.isNaN(start.getTime())) return null
  let end = new Date(start.getTime() + 3 * 36e5)
  if (/^\d{1,2}:\d{2}$/.test(endTime || '')) {
    const [h, m] = endTime.split(':').map(Number)
    end = new Date(start)
    end.setHours(h, m, 0, 0)
    if (end <= start) end.setDate(end.getDate() + 1)
  }
  const st = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
  const q = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${st(start)}/${st(end)}`, ctz: 'Asia/Yerevan', location })
  return `https://calendar.google.com/calendar/render?${q}`
}
