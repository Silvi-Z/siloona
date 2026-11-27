import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { formatEventDate } from '../lib/date'
import coverImg from '../assets/cover.webp'
import clusterImg from '../assets/cluster.webp'
import AddToCalendar from '../../shared/AddToCalendar'
import { SeatDialog, SeatForm, useSeatFinder } from '../../shared/Seating'
import { LiveStep, useLiveSchedule } from '../../shared/LiveSchedule'

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

// A section heading on the stem line, marked by a small leaf.
function Head({ path, i = 0 }) {
  return <h2 className="hd r" style={{ '--i': i }}><Editable path={path} /></h2>
}

// The cover: the artwork itself — the lilies climbing the left edge — with
// the text in the open paper on the right. The image settles in slowly and
// drifts a touch with scrolling.
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
      <img className="art" src={coverImg} alt="" aria-hidden="true" decoding="async" fetchpriority="high" />
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
        <h2 className="hd r">
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

// The big day beside weekday / month / time; the countdown and the
// calendar link below.
export function DateBlock() {
  const { data, editing } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const cd = useCountdown(data.eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  const place = data.places?.[1] || data.places?.[0] || {}
  return (
    <Block className="date">
      <Head path="dateTitle" />
      {editing ? (
        <div className="r" style={{ '--i': 1 }}><Editable path="eventDate" type="date" /></div>
      ) : (
        <div className="big r" style={{ '--i': 1 }}>
          <b>{d.day}</b>
          <span>
            <span className="caps">{d.weekday}</span>
            <span className="my">{d.monthYear}</span>
            <span className="tm">Ժամը {d.time}</span>
          </span>
        </div>
      )}
      {cd && (
        <div className="cd r" style={{ '--i': 2 }}>
          <p className="caps small"><Editable path="countdownTitle" /></p>
          <div className="cells" role="timer" aria-live="off">
            <span><b>{cd.d}</b>օր</span>
            <span><b>{pad(cd.h)}</b>ժամ</span>
            <span><b>{pad(cd.m)}</b>րոպե</span>
            <span><b>{pad(cd.s)}</b>վրկ</span>
          </div>
        </div>
      )}
      <AddToCalendar slug="wd-calla" event={{ location: [place?.name, place?.address].filter(Boolean).join(', ') }} className="btn r" style={{ '--i': 3 }}>
        <Editable path="calendarButton" />
      </AddToCalendar>
    </Block>
  )
}

export function Program() {
  const { data } = useInvitationContent()
  const live = useLiveSchedule()
  return (
    <Block className="program">
      <Head path="scheduleTitle" />
      <ol className="tl">
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
      <Head path="venueTitle" />
      {data.places.map((p, i) => (
        <div className="place r" key={i} style={{ '--i': i + 1 }}>
          <p className="caps"><Editable path={`places.${i}.label`} /> · <Editable path={`places.${i}.time`} /></p>
          <p className="pname"><Editable path={`places.${i}.name`} /></p>
          <p className="paddr"><Editable path={`places.${i}.address`} /></p>
          <a className="btn" href={editing ? undefined : mapUrl(p.address)} target="_blank" rel="noopener noreferrer">
            <Editable path="mapButton" />
          </a>
        </div>
      ))}
    </Block>
  )
}

// Swatches are petal shapes.
export function DressCode() {
  const { data, editing, setField } = useInvitationContent()
  const { colors, colorNames = [] } = data.dressCode
  return (
    <Block className="dress">
      <Head path="dressCode.title" />
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

// ---------- «Ձեր սեղանը» (only on invitations with seating) ----------
// The guest types their name and sees their table (shared/Seating.jsx);
// before the reveal only the date. Nothing renders without seating.
export function Seating() {
  const f = useSeatFinder()
  if (!f.on) return null
  return (
    <Block className="seat" label={f.t.title}>
      <h2 className="hd r">{f.t.title}</h2>
      <div className="seat-card r" style={{ '--i': 2 }} tabIndex={f.result ? -1 : undefined} data-seat-return>
        {!f.revealed ? (
          <p className="seat-soon body">{f.soon}</p>
        ) : f.result ? (
          <div className="seat-res" role="status">
            <p className={`seat-table${f.result.table.length > 3 ? ' long' : ''}`}>{f.result.table}</p>
            <button type="button" className="seat-again" onClick={f.another}>{f.t.other}</button>
          </div>
        ) : (
          <>
            <p className="seat-teaser body">{f.t.teaser}</p>
            <button type="button" className="btn seat-cta" onClick={f.open} aria-haspopup="dialog">{f.t.button}</button>
          </>
        )}
      </div>
      <SeatDialog finder={f} className="sd-seat wcl-seat">
        {(titleId) => <SeatForm finder={f} titleId={titleId} />}
      </SeatDialog>
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
    const wish = f.w.value.trim()
    const note = [yes ? `Հյուրեր՝ ${rsvp.guestOptions[idx]}` : '', wish].filter(Boolean).join(' · ')
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: idx, note })
    setThanks(fillName(yes ? rsvp.thanksYes : rsvp.thanksNo, name.split(/\s+/)[0]))
  }

  return (
    <Block className="rsvp">
      <Head path="rsvp.title" />
      <p className="body r" style={{ '--i': 1 }}><Editable path="rsvp.intro" /></p>
      {thanks ? (
        <p className="thanks" role="status">{thanks}</p>
      ) : (
        <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
          <label className="field">
            <span className="caps small"><Editable path="rsvp.nameLabel" /></span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" defaultValue={guestName || ''} required
              aria-invalid={err || undefined} aria-describedby={err ? 'wcl-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="wcl-err" className="err">{rsvp.nameError}</span>}
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
    </Block>
  )
}

// The end of the sheet: the lowest lilies from the artwork rise from the
// sheet's bottom-left corner again, with the farewell in the paper beside
// them, as on the cover.
export function Closing() {
  return (
    <Block className="closing">
      <img className="cluster" src={clusterImg} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <div className="ctxt">
        <p className="cline r"><Editable path="closing.line" /></p>
        <p className="sign r" style={{ '--i': 1 }}><Editable path="closing.sign" /></p>
        <p className="names r" style={{ '--i': 2 }}><Names /></p>
      </div>
    </Block>
  )
}
