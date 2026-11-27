import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFeature, useInvitationContent } from './EditableContext'
import { calLang, eventKind, eventTitle, googleCalendarUrl, icsUrl } from './calendarEvent'
import './addToCalendar.css'

// «Ավելացնել օրացույցում» (the `calendar` add-on, free in every
// invitation). The design places the trigger where it fits — usually by
// the date or the countdown — with its own classes, so it looks like the
// design's other buttons. Tapping it offers Google Calendar (a filled-in
// link) or Apple / another calendar (an .ics file from the server). The
// small sheet takes the trigger's typeface and the page's colours.
//
//   slug      the design's id: the event (names, date, time, main place)
//             is read from its content the same way checkout reads it
//   event     optional overrides { title, date, time, endTime, location }
//   kind      what the event is, when the design's id doesn't say it
//             ('newYear' for the New Year parties)
//   as        'a' (default) or 'button'

const TEXT = {
  hy: {
    add: 'Ավելացնել օրացույցում', google: 'Google Calendar', apple: 'Apple / այլ օրացույց', appleSub: '.ics ֆայլ',
    close: 'Փակել', inApp: 'Եթե ֆայլը չբացվի, բացեք հրավերը բրաուզերում (Safari կամ Chrome)՝ «⋯» → «Բացել բրաուզերում»։',
    openChrome: 'Բացել Chrome-ում', reminder: 'Հիշեցում՝ 1 օր առաջ',
  },
  ru: {
    add: 'Добавить в календарь', google: 'Google Calendar', apple: 'Apple / другой календарь', appleSub: 'файл .ics',
    close: 'Закрыть', inApp: 'Если файл не открывается, откройте приглашение в браузере (Safari или Chrome): «⋯» → «Открыть в браузере».',
    openChrome: 'Открыть в Chrome', reminder: 'Напоминание — за 1 день',
  },
  en: {
    add: 'Add to calendar', google: 'Google Calendar', apple: 'Apple / other calendar', appleSub: '.ics file',
    close: 'Close', inApp: 'If the file doesn’t open, open the invitation in your browser (Safari or Chrome): “⋯” → “Open in browser”.',
    openChrome: 'Open in Chrome', reminder: 'Reminder 1 day before',
  },
}

// Instagram, Facebook, TikTok… and other apps' built-in browsers often
// refuse to open a downloaded file.
export function inAppBrowser(ua = typeof navigator !== 'undefined' ? navigator.userAgent : '') {
  if (/Instagram|FBAN|FBAV|FB_IAB|FBIOS|Line\/|TikTok|musical_ly|BytedanceWebview|Snapchat|LinkedInApp|Twitter|Telegram|Viber|WhatsApp/i.test(ua)) return true
  if (/Android/i.test(ua) && /; wv\)/.test(ua)) return true // Android WebView
  if (/iPhone|iPad|iPod/i.test(ua) && !/Safari\//.test(ua)) return true // iOS WKWebView
  return false
}
const isAndroid = () => typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)

// The event, from the design's content (invitationDetails.js — loaded only
// when the button is pressed).
export async function eventFromContent(slug, data, kind) {
  const m = await import('../../invitationDetails')
  const d = (slug && m.detailsFromContent(slug, data)) || {}
  const lang = calLang(data?.lang)
  const iso = typeof data?.eventDate === 'string' ? /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/.exec(data.eventDate) : null
  const places = [0, 1, 2, 3]
    .map((i) => ({ name: d[`place${i}.name`] || '', address: d[`place${i}.address`] || '', time: d[`place${i}.time`] || '' }))
    .filter((p) => p.name || p.address)
  // the main place: the one at the event's start time, else the first
  const main = places.find((p) => p.time && p.time === d.eventTime) || places[0]
  return {
    title: eventTitle(kind || eventKind(slug), { p1: d.p1, p2: d.p2, one: d.one, child: d.child, company: d.company, title: d.title }, lang),
    date: d.eventDate || iso?.[1] || '',
    time: d.eventTime || (iso?.[2] && iso[2] !== '00:00' ? iso[2] : ''),
    location: main ? [main.name, main.address].filter(Boolean).join(', ') : '',
    lang,
  }
}

// ---------------------------------------------------------------------------
// The design's look, read off the trigger and the page around it
// ---------------------------------------------------------------------------
const rgb = (c) => (/rgba?\(([^)]+)\)/.exec(c || '')?.[1].split(',').map((x) => parseFloat(x)) || null)
const opaque = (c) => { const v = rgb(c); return v && (v[3] === undefined || v[3] > 0.6) ? v : null }
const lum = ([r, g, b]) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
const css = (v) => `rgb(${v[0]}, ${v[1]}, ${v[2]})`

function lookOf(el) {
  if (!el || typeof getComputedStyle === 'undefined') return {}
  const s = getComputedStyle(el)
  // the page colour behind the button (else the design's paper is a photo: white)
  let paper = null
  for (let p = el.parentElement; p && !paper; p = p.parentElement) paper = opaque(getComputedStyle(p).backgroundColor)
  paper = paper || [255, 255, 255]
  const dark = lum(paper) < 0.2
  const ink = dark ? [245, 240, 232] : [33, 28, 30]
  const own = opaque(s.backgroundColor)
  let accent = own || rgb(s.color) || ink
  if (contrast(accent, paper) < 2.2) accent = ink
  const onAccent = contrast([255, 255, 255], accent) >= contrast([20, 16, 18], accent) ? [255, 255, 255] : [20, 16, 18]
  return {
    '--atc-font': s.fontFamily,
    '--atc-paper': css(paper),
    '--atc-ink': css(ink),
    '--atc-accent': css(accent),
    '--atc-on': css(onAccent),
  }
}

function Sheet({ ev, look, lang, onClose }) {
  const t = TEXT[lang]
  const first = useRef(null)
  // the parent may re-render every second (a countdown) — focus once
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    first.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') closeRef.current() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  const google = googleCalendarUrl(ev)
  const ics = icsUrl(ev)
  const when = ev.date ? `${ev.date.split('-').reverse().join('.')}${ev.time ? ` · ${ev.time}` : ''}` : ''
  const inApp = inAppBrowser()
  // Android: the same page in Chrome (an intent: link the in-app browsers hand over)
  const chrome = inApp && isAndroid()
    ? `intent://${location.host}${location.pathname}#Intent;scheme=${location.protocol.replace(':', '')};package=com.android.chrome;end`
    : null
  return (
    <div className="atc-backdrop" onClick={onClose} style={look}>
      <div className="atc-sheet" role="dialog" aria-modal="true" aria-label={t.add} lang={lang} onClick={(e) => e.stopPropagation()}>
        <p className="atc-eyebrow">{t.add}</p>
        <p className="atc-title">{ev.title}</p>
        {when && <p className="atc-when">{when}{ev.location ? ` · ${ev.location}` : ''}</p>}
        <div className="atc-opts">
          {google && (
            <a ref={first} className="atc-opt atc-opt--main" href={google} target="_blank" rel="noopener noreferrer" onClick={() => setTimeout(onClose, 300)}>
              {t.google}
            </a>
          )}
          <a className="atc-opt" href={ics} onClick={() => setTimeout(onClose, 600)}>
            {t.apple} <small>{t.appleSub}</small>
          </a>
        </div>
        <p className="atc-note">{t.reminder}</p>
        {inApp && (
          <p className="atc-hint">
            {t.inApp}
            {chrome && <> <a href={chrome}>{t.openChrome}</a></>}
          </p>
        )}
        <button type="button" className="atc-close" onClick={onClose}>{t.close}</button>
      </div>
    </div>
  )
}

export default function AddToCalendar({ slug, kind, event: over, as = 'a', className, style, children }) {
  const { data, editing } = useInvitationContent()
  const on = useFeature('calendar')
  const [open, setOpen] = useState(null)
  const trigger = useRef(null)
  const lang = calLang(data?.lang)
  if (!on) return null

  const close = () => { setOpen(null); trigger.current?.focus?.() }
  const onClick = async (e) => {
    // while editing, a tap edits the label instead
    if (editing) return
    e.preventDefault()
    const base = await eventFromContent(slug, data, kind)
    // the design's own choices win where it gives one (empty ones don't count)
    const own = Object.fromEntries(Object.entries(over || {}).filter(([, v]) => typeof v === 'string' && v.trim()))
    const ev = { ...base, ...own, url: `${location.origin}${location.pathname}` }
    if (!ev.date) return
    setOpen({ ev, look: lookOf(trigger.current) })
  }
  const Tag = as === 'button' ? 'button' : 'a'
  const props = as === 'button' ? { type: 'button' } : { href: '#calendar', role: 'button' }
  return (
    <>
      <Tag ref={trigger} {...props} className={className} style={style} onClick={onClick} aria-haspopup="dialog">
        {children || TEXT[lang].add}
      </Tag>
      {open && createPortal(<Sheet ev={open.ev} look={open.look} lang={lang} onClose={close} />, document.body)}
    </>
  )
}
