import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { formatEventDate } from '../lib/date'
import friendsImg from '../assets/friends.webp'
import owlImg from '../assets/owl.webp'
import treeImg from '../assets/tree.webp'
import flowersImg from '../assets/flowers.webp'
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

const HOOPS = { friends: friendsImg, owl: owlImg, tree: treeImg, flowers: flowersImg }

// A wooden embroidery hoop holding a piece of the artwork. Tapping it
// gives it a little wobble.
function Hoop({ img, className = '', i = 0 }) {
  const [wob, setWob] = useState(0)
  return (
    <div
      className={`hoop r ${className}${wob ? ' wob' : ''}`} style={{ '--i': i }} aria-hidden="true"
      onClick={() => setWob((n) => n + 1)} onAnimationEnd={() => setWob(0)}
    >
      <span className="fabric" style={{ backgroundImage: `url(${HOOPS[img]})` }} />
      <span className="clamp" />
    </div>
  )
}

// A section heading on a felt label with stitched edges.
function Label({ path, tone = 'sage', i = 0 }) {
  return <h2 className={`label ${tone} r`} style={{ '--i': i }}><Editable path={path} /></h2>
}

// The cover: the title on linen, the age on a felt patch, then the whole
// company of friends in the big hoop.
export function Hero() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <Block className="hero" label="Հրավեր">
      <p className="caps r"><Editable path="hero.kicker" /></p>
      <span className="stitch r" style={{ '--i': 1 }} />
      <h1 className="htitle r" style={{ '--i': 2 }}><Editable path="hero.title" /></h1>
      <div className="patch r" style={{ '--i': 3 }}>
        <Editable path="child.age" />
        <small>տարեկան</small>
      </div>
      <p className="hdate r" style={{ '--i': 4 }}>{d.long}</p>
      <Hoop img="friends" className="big" i={5} />
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

// Countdown on four felt squares, then the calendar link.
export function Countdown() {
  const { data, editing } = useInvitationContent()
  const cd = useCountdown(data.eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  return (
    <Block className="count">
      <Label path="countdownTitle" tone="honey" />
      {editing && <div className="r" style={{ '--i': 1 }}><Editable path="eventDate" type="date" /></div>}
      {cd && (
        <div className="cells r" style={{ '--i': 1 }} role="timer" aria-live="off">
          <span><b>{cd.d}</b>օր</span>
          <span><b>{pad(cd.h)}</b>ժամ</span>
          <span><b>{pad(cd.m)}</b>րոպե</span>
          <span><b>{pad(cd.s)}</b>վրկ</span>
        </div>
      )}
      <AddToCalendar slug="bd-stitch" event={{ location: [data.venue.name, data.venue.address].filter(Boolean).join(', ') }} className="btn r" style={{ '--i': 2 }}>
        Ավելացնել օրացույցում
      </AddToCalendar>
    </Block>
  )
}

// Owl, who keeps the plans, holds the programme.
export function Program() {
  const { data } = useInvitationContent()
  const live = useLiveSchedule()
  return (
    <Block className="program">
      <Hoop img="owl" className="mid" />
      <Label path="scheduleTitle" tone="sage" i={1} />
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
      <Hoop img="tree" className="small" />
      <Label path="venue.title" tone="sky" i={1} />
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
      <div className="card r">
        <Label path="rsvp.title" tone="red" />
        <p className="body"><Editable path="rsvp.intro" /></p>
        {thanks ? (
          <p className="thanks" role="status">{thanks}</p>
        ) : (
          <form className="form" noValidate onSubmit={submit}>
            <label className="field">
              <span><Editable path="rsvp.nameLabel" /></span>
              <input
                ref={nameRef} type="text" name="n" autoComplete="name" defaultValue={guestName || ''} required
                aria-invalid={err || undefined} aria-describedby={err ? 'bst-err' : undefined}
                onInput={() => err && setErr(false)}
              />
              {err && <span id="bst-err" className="err">{rsvp.nameError}</span>}
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

export function Closing() {
  return (
    <Block className="closing">
      <Hoop img="flowers" className="small" />
      <p className="title r" style={{ '--i': 1 }}><Editable path="closing.line" /></p>
      <span className="stitch r" style={{ '--i': 2 }} />
      <p className="sig r" style={{ '--i': 3 }}><Editable path="closing.signature" /></p>
    </Block>
  )
}
