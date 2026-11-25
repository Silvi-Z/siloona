// Month and weekday names per invitation language. MONTHS: the month on
// its own (the date row); MONTHS_G: as in a date (genitive in Armenian and
// Russian).
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

const pad = (n) => String(n).padStart(2, '0')

// Everything the design derives from eventDate, in the invitation's language.
export function formatEventDate(iso, lang = 'hy') {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const L = WEEKDAYS[lang] ? lang : 'hy'
  const h = d.getHours()
  const time = `${pad(h)}:${pad(d.getMinutes())}`
  const t12 = `${h % 12 || 12}:${pad(d.getMinutes())} ${h < 12 ? 'am' : 'pm'}`
  // The red script line starts with the time: «ժամը 19:00-ին՝ …».
  const AT = { hy: `ժամը ${time}-ին՝`, ru: `в ${time},`, en: `${t12} at` }
  return {
    date: d,
    weekday: WEEKDAYS[L][d.getDay()],
    month: MONTHS[L][d.getMonth()],
    day: d.getDate(),
    at: AT[L],
    long: `${WEEKDAYS[L][d.getDay()]}, ${L === 'en' ? `${MONTHS.en[d.getMonth()]} ${d.getDate()}` : `${d.getDate()} ${MONTHS_G[L][d.getMonth()]}`} ${d.getFullYear()} · ${L === 'en' ? t12 : time}`,
  }
}

// "Add to calendar" (Google Calendar template link), in Yerevan time.
export function calendarUrl({ title, iso, hours = 5, location = '' }) {
  const start = new Date(iso)
  if (Number.isNaN(start.getTime())) return null
  const end = new Date(start.getTime() + hours * 36e5)
  const st = (x) => `${x.getFullYear()}${pad(x.getMonth() + 1)}${pad(x.getDate())}T${pad(x.getHours())}${pad(x.getMinutes())}00`
  const q = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${st(start)}/${st(end)}`, ctz: 'Asia/Yerevan', location })
  return `https://calendar.google.com/calendar/render?${q}`
}
