const WEEKDAYS = ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ']
// Genitive forms, as in «12 դեկտեմբերի».
const MONTHS = [
  'հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի',
  'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի',
]

const pad = (n) => String(n).padStart(2, '0')

// Every displayed date string derives from the one canonical ISO value, so
// editing eventDate can never leave the hero and the venue card disagreeing.
export function formatEventDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { hero: '', venue: '' }
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  const dayMonth = `${d.getDate()} ${MONTHS[d.getMonth()]}`
  return {
    hero: `${dayMonth} ${d.getFullYear()} · ${time}`,
    venue: `${WEEKDAYS[d.getDay()]}, ${dayMonth} · ժամը ${time}`,
  }
}
