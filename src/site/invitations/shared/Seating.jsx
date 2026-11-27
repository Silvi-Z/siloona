import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useInvitationContent } from './EditableContext'
import { pick, useInvLang } from './invLang'
// the dialog's look for designs that style it with variables (.sd-seat)
import './seatDialog.css'

// «Ձեր սեղանը» — the guest finds their table. The behaviour is the same in
// every design and lives here; how it looks is each design's own (its
// fonts, colours, motion), styled through the class names below.
//
// It exists only on a published invitation whose seating the couple
// ordered: the page gets `seating` from the server (SharedInvitation.jsx)
// and every design preview / editor has none, so nothing renders there.
//   before the reveal   a line with the date, no button
//   after               «Իմացեք ձեր սեղանը» → a dialog: name → «Սեղան 7»
//   came back later     the table straight away — the name found last
//                       time is remembered on this device
// The server holds the list and answers one name at a time; nothing here
// ever sees other guests.

const TEXT = {
  hy: {
    title: 'Ձեր սեղանը',
    yours: 'Ձեր սեղանը',
    monthsG: ['Հունվարի', 'Փետրվարի', 'Մարտի', 'Ապրիլի', 'Մայիսի', 'Հունիսի', 'Հուլիսի', 'Օգոստոսի', 'Սեպտեմբերի', 'Հոկտեմբերի', 'Նոյեմբերի', 'Դեկտեմբերի'],
    // \u2060 (word joiner) on both sides of the hyphen keeps «-ին» / «-ից» with the number
    soon: ({ day, month, time }, m) => `${m[month]} ${day}\u2060-\u2060ին${time ? `, ժամը ${time}\u2060-\u2060ից` : ''} այստեղ կտեսնեք ձեր սեղանը`,
    button: 'Իմացեք ձեր սեղանը',
    teaser: 'Գրեք ձեր անունը և իմացեք, թե որ սեղանի շուրջ ենք ձեզ սպասում',
    intro: 'Գրեք ձեր անունը և ազգանունը',
    label: 'Անուն, ազգանուն',
    submit: 'Գտնել',
    searching: 'Փնտրում ենք…',
    empty: 'Գրեք ձեր անունը։',
    ambiguous: 'Այս անունով մի քանի հյուր կա։ Խնդրում ենք գրել նաև ազգանունը։',
    notFound: 'Ձեր անունը չգտանք։ Խնդրում ենք մոտենալ մուտքի մոտ գտնվող ցուցակին կամ դիմել կազմակերպիչներին։',
    notOpen: 'Սեղանները դեռ հասանելի չեն։',
    busy: 'Շատ հարցումներ ստացանք։ Փորձեք մի քանի րոպեից։',
    error: 'Չհաջողվեց կապ հաստատել։ Ստուգեք ինտերնետը և փորձեք նորից։',
    close: 'Փակել',
    other: 'Փնտրել այլ անունով',
  },
  ru: {
    title: 'Ваш стол',
    yours: 'Ваш стол',
    monthsG: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    soon: ({ day, month, time }, m) => `${day} ${m[month]}${time ? ` в ${time}` : ''} здесь появится ваш стол`,
    button: 'Узнать свой стол',
    teaser: 'Напишите своё имя и узнайте, за каким столом мы вас ждём',
    intro: 'Напишите ваше имя и фамилию',
    label: 'Имя, фамилия',
    submit: 'Найти',
    searching: 'Ищем…',
    empty: 'Напишите ваше имя.',
    ambiguous: 'С таким именем несколько гостей. Пожалуйста, напишите и фамилию.',
    notFound: 'Мы не нашли ваше имя. Пожалуйста, посмотрите список у входа или обратитесь к организаторам.',
    notOpen: 'Столы пока не открыты.',
    busy: 'Слишком много запросов. Попробуйте через несколько минут.',
    error: 'Не удалось связаться. Проверьте интернет и попробуйте ещё раз.',
    close: 'Закрыть',
    other: 'Искать другое имя',
  },
  en: {
    title: 'Your table',
    yours: 'Your table',
    monthsG: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    soon: ({ day, month, time }, m) => `Your table will appear here on ${day} ${m[month]}${time ? ` at ${time}` : ''}`,
    button: 'Find your table',
    teaser: 'Type your name to see which table we have saved for you',
    intro: 'Type your first and last name',
    label: 'First and last name',
    submit: 'Find',
    searching: 'Searching…',
    empty: 'Please type your name.',
    ambiguous: 'Several guests have this name. Please add your last name too.',
    notFound: "We couldn't find your name. Please check the list at the entrance or ask the organisers.",
    notOpen: 'Tables are not open yet.',
    busy: 'Too many requests. Please try again in a few minutes.',
    error: "Couldn't connect. Check your internet and try again.",
    close: 'Close',
    other: 'Search another name',
  },
}

// The reveal moment in Yerevan time (Armenia has no daylight saving).
function revealParts(iso) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Yerevan', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  )
  const time = `${parts.hour}:${parts.minute}`
  return { day: Number(parts.day), month: Number(parts.month) - 1, time: time === '00:00' ? '' : time }
}

// The name that found a table, kept on this device for the next visit.
const memoKey = (key) => `siloona.seat.${key}`
const recall = (key) => { try { return localStorage.getItem(memoKey(key)) || '' } catch { return '' } }
const remember = (key, name) => { try { localStorage.setItem(memoKey(key), name) } catch { /* private mode */ } }
const forget = (key) => { try { localStorage.removeItem(memoKey(key)) } catch { /* private mode */ } }

const MAX_TIMER = 2 ** 31 - 1

export function useSeatFinder() {
  const { seating, editing } = useInvitationContent()
  const t = pick(TEXT, useInvLang())
  const [revealed, setRevealed] = useState(!!seating?.open)
  const [result, setResult] = useState(null) // { table }
  const [dialog, setDialog] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { setRevealed(!!seating?.open) }, [seating])

  // A page left open past the reveal time shows the button then.
  useEffect(() => {
    if (!seating || revealed) return undefined
    const ms = Date.parse(seating.revealAt) - Date.now()
    if (ms > MAX_TIMER) return undefined
    const id = setTimeout(() => setRevealed(true), Math.max(0, ms) + 500)
    return () => clearTimeout(id)
  }, [seating, revealed])

  // Came back: look the remembered name up again (the list may have changed).
  useEffect(() => {
    if (!seating || !revealed) return undefined
    const name = recall(seating.key)
    if (!name) return undefined
    let alive = true
    seating.find(name).then((r) => {
      if (!alive) return
      if (r.status === 'found') setResult({ table: r.table })
      else if (['not_found', 'ambiguous', 'empty'].includes(r.status)) forget(seating.key)
    })
    return () => { alive = false }
  }, [seating, revealed])

  async function search(raw) {
    const name = String(raw || '').trim()
    if (!name) { setMessage(t.empty); return }
    setBusy(true)
    setMessage('')
    const r = await seating.find(name)
    setBusy(false)
    if (r.status === 'found') {
      setResult({ table: r.table })
      remember(seating.key, name)
      return
    }
    if (r.status === 'not_open') setRevealed(false)
    setMessage({ ambiguous: t.ambiguous, not_found: t.notFound, empty: t.empty, not_open: t.notOpen, busy: t.busy }[r.status] || t.error)
  }

  return {
    on: !!seating && !editing,
    revealed,
    soon: seating ? t.soon(revealParts(seating.revealAt), t.monthsG) : '',
    t,
    result,
    dialog,
    busy,
    message,
    open: () => { setMessage(''); setDialog(true) },
    close: () => setDialog(false),
    // «Փնտրել այլ անունով»: forget this one and ask again
    another: () => { setResult(null); if (seating) forget(seating.key); setMessage(''); setDialog(true) },
    clearMessage: () => message && setMessage(''),
    search,
  }
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

// The dialog shell (mark where focus should land once the found table
// replaces the opening button with data-seat-return): drawn over the page (in <body>, so no design's
// container can clip it), focus kept inside, Escape / backdrop / the close
// button close it, focus goes back to the button that opened it.
// `className` is the design's own (its CSS styles .seat-*).
export function SeatDialog({ finder, className = '', children }) {
  const ref = useRef(null)
  const titleId = useId()
  const { dialog, close, t } = finder

  useEffect(() => {
    if (!dialog) return undefined
    const back = document.activeElement
    const root = ref.current
    const first = root?.querySelector('input') || root?.querySelector(FOCUSABLE)
    first?.focus({ preventScroll: true })
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return }
      if (e.key !== 'Tab' || !root) return
      const items = [...root.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null)
      if (!items.length) return
      const a = items[0]
      const z = items[items.length - 1]
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      // the button that opened it may be gone (the table took its place)
      const to = back?.isConnected ? back : document.querySelector('[data-seat-return]')
      to?.focus?.({ preventScroll: true })
    }
  }, [dialog]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!dialog) return null
  return createPortal(
    <div className={`seat-modal ${className}`} onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
      <div ref={ref} className="seat-box" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button type="button" className="seat-x" onClick={close} aria-label={t.close}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4l12 12M16 4L4 16" /></svg>
        </button>
        {children(titleId)}
      </div>
    </div>,
    document.body,
  )
}

// The dialog's usual content: the name field, then the result. A design
// may write its own instead; this one is styled through .seat-* classes.
export function SeatForm({ finder, titleId, title }) {
  const { t, busy, message, result, search, clearMessage, close } = finder
  const msgId = useId()
  if (result) {
    return (
      <div className="seat-done" role="status">
        <p id={titleId} className="seat-yours">{t.yours}</p>
        <p className={`seat-table${result.table.length > 3 ? " long" : ""}`}>{result.table}</p>
        <button type="button" className="seat-ok" onClick={close} autoFocus>{t.close}</button>
      </div>
    )
  }
  return (
    <form
      className="seat-form" noValidate
      onSubmit={(e) => { e.preventDefault(); if (!busy) search(e.currentTarget.elements.n.value) }}
    >
      <h2 id={titleId} className="seat-title">{title || t.title}</h2>
      <p className="seat-intro">{t.intro}</p>
      <label className="seat-field">
        <span className="seat-lbl">{t.label}</span>
        <input
          name="n" type="text" autoComplete="off" autoCorrect="off" autoCapitalize="words" spellCheck={false}
          enterKeyHint="search" maxLength={120} readOnly={busy}
          aria-invalid={message ? true : undefined} aria-describedby={message ? msgId : undefined}
          onInput={clearMessage}
        />
      </label>
      <p id={msgId} className="seat-msg" aria-live="polite">{message}</p>
      <button type="submit" className="seat-go" disabled={busy} aria-busy={busy || undefined}>{busy ? t.searching : t.submit}</button>
    </form>
  )
}
