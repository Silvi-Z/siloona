import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { pick, useInvLang } from '../../shared/invLang'
import { formatEventDate } from '../lib/date'
import { Crown, Flourish, Portrait } from './bits'
import sceneImg from '../assets/scene.webp'
import AddToCalendar from '../../shared/AddToCalendar'
import { LiveStep, useLiveSchedule } from '../../shared/LiveSchedule'
import RsvpExtra from '../../shared/RsvpExtra'

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

function Title({ path, i = 0 }) {
  return <h2 className="title r" style={{ '--i': i }}><Editable path={path} /></h2>
}

// The design's own fixed words, in the invitation's language.
const WORDS = {
  hy: {
    invitation: 'Հրավեր', age: () => 'տարեկան', units: ['օր', 'ժամ', 'րոպե', 'վրկ'], party: 'ծննդյան տոն', calendar: 'Ավելացնել օրացույցում',
    scene: 'Վարդագույն ամրոց և հեքիաթային արքայադուստրեր ու արքայազներ', answer: 'Ձեր պատասխանը', guests: 'Հյուրեր՝ ',
  },
  ru: {
    invitation: 'Приглашение', age: (n) => ruYears(n), units: ['дн', 'ч', 'мин', 'сек'], party: 'день рождения', calendar: 'Добавить в календарь',
    scene: 'Розовый замок и сказочные принцессы и принцы', answer: 'Ваш ответ', guests: 'Гостей: ',
  },
  en: {
    invitation: 'Invitation', age: (n) => (String(n).trim() === '1' ? 'year old' : 'years old'), units: ['days', 'hrs', 'min', 'sec'], party: 'birthday party', calendar: 'Add to calendar',
    scene: 'A pink castle with fairy-tale princesses and princes', answer: 'Your answer', guests: 'Guests: ',
  },
}
// 1 год, 2–4 года, 5–20 лет, 21 год…
function ruYears(n) {
  const x = Math.abs(parseInt(n, 10)) || 0
  if (x % 10 === 1 && x % 100 !== 11) return 'год'
  if (x % 10 >= 2 && x % 10 <= 4 && (x % 100 < 12 || x % 100 > 14)) return 'года'
  return 'лет'
}
const useWords = () => pick(WORDS, useInvLang())

// The cover. Revealed by the root's `.go` (when the letter is opened), not
// by scrolling — it sits under the intro until then.
export function Hero() {
  const { data } = useInvitationContent()
  const lang = useInvLang()
  const w = pick(WORDS, lang)
  const d = formatEventDate(data.eventDate, lang)
  return (
    <section className="blk hero" aria-label={w.invitation}>
      <p className="caps r"><Editable path="hero.kicker" /></p>
      <Flourish i={1} />
      <h1 className="htitle r" style={{ '--i': 2 }}><Editable path="hero.title" /></h1>
      <div className="age r" style={{ '--i': 3 }}>
        <Crown className="acrown" />
        <b><Editable path="child.age" /></b>
        <small>{w.age(data.child.age)}</small>
      </div>
      <p className="hdate r" style={{ '--i': 4 }}>{d.long}</p>
      <div className="scene r" style={{ '--i': 5 }}>
        <img src={sceneImg} alt={w.scene} />
      </div>
    </section>
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
      <Flourish i={2} />
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

// Cinderella keeps an eye on the clock. The countdown sits in four arched
// castle windows, then the calendar link.
export function Countdown() {
  const { data, editing } = useInvitationContent()
  const w = useWords()
  const cd = useCountdown(data.eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  return (
    <Block className="count">
      <Portrait img="cinderella" />
      <Title path="countdownTitle" i={1} />
      {editing && <div className="r" style={{ '--i': 2 }}><Editable path="eventDate" type="date" /></div>}
      {cd && (
        <div className="cells r" style={{ '--i': 2 }} role="timer" aria-live="off">
          <span><b>{cd.d}</b>{w.units[0]}</span>
          <span><b>{pad(cd.h)}</b>{w.units[1]}</span>
          <span><b>{pad(cd.m)}</b>{w.units[2]}</span>
          <span><b>{pad(cd.s)}</b>{w.units[3]}</span>
        </div>
      )}
      <AddToCalendar slug="bd-castle" event={{ location: [data.venue.name, data.venue.address].filter(Boolean).join(', ') }} className="btn r" style={{ '--i': 3 }}>
        {w.calendar}
      </AddToCalendar>
    </Block>
  )
}

export function Program() {
  const { data } = useInvitationContent()
  const live = useLiveSchedule()
  return (
    <Block className="program">
      <Portrait img="belle" />
      <Title path="scheduleTitle" i={1} />
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
      <Portrait img="jasmine" />
      <Title path="venue.title" i={1} />
      <p className="vname r" style={{ '--i': 2 }}><Editable path="venue.name" /></p>
      <p className="vaddr r" style={{ '--i': 3 }}><Editable path="venue.address" /></p>
      <a className="btn r" style={{ '--i': 4 }} href={editing ? undefined : mapUrl(data.venue.address)} target="_blank" rel="noopener noreferrer">
        <Editable path="venue.button" />
      </a>
    </Block>
  )
}

export function DressCode() {
  return (
    <Block className="dress">
      <Portrait img="ariel" />
      <Title path="dressCode.title" i={1} />
      <p className="body r" style={{ '--i': 2 }}><Editable path="dressCode.text" /></p>
    </Block>
  )
}

export function Rsvp() {
  const { data, editing, onRsvp, guestName } = useInvitationContent()
  const w = useWords()
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
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: idx, note: yes ? `${w.guests}${rsvp.guestOptions[idx]}` : '' })
    setThanks(fillName(yes ? rsvp.thanksYes : rsvp.thanksNo, name.split(/\s+/)[0]))
  }

  return (
    <Block className="rsvp">
      <div className="card r">
        <Crown className="ccrown" />
        <h2 className="title"><Editable path="rsvp.title" /></h2>
        <p className="body"><Editable path="rsvp.intro" /></p>
        {thanks ? (
          <p className="thanks" role="status">{thanks}</p>
        ) : (
          <form className="form" noValidate onSubmit={submit}>
            <label className="field">
              <span><Editable path="rsvp.nameLabel" /></span>
              <input
                ref={nameRef} type="text" name="n" autoComplete="name" defaultValue={guestName || ''} required
                aria-invalid={err || undefined} aria-describedby={err ? 'bdc-err' : undefined}
                onInput={() => err && setErr(false)}
              />
              {err && <span id="bdc-err" className="err">{rsvp.nameError}</span>}
            </label>
            <div className="choice" role="radiogroup" aria-label={w.answer}>
              <label className={yes ? 'on' : ''}><input type="radio" name="a" checked={yes} onChange={() => setYes(true)} /><Editable path="rsvp.yes" /></label>
              <label className={!yes ? 'on' : ''}><input type="radio" name="a" checked={!yes} onChange={() => setYes(false)} /><Editable path="rsvp.no" /></label>
            </div>
            {yes && (
              <label className="field">
                <span><Editable path="rsvp.guestLabel" /></span>
                <select name="g">{rsvp.guestOptions.map((o) => <option key={o}>{o}</option>)}</select>
              </label>
            )}
            <RsvpExtra />
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
      <Portrait img="aurora" />
      <p className="title r" style={{ '--i': 1 }}><Editable path="closing.line" /></p>
      <Flourish i={2} />
      <p className="sig r" style={{ '--i': 3 }}><Editable path="closing.signature" /></p>
    </Block>
  )
}
