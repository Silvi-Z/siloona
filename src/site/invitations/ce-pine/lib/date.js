// Day, month and weekday names per invitation language. The cover's day
// row uses the short ones (shown in capitals): «ԿԻՐ | 27 | ԴԵԿ».
const WEEKDAYS_S = {
  hy: ['Կիր', 'Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուրբ', 'Շբթ'],
  ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}
const MONTHS_S = {
  hy: ['Հունվ', 'Փետր', 'Մարտ', 'Ապր', 'Մայիս', 'Հունիս', 'Հուլիս', 'Օգոս', 'Սեպտ', 'Հոկտ', 'Նոյ', 'Դեկ'],
  ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}
// The month as in a date, «27 դեկտեմբերի» (genitive in Armenian and Russian).
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

// Everything the design derives from eventDate, in the invitation's language.
export function formatEventDate(iso, lang = 'hy') {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const L = WEEKDAYS[lang] ? lang : 'hy'
  const pad = (n) => String(n).padStart(2, '0')
  const h = d.getHours()
  const time = `${pad(h)}:${pad(d.getMinutes())}`
  return {
    date: d,
    day: d.getDate(),
    weekdayShort: WEEKDAYS_S[L][d.getDay()],
    monthShort: MONTHS_S[L][d.getMonth()],
    // «Կիրակի, 27 դեկտեմբերի 2026»
    long: `${WEEKDAYS[L][d.getDay()]}, ${d.getDate()} ${MONTHS_G[L][d.getMonth()]} ${d.getFullYear()}`,
    time,
    // English reads the time the American way, like the reference: 7:00 pm.
    time12: `${h % 12 || 12}:${pad(d.getMinutes())} ${h < 12 ? 'am' : 'pm'}`,
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
