import { useEffect, useRef, useState } from 'react'
import './bd-planet.css'
import Editable from '../shared/Editable'
import { RowAdd, RowRemove } from '../shared/ListEdit'
import GuestGreeting, { fillName } from '../shared/GuestGreeting'
import Section, { useSectionHidden } from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { formatEventDate } from './lib/date'
import picture from './assets/planet.webp'
import SiloonaCredit from '../shared/SiloonaCredit'
import AddToCalendar from '../shared/AddToCalendar'

const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Hand-drawn bits: a wobble filter that makes clean SVG strokes look
// pencil-drawn, a five-point star and the underline squiggle.
const DEFS = `<defs>
  <filter id="bpl-wobble"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="2.6"/></filter>
  <symbol id="bpl-star" viewBox="0 0 24 24"><path d="M12 2.5l2.7 6.1 6.6.6-5 4.4 1.5 6.5L12 16.7l-5.8 3.4 1.5-6.5-5-4.4 6.6-.6z" fill="#f1c552" stroke="#3b3632" stroke-width="1.1" stroke-linejoin="round" filter="url(#bpl-wobble)"/></symbol>
</defs>`

// The drawing's own stars (in % of the picture), each given a twinkle.
const GLINTS = [[40.3, 10.1], [71.3, 10.8], [14.3, 26.6], [28.5, 32], [78.8, 38.2], [20.4, 47.6]]

// Each section reveals its `.r` children (staggered by --i) once in view.
function Sec({ className = '', children, label }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect() }
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <section ref={ref} className={`sec ${className}`} aria-label={label}>{children}</section>
}

const Star = ({ className = '', style }) => <svg className={`star ${className}`} style={style} aria-hidden="true"><use href="#bpl-star" /></svg>

function Heading({ path, i = 0 }) {
  return (
    <div className="hd r" style={{ '--i': i }}>
      <h2><Editable path={path} /></h2>
      <svg className="squig" viewBox="0 0 120 12" aria-hidden="true"><path pathLength="1" d="M3 7c10-6 18 4 28-1s17-5 27 0 18 4 28-1 18-4 31 1" /></svg>
    </div>
  )
}

// The age as a little ringed planet, like the one in the drawing.
function AgePlanet() {
  return (
    <div className="planet r" style={{ '--i': 2 }}>
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <g filter="url(#bpl-wobble)" stroke="#3b3632" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path d="M14 100A86 22 0 0 1 186 100" transform="rotate(-16 100 100)" />
          <circle cx="100" cy="100" r="58" fill="#f2c75a" />
          <path d="M62 72c14-10 30-14 46-12M58 118c10 14 30 22 52 18" stroke="#d9a73c" strokeWidth="2" opacity=".8" />
          <path d="M14 100A86 22 0 0 0 186 100" transform="rotate(-16 100 100)" />
        </g>
      </svg>
      <span className="age"><Editable path="child.age" /></span>
    </div>
  )
}

// The picture: the drawn stars twinkle; a tap (and every so often, by
// itself) sends a shooting star across the sky.
function Picture() {
  const { editing } = useInvitationContent()
  const [shots, setShots] = useState([])
  const fire = () => {
    if (calm()) return
    const id = Date.now() + Math.random()
    setShots((s) => [...s, { id, top: 6 + Math.random() * 22, left: Math.random() * 30 }])
    setTimeout(() => setShots((s) => s.filter((x) => x.id !== id)), 1600)
  }
  useEffect(() => {
    if (editing || calm()) return
    const t = setInterval(fire, 9000)
    const first = setTimeout(fire, 2600)
    return () => { clearInterval(t); clearTimeout(first) }
  }, [editing])
  return (
    <div className="pic r" style={{ '--i': 3 }} onClick={editing ? undefined : fire}>
      <img src={picture} alt="" width="720" height="740" decoding="async" fetchpriority="high" />
      {GLINTS.map(([x, y], i) => <i key={i} className="glint" style={{ left: `${x}%`, top: `${y}%`, '--d': `${i * 0.7}s` }} />)}
      {shots.map((s) => <b key={s.id} className="shoot" style={{ top: `${s.top}%`, left: `${s.left}%` }} />)}
    </div>
  )
}

function Hero() {
  return (
    <Sec className="hero in" label="Հրավեր">
      <p className="kicker r" style={{ '--i': 0 }}><Editable path="hero.kicker" /></p>
      <h1 className="title r" style={{ '--i': 1 }}><Editable path="hero.title" /></h1>
      <AgePlanet />
      <Picture />
      <p className="when r" style={{ '--i': 4 }}>
        <Editable path="eventDate" type="date" format={(iso) => formatEventDate(iso).long} />
      </p>
      <p className="hint r" style={{ '--i': 5 }}><Editable path="hero.hint" /></p>
    </Sec>
  )
}

function Welcome() {
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Sec className="welcome">
      <Star className="s1" /><Star className="s2" />
      <Section id="greeting">
        <div className="hd r">
          <h2><GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting></h2>
          <svg className="squig" viewBox="0 0 120 12" aria-hidden="true"><path pathLength="1" d="M3 7c10-6 18 4 28-1s17-5 27 0 18 4 28-1 18-4 31 1" /></svg>
        </div>
      </Section>
      <Section id="message"><p className="body r" style={{ '--i': 1 }}><Editable path="message" /></p></Section>
    </Sec>
  )
}

function Countdown() {
  const { data } = useInvitationContent()
  const target = formatEventDate(data.eventDate).date.getTime()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const s = Math.max(0, Math.floor((target - now) / 1000))
  const pad = (n) => String(n).padStart(2, '0')
  const units = [[Math.floor(s / 86400), 'օր'], [pad(Math.floor((s % 86400) / 3600)), 'ժամ'], [pad(Math.floor((s % 3600) / 60)), 'րոպե'], [pad(s % 60), 'վայրկ.']]
  return (
    <Sec className="count">
      <Heading path="countdownTitle" />
      <div className="cd r" style={{ '--i': 1 }} aria-live="off">
        {units.map(([v, l], i) => <div key={l} style={{ '--k': i }}><b>{v}</b><span>{l}</span></div>)}
      </div>
      <div className="r" style={{ '--i': 2 }}><AddToCalendar slug="bd-planet" className="btn" /></div>
    </Sec>
  )
}

function Program() {
  const { data } = useInvitationContent()
  return (
    <Sec className="prog">
      <Heading path="scheduleTitle" />
      <ol className="orbit">
        {data.schedule.map((_, i) => (
          <li key={i} className="r" style={{ '--i': i + 1 }}>
            <Star className="dot" />
            <Editable as="time" path={`schedule.${i}.time`} />
            <Editable path={`schedule.${i}.label`} />
            <RowRemove list="schedule" index={i} />
          </li>
        ))}
      </ol>
      <RowAdd list="schedule" />
    </Sec>
  )
}

function Venue() {
  const { data, editing } = useInvitationContent()
  const { venue } = data
  const q = encodeURIComponent([venue.name, venue.address].filter(Boolean).join(', '))
  return (
    <Sec className="venue">
      <Heading path="venue.title" />
      <Editable as="h3" className="r" path="venue.name" style={{ '--i': 1 }} />
      <Editable as="p" className="addr r" path="venue.address" style={{ '--i': 2 }} />
      <div className="r" style={{ '--i': 3 }}>
        <a
          className="btn" target="_blank" rel="noopener noreferrer"
          href={`https://www.google.com/maps/search/?api=1&query=${q}`}
          onClick={editing ? (e) => e.preventDefault() : undefined}
        >
          <Editable path="venue.button" />
        </a>
      </div>
    </Sec>
  )
}

// Name, yes / no, party size (yes only). Guest count is everyone coming
// (companions = index of the chosen option).
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
    <Sec className="rsvp">
      <Heading path="rsvp.title" />
      <p className="body r" style={{ '--i': 1 }}><Editable path="rsvp.intro" /></p>
      {thanks ? (
        <div className="thanks" role="status"><Star className="t1" /><Star className="t2" /><Star className="t3" /><p>{thanks}</p></div>
      ) : (
        <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
          <label className="field">
            <span>Ձեր անունը</span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" defaultValue={guestName || ''} required
              aria-invalid={err || undefined} aria-describedby={err ? 'bpl-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="bpl-err" className="err">{rsvp.nameError}</span>}
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
          <button className="btn send" type="submit"><Editable path="rsvp.button" /></button>
        </form>
      )}
    </Sec>
  )
}

function Closing() {
  return (
    <Sec className="closing">
      <svg className="moon r" viewBox="0 0 60 60" aria-hidden="true">
        <path filter="url(#bpl-wobble)" d="M38 6a24 24 0 1 0 16 38A20 20 0 1 1 38 6z" fill="#f1c552" stroke="#3b3632" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <p className="line r" style={{ '--i': 1 }}><Editable path="closing.line" /></p>
      <p className="sig r" style={{ '--i': 2 }}><Editable path="closing.signature" /></p>
    </Sec>
  )
}

// «Արսենի 5 տարեկանը» — a hand-drawn storybook birthday: a boy, a fox
// and a rose on a little planet, the age as a ringed planet of its own.
export default function BdPlanetInvitation() {
  const { editing } = useInvitationContent()
  return (
    <div className={`bpl${editing ? ' editing' : ''}`}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: DEFS }} />
      <main className="page">
        <Hero />
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="bd-planet" />
      </main>
    </div>
  )
}
