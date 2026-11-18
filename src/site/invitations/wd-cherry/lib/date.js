const MONTHS = ['Հունվար', 'Փետրվար', 'Մարտ', 'Ապրիլ', 'Մայիս', 'Հունիս', 'Հուլիս', 'Օգոստոս', 'Սեպտեմբեր', 'Հոկտեմբեր', 'Նոյեմբեր', 'Դեկտեմբեր']

// Everything the design derives from eventDate: «12.06.2027» and the
// calendar card's month.
export function formatEventDate(iso) {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return {
    date: d,
    dots: `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`,
    monthName: MONTHS[d.getMonth()],
  }
}

// The event's month as weeks from Monday, padded with the neighbouring
// months' days (marked `other`); the event day is marked `event`.
export function calendarWeeks(date) {
  const y = date.getFullYear()
  const m = date.getMonth()
  const first = new Date(y, m, 1)
  const lead = (first.getDay() + 6) % 7
  const days = new Date(y, m + 1, 0).getDate()
  const prevDays = new Date(y, m, 0).getDate()
  const cells = []
  for (let i = lead - 1; i >= 0; i--) cells.push({ day: prevDays - i, other: true })
  for (let d = 1; d <= days; d++) cells.push({ day: d, event: d === date.getDate() })
  let n = 1
  while (cells.length % 7) cells.push({ day: n++, other: true })
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}
