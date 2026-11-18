import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { calendarUrl, formatEventDate } from '../lib/date'

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

// The ornament outline — a ball with its cap — in a 400 × 470 box; the
// hanging point (the eyelet) is at 200,62.
const BALL = { cx: 200, cy: 280, r: 178 }
function Outline(props) {
  return (
    <g {...props}>
      <rect x="166" y="78" width="68" height="44" rx="10" />
      <circle cx={BALL.cx} cy={BALL.cy} r={BALL.r} />
    </g>
  )
}

// The red watercolour ornament on its cream satin bow, with three white
// ornament-shaped cards fanned out behind it. Drawn, not photographed, so
// it stays crisp at any size.
function OrnamentArt() {
  return (
    <svg className="orn-svg" viewBox="0 0 400 470" aria-hidden="true">
      <defs>
        <radialGradient id="ceo-red" cx="36%" cy="30%" r="78%">
          <stop offset="0" stopColor="#e05a52" />
          <stop offset=".42" stopColor="#b8292f" />
          <stop offset=".8" stopColor="#861a24" />
          <stop offset="1" stopColor="#5e111b" />
        </radialGradient>
        <radialGradient id="ceo-shade" cx="70%" cy="70%" r="62%">
          <stop offset="0" stopColor="#3d0d18" stopOpacity=".45" />
          <stop offset=".55" stopColor="#3d0d18" stopOpacity=".18" />
          <stop offset="1" stopColor="#3d0d18" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ceo-cap" x1="0" x2="1">
          <stop offset="0" stopColor="#8c1d25" />
          <stop offset=".35" stopColor="#d1554f" />
          <stop offset=".6" stopColor="#b5302f" />
          <stop offset="1" stopColor="#7a1820" />
        </linearGradient>
        <linearGradient id="ceo-satin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbf6ea" />
          <stop offset=".45" stopColor="#e9dfc9" />
          <stop offset=".7" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#d8ccb3" />
        </linearGradient>
        <filter id="ceo-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5" />
          <feColorMatrix values="0 0 0 0 .3  0 0 0 0 .05  0 0 0 0 .08  0 0 0 .55 -.18" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="ceo-soft"><feGaussianBlur stdDeviation="7" /></filter>
        <filter id="ceo-paper" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3" seed="2" />
          <feColorMatrix values="0 0 0 0 .5  0 0 0 0 .48  0 0 0 0 .45  0 0 0 .22 -.06" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="ceo-drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="8" stdDeviation="8" floodColor="#3a2420" floodOpacity=".28" />
        </filter>
        <clipPath id="ceo-ball"><circle cx={BALL.cx} cy={BALL.cy} r={BALL.r} /></clipPath>
      </defs>

      {/* the fan of white cards */}
      {[-27, -18, -9].map((a, i) => (
        <g key={a} className="fan" style={{ '--a': `${a}deg`, '--d': `${0.9 + i * 0.12}s` }}>
          <Outline className="card-shape" filter="url(#ceo-drop)" />
          <Outline className="card-grain" filter="url(#ceo-paper)" />
        </g>
      ))}

      {/* the red ornament */}
      <g className="ball" filter="url(#ceo-drop)">
        <rect x="166" y="78" width="68" height="44" rx="10" fill="url(#ceo-cap)" />
        <rect x="166" y="78" width="68" height="10" rx="5" fill="#ffffff" opacity=".12" />
        <circle cx={BALL.cx} cy={BALL.cy} r={BALL.r} fill="url(#ceo-red)" />
      </g>
      <g clipPath="url(#ceo-ball)">
        <circle cx={BALL.cx} cy={BALL.cy} r={BALL.r} fill="url(#ceo-shade)" />
        <ellipse cx="128" cy="190" rx="70" ry="44" transform="rotate(-32 128 190)" fill="#ffd9d2" opacity=".55" filter="url(#ceo-soft)" />
        <ellipse cx="118" cy="182" rx="26" ry="15" transform="rotate(-32 118 182)" fill="#fff" opacity=".6" filter="url(#ceo-soft)" />
        <circle cx={BALL.cx} cy={BALL.cy} r={BALL.r} fill="#000" filter="url(#ceo-grain)" opacity=".9" />
      </g>

      {/* eyelet and satin bow */}
      <circle cx="200" cy="64" r="15" fill="#d6b66d" />
      <circle cx="200" cy="64" r="11" fill="#b8282d" />
      <circle cx="200" cy="64" r="5.5" fill="#fbf6ea" />
      {/* the bow is a satin ribbon: each loop and tail is a band drawn
          twice — a darker edge, then the satin face */}
      <g className="bow" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {[
          'M198 60 C 150 -6, 72 -26, 74 22 C 76 58, 150 66, 196 62',
          'M202 60 C 244 -24, 346 -44, 338 6 C 332 48, 256 64, 204 62',
          'M198 64 C 182 92, 160 116, 146 150',
          'M202 64 C 224 82, 258 96, 290 102',
        ].map((d) => (
          <g key={d}>
            <path d={d} stroke="#cbbd9f" strokeWidth="17" />
            <path d={d} stroke="url(#ceo-satin)" strokeWidth="13" />
          </g>
        ))}
        <ellipse cx="200" cy="62" rx="13" ry="10" fill="url(#ceo-satin)" stroke="#cbbd9f" strokeWidth="2" />
      </g>
    </svg>
  )
}

// Latin names are written in Great Vibes; Armenian ones (no script font
// covers Armenian) in Noto Serif Armenian italic.
const ARM = /[Ա-և]/

// Fit the name on the ball: shorter names are written larger.
function nameSize(name) {
  const n = [...String(name || '')].length
  if (n <= 6) return 'n-l'
  if (n <= 10) return 'n-m'
  return 'n-s'
}

// The cover: the company, the ornament with the guest's name written on
// it (or the general line), the event's name and the date. The ornament
// sways on its ribbon; a tap gives it a push.
export function Hero() {
  const { data, guestName } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const [push, setPush] = useState(0)
  const shown = guestName || data.ornament.general
  return (
    <Block className="hero" label="Հրավեր">
      <p className="company r"><Editable path="company" /></p>
      <p className="caps r" style={{ '--i': 1 }}><Editable path="hero.kicker" /></p>
      <div
        className={`orn${push ? ' push' : ''}`} role="img" aria-label={shown}
        onClick={() => setPush((n) => n + 1)} onAnimationEnd={(e) => { if (e.animationName === 'ceoPush') setPush(0) }}
      >
        <OrnamentArt />
        <p className={`oname ${ARM.test(shown) ? 'arm' : 'lat'} ${nameSize(shown)}`}>
          {guestName ? guestName : <Editable path="ornament.general" />}
        </p>
      </div>
      <h1 className="htitle r" style={{ '--i': 2 }}><Editable path="hero.title" /></h1>
      <p className="hdate r" style={{ '--i': 3 }}>{d.long}</p>
    </Block>
  )
}

// A small cap, eyelet and ribbon ends hanging each card.
function Hanger() {
  return (
    <svg className="hanger" viewBox="0 0 80 46" aria-hidden="true">
      <path d="M36 14 C 26 26, 16 34, 8 44 M44 14 C 54 26, 64 34, 72 44" fill="none" stroke="#e8dcc4" strokeWidth="4" strokeLinecap="round" />
      <rect x="26" y="24" width="28" height="18" rx="5" fill="#b3282e" />
      <circle cx="40" cy="14" r="8" fill="#d6b66d" />
      <circle cx="40" cy="14" r="3.4" fill="#fbf6ea" />
    </svg>
  )
}

// A white card hanging on the wall: every section after the cover.
function Card({ className = '', children, tilt = 0 }) {
  return (
    <Block className={`hang ${className}`}>
      <div className="card r" style={{ '--t': `${tilt}deg` }}>
        <Hanger />
        {children}
      </div>
    </Block>
  )
}

function Title({ path }) {
  return <h2 className="title"><Editable path={path} /></h2>
}

export function Welcome() {
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Card className="welcome" tilt={-1.2}>
      <Section id="greeting">
        <h2 className="title"><GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting></h2>
      </Section>
      <Section id="message"><p className="body"><Editable path="message" /></p></Section>
    </Card>
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

export function DateCard() {
  const { data, editing } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const cd = useCountdown(data.eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  const cal = calendarUrl({
    title: `${data.hero.title} · ${data.company}`,
    iso: data.eventDate,
    hours: 5,
    location: [data.venue.name, data.venue.address].filter(Boolean).join(', '),
  })
  return (
    <Card className="date" tilt={1}>
      <Title path="dateTitle" />
      {editing ? <Editable path="eventDate" type="date" /> : (
        <div className="big">
          <span className="caps">{d.weekday}</span>
          <b>{d.day}</b>
          <span className="my">{d.monthYear} · {d.time}</span>
        </div>
      )}
      {cd && (
        <div className="cd">
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
        <a className="btn" href={editing ? undefined : cal} target="_blank" rel="noopener noreferrer">
          <Editable path="calendarButton" />
        </a>
      )}
    </Card>
  )
}

export function Program() {
  const { data } = useInvitationContent()
  return (
    <Card className="program" tilt={-0.8}>
      <Title path="scheduleTitle" />
      <ol className="tl">
        {data.schedule.map((_, i) => (
          <li key={i}>
            <Editable as="time" path={`schedule.${i}.time`} />
            <Editable path={`schedule.${i}.label`} />
            <RowRemove list="schedule" index={i} />
          </li>
        ))}
      </ol>
      <RowAdd list="schedule" />
    </Card>
  )
}

const mapUrl = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`

export function Venue() {
  const { data, editing } = useInvitationContent()
  return (
    <Card className="venue" tilt={1.1}>
      <Title path="venueTitle" />
      <p className="vname"><Editable path="venue.name" /></p>
      <p className="vaddr"><Editable path="venue.address" /></p>
      <a className="btn" href={editing ? undefined : mapUrl(data.venue.address)} target="_blank" rel="noopener noreferrer">
        <Editable path="mapButton" />
      </a>
    </Card>
  )
}

// Swatches are tiny ornaments.
export function DressCode() {
  const { data, editing, setField } = useInvitationContent()
  const { colors } = data.dressCode
  return (
    <Card className="dress" tilt={-1}>
      <Title path="dressCode.title" />
      <p className="body"><Editable path="dressCode.text" /></p>
      <div className="sw">
        {colors.map((c, i) => (
          editing ? (
            <input key={i} type="color" className="sw-edit" value={c} aria-label={`Գույն ${i + 1}`} onChange={(e) => setField(`dressCode.colors.${i}`, e.target.value)} />
          ) : (
            <span key={i} className="sw-i" style={{ '--c': c }}><i /></span>
          )
        ))}
      </div>
    </Card>
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
    <Card className="rsvp" tilt={0.8}>
      <Title path="rsvp.title" />
      <p className="body"><Editable path="rsvp.intro" /></p>
      {thanks ? (
        <p className="thanks" role="status">{thanks}</p>
      ) : (
        <form className="form" noValidate onSubmit={submit}>
          <label className="field">
            <span className="lbl"><Editable path="rsvp.nameLabel" /></span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required defaultValue={guestName || ''}
              aria-invalid={err || undefined} aria-describedby={err ? 'ceo-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="ceo-err" className="err">{rsvp.nameError}</span>}
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
          <button className="send" type="submit"><Editable path="rsvp.button" /></button>
        </form>
      )}
    </Card>
  )
}

export function Closing() {
  return (
    <Block className="closing">
      <p className="cline r"><Editable path="closing.line" /></p>
      <p className="sig r" style={{ '--i': 1 }}><Editable path="closing.signature" /></p>
    </Block>
  )
}
