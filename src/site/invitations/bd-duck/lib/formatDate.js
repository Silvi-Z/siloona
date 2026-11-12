const WEEKDAYS = ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ']
const MONTHS = [
  'Հունվար', 'Փետրվար', 'Մարտ', 'Ապրիլ', 'Մայիս', 'Հունիս',
  'Հուլիս', 'Օգոստոս', 'Սեպտեմբեր', 'Հոկտեմբեր', 'Նոյեմբեր', 'Դեկտեմբեր',
]
const pad = (n) => String(n).padStart(2, '0')

// Every displayed piece of the date card derives from the one canonical
// ISO value, so editing eventDate keeps weekday/day/month/time in sync.
export function formatEventDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { weekday: '', day: '', monthYear: '', time: '' }
  return {
    weekday: WEEKDAYS[d.getDay()],
    day: String(d.getDate()),
    monthYear: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}
