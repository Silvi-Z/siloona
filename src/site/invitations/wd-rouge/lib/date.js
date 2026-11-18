// In capitals here, not via CSS text-transform (which turns «և» into «ԵՒ»).
const MONTHS = ['ՀՈՒՆՎԱՐԻ', 'ՓԵՏՐՎԱՐԻ', 'ՄԱՐՏԻ', 'ԱՊՐԻԼԻ', 'ՄԱՅԻՍԻ', 'ՀՈՒՆԻՍԻ', 'ՀՈՒԼԻՍԻ', 'ՕԳՈՍՏՈՍԻ', 'ՍԵՊՏԵՄԲԵՐԻ', 'ՀՈԿՏԵՄԲԵՐԻ', 'ՆՈՅԵՄԲԵՐԻ', 'ԴԵԿՏԵՄԲԵՐԻ']
const WEEKDAYS = ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ']

// Everything the design derives from eventDate: «16 ՀՈԿՏԵՄԲԵՐԻ 2027»,
// the big «16 / 10 / 27» numerals and «Շաբաթ · 15:00».
export function formatEventDate(iso) {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return {
    date: d,
    long: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    dd: pad(d.getDate()),
    mm: pad(d.getMonth() + 1),
    yy: pad(d.getFullYear() % 100),
    weekdayTime: `${WEEKDAYS[d.getDay()]} · ${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}
