import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { formatEventDate } from '../lib/date'
import tulipUrl from '../assets/tulip.webp'

// One linen card. Gets `.in` once it scrolls into view; its `.r` children
// and tulips animate from that (staggered by --i).
function Card({ className = '', children, label }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect() }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <section ref={ref} className={`card ${className}`} aria-label={label}>{children}</section>
}

// The painted tulip, placed by its flower head: x (% of sheet width),
// y (a length from the card's top), w (% of sheet width), rotation.
// Keep the rotated painting inside the sheet — tulips are never cropped.
function Tulip({ x, y, w, rot = 0, flip, className = '', eager }) {
  return (
    <div className={`tulip ${className}`} style={{ '--x': x, '--y': y, '--w': w, '--rot': `${rot}deg`, '--fx': flip ? -1 : 1 }} aria-hidden="true">
      <img src={tulipUrl} alt="" decoding="async" loading={eager ? 'eager' : 'lazy'} />
    </div>
  )
}

const initial = (s) => Array.from(String(s || '').trim())[0] || ''

// Names joined by an ampersand, editable in place in edit mode.
function Names() {
  return <><Editable path="couple.first" /><i> &amp; </i><Editable path="couple.second" /></>
}

export function Hero() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <Card className="hero" label="Հրավեր">
      <Tulip className="t-pair" x={30} y="70cqw" w={34} rot={-30} flip eager />
      <Tulip className="t-main" x={62} y="60cqw" w={46} rot={35} eager />
      <div className="mono" aria-hidden="true">
        <span>{initial(data.couple.first)}</span><i>&amp;</i><span>{initial(data.couple.second)}</span>
      </div>
      <div className="htxt">
        <p className="gold r" style={{ '--i': 0 }}><Editable path="hero.kicker" /></p>
        <h1 className="names r" style={{ '--i': 1 }}><Names /></h1>
        <p className="gold r" style={{ '--i': 2 }}>{d.monthYear}</p>
      </div>
    </Card>
  )
}

export function Welcome() {
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Card className="welcome">
      <Tulip x={66} y="calc(100% - 4rem - 17cqw)" w={34} rot={90} />
      <div className="in-pad">
        <Section id="greeting">
          <h2 className="gold r" style={{ '--i': 0 }}>
            <GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting>
          </h2>
          <span className="rule r" style={{ '--i': 1 }} />
        </Section>
        <Section id="message"><p className="body r" style={{ '--i': 2 }}><Editable path="message" /></p></Section>
      </div>
    </Card>
  )
}

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const s = Math.max(0, Math.floor((target - now) / 1000))
  const pad = (n) => String(n).padStart(2, '0')
  return [[Math.floor(s / 86400), 'օր'], [pad(Math.floor((s % 86400) / 3600)), 'ժամ'], [pad(Math.floor((s % 3600) / 60)), 'րոպե'], [pad(s % 60), 'վրկ']]
}

export function DateCard() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const units = useCountdown(d.date.getTime())
  return (
    <Card className="datec" label="Ամսաթիվ">
      <div className="frame">
        <h2 className="gold r" style={{ '--i': 0 }}><Editable path="dateTitle" /></h2>
        <p className="big r" style={{ '--i': 1 }}><Editable path="eventDate" type="date" format={(iso) => formatEventDate(iso).short} /></p>
        <p className="caps r" style={{ '--i': 2 }}>{d.weekdayTime}</p>
        <div className="cd r" style={{ '--i': 3 }} aria-live="off">
          {units.map(([v, l]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}
        </div>
      </div>
    </Card>
  )
}

export function Program() {
  const { data } = useInvitationContent()
  return (
    <Card className="prog">
      <Tulip x={72} y="62cqw" w={38} rot={-8} />
      <div className="in-pad">
        <h2 className="gold r"><Editable path="scheduleTitle" /></h2>
        <span className="rule r" style={{ '--i': 1 }} />
        <ol>
          {data.schedule.map((_, i) => (
            <li key={i} className="r" style={{ '--i': i + 2 }}>
              <Editable as="time" path={`schedule.${i}.time`} />
              <Editable path={`schedule.${i}.label`} />
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}

export function Venue() {
  const { data, editing } = useInvitationContent()
  return (
    <Card className="venue">
      <div className="in-pad">
        <h2 className="gold r"><Editable path="venueTitle" /></h2>
        <span className="rule r" style={{ '--i': 1 }} />
        {data.places.map((p, i) => (
          <div key={i} className="place r" style={{ '--i': i + 2 }}>
            <p className="caps"><Editable path={`places.${i}.label`} /> · <Editable path={`places.${i}.time`} /></p>
            <Editable as="h3" path={`places.${i}.name`} />
            <Editable as="p" className="addr" path={`places.${i}.address`} />
            <a
              className="map" target="_blank" rel="noopener noreferrer"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([p.name, p.address].filter(Boolean).join(', '))}`}
              onClick={editing ? (e) => e.preventDefault() : undefined}
            >
              <Editable path="mapButton" /> <span aria-hidden="true">→</span>
            </a>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function DressCode() {
  const { data, editing, setField } = useInvitationContent()
  const { colors = [], colorNames = [] } = data.dressCode
  return (
    <Card className="dress">
      <div className="in-pad">
        <h2 className="gold r"><Editable path="dressCode.title" /></h2>
        <span className="rule r" style={{ '--i': 1 }} />
        <p className="body r" style={{ '--i': 2 }}><Editable path="dressCode.intro" /></p>
        <ul className="pal r" style={{ '--i': 3 }} aria-label="Գունային գամմա">
          {colors.map((c, i) => (
            <li key={i}>
              {editing
                ? <input type="color" className="color-edit" value={c} aria-label={`Գույն ${i + 1}`} onChange={(e) => setField('dressCode.colors', colors.map((x, j) => (j === i ? e.target.value : x)))} />
                : <i style={{ '--c': c }} />}
              <Editable path={`dressCode.colorNames.${i}`} />
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

// Name, yes / no, party size (yes only). Guest count is everyone coming
// (companions = index of the chosen option).
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
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: idx, note: yes ? `Հյուրեր՝ ${rsvp.guestOptions[idx]}` : '' })
    setThanks(fillName(yes ? rsvp.thanksYes : rsvp.thanksNo, name.split(/\s+/)[0]))
  }

  return (
    <Card className="rsvp">
      <div className="in-pad">
        <h2 className="gold r"><Editable path="rsvp.title" /></h2>
        <span className="rule r" style={{ '--i': 1 }} />
        <p className="body r" style={{ '--i': 2 }}><Editable path="rsvp.intro" /></p>
        {thanks ? (
          <p className="thanks" role="status">{thanks}</p>
        ) : (
          <form className="form r" style={{ '--i': 3 }} noValidate onSubmit={submit}>
            <label className="field">
              <span className="caps">Անուն, ազգանուն</span>
              <input
                ref={nameRef} type="text" name="n" autoComplete="name" required
                aria-invalid={err || undefined} aria-describedby={err ? 'wtl-err' : undefined}
                onInput={() => err && setErr(false)}
              />
              {err && <span id="wtl-err" className="err">{rsvp.nameError}</span>}
            </label>
            <div className="choice" role="radiogroup" aria-label="Ձեր պատասխանը">
              <label className={yes ? 'on' : ''}><input type="radio" name="a" checked={yes} onChange={() => setYes(true)} /><Editable path="rsvp.yes" /></label>
              <label className={!yes ? 'on' : ''}><input type="radio" name="a" checked={!yes} onChange={() => setYes(false)} /><Editable path="rsvp.no" /></label>
            </div>
            {yes && (
              <label className="field">
                <span className="caps"><Editable path="rsvp.guestLabel" /></span>
                <select name="g">{rsvp.guestOptions.map((o) => <option key={o}>{o}</option>)}</select>
              </label>
            )}
            <button className="send" type="submit"><Editable path="rsvp.button" /></button>
          </form>
        )}
      </div>
    </Card>
  )
}

export function Closing() {
  return (
    <Card className="closing">
      <div className="in-pad">
        <p className="gold r"><Editable path="sign" /></p>
        <p className="names r" style={{ '--i': 1 }}><Names /></p>
      </div>
      <Tulip x={50} y="calc(100% - 76cqw)" w={50} rot={-5} />
    </Card>
  )
}
