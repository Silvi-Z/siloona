const MONTHS_OF = ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի']
const MONTHS = ['Հունվար', 'Փետրվար', 'Մարտ', 'Ապրիլ', 'Մայիս', 'Հունիս', 'Հուլիս', 'Օգոստոս', 'Սեպտեմբեր', 'Հոկտեմբեր', 'Նոյեմբեր', 'Դեկտեմբեր']
const WEEKDAYS = ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ']
// Calendar header, Monday first.
export const WEEK_SHORT = ['Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուրբ', 'Շբթ', 'Կիր']

// Everything the design derives from eventDate.
export function formatEventDate(iso) {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const y = d.getFullYear()
  const m = d.getMonth()
  // Leading blanks so the 1st falls on its weekday (Monday first).
  const lead = (new Date(y, m, 1).getDay() + 6) % 7
  const days = new Date(y, m + 1, 0).getDate()
  return {
    date: d,
    long: `${d.getDate()} ${MONTHS_OF[m]} ${y}`,
    month: `${MONTHS[m]} ${y}`,
    weekdayTime: `${WEEKDAYS[d.getDay()]}, ժամը ${pad(d.getHours())}:${pad(d.getMinutes())}`,
    day: d.getDate(),
    cells: [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)],
  }
}

// Capitals for display. «և» has no single capital: toUpperCase() gives
// «ԵՒ», so it is written «ԵՎ» as in modern spelling.
export function caps(s) {
  return String(s || '').replace(/և/g, 'եվ').toUpperCase()
}
