import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { formatEventDate } from '../lib/date'
import sceneImg from '../assets/scene.webp'
import racerImg from '../assets/racer.webp'
import towImg from '../assets/tow.webp'
import AddToCalendar from '../../shared/AddToCalendar'
import { LiveStep, useLiveSchedule } from '../../shared/LiveSchedule'
import RsvpExtra from '../../shared/RsvpExtra'

// A page section that gets `.in` once it scrolls into view; its `.r`
// children reveal from that, staggered by --i.
function Block({ className = '', label, children }) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { setSeen(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect() }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <section ref={ref} className={`blk ${className}${seen ? ' in' : ''}`} aria-label={label}>
      {children}
    </section>
  )
}

// A cut-out car from the artwork; tapping it makes it hop.
function Car({ src, className = '', i = 0 }) {
  const [hop, setHop] = useState(0)
  return (
    <img
      className={`car r ${className}${hop ? ' hop' : ''}`} style={{ '--i': i }} src={src} alt="" aria-hidden="true"
      decoding="async" onClick={() => setHop((n) => n + 1)} onAnimationEnd={() => setHop(0)}
    />
  )
}

function Heading({ path, i = 0 }) {
  return <h2 className="title r" style={{ '--i': i }}><Editable path={path} /></h2>
}

// The cover: the title, the age on a race-number plate, the date, then the
// whole party scene parked on a road whose centre line keeps rolling.
export function Hero() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <Block className="hero" label="Հրավեր">
      <span className="sun" aria-hidden="true" />
      <p className="caps r"><Editable path="hero.kicker" /></p>
      <h1 className="htitle r" style={{ '--i': 1 }}><Editable path="hero.title" /></h1>
      <div className="plate r" style={{ '--i': 2 }}>
        <Editable path="child.age" />
      </div>
      <p className="hsub r" style={{ '--i': 3 }}>տարեկան</p>
      <p className="hdate r" style={{ '--i': 4 }}>{d.long}</p>
      <div className="stage">
        <Car src={sceneImg} className="scene" i={5} />
        <div className="road" aria-hidden="true"><i /></div>
      </div>
    </Block>
  )
}

export function Welcome() {
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Block className="welcome">
      <Section id="greeting">
        <h2 className="title r">
          <GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting>
        </h2>
      </Section>
      <Section id="message"><p className="body r" style={{ '--i': 1 }}><Editable path="message" /></p></Section>
    </Block>
  )
}

function useCountdown(iso) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = Math.max(0, new Date(iso).getTime() - now)
  if (Number.isNaN(diff)) return null
  return {
    d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60,
  }
}

// The countdown on a pit board, then the calendar link.
export function Countdown() {
  const { data, editing } = useInvitationContent()
  const cd = useCountdown(data.eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  return (
    <Block className="count">
      <Heading path="countdownTitle" />
      {editing && <div className="r" style={{ '--i': 1 }}><Editable path="eventDate" type="date" /></div>}
      {cd && (
        <div className="board r" style={{ '--i': 1 }} role="timer" aria-live="off">
          <span><b>{cd.d}</b>օր</span>
          <span><b>{pad(cd.h)}</b>ժամ</span>
          <span><b>{pad(cd.m)}</b>րոպե</span>
          <span><b>{pad(cd.s)}</b>վրկ</span>
        </div>
      )}
      <AddToCalendar slug="bd-cars" event={{ location: [data.venue.name, data.venue.address].filter(Boolean).join(', ') }} className="btn r" style={{ '--i': 2 }}>
        Ավելացնել օրացույցում
      </AddToCalendar>
    </Block>
  )
}

// The programme along a road running down the page.
export function Program() {
  const { data } = useInvitationContent()
  const live = useLiveSchedule()
  return (
    <Block className="program">
      <Heading path="scheduleTitle" />
      <ol className="track">
        {data.schedule.map((_, i) => (
          <li key={i} className={live.cls(i, 'r')} style={{ '--i': i + 1 }}>
            <Editable as="time" path={`schedule.${i}.time`} />
            <Editable path={`schedule.${i}.label`} />
            <LiveStep live={live} i={i} />
            <RowRemove list="schedule" index={i} />
          </li>
        ))}
      </ol>
      <RowAdd list="schedule" />
    </Block>
  )
}

const mapUrl = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`

export function Venue() {
  const { data, editing } = useInvitationContent()
  return (
    <Block className="venue">
      <Car src={racerImg} className="racer" />
      <Heading path="venue.title" i={1} />
      <p className="vname r" style={{ '--i': 2 }}><Editable path="venue.name" /></p>
      <p className="vaddr r" style={{ '--i': 3 }}><Editable path="venue.address" /></p>
      <a className="btn red r" style={{ '--i': 4 }} href={editing ? undefined : mapUrl(data.venue.address)} target="_blank" rel="noopener noreferrer">
        <Editable path="venue.button" />
      </a>
    </Block>
  )
}

export function Rsvp() {
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
    <Block className="rsvp">
      <Car src={towImg} className="tow" />
      <div className="card r" style={{ '--i': 1 }}>
        <h2 className="title"><Editable path="rsvp.title" /></h2>
        <p className="body"><Editable path="rsvp.intro" /></p>
        {thanks ? (
          <p className="thanks" role="status">{thanks}</p>
        ) : (
          <form className="form" noValidate onSubmit={submit}>
            <label className="field">
              <span><Editable path="rsvp.nameLabel" /></span>
              <input
                ref={nameRef} type="text" name="n" autoComplete="name" defaultValue={guestName || ''} required
                aria-invalid={err || undefined} aria-describedby={err ? 'bcr-err' : undefined}
                onInput={() => err && setErr(false)}
              />
              {err && <span id="bcr-err" className="err">{rsvp.nameError}</span>}
            </label>
            <div className="choice" role="radiogroup" aria-label="Ձեր պատասխանը">
              <label className={yes ? 'on' : ''}><input type="radio" name="a" checked={yes} onChange={() => setYes(true)} /><Editable path="rsvp.yes" /></label>
              <label className={!yes ? 'on' : ''}><input type="radio" name="a" checked={!yes} onChange={() => setYes(false)} /><Editable path="rsvp.no" /></label>
            </div>
            {yes && (
              <label className="field">
                <span><Editable path="rsvp.guestLabel" /></span>
                <select name="g">{rsvp.guestOptions.map((o) => <option key={o}>{o}</option>)}</select>
              </label>
            )}
            <RsvpExtra />
            <button className="send" type="submit"><Editable path="rsvp.button" /></button>
          </form>
        )}
      </div>
    </Block>
  )
}

// The finish: the farewell, then a checkered finish line along the
// bottom of the sheet.
export function Closing() {
  return (
    <Block className="closing">
      <p className="title r"><Editable path="closing.line" /></p>
      <p className="sig r" style={{ '--i': 1 }}><Editable path="closing.signature" /></p>
      <div className="finish" aria-hidden="true" />
    </Block>
  )
}
