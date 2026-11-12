const MONTHS_GEN = ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի']
const WEEKDAYS = ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ']

// "Շաբաթ, 12 հունիսի 2027 · 16:00" — everything shown comes from eventDate.
export function formatEventDate(iso) {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return {
    date: d,
    long: `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}
