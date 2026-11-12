import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { calendarUrl, formatEventDate } from '../lib/date'

// A page section that gets `.in` once it scrolls into view; its `.r`
// children (and ribbons) reveal from that, staggered by --i.
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

// A gold line ribbon cut from the artwork (assets/rib-*.webp, used as a
// mask so the gold can carry a sheen). Each piece is cut by the artwork's
// own edges, so it always sits against the sheet's edge:
//   tl — top-left corner, r — right edge (or left edge, mirrored),
//   b — bottom edge.
function Ribbon({ which, className = '' }) {
  return <span className={`rib rib-${which} ${className}`} aria-hidden="true" />
}

function Names() {
  return <><Editable path="couple.first" /><i className="amp">&amp;</i><Editable path="couple.second" /></>
}

// The cover: the artwork itself — three ribbons around a white page —
// with the names in the open middle. The ribbons draw in, catch a single
// sheen of light, then drift a little with scrolling.
export function Hero() {
  const { data } = useInvitationContent()
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const tick = () => {
      raf = 0
      el.style.setProperty('--sy', Math.min(window.scrollY, el.offsetHeight).toFixed(0))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(tick) }
    window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); if (raf) cancelAnimationFrame(raf) }
  }, [])
  const d = formatEventDate(data.eventDate)
  return (
    <Block className="hero" label="Հրավեր" innerRef={ref}>
      <Ribbon which="tl" className="h-tl" />
      <Ribbon which="r" className="h-r" />
      <div className="h-b-wrap"><Ribbon which="b" className="h-b" /></div>
      <div className="htxt">
        <p className="caps r" style={{ '--i': 0 }}><Editable path="hero.kicker" /></p>
        <h1 className="names r" style={{ '--i': 1 }}><Names /></h1>
        <span className="rule r" style={{ '--i': 2 }} />
        <p className="hdate r" style={{ '--i': 3 }}>{d.short}</p>
        <p className="caps small r" style={{ '--i': 4 }}><Editable path="hero.place" /></p>
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

// Editorial date: weekday | big day | month, between hairlines; the time,
// the countdown and the calendar link below.
export function DateBlock() {
  const { data, editing } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const cd = useCountdown(data.eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  const place = data.places?.[1] || data.places?.[0] || {}
  const cal = calendarUrl({
    title: `${data.couple.first} և ${data.couple.second} · հարսանիք`,
    iso: data.eventDate,
    location: [place.name, place.address].filter(Boolean).join(', '),
  })
  return (
    <Block className="date">
      <h2 className="title r"><Editable path="dateTitle" /></h2>
      {editing ? (
        <div className="r" style={{ '--i': 1 }}><Editable path="eventDate" type="date" /></div>
      ) : (
        <div className="trio r" style={{ '--i': 1 }}>
          <span className="caps">{d.weekday}</span>
          <b>{d.day}</b>
          <span className="caps">{d.monthYear}</span>
        </div>
      )}
      <p className="time r" style={{ '--i': 2 }}>Ժամը {d.time}</p>
      {cd && (
        <div className="cd r" style={{ '--i': 3 }}>
          <p className="caps small"><Editable path="countdownTitle" /></p>
          <div className="cells" role="timer" aria-live="off">
            <span><b>{cd.d}</b>օր</span>
            <span><b>{pad(cd.h)}</b>ժամ</span>
            <span><b>{pad(cd.m)}</b>րոպե</span>
            <span><b>{pad(cd.s)}</b>վրկ</span>
          </div>
        </div>
      )}
      {cal && (
        <a className="link r" style={{ '--i': 4 }} href={editing ? undefined : cal} target="_blank" rel="noopener noreferrer">
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
      <Ribbon which="r" className="side-r" />
      <h2 className="title r"><Editable path="scheduleTitle" /></h2>
      <ol className="tl">
        {data.schedule.map((_, i) => (
          <li key={i} className="r" style={{ '--i': i + 1 }}>
            <Editable as="time" path={`schedule.${i}.time`} />
            <Editable path={`schedule.${i}.label`} />
          </li>
        ))}
      </ol>
    </Block>
  )
}

const mapUrl = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`
const ROMAN = ['I', 'II', 'III', 'IV']

export function Venue() {
  const { data, editing } = useInvitationContent()
  return (
    <Block className="venue">
      <Ribbon which="r" className="side-l" />
      <h2 className="title r"><Editable path="venueTitle" /></h2>
      {data.places.map((p, i) => (
        <div className="place r" key={i} style={{ '--i': i + 1 }}>
          <span className="num">{ROMAN[i]}</span>
          <p className="caps"><Editable path={`places.${i}.label`} /></p>
          <p className="pname"><Editable path={`places.${i}.name`} /></p>
          <p className="paddr"><Editable path={`places.${i}.time`} /> · <Editable path={`places.${i}.address`} /></p>
          <a className="link" href={editing ? undefined : mapUrl(p.address)} target="_blank" rel="noopener noreferrer">
            <Editable path="mapButton" />
          </a>
        </div>
      ))}
    </Block>
  )
}

export function DressCode() {
  const { data, editing, setField } = useInvitationContent()
  const { colors, colorNames = [] } = data.dressCode
  return (
    <Block className="dress">
      <h2 className="title r"><Editable path="dressCode.title" /></h2>
      <p className="body r" style={{ '--i': 1 }}><Editable path="dressCode.intro" /></p>
      <div className="sw r" style={{ '--i': 2 }}>
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

export function Rsvp() {
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
    const wish = f.w.value.trim()
    const note = [yes ? `Հյուրեր՝ ${rsvp.guestOptions[idx]}` : '', wish].filter(Boolean).join(' · ')
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: idx, note })
    setThanks(fillName(yes ? rsvp.thanksYes : rsvp.thanksNo, name.split(/\s+/)[0]))
  }

  return (
    <Block className="rsvp">
      <div className="card">
        <h2 className="title r"><Editable path="rsvp.title" /></h2>
        <p className="body r" style={{ '--i': 1 }}><Editable path="rsvp.intro" /></p>
        {thanks ? (
          <p className="thanks" role="status">{thanks}</p>
        ) : (
          <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
            <label className="field">
              <span className="caps small"><Editable path="rsvp.nameLabel" /></span>
              <input
                ref={nameRef} type="text" name="n" autoComplete="name" required
                aria-invalid={err || undefined} aria-describedby={err ? 'wln-err' : undefined}
                onInput={() => err && setErr(false)}
              />
              {err && <span id="wln-err" className="err">{rsvp.nameError}</span>}
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

// The end of the sheet: the cover's bottom ribbon returns, now sitting on
// the sheet's real bottom edge.
export function Closing() {
  return (
    <Block className="closing">
      <div className="ctxt">
        <p className="title r"><Editable path="closing.line" /></p>
        <p className="sign r" style={{ '--i': 1 }}><Editable path="closing.sign" /></p>
        <p className="names r" style={{ '--i': 2 }}><Names /></p>
      </div>
      <Ribbon which="b" className="c-b" />
    </Block>
  )
}
