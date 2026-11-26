import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { pick, useInvLang } from '../../shared/invLang'
import { calendarUrl, formatEventDate } from '../lib/date'
import Art, { Sparkle } from './Art'

// The design's own fixed words, in the invitation's language.
const WORDS = {
  hy: { invitation: 'Հրավեր', units: ['օր', 'ժամ', 'րոպե', 'վրկ'], answer: 'Ձեր պատասխանը', color: 'Գույն', newItem: 'Նոր կետ' },
  ru: { invitation: 'Приглашение', units: ['дн', 'ч', 'мин', 'сек'], answer: 'Ваш ответ', color: 'Цвет', newItem: 'Новый пункт' },
  en: { invitation: 'Invitation', units: ['days', 'hrs', 'min', 'sec'], answer: 'Your answer', color: 'Colour', newItem: 'New item' },
}
const useWords = () => pick(WORDS, useInvLang())

// No handwriting font covers Armenian: Armenian lines are set in Noto
// Serif Armenian italic instead, a little smaller (`arm`).
const ARM = /[Ա-֏]/
const arm = (...texts) => (texts.some((t) => ARM.test(t || '')) ? ' arm' : '')

// Long title lines («Деда Мороза!») are set smaller so they stay on the card.
function titleFit(hero) {
  const longest = Math.max(...[hero.title1, hero.title2].map((t) => [...String(t || '')].length))
  return Math.min(1, 10.5 / Math.max(longest, 1)).toFixed(3)
}

// A page section that gets `.in` once it scrolls into view; its `.r`
// children reveal from that, staggered by --i.
function Block({ className = '', label, children }) {
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
  return <section ref={ref} className={`blk ${className}`} aria-label={label}>{children}</section>
}

// The cover, after the reference card: the tilted black title, Santa in
// the glass, the red event name bottom left, the hosts and the red
// details bottom right, sparkles round about.
export function Hero() {
  const { data, editing } = useInvitationContent()
  const lang = useInvLang()
  const w = useWords()
  const d = formatEventDate(data.eventDate, lang)
  const { hero } = data
  return (
    <Block className="hero in" label={w.invitation}>
      {[1, 2, 3, 4, 5, 6].map((n) => <Sparkle key={n} className={`sp sp${n}`} />)}
      <h1 className={`ttl r${arm(hero.title1, hero.title2)}`} style={{ '--fit': titleFit(hero) }}>
        <span><Editable path="hero.title1" /></span>
        <span><Editable path="hero.title2" /></span>
      </h1>
      <div className="stage"><Art /></div>
      <div className="lead-b r" style={{ '--i': 2 }}>
        <p className={`lead${arm(hero.lead)}`}><Editable path="hero.lead" /></p>
        <p className={`ev${arm(hero.event1, hero.event2)}`}>
          <span><Editable path="hero.event1" /></span>
          <span><Editable path="hero.event2" /></span>
        </p>
      </div>
      <div className="host-b r" style={{ '--i': 3 }}>
        <p className={`hb${arm(hero.hostedBy)}`}><Editable path="hero.hostedBy" /></p>
        <p className={`co${arm(data.company)}`}><Editable path="company" /></p>
        <div className={`det${arm(d.line)}`}>
          <p>{d.line}</p>
          {editing && <p><Editable path="eventDate" type="date" /></p>}
          <p><Editable path="venue.name" /></p>
          <p><Editable path="venue.address" /></p>
          <p><Editable path="rsvpLine" /></p>
        </div>
      </div>
    </Block>
  )
}

function Divider() {
  return (
    <p className="divider r" aria-hidden="true">
      <Sparkle className="d1" /><Sparkle className="d2" /><Sparkle className="d3" />
    </p>
  )
}

function Title({ path, red = false }) {
  const { data } = useInvitationContent()
  const text = path.split('.').reduce((o, k) => o?.[k], data)
  return <h2 className={`title2 r${red ? ' red' : ''}${arm(text)}`}><Editable path={path} /></h2>
}

export function Welcome() {
  const { data } = useInvitationContent()
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Block className="welcome">
      <Divider />
      <Section id="greeting">
        <h2 className={`title2 big r${arm(data.greeting.general)}`} style={{ '--i': 1 }}>
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
  return { d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60 }
}

export function Countdown() {
  const { data, editing } = useInvitationContent()
  const lang = useInvLang()
  const w = useWords()
  const d = formatEventDate(data.eventDate, lang)
  const cd = useCountdown(data.eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  const cal = calendarUrl({
    title: [data.hero.event1, data.hero.event2].filter(Boolean).join(' '),
    iso: data.eventDate,
    location: [data.venue.name, data.venue.address].filter(Boolean).join(', '),
  })
  return (
    <Block className="count">
      <Divider />
      <p className="small r"><Editable path="countdownTitle" /></p>
      {cd && (
        <div className="cells r" style={{ '--i': 1 }} role="timer" aria-live="off">
          {[cd.d, pad(cd.h), pad(cd.m), pad(cd.s)].map((v, i) => (
            <span key={i}><b key={v}>{v}</b>{w.units[i]}</span>
          ))}
        </div>
      )}
      <p className="long r" style={{ '--i': 2 }}>{d.long}</p>
      {cal && (
        <a className="btn r" style={{ '--i': 3 }} href={editing ? undefined : cal} target="_blank" rel="noopener noreferrer">
          <Editable path="calendarButton" />
        </a>
      )}
    </Block>
  )
}

export function Program() {
  const { data } = useInvitationContent()
  const w = useWords()
  return (
    <Block className="program">
      <Divider />
      <Title path="scheduleTitle" red />
      <ol className="tl">
        {data.schedule.map((_, i) => (
          <li key={i} className="r" style={{ '--i': i + 1 }}>
            <Editable as="time" path={`schedule.${i}.time`} />
            <Editable path={`schedule.${i}.label`} />
            <RowRemove list="schedule" index={i} />
          </li>
        ))}
      </ol>
      <RowAdd list="schedule" text={w.newItem} />
    </Block>
  )
}

const mapUrl = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`

export function Venue() {
  const { data, editing } = useInvitationContent()
  return (
    <Block className="venue">
      <Divider />
      <Title path="venueTitle" />
      <p className="vname r" style={{ '--i': 1 }}><Editable path="venue.name" /></p>
      <p className="body r" style={{ '--i': 2 }}><Editable path="venue.address" /></p>
      <a className="btn r" style={{ '--i': 3 }} href={editing ? undefined : mapUrl(data.venue.address)} target="_blank" rel="noopener noreferrer">
        <Editable path="mapButton" />
      </a>
    </Block>
  )
}

export function DressCode() {
  const { data, editing, setField } = useInvitationContent()
  const w = useWords()
  return (
    <Block className="dress">
      <Divider />
      <Title path="dressCode.title" red />
      <p className="body r" style={{ '--i': 1 }}><Editable path="dressCode.text" /></p>
      <div className="sw r" style={{ '--i': 2 }}>
        {data.dressCode.colors.map((c, i) => (
          editing ? (
            <input key={i} type="color" className="sw-edit" value={c} aria-label={`${w.color} ${i + 1}`} onChange={(e) => setField(`dressCode.colors.${i}`, e.target.value)} />
          ) : (
            <span key={i} className="sw-i" style={{ '--c': c, '--k': i }} />
          )
        ))}
      </div>
    </Block>
  )
}

export function Rsvp() {
  const { data, editing, onRsvp, guestName } = useInvitationContent()
  const w = useWords()
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
    const note = [yes ? rsvp.plusOptions[plus] : '', f.w.value.trim()].filter(Boolean).join(' · ')
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: yes ? plus : 0, note })
    setThanks(fillName(yes ? rsvp.thanksYes : rsvp.thanksNo, name.split(/\s+/)[0]))
  }

  return (
    <Block className="rsvp">
      <Divider />
      <Title path="rsvp.title" />
      <p className="body r" style={{ '--i': 1 }}><Editable path="rsvp.intro" /></p>
      {thanks ? (
        <p className={`thanks${arm(thanks)}`} role="status">{thanks}</p>
      ) : (
        <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
          <label className="field">
            <span className="lbl"><Editable path="rsvp.nameLabel" /></span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required defaultValue={guestName || ''}
              aria-invalid={err || undefined} aria-describedby={err ? 'ctt-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="ctt-err" className="err">{rsvp.nameError}</span>}
          </label>
          <div className="choice" role="radiogroup" aria-label={w.answer}>
            <label className={yes ? 'on' : ''}><input type="radio" name="a" checked={yes} onChange={() => setYes(true)} /><Editable path="rsvp.yes" /></label>
            <label className={!yes ? 'on' : ''}><input type="radio" name="a" checked={!yes} onChange={() => setYes(false)} /><Editable path="rsvp.no" /></label>
          </div>
          {yes && (
            <div className="field">
              <span className="lbl"><Editable path="rsvp.plusLabel" /></span>
              <div className="choice" role="radiogroup" aria-label={rsvp.plusLabel}>
                {rsvp.plusOptions.map((o, i) => (
                  <label key={i} className={plus === i ? 'on' : ''}><input type="radio" name="p" checked={plus === i} onChange={() => setPlus(i)} />{o}</label>
                ))}
              </div>
            </div>
          )}
          <label className="field">
            <span className="lbl"><Editable path="rsvp.noteLabel" /></span>
            <textarea name="w" rows="2" />
          </label>
          <button className="btn solid send" type="submit"><Editable path="rsvp.button" /></button>
        </form>
      )}
    </Block>
  )
}

export function Closing() {
  const { data } = useInvitationContent()
  return (
    <Block className="closing">
      <Divider />
      <p className={`title2 big red r${arm(data.closing.line)}`} style={{ '--i': 1 }}><Editable path="closing.line" /></p>
      <p className={`co small-co r${arm(data.company)}`} style={{ '--i': 2 }}><Editable path="company" /></p>
    </Block>
  )
}
