// Everything the design derives from eventDate: the cover's stacked
// «24. / 09. / 2027» and the week strip around the day.
export function formatEventDate(iso) {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const around = [-2, -1, 1, 2].map((k) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + k).getDate())
  return {
    date: d,
    dd: pad(d.getDate()),
    mm: pad(d.getMonth() + 1),
    yyyy: String(d.getFullYear()),
    short: `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`,
    // two days before, the day itself, two after
    week: [around[0], around[1], null, around[2], around[3]],
  }
}
