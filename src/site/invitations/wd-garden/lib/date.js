const MONTHS = ['Հունվար', 'Փետրվար', 'Մարտ', 'Ապրիլ', 'Մայիս', 'Հունիս', 'Հուլիս', 'Օգոստոս', 'Սեպտեմբեր', 'Հոկտեմբեր', 'Նոյեմբեր', 'Դեկտեմբեր']

// Everything the design derives from eventDate: the "05.04.2027" line, the
// calendar title ("ԱՊՐԻԼ 2027"), its leading blanks (weeks start on
// Monday), its length and the wedding day.
export function formatEventDate(iso) {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const Y = d.getFullYear(), M = d.getMonth(), D = d.getDate()
  const pad = (n) => String(n).padStart(2, '0')
  return {
    date: d,
    short: `${pad(D)}.${pad(M + 1)}.${Y}`,
    calTitle: `${MONTHS[M]} ${Y}`.toUpperCase(),
    day: D,
    lead: (new Date(Y, M, 1).getDay() + 6) % 7,
    total: new Date(Y, M + 1, 0).getDate(),
  }
}

export const daysLeft = (date) => Math.max(0, Math.ceil((date.getTime() - Date.now()) / 864e5))
