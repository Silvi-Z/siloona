import { useEffect, useRef, useState } from 'react'
import './bd-balloons.css'
import Editable from '../shared/Editable'
import GuestGreeting, { fillName } from '../shared/GuestGreeting'
import Section, { useSectionHidden } from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { formatEventDate } from './lib/date'
import pooh from './assets/pooh.webp'
import piglet from './assets/piglet.webp'
import eeyore from './assets/eeyore.webp'
import tigger from './assets/tigger.webp'

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

// A character on its balloon: floats by itself, wiggles when tapped.
// Sized and placed in % of the page width so it is never cropped.
function Buddy({ src, w, h, className }) {
  const [boing, setBoing] = useState(0)
  return (
    <div className={`buddy ${className}`} aria-hidden="true" onPointerDown={() => setBoing((n) => n + 1)}>
      <img key={boing} className={boing ? 'boing' : ''} src={src} alt="" width={w} height={h} decoding="async" draggable="false" />
    </div>
  )
}

// A drawn balloon (watercolour fill, pencil outline) holding a number.
function Balloon({ children, tone = 'blue', className = '' }) {
  return (
    <div className={`balloon ${tone} ${className}`}>
      <svg viewBox="0 0 100 150" aria-hidden="true">
        <path className="str" d="M50 108c-6 10 6 18 0 28s4 10 2 14" />
        <path className="body" d="M50 6C25 6 9 27 9 52c0 27 23 49 41 53 18-4 41-26 41-53C91 27 75 6 50 6z" />
        <path className="knot" d="M45 104l5 6 5-6z" />
        <ellipse className="shine" cx="33" cy="32" rx="7" ry="12" transform="rotate(24 33 32)" />
      </svg>
      <span>{children}</span>
    </div>
  )
}

function Heading({ path, i = 0, children }) {
  return (
    <div className="hd r" style={{ '--i': i }}>
      <h2>{children ?? <Editable path={path} />}</h2>
      <svg className="squig" viewBox="0 0 120 12" aria-hidden="true"><path pathLength="1" d="M3 7c10-6 18 4 28-1s17-5 27 0 18 4 28-1 18-4 31 1" /></svg>
    </div>
  )
}

function Hero() {
  return (
    <Sec className="hero" label="Հրավեր">
      <Buddy className="pooh" src={pooh} w={445} h={990} />
      <Buddy className="piglet" src={piglet} w={255} h={565} />
      <Buddy className="eeyore" src={eeyore} w={365} h={990} />
      <div className="htxt">
        <p className="kicker r" style={{ '--i': 0 }}><Editable path="hero.kicker" /></p>
        <h1 className="title r" style={{ '--i': 1 }}><Editable path="hero.title" /></h1>
        <div className="r" style={{ '--i': 2 }}><Balloon className="age"><Editable path="child.age" /></Balloon></div>
        <p className="when r" style={{ '--i': 3 }}>
          <Editable path="eventDate" type="date" format={(iso) => formatEventDate(iso).long} />
        </p>
        <p className="hint r" style={{ '--i': 4 }}><Editable path="hero.hint" /></p>
      </div>
    </Sec>
  )
}

function Welcome() {
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Sec className="welcome">
      <Section id="greeting">
        <Heading><GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting></Heading>
      </Section>
      <Section id="message"><p className="body r" style={{ '--i': 1 }}><Editable path="message" /></p></Section>
    </Sec>
  )
}

const TONES = ['blue', 'honey', 'pink', 'blue']

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
        {units.map(([v, l], i) => (
          <div key={l} style={{ '--k': i }}>
            <Balloon tone={TONES[i]}>{v}</Balloon>
            <small>{l}</small>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function Program() {
  const { data } = useInvitationContent()
  return (
    <Sec className="prog">
      <Heading path="scheduleTitle" />
      <ol>
        {data.schedule.map((_, i) => (
          <li key={i} className="r" style={{ '--i': i + 1 }}>
            <Editable as="time" path={`schedule.${i}.time`} />
            <Editable path={`schedule.${i}.label`} />
          </li>
        ))}
      </ol>
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
  const { data, editing, onRsvp } = useInvitationContent()
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
        <div className="thanks" role="status">
          <Balloon tone="honey" className="b1" /><Balloon tone="pink" className="b2" /><Balloon className="b3" />
          <p>{thanks}</p>
        </div>
      ) : (
        <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
          <label className="field">
            <span>Ձեր անունը</span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required
              aria-invalid={err || undefined} aria-describedby={err ? 'bbl-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="bbl-err" className="err">{rsvp.nameError}</span>}
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
      <Buddy className="tigger" src={tigger} w={280} h={1043} />
      <p className="line r"><Editable path="closing.line" /></p>
      <p className="sig r" style={{ '--i': 1 }}><Editable path="closing.signature" /></p>
    </Sec>
  )
}

// «Լեոնի 3 տարեկանը» — storybook friends floating on soft blue
// balloons over a pale sky; the age is a balloon of its own.
export default function BdBalloonsInvitation() {
  const { editing } = useInvitationContent()
  return (
    <div className={`bbl${editing ? ' editing' : ''}`}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="bbl-wobble"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="5" /><feDisplacementMap in="SourceGraphic" scale="2.2" /></filter>
      </svg>
      <main className="page">
        <Hero />
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
      </main>
    </div>
  )
}
