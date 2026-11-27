import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { getByPath } from '../../shared/pathUtils'
import { caps, formatEventDate } from '../lib/date'
import garlandArt from '../assets/garland.webp'
import AddToCalendar from '../../shared/AddToCalendar'
import { LiveStep, useLiveSchedule } from '../../shared/LiveSchedule'
import RsvpExtra from '../../shared/RsvpExtra'

// One part of the page. Gets `.in` once it scrolls into view; its `.r`
// children fade up from that (staggered by --i).
function Block({ className = '', children, label }) {
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
  return <section ref={ref} className={`blk ${className}`} aria-label={label}>{children}</section>
}

// Text shown in capitals; plain and editable in edit mode.
function Caps({ path, as: Tag = 'span', className, style }) {
  const { data, editing } = useInvitationContent()
  if (editing) return <Editable as={Tag} path={path} className={className} style={style} />
  return <Tag className={className} style={style}>{caps(getByPath(data, path))}</Tag>
}

// A thin rule with a dot in the middle, as on the printed card.
function Rule({ short = false, i }) {
  return <div className={`rule r${short ? ' short' : ''}`} style={i != null ? { '--i': i } : undefined} aria-hidden="true"><i /></div>
}

function Heading({ path }) {
  return (
    <div className="head r">
      <Caps as="h2" path={path} className="ht" />
      <span className="dot" aria-hidden="true" />
    </div>
  )
}

const mapUrl = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`

export function Hero() {
  const { data, editing } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const words = caps(data.hero.title).split(/\s+/).filter(Boolean)
  return (
    <header className="cover">
      <img className="garland" src={garlandArt} width="759" height="582" alt="" />
      <div className="cover-text">
        <Caps as="p" path="hero.kicker" className="kicker" />
        {editing ? (
          <Editable as="h1" path="hero.title" className="title" />
        ) : (
          <h1 className="title">{words.map((w, i) => <span key={i} style={{ '--i': i }}>{w}</span>)}</h1>
        )}
        <div className="rule hero-rule" aria-hidden="true"><i /></div>
        {editing ? (
          <div className="when-edit"><Editable path="eventDate" type="date" /></div>
        ) : (
          <p className="when" aria-label={`${d.long}, ${d.time}`}>
            <span className="mon">{d.mon}</span>
            <span className="day">{d.day}</span>
            <span className="tm">{d.time}</span>
          </p>
        )}
        <span className="dot solo" aria-hidden="true" />
        <p className="addr"><Caps path="venue.name" /><br /><Caps path="venue.address" /></p>
        <div className="rule short hero-rule" aria-hidden="true"><i /></div>
        <p className="contact">
          <Caps path="contact.label" />
          <br />
          {editing ? <Editable path="contact.phone" /> : <a href={`tel:${String(data.contact.phone).replace(/[^\d+]/g, '')}`}>{data.contact.phone}</a>}
        </p>
        <Caps as="p" path="company" className="company" />
      </div>
    </header>
  )
}

export function Welcome() {
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Block className="welcome" label="Հրավեր">
      <Section id="greeting">
        <p className="greet r">
          <GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting>
        </p>
      </Section>
      <Section id="message">
        <Editable as="p" path="message" className="body r" style={{ '--i': 1 }} />
      </Section>
    </Block>
  )
}

function useCountdown(iso) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])
  const left = new Date(iso).getTime() - now
  if (!(left > 0)) return null
  return { d: Math.floor(left / 864e5), h: Math.floor(left / 36e5) % 24, m: Math.floor(left / 6e4) % 60 }
}

export function Countdown() {
  const { data, editing } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const cd = useCountdown(data.eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  return (
    <Block className="countdown" label="Հետհաշվարկ">
      <Caps as="p" path="countdownTitle" className="lbl-caps r" />
      {cd && (
        <div className="cells r" style={{ '--i': 1 }} role="timer" aria-live="off">
          <span><b>{cd.d}</b>օր</span>
          <i aria-hidden="true" />
          <span><b>{pad(cd.h)}</b>ժամ</span>
          <i aria-hidden="true" />
          <span><b>{pad(cd.m)}</b>րոպե</span>
        </div>
      )}
      <p className="long r" style={{ '--i': 2 }}>{d.long} · {d.time}</p>
      <AddToCalendar slug="ce-garland" event={{ title: `${data.hero.title} · ${data.company}`, location: [data.venue.name, data.venue.address].filter(Boolean).join(', ') }} className="btn r" style={{ '--i': 3 }}>
        <Editable path="calendarButton" />
      </AddToCalendar>
    </Block>
  )
}

export function Program() {
  const { data } = useInvitationContent()
  const live = useLiveSchedule()
  return (
    <Block className="program" label="Երեկոյի ծրագիր">
      <Heading path="scheduleTitle" />
      <ol className="plist">
        {data.schedule.map((_, i) => (
          <li key={i} className={live.cls(i, 'r')} style={{ '--i': Math.min(i + 1, 6) }}>
            <Editable as="time" path={`schedule.${i}.time`} />
            <Editable as="p" path={`schedule.${i}.label`} />
            <LiveStep live={live} i={i} />
            <RowRemove list="schedule" index={i} />
          </li>
        ))}
      </ol>
      <RowAdd list="schedule" />
    </Block>
  )
}

export function Venue() {
  const { data, editing } = useInvitationContent()
  return (
    <Block className="venue" label="Վայրը">
      <Heading path="venueTitle" />
      <Editable as="p" path="venue.name" className="vname r" style={{ '--i': 1 }} />
      <Editable as="p" path="venue.address" className="vaddr r" style={{ '--i': 2 }} />
      <a className="btn r" style={{ '--i': 3 }} href={editing ? undefined : mapUrl(data.venue.address || data.venue.name)} target="_blank" rel="noopener noreferrer">
        <Editable path="mapButton" />
      </a>
    </Block>
  )
}

export function DressCode() {
  const { data, editing, setField } = useInvitationContent()
  const { colors } = data.dressCode
  return (
    <Block className="dress" label="Հագուստի ոճ">
      <Heading path="dressCode.title" />
      <Editable as="p" path="dressCode.text" className="body r" style={{ '--i': 1 }} />
      <div className="sw r" style={{ '--i': 2 }}>
        {colors.map((c, i) => (
          editing ? (
            <input key={i} type="color" className="sw-edit" value={c} aria-label={`Գույն ${i + 1}`} onChange={(e) => setField(`dressCode.colors.${i}`, e.target.value)} />
          ) : (
            <span key={i} className="sw-i" style={{ background: c }} />
          )
        ))}
      </div>
    </Block>
  )
}

export function Rsvp() {
  const { data, editing, onRsvp, guestName } = useInvitationContent()
  const { rsvp } = data
  const [yes, setYes] = useState(true)
  const [plus, setPlus] = useState(0)
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
    const diet = f.w.value.trim()
    const note = [yes ? rsvp.plusOptions[plus] : '', diet].filter(Boolean).join(' · ')
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: yes ? plus : 0, note })
    setThanks(fillName(yes ? rsvp.thanksYes : rsvp.thanksNo, name.split(/\s+/)[0]))
  }

  return (
    <Block className="rsvp" label="Ներկայության հաստատում">
      <Heading path="rsvp.title" />
      <Editable as="p" path="rsvp.intro" className="body r" style={{ '--i': 1 }} />
      {thanks ? (
        <p className="thanks" role="status">{thanks}</p>
      ) : (
        <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
          <label className="field">
            <span className="lbl"><Editable path="rsvp.nameLabel" /></span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required defaultValue={guestName || ''}
              aria-invalid={err || undefined} aria-describedby={err ? 'ceg-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="ceg-err" className="err">{rsvp.nameError}</span>}
          </label>
          <div className="choice" role="radiogroup" aria-label="Ձեր պատասխանը">
            <label className={yes ? 'on' : ''}><input type="radio" name="a" checked={yes} onChange={() => setYes(true)} /><Editable path="rsvp.yes" /></label>
            <label className={!yes ? 'on' : ''}><input type="radio" name="a" checked={!yes} onChange={() => setYes(false)} /><Editable path="rsvp.no" /></label>
          </div>
          {yes && (
            <div className="field">
              <span className="lbl"><Editable path="rsvp.plusLabel" /></span>
              <div className="choice soft" role="radiogroup" aria-label={rsvp.plusLabel}>
                {rsvp.plusOptions.map((o, i) => (
                  <label key={i} className={plus === i ? 'on' : ''}><input type="radio" name="p" checked={plus === i} onChange={() => setPlus(i)} />{o}</label>
                ))}
              </div>
            </div>
          )}
          <label className="field">
            <span className="lbl"><Editable path="rsvp.dietLabel" /></span>
            <textarea name="w" rows="2" />
          </label>
          <RsvpExtra />
          <button className="send" type="submit"><Editable path="rsvp.button" /></button>
        </form>
      )}
    </Block>
  )
}

export function Closing() {
  return (
    <Block className="closing" label="Ավարտ">
      <Rule />
      <Caps as="p" path="closing.line" className="cline r" style={{ '--i': 1 }} />
      <Editable as="p" path="closing.signature" className="sig r" style={{ '--i': 2 }} />
    </Block>
  )
}
