import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { pick, useInvLang } from '../../shared/invLang'
import { formatEventDate } from '../lib/date'
import cornerArt from '../assets/corner.webp'
import bottomArt from '../assets/bottom.webp'
import baubleArt from '../assets/bauble.webp'
import AddToCalendar from '../../shared/AddToCalendar'
import { LiveStep, useLiveSchedule } from '../../shared/LiveSchedule'
import RsvpExtra from '../../shared/RsvpExtra'

// The design's own fixed words, in the invitation's language.
const WORDS = {
  hy: { invitation: 'Հրավեր', units: ['օր', 'ժամ', 'րոպե', 'վրկ'], answer: 'Ձեր պատասխանը', color: 'Գույն', newItem: 'Նոր կետ' },
  ru: { invitation: 'Приглашение', units: ['дн', 'ч', 'мин', 'сек'], answer: 'Ваш ответ', color: 'Цвет', newItem: 'Новый пункт' },
  en: { invitation: 'Invitation', units: ['days', 'hrs', 'min', 'sec'], answer: 'Your answer', color: 'Colour', newItem: 'New item' },
}
const useWords = () => pick(WORDS, useInvLang())

// No script font covers Armenian: Armenian script lines are set in Noto
// Serif Armenian italic instead (`arm`).
const ARM = /[Ա-֏]/
const arm = (...texts) => (texts.some((t) => ARM.test(t || '')) ? ' arm' : '')

// A long title word («НОВОГОДНИЙ») is set smaller so it stays in the frame.
function titleFit(title) {
  const n = [...String(title || '')].length
  return Math.min(1, (ARM.test(title || '') ? 8 : 9) / Math.max(n, 1)).toFixed(3)
}

// True once the image has loaded (or failed): the arrival animations wait
// for it, so a slow connection doesn't play them to an empty space.
function useLoaded() {
  const ref = useRef(null)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { if (ref.current?.complete) setLoaded(true) }, [])
  return [ref, loaded, () => setLoaded(true)]
}

function Img({ className, src, priority }) {
  const [ref, loaded, done] = useLoaded()
  return (
    <img
      ref={ref} className={`${className}${loaded ? ' go' : ''}`} src={src} alt="" aria-hidden="true"
      decoding="async" fetchpriority={priority ? 'high' : undefined} onLoad={done} onError={done}
    />
  )
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

// The cover, after the reference card: a thin green frame, greenery in the
// top right corner, the bauble top left, the stocking, gift and greenery
// along the bottom, the words in the middle.
export function Hero() {
  const { data, editing } = useInvitationContent()
  const lang = useInvLang()
  const w = useWords()
  const d = formatEventDate(data.eventDate, lang)
  const { hero } = data
  return (
    <Block className="hero in" label={w.invitation}>
      <div className="frame" aria-hidden="true" />
      <Img className="corner" src={cornerArt} priority />
      <Img className="band" src={bottomArt} priority />
      <div className="bauble-w" aria-hidden="true"><Img className="bauble" src={baubleArt} /></div>
      <div className="words">
        <p className={`company r${arm(data.company)}`}><Editable path="company" /></p>
        <p className="kicker r" style={{ '--i': 1 }}><Editable path="hero.kicker" /></p>
        <h1 className="title r" style={{ '--i': 2, '--fit': titleFit(hero.title) }}>
          <span className="big"><Editable path="hero.title" /></span>
          <span className={`script${arm(hero.script)}`}><Editable path="hero.script" /></span>
        </h1>
        <p className="text r" style={{ '--i': 3 }}><Editable path="hero.text" /></p>
        <div className="when r" style={{ '--i': 4 }}>
          <p className="month">{d.month}</p>
          <div className="row">
            <span className="side">{d.weekday}</span>
            <b>{d.day}</b>
            <span className="side">{d.at}</span>
          </div>
          {editing && <p className="edit-when"><Editable path="eventDate" type="date" /></p>}
        </div>
        <p className="addr r" style={{ '--i': 5 }}>
          <span><Editable path="venue.name" /></span>
          <span><Editable path="venue.address" /></span>
        </p>
      </div>
    </Block>
  )
}

// A sprig of holly with three berries, opening each part.
function Holly() {
  return (
    <p className="holly r" aria-hidden="true">
      <svg viewBox="0 0 120 60" width="84" height="42" focusable="false">
        <g fill="#2f6430">
          <path d="M60 32 C 50 22, 46 26, 40 18 C 38 26, 30 24, 24 20 C 26 28, 18 30, 10 30 C 18 34, 18 40, 12 46 C 22 44, 28 48, 34 52 C 34 44, 44 44, 48 40 C 52 38, 56 36, 60 32 Z" />
          <path d="M60 32 C 70 22, 74 26, 80 18 C 82 26, 90 24, 96 20 C 94 28, 102 30, 110 30 C 102 34, 102 40, 108 46 C 98 44, 92 48, 86 52 C 86 44, 76 44, 72 40 C 68 38, 64 36, 60 32 Z" />
        </g>
        <path d="M60 32 L 20 34 M60 32 L 100 34" stroke="#1d4420" strokeWidth="1.2" opacity=".6" />
        <g fill="#c4232c"><circle className="b b1" cx="54" cy="30" r="6" /><circle className="b b2" cx="66" cy="30" r="6" /><circle className="b b3" cx="60" cy="20" r="6" /></g>
      </svg>
    </p>
  )
}

function Title({ path }) {
  return <h2 className="title2 r"><Editable path={path} /></h2>
}

export function Welcome() {
  const { data } = useInvitationContent()
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Block className="welcome">
      <Holly />
      <Section id="greeting">
        <h2 className={`script big r${arm(data.greeting.general)}`} style={{ '--i': 1 }}>
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
  return (
    <Block className="count">
      <Holly />
      <p className="small r"><Editable path="countdownTitle" /></p>
      {cd && (
        <div className="cells r" style={{ '--i': 1 }} role="timer" aria-live="off">
          {[cd.d, pad(cd.h), pad(cd.m), pad(cd.s)].map((v, i) => (
            <span key={i}><b key={v}>{v}</b>{w.units[i]}</span>
          ))}
        </div>
      )}
      <p className="long r" style={{ '--i': 2 }}>{d.long}</p>
      <AddToCalendar slug="ce-holly" kind="newYear" event={{ location: [data.venue.name, data.venue.address].filter(Boolean).join(', ') }} className="btn r" style={{ '--i': 3 }}>
        <Editable path="calendarButton" />
      </AddToCalendar>
    </Block>
  )
}

export function Program() {
  const { data } = useInvitationContent()
  const live = useLiveSchedule()
  const w = useWords()
  return (
    <Block className="program">
      <Holly />
      <Title path="scheduleTitle" />
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
      <RowAdd list="schedule" text={w.newItem} />
    </Block>
  )
}

const mapUrl = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`

export function Venue() {
  const { data, editing } = useInvitationContent()
  return (
    <Block className="venue">
      <Holly />
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
      <Holly />
      <Title path="dressCode.title" />
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
      <Holly />
      <Title path="rsvp.title" />
      <p className="body r" style={{ '--i': 1 }}><Editable path="rsvp.intro" /></p>
      {thanks ? (
        <p className={`thanks script${arm(thanks)}`} role="status">{thanks}</p>
      ) : (
        <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
          <label className="field">
            <span className="lbl"><Editable path="rsvp.nameLabel" /></span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required defaultValue={guestName || ''}
              aria-invalid={err || undefined} aria-describedby={err ? 'ceh-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="ceh-err" className="err">{rsvp.nameError}</span>}
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
          <RsvpExtra />
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
      <Holly />
      <p className={`script big r${arm(data.closing.line)}`} style={{ '--i': 1 }}><Editable path="closing.line" /></p>
      <p className="sig r" style={{ '--i': 2 }}><Editable path="closing.signature" /></p>
    </Block>
  )
}
