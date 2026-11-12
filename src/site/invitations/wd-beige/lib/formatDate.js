const MONTHS_GENITIVE = [
  'հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի',
  'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի',
]

function pad(n) { return String(n).padStart(2, '0') }

// Derives every display format of the event date from the one canonical
// ISO value, so editing a single date field can never leave the
// countdown, the hero label and the "big" numeric date out of sync.
export function formatEventDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { short: '', label: '', big: '', time: '' }
  const day = d.getDate()
  const month = d.getMonth()
  const year = d.getFullYear()
  return {
    short: `${pad(day)} · ${pad(month + 1)} · ${year}`,
    label: `${day} ${MONTHS_GENITIVE[month]} ${year} թվական`,
    big: `${pad(day)}.${pad(month + 1)}.${year}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}
