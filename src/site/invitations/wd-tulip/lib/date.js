const MONTHS = ['Հունվար', 'Փետրվար', 'Մարտ', 'Ապրիլ', 'Մայիս', 'Հունիս', 'Հուլիս', 'Օգոստոս', 'Սեպտեմբեր', 'Հոկտեմբեր', 'Նոյեմբեր', 'Դեկտեմբեր']
const WEEKDAYS = ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ']

// Everything the design derives from eventDate: the hero's "Սեպտեմբեր
// 2027", the date card's "18 · 09 · 2027" and "Շաբաթ · 15:00".
export function formatEventDate(iso) {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return {
    date: d,
    monthYear: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    short: `${pad(d.getDate())} · ${pad(d.getMonth() + 1)} · ${d.getFullYear()}`,
    weekdayTime: `${WEEKDAYS[d.getDay()]} · ${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}
