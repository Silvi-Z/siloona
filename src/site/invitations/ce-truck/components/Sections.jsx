import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import TimeSelect from '../../shared/TimeSelect'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { pick, useInvLang } from '../../shared/invLang'
import { formatEventDate } from '../lib/date'
import truckArt from '../assets/truck.webp'
import AddToCalendar from '../../shared/AddToCalendar'
import { LiveStep, useLiveSchedule } from '../../shared/LiveSchedule'
import RsvpExtra from '../../shared/RsvpExtra'

// The design's own fixed words, in the invitation's language.
const WORDS = {
  hy: { invitation: 'Հրավեր', units: ['օր', 'ժամ', 'րոպե', 'վրկ'], answer: 'Ձեր պատասխանը', color: 'Գույն', newItem: 'Նոր կետ', hostedBy: 'Հյուրընկալում են', end: 'Ավարտ' },
  ru: { invitation: 'Приглашение', units: ['дн', 'ч', 'мин', 'сек'], answer: 'Ваш ответ', color: 'Цвет', newItem: 'Новый пункт', hostedBy: 'Принимают', end: 'Окончание' },
  en: { invitation: 'Invitation', units: ['days', 'hrs', 'min', 'sec'], answer: 'Your answer', color: 'Colour', newItem: 'New item', hostedBy: 'hosted by', end: 'Ends' },
}
const useWords = () => pick(WORDS, useInvLang())

// No handwriting font covers Armenian: Armenian script lines are set in
// Noto Serif Armenian italic instead.
const ARM = /[Ա-֏]/
const scriptCls = (text) => (ARM.test(text || '') ? 'script arm' : 'script')

// Long title lines («новогоднюю вечеринку») are set smaller so the longest
// one still fits the column.
function titleFit(hero) {
  const lines = [hero.title1, hero.title2].map((t) => String(t || ''))
  const longest = Math.max(...lines.map((t) => [...t].length))
  // Armenian letters run wider than Latin ones.
  const room = lines.some((t) => ARM.test(t)) ? 12.5 : 15.5
  return Math.min(1, room / Math.max(longest, 1)).toFixed(3)
}

// True once the image has loaded (or failed): the arrival animations wait
// for it, so a slow connection doesn't play them to an empty space.
function useLoaded() {
  const ref = useRef(null)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { if (ref.current?.complete) setLoaded(true) }, [])
  return [ref, loaded, () => setLoaded(true)]
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

// A small red star between two hairlines, opening each part.
function Star() {
  return (
    <p className="star r" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2.5l2.6 6.3 6.8.5-5.2 4.4 1.6 6.6L12 16.8l-5.8 3.5 1.6-6.6L2.6 9.3l6.8-.5z" fill="currentColor" /></svg>
    </p>
  )
}

// The cover, after the reference card: the red pickup bringing the trees
// home with «join us» written above its hood, then the red title and the
// details in spaced black letters.
export function Hero() {
  const { data, editing, setField } = useInvitationContent()
  const lang = useInvLang()
  const w = useWords()
  const d = formatEventDate(data.eventDate, lang, data.endTime)
  const where = [data.venue.name, data.venue.address].filter(Boolean).join(', ')
  const [artRef, artLoaded, onArt] = useLoaded()
  return (
    <Block className="hero in" label={w.invitation}>
      <div className={`art${artLoaded ? ' go' : ''}`}>
        <img ref={artRef} className="truck" src={truckArt} alt="" aria-hidden="true" fetchpriority="high" decoding="async" onLoad={onArt} onError={onArt} />
        {/* a few puffs from the exhaust while the truck idles */}
        {[0, 1, 2].map((k) => <span key={k} className="puff" style={{ '--d': k }} aria-hidden="true" />)}
        <p className={`${scriptCls(data.hero.script)} join r`}><Editable path="hero.script" /></p>
      </div>
      <p className="kicker r" style={{ '--i': 1 }}><Editable path="hero.kicker" /></p>
      <h1 className="title r" style={{ '--i': 2, '--fit': titleFit(data.hero) }}>
        <span><Editable path="hero.title1" /></span>
        <span><Editable path="hero.title2" /></span>
      </h1>
      <div className="details r" style={{ '--i': 3 }}>
        <p className="caps">{d.day}</p>
        {editing && (
          <p className="edit-when">
            <Editable path="eventDate" type="date" />
            <span className="wdb-edit-dt">{w.end}: <TimeSelect className="wdb-edit-input" value={data.endTime || ''} allowEmpty onChange={(v) => setField('endTime', v)} /></span>
          </p>
        )}
        <p className="it">{d.time}</p>
        <p className="caps">{w.hostedBy} <Editable path="hosts" /></p>
        {where && <p className="it">{where}</p>}
        <p className="it"><Editable path="rsvpLine" /></p>
      </div>
    </Block>
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
      <Star />
      <Section id="greeting">
        <h2 className={`${scriptCls(data.greeting.general)} big r`} style={{ '--i': 1 }}>
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
  const d = formatEventDate(data.eventDate, lang, data.endTime)
  const cd = useCountdown(data.eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  return (
    <Block className="count">
      <Star />
      <p className="small r"><Editable path="countdownTitle" /></p>
      {cd && (
        <div className="cells r" style={{ '--i': 1 }} role="timer" aria-live="off">
          {[cd.d, pad(cd.h), pad(cd.m), pad(cd.s)].map((v, i) => (
            <span key={i}><b key={v}>{v}</b>{w.units[i]}</span>
          ))}
        </div>
      )}
      <p className="long r" style={{ '--i': 2 }}>{d.long} · {d.time}</p>
      <AddToCalendar slug="ce-truck" kind="newYear" event={{ location: [data.venue.name, data.venue.address].filter(Boolean).join(', '), endTime: data.endTime }} className="btn r" style={{ '--i': 3 }}>
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
      <Star />
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
      <Star />
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
      <Star />
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
    const note = f.w.value.trim()
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: yes ? plus : 0, note })
    setThanks(fillName(yes ? rsvp.thanksYes : rsvp.thanksNo, name.split(/\s+/)[0]))
  }

  return (
    <Block className="rsvp">
      <Star />
      <Title path="rsvp.title" />
      <p className="body r" style={{ '--i': 1 }}><Editable path="rsvp.intro" /></p>
      {thanks ? (
        <p className="thanks" role="status">{thanks}</p>
      ) : (
        <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
          <label className="field">
            <span className="lbl"><Editable path="rsvp.nameLabel" /></span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required defaultValue={guestName || ''}
              aria-invalid={err || undefined} aria-describedby={err ? 'cet-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="cet-err" className="err">{rsvp.nameError}</span>}
          </label>
          <div className="choice" role="radiogroup" aria-label={w.answer}>
            <label className={yes ? 'on' : ''}><input type="radio" name="a" checked={yes} onChange={() => setYes(true)} /><Editable path="rsvp.yes" /></label>
            <label className={!yes ? 'on' : ''}><input type="radio" name="a" checked={!yes} onChange={() => setYes(false)} /><Editable path="rsvp.no" /></label>
          </div>
          {yes && (
            <div className="field">
              <span className="lbl"><Editable path="rsvp.guestsLabel" /></span>
              <div className="choice nums" role="radiogroup" aria-label={rsvp.guestsLabel}>
                {rsvp.guestOptions.map((o, i) => (
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

// The truck again, small, driving off with the closing line.
export function Closing() {
  const { data } = useInvitationContent()
  return (
    <Block className="closing">
      <img className="truck-s r" src={truckArt} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <p className={`${scriptCls(data.closing.line)} big r`} style={{ '--i': 1 }}><Editable path="closing.line" /></p>
      <p className="caps r" style={{ '--i': 2 }}><Editable path="hosts" /></p>
    </Block>
  )
}
