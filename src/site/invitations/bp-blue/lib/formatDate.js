const WEEKDAYS = ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ']
const MONTHS = [
  'Հունվար', 'Փետրվար', 'Մարտ', 'Ապրիլ', 'Մայիս', 'Հունիս',
  'Հուլիս', 'Օգոստոս', 'Սեպտեմբեր', 'Հոկտեմբեր', 'Նոյեմբեր', 'Դեկտեմբեր',
]

// The date block (month / weekday · day · year) derives from the one
// canonical ISO value, so editing eventDate keeps all four in sync.
export function formatEventDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { month: '', weekday: '', day: '', year: '' }
  return { month: MONTHS[d.getMonth()], weekday: WEEKDAYS[d.getDay()], day: String(d.getDate()), year: String(d.getFullYear()) }
}
