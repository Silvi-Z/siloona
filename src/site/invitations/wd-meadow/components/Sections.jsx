import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { formatEventDate } from '../lib/date'
import AddToCalendar from '../../shared/AddToCalendar'

// A page section that gets `.in` once it scrolls into view; its `.r`
// children reveal from that, staggered by --i.
function Block({ className = '', label, children, innerRef }) {
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
    <section
      ref={(n) => { ref.current = n; if (innerRef) innerRef.current = n }}
      className={`blk ${className}${seen ? ' in' : ''}`} aria-label={label}
    >
      {children}
    </section>
  )
}

function Names() {
  return <><Editable path="couple.first" /><i className="amp">&amp;</i><Editable path="couple.second" /></>
}

// Three dabs of the painting's colours above each heading.
function Dabs({ i = 0 }) {
  return <span className="dabs r" style={{ '--i': i }} aria-hidden="true"><i /><i /><i /></span>
}

// A strip of the painting that fades into the paper above and below, like
// mist. `y` picks which part of the painting shows (0% top … 100% bottom).
function Band({ y, className = '' }) {
  return <div className={`band ${className}`} style={{ '--y': y }} aria-hidden="true" />
}

// The cover: the whole painting, with a cream mist clearing in its hazy
// middle that holds the names.
export function Hero() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <Block className="hero" label="Հրավեր">
      <div className="paint" aria-hidden="true" />
      <div className="mist" aria-hidden="true" />
      <div className="htxt">
        <p className="caps r" style={{ '--i': 0 }}><Editable path="hero.kicker" /></p>
        <h1 className="names r" style={{ '--i': 1 }}><Names /></h1>
        <p className="line r" style={{ '--i': 2 }}><Editable path="hero.line" /></p>
        <p className="hdate r" style={{ '--i': 3 }}>{d.short}</p>
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
        <Dabs />
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

// The date in a mist circle over a band of the painting; the countdown and
// the calendar link below, on paper.
export function DateBlock() {
  const { data, editing } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const cd = useCountdown(data.eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  const place = data.places?.[1] || data.places?.[0] || {}
  return (
    <Block className="date">
      <div className="dpaint">
        <Band y="38%" />
        <div className="circle r">
          <p className="caps"><Editable path="dateTitle" /></p>
          {editing ? (
            <Editable path="eventDate" type="date" />
          ) : (
            <>
              <p className="wd">{d.weekday}</p>
              <p className="day">{d.day}</p>
              <p className="my">{d.monthYear}</p>
            </>
          )}
          <p className="tm">Ժամը {d.time}</p>
        </div>
      </div>
      {cd && (
        <div className="cd r" style={{ '--i': 1 }}>
          <p className="caps small"><Editable path="countdownTitle" /></p>
          <div className="cells" role="timer" aria-live="off">
            <span><b>{cd.d}</b>օր</span>
            <span><b>{pad(cd.h)}</b>ժամ</span>
            <span><b>{pad(cd.m)}</b>րոպե</span>
            <span><b>{pad(cd.s)}</b>վրկ</span>
          </div>
        </div>
      )}
      <AddToCalendar slug="wd-meadow" event={{ location: [place?.name, place?.address].filter(Boolean).join(', ') }} className="btn r" style={{ '--i': 2 }}>
        <Editable path="calendarButton" />
      </AddToCalendar>
    </Block>
  )
}

export function Program() {
  const { data } = useInvitationContent()
  return (
    <Block className="program">
      <Dabs />
      <h2 className="title r" style={{ '--i': 1 }}><Editable path="scheduleTitle" /></h2>
      <ol className="tl">
        {data.schedule.map((_, i) => (
          <li key={i} className="r" style={{ '--i': i + 2 }}>
            <Editable as="time" path={`schedule.${i}.time`} />
            <Editable path={`schedule.${i}.label`} />
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
      <Band y="70%" />
      <div className="vin">
        <Dabs />
        <h2 className="title r" style={{ '--i': 1 }}><Editable path="venueTitle" /></h2>
        {data.places.map((p, i) => (
          <div className="place r" key={i} style={{ '--i': i + 2 }}>
            <p className="caps"><Editable path={`places.${i}.label`} /></p>
            <p className="ptime"><Editable path={`places.${i}.time`} /></p>
            <p className="pname"><Editable path={`places.${i}.name`} /></p>
            <p className="paddr"><Editable path={`places.${i}.address`} /></p>
            <a className="btn" href={editing ? undefined : mapUrl(p.address)} target="_blank" rel="noopener noreferrer">
              <Editable path="mapButton" />
            </a>
          </div>
        ))}
      </div>
    </Block>
  )
}

// Swatches are soft painted dabs.
export function DressCode() {
  const { data, editing, setField } = useInvitationContent()
  const { colors, colorNames = [] } = data.dressCode
  return (
    <Block className="dress">
      <Dabs />
      <h2 className="title r" style={{ '--i': 1 }}><Editable path="dressCode.title" /></h2>
      <p className="body r" style={{ '--i': 2 }}><Editable path="dressCode.intro" /></p>
      <div className="sw r" style={{ '--i': 3 }}>
        {colors.map((c, i) => (
          editing ? (
            <input key={i} type="color" className="sw-edit" value={c} aria-label={`Գույն ${i + 1}`} onChange={(e) => setField(`dressCode.colors.${i}`, e.target.value)} />
          ) : (
            <span key={i} className="sw-i" style={{ '--c': c }} title={colorNames[i] || undefined} />
          )
        ))}
      </div>
    </Block>
  )
}

// The form on a cream panel laid over the painting.
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
    const wish = f.w.value.trim()
    const note = [yes ? `Հյուրեր՝ ${rsvp.guestOptions[idx]}` : '', wish].filter(Boolean).join(' · ')
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: idx, note })
    setThanks(fillName(yes ? rsvp.thanksYes : rsvp.thanksNo, name.split(/\s+/)[0]))
  }

  return (
    <Block className="rsvp">
      <div className="panel">
        <Dabs />
        <h2 className="title r" style={{ '--i': 1 }}><Editable path="rsvp.title" /></h2>
        <p className="body r" style={{ '--i': 2 }}><Editable path="rsvp.intro" /></p>
        {thanks ? (
          <p className="thanks" role="status">{thanks}</p>
        ) : (
          <form className="form r" style={{ '--i': 3 }} noValidate onSubmit={submit}>
            <label className="field">
              <span className="caps small"><Editable path="rsvp.nameLabel" /></span>
              <input
                ref={nameRef} type="text" name="n" autoComplete="name" defaultValue={guestName || ''} required
                aria-invalid={err || undefined} aria-describedby={err ? 'wmd-err' : undefined}
                onInput={() => err && setErr(false)}
              />
              {err && <span id="wmd-err" className="err">{rsvp.nameError}</span>}
            </label>
            <div className="choice" role="radiogroup" aria-label="Ձեր պատասխանը">
              <label className={yes ? 'on' : ''}><input type="radio" name="a" checked={yes} onChange={() => setYes(true)} /><Editable path="rsvp.yes" /></label>
              <label className={!yes ? 'on' : ''}><input type="radio" name="a" checked={!yes} onChange={() => setYes(false)} /><Editable path="rsvp.no" /></label>
            </div>
            {yes && (
              <label className="field">
                <span className="caps small"><Editable path="rsvp.guestLabel" /></span>
                <select name="g">{rsvp.guestOptions.map((o) => <option key={o}>{o}</option>)}</select>
              </label>
            )}
            <label className="field">
              <span className="caps small"><Editable path="rsvp.wishLabel" /></span>
              <textarea name="w" rows="2" />
            </label>
            <button className="send" type="submit"><Editable path="rsvp.button" /></button>
          </form>
        )}
      </div>
    </Block>
  )
}

// The end: the lower meadow, with a mist clearing for the farewell, down to
// the sheet's real bottom edge.
export function Closing() {
  return (
    <Block className="closing">
      <div className="ctxt">
        <p className="title r"><Editable path="closing.line" /></p>
        <p className="sign r" style={{ '--i': 1 }}><Editable path="closing.sign" /></p>
        <p className="names r" style={{ '--i': 2 }}><Names /></p>
      </div>
    </Block>
  )
}
