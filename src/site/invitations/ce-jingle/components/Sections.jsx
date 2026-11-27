import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { pick, useInvLang } from '../../shared/invLang'
import { formatEventDate } from '../lib/date'
import ginger from '../assets/ginger.webp'
import cane from '../assets/cane.webp'
import gnome from '../assets/gnome.webp'
import tree from '../assets/tree.webp'
import stocking from '../assets/stocking.webp'
import snowman from '../assets/snowman.webp'
import cookie from '../assets/cookie.webp'
import gifts from '../assets/gifts.webp'
import deer from '../assets/deer.webp'
import AddToCalendar from '../../shared/AddToCalendar'

// The characters round the cover, in paint order; ce-jingle.css places
// each one (`ch-<id>`) and gives it its own little movement.
const CHARACTERS = [
  ['tree', tree], ['ginger', ginger], ['cane', cane], ['gnome', gnome], ['stocking', stocking],
  ['snowman', snowman], ['cookie', cookie], ['gifts', gifts], ['deer', deer],
]

// The design's own fixed words, in the invitation's language.
const WORDS = {
  hy: { invitation: 'Հրավեր', units: ['օր', 'ժամ', 'րոպե', 'վրկ'], answer: 'Ձեր պատասխանը', color: 'Գույն', newItem: 'Նոր կետ' },
  ru: { invitation: 'Приглашение', units: ['дн', 'ч', 'мин', 'сек'], answer: 'Ваш ответ', color: 'Цвет', newItem: 'Новый пункт' },
  en: { invitation: 'Invitation', units: ['days', 'hrs', 'min', 'sec'], answer: 'Your answer', color: 'Colour', newItem: 'New item' },
}
const useWords = () => pick(WORDS, useInvLang())

// No handwriting font covers Armenian: Armenian script lines are set in
// Noto Serif Armenian italic instead (`arm`).
const ARM = /[Ա-֏]/
const arm = (...texts) => (texts.some((t) => ARM.test(t || '')) ? ' arm' : '')

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

// One character: it pops in once its image has loaded (or failed), so a
// slow connection doesn't play the pop to an empty space.
function Character({ id, src, i }) {
  const ref = useRef(null)
  const [go, setGo] = useState(false)
  useEffect(() => { if (ref.current?.complete) setGo(true) }, [])
  return (
    <span className={`ch ch-${id}${go ? ' go' : ''}`} style={{ '--n': i }} aria-hidden="true">
      <img ref={ref} src={src} alt="" decoding="async" onLoad={() => setGo(true)} onError={() => setGo(true)} />
    </span>
  )
}

// The cover, after the reference card: the characters all round, the red
// script title, the spaced capitals, the date between hairlines, the red
// script line with the time and the place.
export function Hero() {
  const { data, editing } = useInvitationContent()
  const lang = useInvLang()
  const w = useWords()
  const d = formatEventDate(data.eventDate, lang)
  const { hero } = data
  return (
    <Block className="hero in" label={w.invitation}>
      {CHARACTERS.map(([id, src], i) => <Character key={id} id={id} src={src} i={i} />)}
      <div className="words">
        <p className="company r"><Editable path="company" /></p>
        <h1 className={`title r${arm(hero.title1, hero.title2)}`} style={{ '--i': 1 }}>
          <span className="t1"><Editable path="hero.title1" /></span>
          <span className="amp"><Editable path="hero.amp" /></span>
          <span className="t2"><Editable path="hero.title2" /></span>
        </h1>
        <p className="caps r" style={{ '--i': 2 }}><Editable path="hero.kicker" /></p>
        <p className="caps big r" style={{ '--i': 3 }}><Editable path="hero.subtitle" /></p>
        <div className="dr r" style={{ '--i': 4 }}>
          <span>{d.weekday}</span><b>{d.day}</b><span>{d.month}</span>
        </div>
        {editing && <p className="edit-when"><Editable path="eventDate" type="date" /></p>}
        <p className={`line r${arm(data.venue.name, d.at)}`} style={{ '--i': 5 }}>{d.at} <Editable path="venue.name" /></p>
        <p className="caps r" style={{ '--i': 6 }}><Editable path="venue.address" /></p>
        <p className="caps r" style={{ '--i': 7 }}><Editable path="rsvpLine" /></p>
        <p className="caps r" style={{ '--i': 8 }}><Editable path="hero.note" /></p>
      </div>
    </Block>
  )
}

// A star cookie opening each part.
function Cookie() {
  return <img className="cookie r" src={cookie} alt="" aria-hidden="true" loading="lazy" decoding="async" />
}

function Title({ path }) {
  const { data } = useInvitationContent()
  const text = path.split('.').reduce((o, k) => o?.[k], data)
  return <h2 className={`title2 r${arm(text)}`}><Editable path={path} /></h2>
}

export function Welcome() {
  const { data } = useInvitationContent()
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Block className="welcome">
      <Cookie />
      <Section id="greeting">
        <h2 className={`title2 r${arm(data.greeting.general)}`} style={{ '--i': 1 }}>
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
      <Cookie />
      <p className="caps r"><Editable path="countdownTitle" /></p>
      {cd && (
        <div className="cells r" style={{ '--i': 1 }} role="timer" aria-live="off">
          {[cd.d, pad(cd.h), pad(cd.m), pad(cd.s)].map((v, i) => (
            <span key={i}><b key={v}>{v}</b>{w.units[i]}</span>
          ))}
        </div>
      )}
      <p className="long r" style={{ '--i': 2 }}>{d.long}</p>
      <AddToCalendar slug="ce-jingle" kind="newYear" event={{ location: [data.venue.name, data.venue.address].filter(Boolean).join(', ') }} className="btn r" style={{ '--i': 3 }}>
        <Editable path="calendarButton" />
      </AddToCalendar>
    </Block>
  )
}

export function Program() {
  const { data } = useInvitationContent()
  const w = useWords()
  return (
    <Block className="program">
      <Cookie />
      <Title path="scheduleTitle" />
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
      <Cookie />
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
      <Cookie />
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
      <Cookie />
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
              aria-invalid={err || undefined} aria-describedby={err ? 'cjg-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="cjg-err" className="err">{rsvp.nameError}</span>}
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
      <div className="closing-chars r" aria-hidden="true">
        <img src={ginger} alt="" loading="lazy" decoding="async" />
        <img src={gifts} alt="" loading="lazy" decoding="async" />
        <img src={deer} alt="" loading="lazy" decoding="async" />
      </div>
      <p className={`title2 big r${arm(data.closing.line)}`} style={{ '--i': 1 }}><Editable path="closing.line" /></p>
      <p className="caps r" style={{ '--i': 2 }}><Editable path="closing.signature" /></p>
    </Block>
  )
}
