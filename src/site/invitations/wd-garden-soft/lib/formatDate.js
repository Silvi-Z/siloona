// Genitive month names, as in «12 դեկտեմբերի 2026».
const MONTHS = [
  'հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի',
  'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի',
]
const pad = (n) => String(n).padStart(2, '0')

// Every displayed date derives from the one canonical ISO value:
//   short  "12 • 12 • 2026" (inside the arch)
//   long   "12 դեկտեմբերի 2026" (under it)
//   week   the Monday–Sunday days around it, for the week strip
export function formatEventDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { short: '', long: '', week: [], dayIndex: -1 }
  const mondayOffset = (d.getDay() + 6) % 7
  const week = Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() - mondayOffset + i)
    return x.getDate()
  })
  return {
    short: `${pad(d.getDate())} • ${pad(d.getMonth() + 1)} • ${d.getFullYear()}`,
    long: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    week,
    dayIndex: mondayOffset,
  }
}
