import { useEffect, useRef, useState } from 'react'
import './wd-noir-lite.css'
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
import { caps, formatEventDate } from '../wd-noir/lib/date'
import AddToCalendar from '../shared/AddToCalendar'
import { LiveStep, useLiveSchedule } from '../shared/LiveSchedule'
import RsvpExtra from '../shared/RsvpExtra'
import WishForm, { useWishBook, useWishWords } from '../shared/WishForm'

// Same type as wd-noir.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Noto+Serif+Armenian:wght@200;300;400;500&display=swap'

// "Էդգար & Ալիսա" — wd-noir-lite. One photograph stays still behind the
// page; the cover is the photo itself, then the invitation scrolls over it
// in dark translucent panels with the photo showing between them.
export default function WdNoirLiteInvitation() {
  const { data, editing } = useInvitationContent()
  useDesignFonts('wnl-fonts', FONTS_HREF)
  return (
    <div className={`wnl${editing ? ' editing' : ''}`}>
      {/* the still photograph: a fixed layer (iOS ignores background-attachment: fixed) */}
      <div className="bg" aria-hidden="true">
        {data.background && <img src={data.background} alt="" decoding="async" />}
      </div>
      <main className="col">
        <Section id="couple"><Cover /></Section>
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="venue"><Venue /></Section>
        {/* only where the couple ordered seating — renders nothing otherwise */}
        <Seating />
        <Section id="schedule"><Program /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        {/* only where the couple ordered the wishes book */}
        <WishBook />
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="wd-noir-lite" className="wnl-credit" />
      </main>
    </div>
  )
}

// A panel over the photo. Gets `.in` once it scrolls into view.
function Panel({ className = '', label, children }) {
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
  return <section ref={ref} className={`panel ${className}`} aria-label={label}>{children}</section>
}

function Caps({ path, as: Tag = 'span', className }) {
  const { data, editing } = useInvitationContent()
  if (editing) return <Editable as={Tag} path={path} className={className} />
  return <Tag className={className}>{caps(getByPath(data, path))}</Tag>
}

function Heading({ path }) {
  return <Caps as="h2" path={path} className="hd" />
}

function Names({ as: Tag = 'p', className = 'names' }) {
  return (
    <Tag className={className}>
      <Editable path="couple.first" />
      <span className="amp" aria-hidden="true">&amp;</span>
      <span className="sr-only"> և </span>
      <Editable path="couple.second" />
    </Tag>
  )
}

function Cover() {
  const { data, editing } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <header className="cover">
      <div className="cover-c">
        <Caps as="p" path="kicker" className="kick" />
        <Names as="h1" className="names big" />
        <p className="date"><Editable path="eventDate" type="date" format={() => d.numeric} /></p>
      </div>
      <span className="cue" aria-hidden="true" />
      {/* the photo is changed here, on the first screen; the image itself is the fixed layer */}
      {editing && <EditablePhoto path="background" className="bg-edit" imgClassName="bg-edit-img" />}
    </header>
  )
}

function Welcome() {
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Panel label="Հրավեր">
      <Section id="greeting">
        <p className="greet"><GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting></p>
      </Section>
      <Section id="message"><Editable as="p" path="message" className="body" /></Section>
    </Panel>
  )
}

function useCountdown(iso) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])
  const target = new Date(iso).getTime()
  if (Number.isNaN(target)) return null
  const left = Math.max(0, target - now)
  return [Math.floor(left / 864e5), Math.floor(left / 36e5) % 24, Math.floor(left / 6e4) % 60]
}

function Countdown() {
  const { data, editing } = useInvitationContent()
  const c = useCountdown(data.eventDate)
  const d = formatEventDate(data.eventDate)
  const last = data.places[data.places.length - 1] || {}
  if (!c) return null
  return (
    <Panel label="Հետհաշվարկ">
      <Caps as="p" path="countdownTitle" className="kick" />
      <div className="cd" role="timer" aria-live="off">
        {c.map((v, i) => <span key={i}><b>{v}</b><small>{['օր', 'ժամ', 'րոպե'][i]}</small></span>)}
      </div>
      <p className="wd">{d.weekday}, {d.long}, ժամը {d.time}</p>
      <AddToCalendar slug="wd-noir-lite" event={{ location: [last.name, last.address].filter(Boolean).join(', ') }} className="btn-line"><Editable path="calendarButton" /></AddToCalendar>
    </Panel>
  )
}

const mapUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || '')}`

function Venue() {
  const { data, editing } = useInvitationContent()
  return (
    <Panel label="Վայրերը">
      <Heading path="venueTitle" />
      <ol className="places">
        {data.places.map((p, i) => (
          <li key={i} className="place">
            <p className="pl-meta"><Caps path={`places.${i}.label`} /> · <Editable path={`places.${i}.time`} /></p>
            <Editable as="h3" path={`places.${i}.name`} />
            <Editable as="p" path={`places.${i}.address`} className="addr" />
            <a className="pl-link" href={editing ? undefined : mapUrl(p.address || [p.name, p.address].filter(Boolean).join(', '))} target="_blank" rel="noopener noreferrer">
              <Editable path="mapButton" /> →
            </a>
            <RowRemove list="places" index={i} />
          </li>
        ))}
      </ol>
      <RowAdd list="places" />
    </Panel>
  )
}

function Seating() {
  const f = useSeatFinder()
  if (!f.on) return null
  return (
    <Panel className="seat" label={f.t.title}>
      <div tabIndex={f.result ? -1 : undefined} data-seat-return>
        <h2 className="hd">{caps(f.t.title)}</h2>
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
    </Panel>
  )
}

function Program() {
  const { data } = useInvitationContent()
  const live = useLiveSchedule()
  return (
    <Panel label="Օրվա ծրագիրը">
      <Heading path="scheduleTitle" />
      <ol className="plist">
        {data.schedule.map((_, i) => (
          <li key={i} className={live.cls(i)}>
            <Editable as="time" path={`schedule.${i}.time`} />
            <Editable as="p" path={`schedule.${i}.label`} />
            <LiveStep live={live} i={i} />
            <RowRemove list="schedule" index={i} />
          </li>
        ))}
      </ol>
      <RowAdd list="schedule" />
    </Panel>
  )
}

function DressCode() {
  return (
    <Panel label="Դրես-կոդ">
      <Heading path="dressCode.title" />
      <Editable as="p" path="dressCode.text" className="body" />
    </Panel>
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
    const f = e.target.elements
    const name = f.n.value.trim()
    setErr(!name)
    if (!name) { nameRef.current?.focus(); return }
    const idx = yes ? Math.max(0, f.g.selectedIndex) : 0
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: idx, note: yes ? `Հյուրեր՝ ${rsvp.guestOptions[idx]}` : '' })
    setThanks(fillName(yes ? rsvp.thanksYes : rsvp.thanksNo, name.split(/\s+/)[0]))
  }

  return (
    <Panel label="Ներկայության հաստատում">
      <Heading path="rsvp.title" />
      <Editable as="p" path="rsvp.intro" className="body" />
      {thanks ? (
        <p className="thanks" role="status">{thanks}</p>
      ) : (
        <form className="form" noValidate onSubmit={submit}>
          <label className="field">
            <span className="lbl"><Editable path="rsvp.nameLabel" /></span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required defaultValue={guestName || ''}
              aria-invalid={err || undefined} aria-describedby={err ? 'wnl-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="wnl-err" className="err">{rsvp.nameError}</span>}
          </label>
          <div className="choice" role="radiogroup" aria-label="Ձեր պատասխանը">
            <label className={yes ? 'on' : ''}><input type="radio" name="a" checked={yes} onChange={() => setYes(true)} /><Editable path="rsvp.yes" /></label>
            <label className={!yes ? 'on' : ''}><input type="radio" name="a" checked={!yes} onChange={() => setYes(false)} /><Editable path="rsvp.no" /></label>
          </div>
          {yes && (
            <label className="field">
              <span className="lbl"><Editable path="rsvp.guestsLabel" /></span>
              <select name="g">{rsvp.guestOptions.map((o) => <option key={o}>{o}</option>)}</select>
            </label>
          )}
          <RsvpExtra />
          <button className="btn-gold" type="submit"><Editable path="rsvp.button" /></button>
        </form>
      )}
    </Panel>
  )
}

// ---------- «Թողեք մաղթանք» (only on invitations with the wishes book) ----------
// Guests write a wish for the couple (shared/WishForm.jsx); nobody but the
// couple ever reads them. Nothing renders without the book.
function WishBook() {
  const on = useWishBook()
  const t = useWishWords()
  if (!on) return null
  return (
    <Panel className="wish" label={t.title}>
      <h2 className="hd">{caps(t.title)}</h2>
      <div className="wish-in r" style={{ '--i': 2 }}>
        <WishForm btnClass="btn-gold" bodyClass="body" />
      </div>
    </Panel>
  )
}

function Closing() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <footer className="closing">
      <Editable as="p" path="closing.line" className="cl" />
      <Names />
      <p className="date">{d.numeric}</p>
    </footer>
  )
}
