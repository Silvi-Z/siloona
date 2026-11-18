// Written in capitals here rather than with CSS text-transform, which
// would turn «և» into «ԵՒ».
const MONTHS = ['ՀՈՒՆՎԱՐԻ', 'ՓԵՏՐՎԱՐԻ', 'ՄԱՐՏԻ', 'ԱՊՐԻԼԻ', 'ՄԱՅԻՍԻ', 'ՀՈՒՆԻՍԻ', 'ՀՈՒԼԻՍԻ', 'ՕԳՈՍՏՈՍԻ', 'ՍԵՊՏԵՄԲԵՐԻ', 'ՀՈԿՏԵՄԲԵՐԻ', 'ՆՈՅԵՄԲԵՐԻ', 'ԴԵԿՏԵՄԲԵՐԻ']
const WEEKDAYS = ['ԿԻՐԱԿԻ', 'ԵՐԿՈՒՇԱԲԹԻ', 'ԵՐԵՔՇԱԲԹԻ', 'ՉՈՐԵՔՇԱԲԹԻ', 'ՀԻՆԳՇԱԲԹԻ', 'ՈՒՐԲԱԹ', 'ՇԱԲԱԹ']

// Everything the design derives from eventDate: the hero's
// «25 · 09 · 2027» and the «ՇԱԲԱԹ | 25 | ՍԵՊՏԵՄԲԵՐԻ» row.
export function formatEventDate(iso) {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return {
    date: d,
    dots: `${pad(d.getDate())} · ${pad(d.getMonth() + 1)} · ${d.getFullYear()}`,
    weekday: WEEKDAYS[d.getDay()],
    day: d.getDate(),
    month: MONTHS[d.getMonth()],
  }
}
