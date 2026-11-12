// "Add to calendar" link (Google Calendar template URL) for the event:
// starts at eventDate, in Yerevan time, and lasts `hours`.
function stamp(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`
}

export function calendarUrl({ title, iso, hours = 8, location = '' }) {
  const start = new Date(iso)
  if (Number.isNaN(start.getTime())) return null
  const end = new Date(start.getTime() + hours * 36e5)
  const q = new URLSearchParams({
    action: 'TEMPLATE', text: title, dates: `${stamp(start)}/${stamp(end)}`, ctz: 'Asia/Yerevan', location,
  })
  return `https://calendar.google.com/calendar/render?${q}`
}
