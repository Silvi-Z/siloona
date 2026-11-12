import { useEffect, useId, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { calendarUrl, formatEventDate } from '../lib/date'
import storkImg from '../assets/stork.webp'

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

// A heading with a painted brush stroke under it, blue fading into pink.
function Heading({ path, i = 0 }) {
  const id = `gps-g${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <div className="hd r" style={{ '--i': i }}>
      <h2 className="title"><Editable path={path} /></h2>
      <svg className="stroke" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={id}><stop offset="0" stopColor="#9cc0de" /><stop offset="1" stopColor="#e597ab" /></linearGradient>
        </defs>
        <path d="M3 9 C 40 3, 80 11, 120 6 S 180 4, 197 7" stroke={`url(#${id})`} />
      </svg>
    </div>
  )
}

// The cover: the question in blue and pink on the painting's own white,
// then the painting — the stork glides in from the right and keeps
// hovering — and the parents with the date beneath it.
export function Hero() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <Block className="hero" label="Հրավեր">
      <div className="htop">
        <p className="caps r"><Editable path="kicker" /></p>
        <h1 className="q">
          <span className="boy r" style={{ '--i': 1 }}><Editable path="title.first" /></span>
          <span className="or r" style={{ '--i': 2 }}><Editable path="title.or" /></span>
          <span className="girl r" style={{ '--i': 3 }}><Editable path="title.second" /></span>
        </h1>
      </div>
      <div className="paint">
        <img src={storkImg} alt="" aria-hidden="true" decoding="async" fetchpriority="high" />
      </div>
      <div className="hbot">
        <p className="parents r" style={{ '--i': 4 }}>
          <Editable path="parents.first" /> <i className="amp">և</i> <Editable path="parents.second" />
        </p>
        <p className="trail r" style={{ '--i': 5 }}><Editable path="parents.trail" /></p>
        <p className="hdate r" style={{ '--i': 6 }}>{d.long}</p>
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
        <div className="hd r">
          <h2 className="title"><GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting></h2>
        </div>
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
    done: diff === 0,
    d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60,
  }
}

// Numerals alternate blue and pink.
export function Countdown() {
  const { data, editing } = useInvitationContent()
  const cd = useCountdown(data.eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  const cal = calendarUrl({
    title: `${data.parents.first} և ${data.parents.second} · գենդեր երեկույթ`,
    iso: data.eventDate,
    hours: 4,
    location: [data.venue.name, data.venue.address].filter(Boolean).join(', '),
  })
  return (
    <Block className="count">
      <Heading path="countdownTitle" />
      {editing && <div className="r" style={{ '--i': 1 }}><Editable path="eventDate" type="date" /></div>}
      {cd && (cd.done ? (
        <p className="done r" style={{ '--i': 1 }}><Editable path="countdownDone" /></p>
      ) : (
        <div className="cells r" style={{ '--i': 1 }} role="timer" aria-live="off">
          <span><b>{cd.d}</b>օր</span>
          <span><b>{pad(cd.h)}</b>ժամ</span>
          <span><b>{pad(cd.m)}</b>րոպե</span>
          <span><b>{pad(cd.s)}</b>վրկ</span>
        </div>
      ))}
      {cal && (
        <a className="btn r" style={{ '--i': 2 }} href={editing ? undefined : cal} target="_blank" rel="noopener noreferrer">
          <Editable path="calendarButton" />
        </a>
      )}
    </Block>
  )
}

export function Program() {
  const { data } = useInvitationContent()
  return (
    <Block className="program">
      <Heading path="scheduleTitle" />
      <ol className="tl">
        {data.schedule.map((_, i) => (
          <li key={i} className="r" style={{ '--i': i + 1 }}>
            <Editable as="time" path={`schedule.${i}.time`} />
            <i aria-hidden="true" />
            <Editable path={`schedule.${i}.label`} />
          </li>
        ))}
      </ol>
    </Block>
  )
}

const mapUrl = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`

export function Venue() {
  const { data, editing } = useInvitationContent()
  return (
    <Block className="venue">
      <Heading path="venueTitle" />
      <p className="vname r" style={{ '--i': 1 }}><Editable path="venue.name" /></p>
      <p className="vaddr r" style={{ '--i': 2 }}><Editable path="venue.address" /></p>
      <a className="btn r" style={{ '--i': 3 }} href={editing ? undefined : mapUrl(data.venue.address)} target="_blank" rel="noopener noreferrer">
        <Editable path="mapButton" />
      </a>
    </Block>
  )
}

// Swatches are soft painted dabs.
export function DressCode() {
  const { data, editing, setField } = useInvitationContent()
  const { colors } = data.dressCode
  return (
    <Block className="dress">
      <Heading path="dressCode.title" />
      <p className="body r" style={{ '--i': 1 }}><Editable path="dressCode.text" /></p>
      <div className="sw r" style={{ '--i': 2 }}>
        {colors.map((c, i) => (
          editing ? (
            <input key={i} type="color" className="sw-edit" value={c} aria-label={`Գույն ${i + 1}`} onChange={(e) => setField(`dressCode.colors.${i}`, e.target.value)} />
          ) : (
            <span key={i} className="sw-i" style={{ '--c': c }} />
          )
        ))}
      </div>
    </Block>
  )
}

// RSVP with the boy/girl guess; the guess and the wish reach the hosts as
// the RSVP note, so they see every guess.
export function Rsvp() {
  const { data, editing, onRsvp } = useInvitationContent()
  const { rsvp } = data
  const [yes, setYes] = useState(true)
  const [guess, setGuess] = useState('')
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
    const wish = f.w.value.trim()
    const note = [guess && `Գուշակություն՝ ${guess === 'boy' ? rsvp.boy : rsvp.girl}`, wish].filter(Boolean).join(' · ')
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: 0, note })
    setThanks(fillName(yes ? rsvp.thanksYes : rsvp.thanksNo, name.split(/\s+/)[0]))
  }

  return (
    <Block className="rsvp">
      <Heading path="rsvp.title" />
      <p className="body r" style={{ '--i': 1 }}><Editable path="rsvp.intro" /></p>
      {thanks ? (
        <p className={`thanks ${guess}`} role="status">{thanks}</p>
      ) : (
        <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
          <label className="field">
            <span className="lbl"><Editable path="rsvp.nameLabel" /></span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required
              aria-invalid={err || undefined} aria-describedby={err ? 'gps-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="gps-err" className="err">{rsvp.nameError}</span>}
          </label>
          <div className="choice" role="radiogroup" aria-label="Ձեր պատասխանը">
            <label className={yes ? 'on' : ''}><input type="radio" name="a" checked={yes} onChange={() => setYes(true)} /><Editable path="rsvp.yes" /></label>
            <label className={!yes ? 'on' : ''}><input type="radio" name="a" checked={!yes} onChange={() => setYes(false)} /><Editable path="rsvp.no" /></label>
          </div>
          <div className="guess" role="radiogroup" aria-label={rsvp.guessLabel}>
            <span className="lbl"><Editable path="rsvp.guessLabel" /></span>
            <div>
              <label className={`boy${guess === 'boy' ? ' on' : ''}`}><input type="radio" name="gs" checked={guess === 'boy'} onChange={() => setGuess('boy')} /><Editable path="rsvp.boy" /></label>
              <label className={`girl${guess === 'girl' ? ' on' : ''}`}><input type="radio" name="gs" checked={guess === 'girl'} onChange={() => setGuess('girl')} /><Editable path="rsvp.girl" /></label>
            </div>
          </div>
          <label className="field">
            <span className="lbl"><Editable path="rsvp.wishLabel" /></span>
            <textarea name="w" rows="2" />
          </label>
          <button className="send" type="submit"><Editable path="rsvp.button" /></button>
        </form>
      )}
    </Block>
  )
}

export function Closing() {
  return (
    <Block className="closing">
      <p className="title r"><Editable path="closing.title" /></p>
      <p className="q small r" style={{ '--i': 1 }} aria-hidden="true"><span className="boy">?</span><span className="girl">?</span></p>
      <p className="sig r" style={{ '--i': 2 }}><Editable path="closing.signature" /></p>
    </Block>
  )
}
