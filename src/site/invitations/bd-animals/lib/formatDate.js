const WEEKDAYS = ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ']
const MONTHS = [
  'Հունվար', 'Փետրվար', 'Մարտ', 'Ապրիլ', 'Մայիս', 'Հունիս',
  'Հուլիս', 'Օգոստոս', 'Սեպտեմբեր', 'Հոկտեմբեր', 'Նոյեմբեր', 'Դեկտեմբեր',
]

function pad(n) { return String(n).padStart(2, '0') }

// Every displayed piece of the party date/time derives from the one
// canonical ISO value, same reasoning as wd-beige/lib/formatDate.js —
// editing eventDate once can never leave the date grid out of sync.
// Only the "dates" grid (weekday/month/day/year/time) actually needs a
// derived string in this design — the RSVP deadline phrase and thank-you
// messages are independent editable text, same as in the source demo.
export function formatEventDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { weekday: '', day: '', month: '', year: '', time: '' }
  return {
    weekday: WEEKDAYS[d.getDay()],
    day: String(d.getDate()),
    month: MONTHS[d.getMonth()],
    year: String(d.getFullYear()),
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}
