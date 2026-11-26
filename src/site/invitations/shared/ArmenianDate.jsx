import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useText } from '../../i18n'

// Siloona's own date picker: month and weekday names in the site's language, weeks from
// Monday, and the day always shown as 12.06.2027 — the same on every phone
// (a native date input follows the phone's language: 06/12/2027, English
// months…). Styled inline so it looks the same inside any design and on
// the site. Value: "YYYY-MM-DD" or "".

// The picker's own words follow the site's language (/ru, /en); the
// format of the chosen day doesn't.
const TEXT = {
  hy: {
    months: ['Հունվար', 'Փետրվար', 'Մարտ', 'Ապրիլ', 'Մայիս', 'Հունիս', 'Հուլիս', 'Օգոստոս', 'Սեպտեմբեր', 'Հոկտեմբեր', 'Նոյեմբեր', 'Դեկտեմբեր'],
    monthsG: ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի'],
    weekdays: ['Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուր', 'Շբթ', 'Կիր'],
    prev: 'Նախորդ ամիս', next: 'Հաջորդ ամիս', pick: 'Ընտրել ամսաթիվը', date: 'Ամսաթիվ', dialog: 'Ընտրեք ամսաթիվը', close: 'Փակել', sep: '՝ ',
  },
  ru: {
    months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    monthsG: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    prev: 'Предыдущий месяц', next: 'Следующий месяц', pick: 'Выбрать дату', date: 'Дата', dialog: 'Выберите дату', close: 'Закрыть', sep: ': ',
  },
  en: {
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsG: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    prev: 'Previous month', next: 'Next month', pick: 'Choose a date', date: 'Date', dialog: 'Choose a date', close: 'Close', sep: ': ',
  },
}
const FONT = '"Noto Sans Armenian","Noto Sans",-apple-system,"Segoe UI",Roboto,sans-serif'

const pad = (n) => String(n).padStart(2, '0')
const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`
const todayIso = () => { const t = new Date(); return iso(t.getFullYear(), t.getMonth(), t.getDate()) }
const parse = (v) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '')
  return m ? { y: +m[1], m: +m[2] - 1, d: +m[3] } : null
}
export const formatDay = (v) => { const p = parse(v); return p ? `${pad(p.d)}.${pad(p.m + 1)}.${p.y}` : '' }

export function Calendar({ value, onChange, min = todayIso(), accent = '#4A0611' }) {
  const t = useText(TEXT)
  const sel = parse(value)
  const start = sel || parse(min) || parse(todayIso())
  const [view, setView] = useState({ y: start.y, m: start.m })
  const first = new Date(view.y, view.m, 1)
  const lead = (first.getDay() + 6) % 7 // Monday first
  const days = new Date(view.y, view.m + 1, 0).getDate()
  const today = todayIso()
  const move = (n) => setView((v) => { const d = new Date(v.y, v.m + n, 1); return { y: d.getFullYear(), m: d.getMonth() } })
  const navBtn = { width: 40, height: 40, border: 0, borderRadius: '50%', background: 'transparent', color: '#211C28', fontSize: 22, lineHeight: 1, cursor: 'pointer', fontFamily: FONT }

  return (
    <div style={{ fontFamily: FONT, color: '#211C28', width: '100%', maxWidth: 340, userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <button type="button" style={navBtn} onClick={() => move(-1)} aria-label={t.prev}>‹</button>
        <strong style={{ fontWeight: 600, fontSize: 15.5, letterSpacing: '.01em' }} aria-live="polite">{t.months[view.m]} {view.y}</strong>
        <button type="button" style={navBtn} onClick={() => move(1)} aria-label={t.next}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, textAlign: 'center' }}>
        {t.weekdays.map((w, i) => (
          <span key={w} style={{ fontSize: 11.5, color: i > 4 ? accent : '#7A7080', padding: '4px 0 6px', fontWeight: 500 }}>{w}</span>
        ))}
        {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = i + 1
          const v = iso(view.y, view.m, d)
          const on = sel && sel.y === view.y && sel.m === view.m && sel.d === d
          const off = min && v < min
          const isToday = v === today
          return (
            <button
              key={d} type="button" disabled={off}
              aria-label={`${d} ${t.monthsG[view.m]} ${view.y}`} aria-pressed={!!on}
              onClick={() => onChange(v)}
              style={{
                height: 40, border: 0, borderRadius: '50%', fontFamily: FONT, fontSize: 15, cursor: off ? 'default' : 'pointer',
                background: on ? accent : 'transparent', color: on ? '#fff' : off ? '#C9C2CC' : '#211C28', fontWeight: on ? 600 : 400,
                boxShadow: isToday && !on ? `inset 0 0 0 1px ${accent}` : 'none', aspectRatio: '1', maxWidth: 44, justifySelf: 'center', width: '100%', padding: 0,
              }}
            >
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// A field that shows the chosen day (12.06.2027) and opens the calendar
// over the page. `className` styles the button like the surrounding inputs.
export function DateField({ value, onChange, className, style, placeholder, id, invalid, accent, min, ariaLabel }) {
  const t = useText(TEXT)
  placeholder ??= t.pick
  ariaLabel ??= t.date
  const [open, setOpen] = useState(false)
  const btn = useRef(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])
  const close = () => { setOpen(false); btn.current?.focus() }
  return (
    <>
      <button
        ref={btn} id={id} type="button" className={className} aria-invalid={invalid || undefined} aria-haspopup="dialog"
        aria-label={value ? `${ariaLabel}${t.sep}${formatDay(value)}` : ariaLabel}
        onClick={() => setOpen(true)}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, textAlign: 'left', cursor: 'pointer', ...style }}
      >
        <span style={{ opacity: value ? 1 : 0.55 }}>{value ? formatDay(value) : placeholder}</span>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" style={{ flex: 'none', opacity: 0.7 }}>
          <rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
      </button>
      {open && createPortal(
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(25,23,22,.42)', display: 'grid', placeItems: 'center', padding: 16 }}
        >
          <div role="dialog" aria-modal="true" aria-label={t.dialog} style={{ boxSizing: 'border-box', background: '#FFFDF9', borderRadius: 14, padding: '18px 16px 14px', width: '100%', maxWidth: 360, boxShadow: '0 20px 60px rgba(0,0,0,.25)', display: 'grid', justifyItems: 'center' }}>
            <Calendar value={value} min={min} accent={accent} onChange={(v) => { onChange(v); close() }} />
            <button type="button" onClick={close} style={{ marginTop: 10, border: 0, background: 'none', color: '#4B4256', fontFamily: FONT, fontSize: 14, padding: '10px 16px', cursor: 'pointer' }}>{t.close}</button>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
