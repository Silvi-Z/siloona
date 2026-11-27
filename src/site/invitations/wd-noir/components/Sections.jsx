import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import EditablePhoto from '../../shared/EditablePhoto'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { getByPath } from '../../shared/pathUtils'
import { SeatDialog, SeatForm, useSeatFinder } from '../../shared/Seating'
import { WEEK_SHORT, caps, formatEventDate, initial } from '../lib/date'
import AddToCalendar from '../../shared/AddToCalendar'
import { LiveStep, useLiveSchedule } from '../../shared/LiveSchedule'
import RsvpExtra from '../../shared/RsvpExtra'
import WishForm, { useWishBook, useWishWords } from '../../shared/WishForm'

// One part of the page. Gets `.in` once it scrolls into view; its `.r`
// children rise in from that, staggered by --i. `tone` is the part's
// paper: 'noir' (black) or 'ivory'.
function Block({ tone = 'noir', className = '', label, children }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return undefined }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect() }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <section ref={ref} className={`blk ${tone} ${className}`} aria-label={label}>{children}</section>
}

// Text shown in spaced capitals; plain and editable in edit mode.
function Caps({ path, as: Tag = 'span', className, style }) {
  const { data, editing } = useInvitationContent()
  if (editing) return <Editable as={Tag} path={path} className={className} style={style} />
  return <Tag className={className} style={style}>{caps(getByPath(data, path))}</Tag>
}

// A section heading: a hairline, the title in spaced capitals, a hairline.
function Heading({ path, i = 0 }) {
  return (
    <div className="hd r" style={{ '--i': i }}>
      <i aria-hidden="true" />
      <Caps as="h2" path={path} />
      <i aria-hidden="true" />
    </div>
  )
}

// A small gold diamond between two lines.
function Ornament({ i = 0 }) {
  return (
    <svg className="orn r" style={{ '--i': i }} viewBox="0 0 120 12" aria-hidden="true" focusable="false">
      <path d="M0 6H50M70 6H120" />
      <path d="M60 1l5 5-5 5-5-5z" className="fill" />
    </svg>
  )
}

function Names({ as: Tag = 'p', className = 'names' }) {
  return (
    <Tag className={className}>
      <Editable path="couple.first" className="nm" />
      <span className="amp" aria-hidden="true">&amp;</span>
      <span className="sr-only"> և </span>
      <Editable path="couple.second" className="nm" />
    </Tag>
  )
}

// The couple's initials in a gold seal.
function Seal({ className = 'seal' }) {
  const { data } = useInvitationContent()
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="96" className="ring" />
        <circle cx="100" cy="100" r="86" className="ring thin" />
        {Array.from({ length: 48 }, (_, k) => {
          const a = (k / 48) * Math.PI * 2
          return <line key={k} x1={100 + Math.cos(a) * 89} y1={100 + Math.sin(a) * 89} x2={100 + Math.cos(a) * 93} y2={100 + Math.sin(a) * 93} className="tick" />
        })}
      </svg>
      <span className="mono">{initial(data.couple.first)}<em>&amp;</em>{initial(data.couple.second)}</span>
    </div>
  )
}

// ---------- the sealed opening ----------
// A black card with the couple's monogram. Opening breaks it in two (the
// halves slide away) and hands the page over to the cover. Skipped in edit
// mode, when the host opens straight to the content, and for reduced motion.
export function Gate({ onOpen }) {
  const { data, editing, skipIntro, guestName } = useInvitationContent()
  const [phase, setPhase] = useState('closed') // closed → open → done
  const timers = useRef([])
  const btn = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (editing || skipIntro || reduce) { setPhase('done'); onOpen(true) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, skipIntro])

  useEffect(() => {
    if (phase !== 'closed') return undefined
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    btn.current?.focus({ preventScroll: true })
    return () => { html.style.overflow = prev }
  }, [phase])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function open() {
    setPhase('open')
    timers.current.push(setTimeout(() => onOpen(false), 700))
    timers.current.push(setTimeout(() => setPhase('done'), 1900))
  }

  if (phase === 'done') return null
  const d = formatEventDate(data.eventDate)
  return (
    <div className={`gate${phase === 'open' ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label={caps(data.gate.kicker)}>
      <div className="half hl" aria-hidden="true" />
      <div className="half hr" aria-hidden="true" />
      <div className="gate-c">
        <p className="kick">{guestName ? fillName(data.greeting.personal, guestName) : caps(data.gate.kicker)}</p>
        <Seal />
        <p className="gate-names">{data.couple.first} <em>&amp;</em> {data.couple.second}</p>
        <p className="gate-date">{d.numeric}</p>
        <button ref={btn} type="button" className="gate-btn" onClick={open}>{data.gate.button}</button>
      </div>
    </div>
  )
}

// ---------- cover ----------
export function Hero() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <header className="hero">
      <EditablePhoto path="hero.photo" className="hero-ph" imgClassName="hero-img" loading="eager" alt="" />
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-c">
        <Caps as="p" path="hero.kicker" className="kick s1" />
        <Names as="h1" className="names hero-names s2" />
        <p className="hero-date s3"><Editable path="eventDate" type="date" format={() => d.numeric} /></p>
        <p className="hero-wd s4">{caps(d.weekday)} · {d.time}</p>
      </div>
      <span className="scroll-cue" aria-hidden="true"><i /></span>
    </header>
  )
}

// ---------- greeting ----------
export function Welcome() {
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Block tone="ivory" className="welcome" label="Հրավեր">
      <Ornament />
      <Section id="greeting">
        <p className="greet r" style={{ '--i': 1 }}>
          <GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting>
        </p>
      </Section>
      <Section id="message">
        <Editable as="p" path="message" className="body r" style={{ '--i': 2 }} />
      </Section>
      <p className="sign r" style={{ '--i': 3 }}><Editable path="couple.first" /> <em>&amp;</em> <Editable path="couple.second" /></p>
    </Block>
  )
}

// ---------- countdown ----------
function useCountdown(iso) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const target = new Date(iso).getTime()
  if (Number.isNaN(target)) return null
  const left = Math.max(0, target - now)
  return [Math.floor(left / 864e5), Math.floor(left / 36e5) % 24, Math.floor(left / 6e4) % 60, Math.floor(left / 1e3) % 60]
}

export function Countdown() {
  const { data } = useInvitationContent()
  const c = useCountdown(data.eventDate)
  if (!c) return null
  const units = ['օր', 'ժամ', 'րոպե', 'վայրկյան']
  return (
    <Block className="count" label="Հետհաշվարկ">
      <Caps as="p" path="countdownTitle" className="kick r" />
      <div className="cd r" style={{ '--i': 1 }} role="timer" aria-live="off">
        {c.map((v, i) => (
          <span key={units[i]}><b>{i ? String(v).padStart(2, '0') : v}</b><small>{units[i]}</small></span>
        ))}
      </div>
    </Block>
  )
}

// ---------- story ----------
export function Story() {
  const { data } = useInvitationContent()
  return (
    <Block tone="ivory" className="story" label="Մեր պատմությունը">
      <Heading path="story.title" />
      <ol className="chapters">
        {data.story.items.map((_, i) => (
          <li key={i} className={`chap r${i % 2 ? ' alt' : ''}`} style={{ '--i': 1 }}>
            <EditablePhoto path={`story.items.${i}.photo`} className="chap-ph" imgClassName="chap-img">
              <Editable as="span" path={`story.items.${i}.year`} className="year" />
            </EditablePhoto>
            <div className="chap-t">
              <Editable as="h3" path={`story.items.${i}.title`} />
              <Editable as="p" path={`story.items.${i}.text`} className="body" />
            </div>
          </li>
        ))}
      </ol>
    </Block>
  )
}

// ---------- gallery ----------
export function Gallery() {
  const { data, editing } = useInvitationContent()
  const photos = data.gallery.photos || []
  const track = useRef(null)
  const [cur, setCur] = useState(0)
  useEffect(() => {
    const el = track.current
    if (!el) return undefined
    const onScroll = () => {
      const mid = el.scrollLeft + el.clientWidth / 2
      let best = 0
      ;[...el.children].forEach((k, i) => {
        const c = (x) => Math.abs(x.offsetLeft + x.offsetWidth / 2 - mid)
        if (c(k) < c(el.children[best])) best = i
      })
      setCur(best)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])
  const go = (i) => {
    const el = track.current
    const k = el?.children[Math.max(0, Math.min(photos.length - 1, i))]
    if (k) el.scrollTo({ left: k.offsetLeft - (el.clientWidth - k.offsetWidth) / 2, behavior: 'smooth' })
  }
  if (!photos.length) return null
  const pad = (n) => String(n).padStart(2, '0')
  return (
    <Block className="gallery" label="Լուսանկարներ">
      <Heading path="gallery.title" />
      <div className="g-track r" style={{ '--i': 1 }} ref={track} role="list">
        {photos.map((_, i) => (
          <div key={i} className={`g-item${i === cur ? ' on' : ''}`} role="listitem" aria-label={`Լուսանկար ${i + 1}`}>
            <EditablePhoto path={`gallery.photos.${i}`} className="g-ph" imgClassName="g-img" />
          </div>
        ))}
      </div>
      <div className="g-nav r" style={{ '--i': 2 }}>
        {!editing && <button type="button" className="g-btn" aria-label="Նախորդը" onClick={() => go(cur - 1)} disabled={cur === 0}><Arrow left /></button>}
        <p className="g-count"><b>{pad(cur + 1)}</b> / {pad(photos.length)}</p>
        {!editing && <button type="button" className="g-btn" aria-label="Հաջորդը" onClick={() => go(cur + 1)} disabled={cur === photos.length - 1}><Arrow /></button>}
      </div>
    </Block>
  )
}

function Arrow({ left = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={left ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M4 12h15M14 7l5 5-5 5" />
    </svg>
  )
}

// ---------- the day on its month ----------
export function DateCard() {
  const { data, editing } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const last = data.places[data.places.length - 1] || {}
  return (
    <Block tone="ivory" className="date" label="Ամսաթիվ">
      <Heading path="dateTitle" />
      <div className="cal r" style={{ '--i': 1 }}>
        <p className="cal-m">{caps(d.month)}</p>
        <div className="cal-g" role="grid" aria-label={d.month}>
          {WEEK_SHORT.map((w) => <span key={w} className="wd">{w}</span>)}
          {d.cells.map((n, i) => (
            <span key={i} className={n === d.day ? 'day on' : 'day'} aria-current={n === d.day ? 'date' : undefined}>
              {n === d.day && <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" pathLength="1" /></svg>}
              <b>{n || ''}</b>
            </span>
          ))}
        </div>
        <p className="cal-wt">{d.weekday}, ժամը {d.time}</p>
      </div>
      <AddToCalendar slug="wd-noir" event={{ location: [last.name, last.address].filter(Boolean).join(', ') }} className="btn-line r" style={{ '--i': 2 }}>
        <Editable path="calendarButton" />
      </AddToCalendar>
    </Block>
  )
}

// ---------- places ----------
const mapUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || '')}`
const embedUrl = (q) => `https://maps.google.com/maps?q=${encodeURIComponent(q || '')}&z=15&output=embed`

// The map of the last place (the reception), loaded only when it comes near.
function LazyMap({ q }) {
  const { editing } = useInvitationContent()
  const box = useRef(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = box.current
    if (!el || !('IntersectionObserver' in window)) { setNear(true); return undefined }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect() } }, { rootMargin: '300px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div className="map" ref={box}>
      {near && !editing && q
        ? <iframe title={`Քարտեզ՝ ${q}`} src={embedUrl(q)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        : <span className="map-ph" aria-hidden="true" />}
    </div>
  )
}

export function Venue() {
  const { data, editing } = useInvitationContent()
  const lastIdx = data.places.length - 1
  return (
    <Block className="venue" label="Վայրերը">
      <EditablePhoto path="venuePhoto" className="venue-ph r" imgClassName="venue-img" />
      <Heading path="venueTitle" i={1} />
      <ol className="places">
        {data.places.map((p, i) => {
          const q = [p.name, p.address].filter(Boolean).join(', ')
          return (
            <li key={i} className="place r" style={{ '--i': Math.min(i + 2, 6) }}>
              <p className="pl-time"><Editable path={`places.${i}.time`} /></p>
              <div className="pl-body">
                <Caps as="p" path={`places.${i}.label`} className="pl-label" />
                <Editable as="h3" path={`places.${i}.name`} />
                <Editable as="p" path={`places.${i}.address`} className="addr" />
                {i === lastIdx && <LazyMap q={q} />}
                <a className="pl-link" href={editing ? undefined : mapUrl(p.address || q)} target="_blank" rel="noopener noreferrer">
                  <Editable path="mapButton" /> <Arrow />
                </a>
              </div>
              <RowRemove list="places" index={i} />
            </li>
          )
        })}
      </ol>
      <RowAdd list="places" />
    </Block>
  )
}

// ---------- «Ձեր սեղանը» (only on invitations with seating) ----------
export function Seating() {
  const f = useSeatFinder()
  if (!f.on) return null
  return (
    <Block className="seat" label={f.t.title}>
      <div className="seat-card r" tabIndex={f.result ? -1 : undefined} data-seat-return>
        <Seal className="seal small" />
        <h2 className="seat-h">{caps(f.t.title)}</h2>
        {!f.revealed ? (
          <p className="seat-soon">{f.soon}</p>
        ) : f.result ? (
          <div className="seat-res" role="status">
            <p className={`seat-table${f.result.table.length > 3 ? ' long' : ''}`}>{f.result.table}</p>
            <button type="button" className="seat-again" onClick={f.another}>{f.t.other}</button>
          </div>
        ) : (
          <>
            <p className="seat-teaser">{f.t.teaser}</p>
            <button type="button" className="btn-gold seat-cta" onClick={f.open} aria-haspopup="dialog">{f.t.button}</button>
          </>
        )}
      </div>
      <SeatDialog finder={f} className="wnr-seat">
        {(titleId) => <SeatForm finder={f} titleId={titleId} title={caps(f.t.title)} />}
      </SeatDialog>
    </Block>
  )
}

// ---------- programme ----------
export function Program() {
  const { data } = useInvitationContent()
  const live = useLiveSchedule()
  return (
    <Block tone="ivory" className="program" label="Օրվա ծրագիրը">
      <Heading path="scheduleTitle" />
      <ol className="plist">
        {data.schedule.map((_, i) => (
          <li key={i} className={live.cls(i, 'r')} style={{ '--i': Math.min(i + 1, 7) }}>
            <Editable as="time" path={`schedule.${i}.time`} />
            <i aria-hidden="true" />
            <Editable as="p" path={`schedule.${i}.label`} />
            <LiveStep live={live} i={i} />
            <RowRemove list="schedule" index={i} />
          </li>
        ))}
      </ol>
      <RowAdd list="schedule" />
    </Block>
  )
}

// ---------- dress code ----------
export function DressCode() {
  const { data, editing, setField } = useInvitationContent()
  const colors = data.dressCode.colors || []
  return (
    <Block className="dress" label="Դրես-կոդ">
      <Heading path="dressCode.title" />
      <Editable as="p" path="dressCode.text" className="body r" style={{ '--i': 1 }} />
      <div className="sw r" style={{ '--i': 2 }}>
        {colors.map((c, i) => (
          <label key={i} className="swatch" style={{ '--c': c }}>
            <i />
            {editing && (
              <input type="color" value={c} aria-label={`Գույն ${i + 1}`} onChange={(e) => setField(`dressCode.colors.${i}`, e.target.value)} />
            )}
          </label>
        ))}
      </div>
    </Block>
  )
}

// ---------- details (gifts, transfer, photos …) ----------
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI']
export function Details() {
  const { data } = useInvitationContent()
  return (
    <Block tone="ivory" className="details" label="Մանրամասներ">
      <Heading path="details.title" />
      <ul className="dlist">
        {data.details.items.map((_, i) => (
          <li key={i} className="r" style={{ '--i': i + 1 }}>
            <span className="rn" aria-hidden="true">{ROMAN[i] || i + 1}</span>
            <Caps as="h3" path={`details.items.${i}.title`} />
            <Editable as="p" path={`details.items.${i}.text`} className="body" />
            <RowRemove list="details.items" index={i} />
          </li>
        ))}
      </ul>
      <RowAdd list="details.items" />
    </Block>
  )
}

// ---------- reply ----------
// Name, yes / no, party size and a wish (yes only for the size). The party
// size is everyone coming (companions = the chosen option's index).
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
    <Block className="rsvp" label="Ներկայության հաստատում">
      <div id="wnr-rsvp" />
      <Heading path="rsvp.title" />
      <Editable as="p" path="rsvp.intro" className="body r" style={{ '--i': 1 }} />
      {thanks ? (
        <div className="thanks" role="status">
          <Ornament />
          <p>{thanks}</p>
        </div>
      ) : (
        <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
          <label className="field">
            <span className="lbl"><Editable path="rsvp.nameLabel" /></span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required defaultValue={guestName || ''}
              aria-invalid={err || undefined} aria-describedby={err ? 'wnr-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="wnr-err" className="err">{rsvp.nameError}</span>}
          </label>
          <div className="choice" role="radiogroup" aria-label="Ձեր պատասխանը">
            <label className={yes ? 'on' : ''}><input type="radio" name="a" checked={yes} onChange={() => setYes(true)} /><Editable path="rsvp.yes" /></label>
            <label className={!yes ? 'on' : ''}><input type="radio" name="a" checked={!yes} onChange={() => setYes(false)} /><Editable path="rsvp.no" /></label>
          </div>
          {yes && (
            <label className="field">
              <span className="lbl"><Editable path="rsvp.guestsLabel" /></span>
              <select name="g">{rsvp.guestOptions.map((o) => <option key={o}>{o}</option>)}</select>
            </label>
          )}
          <label className="field">
            <span className="lbl"><Editable path="rsvp.wishLabel" /></span>
            <textarea name="w" rows="3" maxLength={500} />
          </label>
          <RsvpExtra />
          <button className="btn-gold" type="submit"><Editable path="rsvp.button" /></button>
        </form>
      )}
    </Block>
  )
}

// ---------- «Թողեք մաղթանք» (only on invitations with the wishes book) ----------
// Guests write a wish for the couple (shared/WishForm.jsx); nobody but the
// couple ever reads them. Nothing renders without the book.
export function WishBook() {
  const on = useWishBook()
  const t = useWishWords()
  if (!on) return null
  return (
    <Block tone="ivory" className="wish" label={t.title}>
      <div className="hd r"><i aria-hidden="true" /><h2>{caps(t.title)}</h2><i aria-hidden="true" /></div>
      <div className="wish-in r" style={{ '--i': 2 }}>
        <WishForm btnClass="btn-gold" bodyClass="wish-txt" />
      </div>
    </Block>
  )
}

// ---------- closing ----------
export function Closing() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <Block className="closing" label="Ավարտ">
      <EditablePhoto path="closing.photo" className="closing-ph" imgClassName="closing-img">
        <div className="closing-shade" aria-hidden="true" />
      </EditablePhoto>
      <div className="closing-c">
        <Seal className="seal small r" />
        <Editable as="p" path="closing.line" className="cl r" style={{ '--i': 1 }} />
        <div className="r" style={{ '--i': 2 }}><Names /></div>
        <p className="cdate r" style={{ '--i': 3 }}>{d.numeric}</p>
      </div>
    </Block>
  )
}
