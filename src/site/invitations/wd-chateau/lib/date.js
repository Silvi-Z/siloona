// Month and weekday names per invitation language. MONTHS: the month on
// its own (the calendar's heading, the date rows); MONTHS_G: as in a date
// (genitive in Armenian and Russian).
const MONTHS = {
  hy: ['Հունվար', 'Փետրվար', 'Մարտ', 'Ապրիլ', 'Մայիս', 'Հունիս', 'Հուլիս', 'Օգոստոս', 'Սեպտեմբեր', 'Հոկտեմբեր', 'Նոյեմբեր', 'Դեկտեմբեր'],
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
}
const MONTHS_G = {
  hy: ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  en: MONTHS.en,
}
const WEEKDAYS = {
  hy: ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ'],
  ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
}
// The calendar's column heads, Monday first.
const WEEK_SHORT = {
  hy: ['Եր', 'Եք', 'Չո', 'Հի', 'Ու', 'Շա', 'Կի'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
}

const pad = (n) => String(n).padStart(2, '0')

// Everything the design derives from eventDate, in the invitation's language.
export function formatEventDate(iso, lang = 'hy') {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const L = WEEKDAYS[lang] ? lang : 'hy'
  const y = d.getFullYear()
  const m = d.getMonth()
  // The month as weeks of seven (Monday first), null for the blanks.
  const lead = (new Date(y, m, 1).getDay() + 6) % 7
  const days = new Date(y, m + 1, 0).getDate()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  while (cells.length % 7) cells.push(null)
  return {
    date: d,
    day: d.getDate(),
    weekday: WEEKDAYS[L][d.getDay()],
    month: MONTHS[L][m],
    year: y,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    long: `${WEEKDAYS[L][d.getDay()]}, ${L === 'en' ? `${MONTHS.en[m]} ${d.getDate()}` : `${d.getDate()} ${MONTHS_G[L][m]}`} ${y}`,
    weekHeads: WEEK_SHORT[L],
    cells,
  }
}

// "Add to calendar" (Google Calendar template link), in Yerevan time.
export function calendarUrl({ title, iso, hours = 10, location = '' }) {
  const start = new Date(iso)
  if (Number.isNaN(start.getTime())) return null
  const end = new Date(start.getTime() + hours * 36e5)
  const st = (x) => `${x.getFullYear()}${pad(x.getMonth() + 1)}${pad(x.getDate())}T${pad(x.getHours())}${pad(x.getMinutes())}00`
  const q = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${st(start)}/${st(end)}`, ctz: 'Asia/Yerevan', location })
  return `https://calendar.google.com/calendar/render?${q}`
}
