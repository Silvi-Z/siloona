// A 24-hour time picker: hour 00–23 and minute lists. A native
// <input type="time"> shows AM/PM or 24h depending on the visitor's
// browser/OS language, which nothing in the page can override — these
// lists always read 24h, and on a phone open the system's wheel picker.
// Value: "HH:MM", or "" when empty (if `allowEmpty`).

import { useText } from '../../i18n'

const TEXT = {
  hy: { time: 'Ժամ', hour: (l) => `${l}՝ ժամ`, minute: (l) => `${l}՝ րոպե` },
  ru: { time: 'Время', hour: (l) => `${l}: часы`, minute: (l) => `${l}: минуты` },
  en: { time: 'Time', hour: (l) => `${l}: hour`, minute: (l) => `${l}: minutes` },
}

const pad = (n) => String(n).padStart(2, '0')
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i))

export function parseTime(v) {
  const m = /^(\d{1,2}):(\d{2})/.exec(v || '')
  return m && Number(m[1]) < 24 && Number(m[2]) < 60 ? [pad(m[1]), m[2]] : null
}

export default function TimeSelect({ value, onChange, className, ariaLabel, allowEmpty = false, step = 5, id, style, invalid }) {
  const tx = useText(TEXT)
  ariaLabel ??= tx.time
  const t = parseTime(value)
  const [h, m] = t || ['', '']
  const minutes = Array.from({ length: 60 / step }, (_, i) => pad(i * step))
  if (m && !minutes.includes(m)) minutes.push(m), minutes.sort() // keep an existing 14:07
  const emit = (nh, nm) => {
    if (!nh && !nm) return onChange('')
    onChange(`${nh || '12'}:${nm || '00'}`)
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...style }} role="group" aria-label={ariaLabel}>
      <select id={id} className={className} value={h} aria-label={tx.hour(ariaLabel)} aria-invalid={invalid || undefined} onChange={(e) => emit(e.target.value, m)}>
        {(allowEmpty || !h) && <option value="">--</option>}
        {HOURS.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
      <span aria-hidden="true">:</span>
      <select className={className} value={m} aria-label={tx.minute(ariaLabel)} aria-invalid={invalid || undefined} onChange={(e) => emit(h, e.target.value)}>
        {(allowEmpty || !m) && <option value="">--</option>}
        {minutes.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
    </span>
  )
}
