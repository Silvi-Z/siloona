import { useEffect, useRef, useState } from 'react'
import './ce-sparkle.css'
// the seat dialog's look (.wnr-seat) is wd-noir's
import '../wd-noir/wd-noir.css'
import Editable from '../shared/Editable'
import EditablePhoto from '../shared/EditablePhoto'
import { RowAdd, RowRemove } from '../shared/ListEdit'
import GuestGreeting, { fillName } from '../shared/GuestGreeting'
import Section, { useSectionHidden } from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { getByPath } from '../shared/pathUtils'
import { SeatDialog, SeatForm, useSeatFinder } from '../shared/Seating'
import SiloonaCredit from '../shared/SiloonaCredit'
import { calendarUrl, caps, formatEventDate } from '../wd-noir/lib/date'

// Great Vibes for the handwritten Latin line, Cormorant Garamond for the
// wide word and the figures, Noto Serif Armenian for every Armenian letter.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:wght@300;400;500&family=Noto+Serif+Armenian:wght@200;300;400;500&display=swap'

// Little lights that come and go over the photograph (fixed positions so
// every visit looks the same).
const TWINKLES = [
  [8, 12, 0], [86, 9, 1.2], [70, 22, 2.1], [18, 34, .6], [92, 41, 2.8], [6, 58, 1.7],
  [78, 63, .3], [30, 76, 2.4], [62, 84, 1.1], [12, 90, 3.1], [48, 6, 1.9], [95, 78, .9],
]

// The New Year party layout, shared by the designs built on it (ce-sparkle,
// ce-cozy): each brings its own photo and texts (data.js) and its own
// colours as a modifier class on .csp (`variant`, styled in its own CSS).
export function NewYearParty({ design, variant = '', twinkles = true }) {
  const { data, editing } = useInvitationContent()
  useDesignFonts('csp-fonts', FONTS_HREF)
  return (
    <div className={`csp${variant ? ` ${variant}` : ''}${editing ? ' editing' : ''}`}>
      <div className="bg" aria-hidden="true">
        {data.background && <img src={data.background} alt="" decoding="async" />}
        {twinkles && TWINKLES.map(([x, y, d], i) => <i key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />)}
      </div>
      <main className="col">
        <Section id="cover"><Cover /></Section>
        <Welcome />
        <Section id="venue"><DateVenue /></Section>
        {/* only where seating was ordered — renders nothing otherwise */}
        <Seating />
        <Section id="schedule"><Program /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design={design} className="csp-credit" />
      </main>
    </div>
  )
}

// "Կայծերի երեկո" — ce-sparkle. Sparklers on a midnight-blue night.
export default function CeSparkleInvitation() {
  return <NewYearParty design="ce-sparkle" />
}

// A part of the page that rises in once it scrolls into view.
function Part({ className = '', label, children }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return undefined }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect() }
    }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <section ref={ref} className={`part ${className}`} aria-label={label}>{children}</section>
}

// A small eight-pointed spark, drawn.
function Spark({ className = 'spark' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M20 0 L22.4 17.6 L40 20 L22.4 22.4 L20 40 L17.6 22.4 L0 20 L17.6 17.6 Z" />
      <path d="M20 8 L21.2 18.8 L32 20 L21.2 21.2 L20 32 L18.8 21.2 L8 20 L18.8 18.8 Z" transform="rotate(45 20 20)" opacity=".6" />
    </svg>
  )
}

// Spaced capitals made in JS (CSS uppercase turns «և» into «ԵՒ»).
function Caps({ path, as: Tag = 'span', className }) {
  const { data, editing } = useInvitationContent()
  if (editing) return <Editable as={Tag} path={path} className={className} />
  return <Tag className={className}>{caps(getByPath(data, path))}</Tag>
}

function Heading({ path }) {
  return (
    <div className="hd">
      <Spark className="spark sm" />
      <Editable as="h2" path={path} />
    </div>
  )
}

function Cover() {
  const { data, editing } = useInvitationContent()
  return (
    <header className="cover">
      <div className="cover-c">
        <Caps as="p" path="company" className="company" />
        <p className="script"><Editable path="cover.script" /></p>
        <p className="word"><Editable path="cover.word" /></p>
        <p className="year"><Editable path="cover.year" /></p>
      </div>
      <span className="cue" aria-hidden="true" />
      {/* the photo is changed here; the image itself is the fixed layer */}
      {editing && <EditablePhoto path="background" className="bg-edit" imgClassName="bg-edit-img" />}
    </header>
  )
}

function Welcome() {
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Part className="welcome" label="Հրավեր">
      <Section id="greeting">
        <p className="greet"><GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting></p>
      </Section>
      <Section id="message"><Editable as="p" path="message" className="body" /></Section>
    </Part>
  )
}

const mapUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || '')}`
const pad = (n) => String(n).padStart(2, '0')

// The date inside a gold ring that draws itself, a spark on top.
function DateVenue() {
  const { data, editing } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const dd = `${pad(d.date.getDate())}.${pad(d.date.getMonth() + 1)}`
  const q = [data.venue.name, data.venue.address].filter(Boolean).join(', ')
  const cal = calendarUrl({ title: data.company || caps(data.cover.word), iso: data.eventDate, hours: 5, location: q })
  return (
    <Part className="when" label="Ամսաթիվ և վայր">
      <div className="ring">
        <svg className="ring-art" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
          <circle cx="100" cy="100" r="92" pathLength="1" />
          <circle cx="100" cy="100" r="84" className="thin" />
        </svg>
        <Spark className="spark top" />
        <div className="ring-c">
          <p className="dd"><Editable path="eventDate" type="date" format={() => dd} /></p>
          <p className="yy">{d.date.getFullYear()}</p>
          <p className="wt">{d.weekday} · {d.time}</p>
        </div>
      </div>
      <Editable as="h3" path="venue.name" className="vname" />
      <Editable as="p" path="venue.address" className="addr" />
      <div className="links">
        <a className="btn-line" href={editing ? undefined : mapUrl(data.venue.address || q)} target="_blank" rel="noopener noreferrer"><Editable path="mapButton" /></a>
        {cal && <a className="btn-line" href={editing ? undefined : cal} target="_blank" rel="noopener noreferrer"><Editable path="calendarButton" /></a>}
      </div>
    </Part>
  )
}

function Seating() {
  const f = useSeatFinder()
  if (!f.on) return null
  return (
    <Part className="seat" label={f.t.title}>
      <div tabIndex={f.result ? -1 : undefined} data-seat-return>
        <div className="hd"><Spark className="spark sm" /><h2>{f.t.title}</h2></div>
        {!f.revealed ? (
          <p className="body">{f.soon}</p>
        ) : f.result ? (
          <div role="status">
            <p className={`seat-table${f.result.table.length > 3 ? ' long' : ''}`}>{f.result.table}</p>
            <button type="button" className="seat-again" onClick={f.another}>{f.t.other}</button>
          </div>
        ) : (
          <>
            <p className="body">{f.t.teaser}</p>
            <button type="button" className="btn-gold" onClick={f.open} aria-haspopup="dialog">{f.t.button}</button>
          </>
        )}
      </div>
      <SeatDialog finder={f} className="wnr-seat">
        {(titleId) => <SeatForm finder={f} titleId={titleId} title={caps(f.t.title)} />}
      </SeatDialog>
    </Part>
  )
}

function Program() {
  const { data } = useInvitationContent()
  return (
    <Part label="Ծրագիր">
      <Heading path="scheduleTitle" />
      <ol className="plist">
        {data.schedule.map((_, i) => (
          <li key={i}>
            <Editable as="time" path={`schedule.${i}.time`} />
            <Editable as="p" path={`schedule.${i}.label`} />
            <RowRemove list="schedule" index={i} />
          </li>
        ))}
      </ol>
      <RowAdd list="schedule" />
    </Part>
  )
}

function Rsvp() {
  const { data, editing, onRsvp, guestName } = useInvitationContent()
  const { rsvp } = data
  const [yes, setYes] = useState(true)
  const [err, setErr] = useState(false)
  const [thanks, setThanks] = useState('')
  const nameRef = useRef(null)

  function submit(e) {
    e.preventDefault()
    if (editing) return
    const name = e.target.elements.n.value.trim()
    setErr(!name)
    if (!name) { nameRef.current?.focus(); return }
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: 0, note: '' })
    setThanks(fillName(yes ? rsvp.thanksYes : rsvp.thanksNo, name.split(/\s+/)[0]))
  }

  return (
    <Part label="Ներկայության հաստատում">
      <Heading path="rsvp.title" />
      <Editable as="p" path="rsvp.intro" className="body" />
      {thanks ? (
        <p className="thanks" role="status">{thanks}</p>
      ) : (
        <form className="form" noValidate onSubmit={submit}>
          <div className="choice" role="radiogroup" aria-label="Ձեր պատասխանը">
            <label className={yes ? 'on' : ''}><input type="radio" name="a" checked={yes} onChange={() => setYes(true)} /><Editable path="rsvp.yes" /></label>
            <label className={!yes ? 'on' : ''}><input type="radio" name="a" checked={!yes} onChange={() => setYes(false)} /><Editable path="rsvp.no" /></label>
          </div>
          <label className="field">
            <span className="lbl"><Editable path="rsvp.nameLabel" /></span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required defaultValue={guestName || ''}
              aria-invalid={err || undefined} aria-describedby={err ? 'csp-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="csp-err" className="err">{rsvp.nameError}</span>}
          </label>
          <button className="btn-gold" type="submit"><Editable path="rsvp.button" /></button>
        </form>
      )}
    </Part>
  )
}

function Closing() {
  return (
    <footer className="closing">
      <Spark className="spark big" />
      <Editable as="p" path="closing.line" className="cl" />
      <Caps as="p" path="company" className="sig" />
    </footer>
  )
}
