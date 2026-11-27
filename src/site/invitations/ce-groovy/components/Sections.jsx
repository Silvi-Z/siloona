import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { pick, useInvLang } from '../../shared/invLang'
import { formatEventDate } from '../lib/date'
import { Bells, DiscoBall, Gifts, MiniRainbow, Sparkle } from './Art'
import AddToCalendar from '../../shared/AddToCalendar'
import { LiveStep, useLiveSchedule } from '../../shared/LiveSchedule'

// The design's own fixed words, in the invitation's language.
const WORDS = {
  hy: { invitation: 'Հրավեր', units: ['օր', 'ժամ', 'րոպե', 'վրկ'], answer: 'Ձեր պատասխանը', color: 'Գույն', newItem: 'Նոր կետ' },
  ru: { invitation: 'Приглашение', units: ['дн', 'ч', 'мин', 'сек'], answer: 'Ваш ответ', color: 'Цвет', newItem: 'Новый пункт' },
  en: { invitation: 'Invitation', units: ['days', 'hrs', 'min', 'sec'], answer: 'Your answer', color: 'Colour', newItem: 'New item' },
}
const useWords = () => pick(WORDS, useInvLang())

// Long title lines («Дзинь-дзинь») are set smaller so they fit the arch;
// Cyrillic and Armenian letters run wider in these fonts than the Latin.
function titleFit(hero) {
  const lines = [hero.title1, hero.title2].map((t) => String(t || ''))
  const longest = Math.max(...lines.map((t) => [...t].length))
  const room = /[Ѐ-ӿ]/.test(lines.join('')) ? 6 : /[Ա-֏]/.test(lines.join('')) ? 7.5 : 8.5
  return Math.min(1, room / Math.max(longest, 1)).toFixed(3)
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

// The cover, after the reference card: the rainbow arch over the blush
// panel, the disco ball hanging on the right, the bells down the left,
// the gifts in the corner, the words in the middle.
export function Hero() {
  const { data, editing } = useInvitationContent()
  const lang = useInvLang()
  const w = useWords()
  const d = formatEventDate(data.eventDate, lang)
  const { hero } = data
  return (
    <Block className="hero in" label={w.invitation}>
      <div className="arch" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((k) => <i key={k} className={`band b${k}`} style={{ '--k': k }} />)}
      </div>
      <div className="disco-w"><DiscoBall /></div>
      <Sparkle className="sp sp1" /><Sparkle className="sp sp2" /><Sparkle className="sp sp3" />
      <div className="bells-w"><Bells /></div>
      <div className="gifts-w"><Gifts /></div>
      <div className="words">
        <p className="caps r"><Editable path="hero.kicker" /></p>
        <h1 className="title r" style={{ '--i': 1, '--fit': titleFit(hero) }}>
          <span className="t1"><Editable path="hero.title1" /></span>
          <span className="t2"><Editable path="hero.title2" /></span>
        </h1>
        <p className="caps sub r" style={{ '--i': 2 }}><Editable path="hero.subtitle" /></p>
        <p className="when r" style={{ '--i': 3 }}><span>{d.month}</span><b>{d.day}</b><span>{d.time}</span></p>
        {editing && <p className="edit-when"><Editable path="eventDate" type="date" /></p>}
        <p className="co r" style={{ '--i': 4 }}><Editable path="company" /></p>
        <p className="caps addr r" style={{ '--i': 5 }}>
          <span><Editable path="venue.name" /></span>
          <span><Editable path="venue.address" /></span>
        </p>
        <p className="caps r" style={{ '--i': 6 }}><Editable path="rsvpLine" /></p>
        <p className="caps note r" style={{ '--i': 7 }}><Editable path="hero.note" /></p>
      </div>
    </Block>
  )
}

function Title({ path, tone = 'green' }) {
  return <h2 className={`title2 ${tone} r`}><Editable path={path} /></h2>
}

export function Welcome() {
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Block className="welcome">
      <MiniRainbow />
      <Section id="greeting">
        <h2 className="title2 red r" style={{ '--i': 1 }}>
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
  const tones = ['red', 'mustard', 'green', 'blue']
  return (
    <Block className="count">
      <MiniRainbow />
      <p className="caps r"><Editable path="countdownTitle" /></p>
      {cd && (
        <div className="cells r" style={{ '--i': 1 }} role="timer" aria-live="off">
          {[cd.d, pad(cd.h), pad(cd.m), pad(cd.s)].map((v, i) => (
            <span key={i} className={tones[i]}><b key={v}>{v}</b>{w.units[i]}</span>
          ))}
        </div>
      )}
      <p className="long r" style={{ '--i': 2 }}>{d.long}</p>
      <AddToCalendar slug="ce-groovy" event={{ title: [data.hero.subtitle, data.company].filter(Boolean).join(' · '), location: [data.venue.name, data.venue.address].filter(Boolean).join(', ') }} className="btn r" style={{ '--i': 3 }}>
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
      <MiniRainbow />
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
      <MiniRainbow />
      <Title path="venueTitle" tone="red" />
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
      <MiniRainbow />
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
      <MiniRainbow />
      <Title path="rsvp.title" tone="red" />
      <p className="body r" style={{ '--i': 1 }}><Editable path="rsvp.intro" /></p>
      {thanks ? (
        <p className="thanks" role="status">{thanks}</p>
      ) : (
        <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
          <label className="field">
            <span className="lbl"><Editable path="rsvp.nameLabel" /></span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required defaultValue={guestName || ''}
              aria-invalid={err || undefined} aria-describedby={err ? 'cgr-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="cgr-err" className="err">{rsvp.nameError}</span>}
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
  return (
    <Block className="closing">
      <MiniRainbow />
      <p className="title2 red big r" style={{ '--i': 1 }}><Editable path="closing.line" /></p>
      <p className="co r" style={{ '--i': 2 }}><Editable path="closing.signature" /></p>
    </Block>
  )
}
