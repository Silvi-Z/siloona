import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { pick, useInvLang } from '../../shared/invLang'
import { calendarUrl, formatEventDate } from '../lib/date'
import pineArt from '../assets/pine.webp'
import sprigArt from '../assets/sprig.webp'

// The design's own fixed words, in the invitation's language.
const WORDS = {
  hy: {
    invitation: 'Հրավեր', units: ['օր', 'ժամ', 'րոպե', 'վրկ'], answer: 'Ձեր պատասխանը', color: 'Գույն', newItem: 'Նոր կետ',
    at: (d) => `Ժամը ${d.time}-ին՝`,
  },
  ru: {
    invitation: 'Приглашение', units: ['дн', 'ч', 'мин', 'сек'], answer: 'Ваш ответ', color: 'Цвет', newItem: 'Новый пункт',
    at: (d) => `в ${d.time}`,
  },
  en: {
    invitation: 'Invitation', units: ['days', 'hrs', 'min', 'sec'], answer: 'Your answer', color: 'Colour', newItem: 'New item',
    at: (d) => d.time12,
  },
}
const useWords = () => pick(WORDS, useInvLang())

// No script font covers Armenian: Armenian script lines are set in Noto
// Serif Armenian italic instead.
const ARM = /[Ա-֏]/
const scriptCls = (text) => (ARM.test(text || '') ? 'script arm' : 'script')

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

// A sprig of pine between sections; every other one points the other way.
export function Sprig({ flip = false }) {
  return <img className={`sprig r${flip ? ' flip' : ''}`} src={sprigArt} alt="" aria-hidden="true" loading="lazy" decoding="async" />
}

// The day row: «ԿԻՐ | 27 | ԴԵԿ».
function DayRow({ d }) {
  return (
    <p className="when">
      <span>{d.weekdayShort}</span><i aria-hidden="true" /><b>{d.day}</b><i aria-hidden="true" /><span>{d.monthShort}</span>
    </p>
  )
}

// Long title words («НОВОГОДНЯЯ») are set smaller so the longest one
// still fits the column.
function titleFit(hero) {
  const longest = Math.max(...[hero.title1, hero.title2].map((t) => [...String(t || '')].length))
  return Math.min(1, 7.6 / Math.max(longest, 1)).toFixed(3)
}

// The cover, after the reference card: pine sweeping across the top and
// down the right side, the words in a gold column on the left.
export function Hero() {
  const { data, editing } = useInvitationContent()
  const lang = useInvLang()
  const w = useWords()
  const d = formatEventDate(data.eventDate, lang)
  const [artRef, artLoaded, onArt] = useLoaded()
  return (
    <Block className="hero in" label={w.invitation}>
      <img ref={artRef} className={`pine${artLoaded ? ' go' : ''}`} src={pineArt} alt="" aria-hidden="true" fetchpriority="high" decoding="async" onLoad={onArt} onError={onArt} />
      <div className="snow" aria-hidden="true" />
      <div className="htxt">
        <p className="intro r"><Editable path="hero.intro" /></p>
        <p className={`${scriptCls(data.hero.script)} r`} style={{ '--i': 1 }}><Editable path="hero.script" /></p>
        <h1 className="title r" style={{ '--i': 2, '--fit': titleFit(data.hero) }}>
          <span className="gold"><Editable path="hero.title1" /></span>
          <span className="gold"><Editable path="hero.title2" /></span>
        </h1>
        <p className="text r" style={{ '--i': 3 }}><Editable path="hero.text" /></p>
        <div className="r" style={{ '--i': 4 }}>
          <DayRow d={d} />
          {editing && <Editable path="eventDate" type="date" />}
        </div>
        <p className="at r" style={{ '--i': 5 }}>{w.at(d)} <Editable path="hero.place" /></p>
        <p className="hosts r" style={{ '--i': 6 }}><Editable path="hosts" /></p>
      </div>
    </Block>
  )
}

function Title({ path }) {
  return <h2 className="title2 r"><span className="gold"><Editable path={path} /></span></h2>
}

export function Welcome() {
  const { data } = useInvitationContent()
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Block className="welcome">
      <Sprig />
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
  const d = formatEventDate(data.eventDate, lang)
  const cd = useCountdown(data.eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  const cal = calendarUrl({
    title: [data.hero.title1, data.hero.title2].filter(Boolean).join(' '),
    iso: data.eventDate,
    location: [data.venue.name, data.venue.address].filter(Boolean).join(', '),
  })
  return (
    <Block className="count">
      <Sprig flip />
      <p className="small r"><Editable path="countdownTitle" /></p>
      {cd && (
        <div className="cells r" style={{ '--i': 1 }} role="timer" aria-live="off">
          {[cd.d, pad(cd.h), pad(cd.m), pad(cd.s)].map((v, i) => (
            <span key={i}><b key={v}>{v}</b>{w.units[i]}</span>
          ))}
        </div>
      )}
      <p className="long r" style={{ '--i': 2 }}>{d.long} · {lang === 'en' ? d.time12 : d.time}</p>
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
      <Sprig />
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
      <Sprig flip />
      <Title path="venueTitle" />
      <p className={`${scriptCls(data.venue.name)} mid r`} style={{ '--i': 1 }}><Editable path="venue.name" /></p>
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
      <Sprig />
      <Title path="dressCode.title" />
      <p className="body r" style={{ '--i': 1 }}><Editable path="dressCode.text" /></p>
      <div className="sw r" style={{ '--i': 2 }}>
        {data.dressCode.colors.map((c, i) => (
          editing ? (
            <input key={i} type="color" className="sw-edit" value={c} aria-label={`${w.color} ${i + 1}`} onChange={(e) => setField(`dressCode.colors.${i}`, e.target.value)} />
          ) : (
            <span key={i} className="sw-i" style={{ '--c': c }} />
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
      <Sprig flip />
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
              aria-invalid={err || undefined} aria-describedby={err ? 'cep-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="cep-err" className="err">{rsvp.nameError}</span>}
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
          <button className="btn send" type="submit"><Editable path="rsvp.button" /></button>
        </form>
      )}
    </Block>
  )
}

export function Closing() {
  const { data } = useInvitationContent()
  return (
    <Block className="closing">
      <Sprig />
      <p className={`${scriptCls(data.closing.line)} big r`} style={{ '--i': 1 }}><Editable path="closing.line" /></p>
      <p className="hosts r" style={{ '--i': 2 }}><Editable path="hosts" /></p>
    </Block>
  )
}
