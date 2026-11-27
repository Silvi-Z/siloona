import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { formatEventDate } from '../lib/date'
import cloudA from '../assets/cloud-a.webp'
import cloudB from '../assets/cloud-b.webp'
import cloudC from '../assets/cloud-c.webp'
import cloudD from '../assets/cloud-d.webp'
import hat from '../assets/hat.webp'
import hammer from '../assets/hammer.webp'
import vest from '../assets/vest.webp' // cover only: it is cut by the artwork's right edge
import cone from '../assets/cone.webp'
import crane from '../assets/crane.webp'
import machines from '../assets/machines.webp'
import AddToCalendar from '../../shared/AddToCalendar'
import { LiveStep, useLiveSchedule } from '../../shared/LiveSchedule'

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

// Every piece of the artwork, cut out, at its place in the 1152 × 2048
// original: [x, y, width, height]. The cover rebuilds the artwork from
// these, so each piece can move on its own (clouds drift, the crane's
// balloons sway).
const ART = {
  'cloud-a': [cloudA, 0, 0, 545, 358],
  hat: [hat, 510, 76, 198, 146],
  hammer: [hammer, 724, 40, 128, 174],
  'cloud-b': [cloudB, 844, 10, 280, 238],
  vest: [vest, 968, 246, 184, 280],
  'cloud-c': [cloudC, 472, 272, 500, 316],
  'cloud-d': [cloudD, 0, 360, 300, 270],
  cone: [cone, 298, 380, 182, 227],
  crane: [crane, 0, 890, 646, 1158],
  machines: [machines, 425, 1516, 716, 532],
}

function Piece({ name, className = '' }) {
  const [src, x, y, w, h] = ART[name]
  return (
    <img
      className={`pc pc-${name} ${className}`} src={src} alt="" aria-hidden="true" decoding="async"
      style={{ '--x': x, '--y': y, '--w': w, '--h': h }}
    />
  )
}

// A single piece used as an illustration in a section.
function Sprite({ name, className = '', i = 0 }) {
  const [hop, setHop] = useState(0)
  return (
    <img
      className={`sp sp-${name} r ${className}${hop ? ' hop' : ''}`} style={{ '--i': i }} src={ART[name][0]} alt="" aria-hidden="true"
      decoding="async" loading="lazy" onClick={() => setHop((n) => n + 1)} onAnimationEnd={() => setHop(0)}
    />
  )
}

function Heading({ path, i = 0 }) {
  return <h2 className="title r" style={{ '--i': i }}><Editable path={path} /></h2>
}

// The cover: the artwork rebuilt piece by piece, the title in the open sky,
// the age as the big felt number between the crane and the excavator, and
// a strip of earth for the machines to stand on.
export function Hero() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <Block className="hero" label="Հրավեր">
      <div className="art">
        {Object.keys(ART).map((n) => <Piece key={n} name={n} />)}
        <div className="htxt">
          <p className="caps r"><Editable path="hero.kicker" /></p>
          <h1 className="htitle r" style={{ '--i': 1 }}><Editable path="hero.title" /></h1>
          <p className="hdate r" style={{ '--i': 2 }}>{d.long}</p>
        </div>
        <p className="age r" style={{ '--i': 3 }}><Editable path="child.age" /></p>
        <svg className="ground" viewBox="0 0 1152 130" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="bbd-wash" x="-5%" y="-30%" width="110%" height="160%">
              <feTurbulence type="fractalNoise" baseFrequency=".02 .08" numOctaves="3" seed="7" />
              <feDisplacementMap in="SourceGraphic" scale="14" />
            </filter>
            <linearGradient id="bbd-earth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d8b885" />
              <stop offset="1" stopColor="#c09a68" />
            </linearGradient>
          </defs>
          <path filter="url(#bbd-wash)" fill="url(#bbd-earth)" d="M-20 40 C 120 18 260 34 400 26 S 700 12 860 28 S 1100 20 1172 34 L 1172 150 L -20 150 Z" />
        </svg>
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
        <Sprite name="hat" />
        <h2 className="title r" style={{ '--i': 1 }}>
          <GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting>
        </h2>
      </Section>
      <Section id="message"><p className="body r" style={{ '--i': 2 }}><Editable path="message" /></p></Section>
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

// The countdown on four diamond site signs, then the calendar link.
export function Countdown() {
  const { data, editing } = useInvitationContent()
  const cd = useCountdown(data.eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  return (
    <Block className="count">
      <Heading path="countdownTitle" />
      {editing && <div className="r" style={{ '--i': 1 }}><Editable path="eventDate" type="date" /></div>}
      {cd && (
        <div className="signs r" style={{ '--i': 1 }} role="timer" aria-live="off">
          <span><i><b>{cd.d}</b>օր</i></span>
          <span><i><b>{pad(cd.h)}</b>ժամ</i></span>
          <span><i><b>{pad(cd.m)}</b>րոպե</i></span>
          <span><i><b>{pad(cd.s)}</b>վրկ</i></span>
        </div>
      )}
      <AddToCalendar slug="bd-build" event={{ location: [data.venue.name, data.venue.address].filter(Boolean).join(', ') }} className="btn r" style={{ '--i': 2 }}>
        Ավելացնել օրացույցում
      </AddToCalendar>
    </Block>
  )
}

export function Program() {
  const { data } = useInvitationContent()
  const live = useLiveSchedule()
  return (
    <Block className="program">
      <Sprite name="hammer" />
      <Heading path="scheduleTitle" i={1} />
      <ol className="tl">
        {data.schedule.map((_, i) => (
          <li key={i} className={live.cls(i, 'r')} style={{ '--i': i + 2 }}>
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
      <img className="drift d-r" src={cloudB} alt="" aria-hidden="true" loading="lazy" />
      <Heading path="venue.title" i={1} />
      <p className="vname r" style={{ '--i': 2 }}><Editable path="venue.name" /></p>
      <p className="vaddr r" style={{ '--i': 3 }}><Editable path="venue.address" /></p>
      <a className="btn r" style={{ '--i': 4 }} href={editing ? undefined : mapUrl(data.venue.address)} target="_blank" rel="noopener noreferrer">
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
      <Sprite name="cone" className="on-card" />
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
                aria-invalid={err || undefined} aria-describedby={err ? 'bbd-err' : undefined}
                onInput={() => err && setErr(false)}
              />
              {err && <span id="bbd-err" className="err">{rsvp.nameError}</span>}
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
            <button className="send" type="submit"><Editable path="rsvp.button" /></button>
          </form>
        )}
      </div>
    </Block>
  )
}

// The end: clouds drift by over the farewell.
export function Closing() {
  return (
    <Block className="closing">
      <img className="drift d-l" src={cloudD} alt="" aria-hidden="true" loading="lazy" />
      <img className="drift d-c" src={cloudC} alt="" aria-hidden="true" loading="lazy" />
      <p className="title r"><Editable path="closing.line" /></p>
      <p className="sig r" style={{ '--i': 1 }}><Editable path="closing.signature" /></p>
    </Block>
  )
}
