const MONTHS = ['Հունվար', 'Փետրվար', 'Մարտ', 'Ապրիլ', 'Մայիս', 'Հունիս', 'Հուլիս', 'Օգոստոս', 'Սեպտեմբեր', 'Հոկտեմբեր', 'Նոյեմբեր', 'Դեկտեմբեր']

// Everything the design derives from eventDate: the hero line
// ("5 · 06 · 2027"), the calendar month, its leading blanks (weeks start on
// Monday), its length and the wedding day.
export function formatEventDate(iso) {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const Y = d.getFullYear(), M = d.getMonth(), D = d.getDate()
  return {
    date: d,
    short: `${D} · ${String(M + 1).padStart(2, '0')} · ${Y}`,
    month: MONTHS[M],
    day: D,
    lead: (new Date(Y, M, 1).getDay() + 6) % 7,
    total: new Date(Y, M + 1, 0).getDate(),
  }
}
