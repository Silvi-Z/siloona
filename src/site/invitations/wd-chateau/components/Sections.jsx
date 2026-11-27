import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import EditablePhoto from '../../shared/EditablePhoto'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import { fillName } from '../../shared/GuestGreeting'
import { useInvitationContent } from '../../shared/EditableContext'
import { pick, useInvLang } from '../../shared/invLang'
import { formatEventDate } from '../lib/date'
import chateauArt from '../assets/chateau.webp'
import floralsArt from '../assets/florals.webp'
import AddToCalendar from '../../shared/AddToCalendar'

// The design's own fixed words, in the invitation's language.
const WORDS = {
  hy: { invitation: 'Հրավեր', at: 'ժամը', units: ['օր', 'ժամ', 'րոպե', 'վրկ'], answer: 'Ձեր պատասխանը', color: 'Գույն', newItem: 'Նոր կետ', prev: 'Նախորդը', next: 'Հաջորդը', photo: 'Լուսանկար', open: 'Բացել', map: 'Քարտեզ' },
  ru: { invitation: 'Приглашение', at: 'в', units: ['дн', 'ч', 'мин', 'сек'], answer: 'Ваш ответ', color: 'Цвет', newItem: 'Новый пункт', prev: 'Назад', next: 'Вперёд', photo: 'Фото', open: 'Открыть', map: 'Карта' },
  en: { invitation: 'Invitation', at: 'at', units: ['days', 'hrs', 'min', 'sec'], answer: 'Your answer', color: 'Colour', newItem: 'New item', prev: 'Previous', next: 'Next', photo: 'Photo', open: 'Open', map: 'Map' },
}
const useWords = () => pick(WORDS, useInvLang())

// A page section that gets `.in` once it scrolls into view; its `.r`
// children reveal from that, staggered by --i.
function Block({ className = '', id, label, children }) {
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
  return <section ref={ref} id={id} className={`blk ${className}`} aria-label={label}>{children}</section>
}

function Heading({ path }) {
  return <h2 className="hd r"><Editable path={path} /></h2>
}

// The navy scroll over the welcome line.
function Ornament() {
  return (
    <svg className="orn r" viewBox="0 0 120 30" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M60 20 C 52 8, 40 6, 34 12 C 30 16, 34 22, 40 19 C 44 17, 42 12, 38 13" />
        <path d="M60 20 C 68 8, 80 6, 86 12 C 90 16, 86 22, 80 19 C 76 17, 78 12, 82 13" />
        <path d="M34 14 C 24 18, 14 16, 6 10 M86 14 C 96 18, 106 16, 114 10" />
        <path d="M60 20 V 27 M54 24 H 66" />
      </g>
      <circle cx="60" cy="12" r="2.4" fill="currentColor" />
    </svg>
  )
}

// «ՇԱԲԱԹ | 26 | ՀՈՒՆԻՍ», then the year.
function DateRow({ d }) {
  return (
    <div className="dr">
      <p className="dr-row"><span>{d.weekday}</span><i aria-hidden="true" /><b>{d.day}</b><i aria-hidden="true" /><span>{d.month}</span></p>
      <p className="dr-year">{d.year}</p>
    </div>
  )
}

export function Hero() {
  const lang = useInvLang()
  const w = pick(WORDS, lang)
  return (
    <Block className="hero in" label={w.invitation}>
      <Ornament />
      <p className="welcome r" style={{ '--i': 1 }}><Editable path="welcome" /></p>
      <h1 className="names r" style={{ '--i': 2 }}>
        <Editable path="couple.first" />
        <i className="amp" aria-hidden="true">&amp;</i>
        <Editable path="couple.second" />
      </h1>
      <img className="chateau" src={chateauArt} alt="" aria-hidden="true" decoding="async" fetchpriority="high" />
    </Block>
  )
}

// One of the two places: its name, where, when.
function Place({ i, d }) {
  const w = useWords()
  return (
    <div className="place r" style={{ '--i': 4 + i }}>
      <p className="caps"><Editable path={`places.${i}.label`} /></p>
      <p className="pname"><Editable path={`places.${i}.name`} /></p>
      <p className="small-caps">{w.at}</p>
      <p className="ptime"><Editable path={`places.${i}.time`} /></p>
      <DateRow d={d} />
    </div>
  )
}

export function Ceremony() {
  const { data, editing } = useInvitationContent()
  const lang = useInvLang()
  const d = formatEventDate(data.eventDate, lang)
  return (
    <Block className="ceremony">
      <Heading path="ceremonyTitle" />
      <div className="parents r" style={{ '--i': 1 }}>
        <p><span className="small-caps"><Editable path="parentsLabels.first" /></span><b><Editable path="parents.first" /></b></p>
        <i aria-hidden="true" />
        <p><span className="small-caps"><Editable path="parentsLabels.second" /></span><b><Editable path="parents.second" /></b></p>
      </div>
      <p className="intro r" style={{ '--i': 2 }}><Editable path="intro" /></p>
      <p className="bignames r" style={{ '--i': 3 }}>
        <Editable path="couple.first" /><i className="amp" aria-hidden="true">&amp;</i><Editable path="couple.second" />
      </p>
      {editing && <p className="edit-when"><Editable path="eventDate" type="date" /></p>}
      <Place i={0} d={d} />
      <Place i={1} d={d} />
    </Block>
  )
}

// A swipeable row of photos, the current one in the middle, with a counter.
export function Gallery() {
  const { data, editing } = useInvitationContent()
  const w = useWords()
  const photos = data.gallery.photos || []
  const track = useRef(null)
  const [cur, setCur] = useState(0)
  useEffect(() => {
    const el = track.current
    if (!el) return undefined
    const onScroll = () => {
      const kids = [...el.children]
      const mid = el.scrollLeft + el.clientWidth / 2
      let best = 0
      kids.forEach((k, i) => { if (Math.abs(k.offsetLeft + k.offsetWidth / 2 - mid) < Math.abs(kids[best].offsetLeft + kids[best].offsetWidth / 2 - mid)) best = i })
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
  return (
    <Block className="gallery">
      <Heading path="gallery.title" />
      <div className="g-wrap r" style={{ '--i': 1 }}>
        <div className="g-track" ref={track} role="list">
          {photos.map((_, i) => (
            <div key={i} className={`g-item${i === cur ? ' on' : ''}`} role="listitem" aria-label={`${w.photo} ${i + 1}`}>
              <EditablePhoto path={`gallery.photos.${i}`} className="g-ph" imgClassName="g-img" />
            </div>
          ))}
        </div>
        {!editing && (
          <>
            <button type="button" className="g-btn prev" aria-label={w.prev} onClick={() => go(cur - 1)} disabled={cur === 0}>‹</button>
            <button type="button" className="g-btn next" aria-label={w.next} onClick={() => go(cur + 1)} disabled={cur === photos.length - 1}>›</button>
          </>
        )}
      </div>
      <p className="g-count">{cur + 1} / {photos.length}</p>
    </Block>
  )
}

export function Florals({ flip = false }) {
  return <img className={`florals r${flip ? ' flip' : ''}`} src={floralsArt} alt="" aria-hidden="true" loading="lazy" decoding="async" />
}

// The roses on their own, between two parts.
export function Divider({ flip = false }) {
  return <Block className="divider"><Florals flip={flip} /></Block>
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

// A small ornate corner for the calendar card (mirrored for the others).
function Corner({ className }) {
  return (
    <svg className={`cc ${className}`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M3 37 V 12 C 3 6, 6 3, 12 3 H 37 M8 30 C 8 18, 18 8, 30 8 M12 20 C 6 22, 6 14, 12 14 C 16 14, 16 20, 12 20 Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function Reception() {
  const { data, editing } = useInvitationContent()
  const lang = useInvLang()
  const w = useWords()
  const d = formatEventDate(data.eventDate, lang)
  const cd = useCountdown(data.eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  const place = data.places[1] || data.places[0]
  return (
    <Block className="reception">
      <Heading path="reception.title" />
      <p className="small-caps r" style={{ '--i': 1 }}><Editable path="reception.lead" /></p>
      <p className="ptime r" style={{ '--i': 2 }}><Editable path="places.1.time" /></p>
      <div className="r" style={{ '--i': 3 }}><DateRow d={d} /></div>
      <div className="two r" style={{ '--i': 4 }}>
        <p><span className="small-caps"><Editable path="reception.welcomeLabel" /></span><b><Editable path="reception.welcomeTime" /></b></p>
        <p><span className="small-caps"><Editable path="reception.startLabel" /></span><b><Editable path="places.1.time" /></b></p>
      </div>
      <h3 className="hd small r" style={{ '--i': 5 }}><Editable path="countdownTitle" /></h3>
      {cd && (
        <p className="cd r" style={{ '--i': 6 }} role="timer" aria-live="off">
          {[cd.d, pad(cd.h), pad(cd.m), pad(cd.s)].map((v, i) => <span key={i}><b key={v}>{v}</b> {w.units[i]}</span>)}
        </p>
      )}
      <div className="cal r" style={{ '--i': 7 }}>
        <Corner className="tl" /><Corner className="tr" /><Corner className="bl" /><Corner className="br" />
        <p className="cal-h">{d.month} {d.year}</p>
        <div className="cal-g" role="grid" aria-label={`${d.month} ${d.year}`}>
          {d.weekHeads.map((x) => <span key={x} className="cal-wd">{x}</span>)}
          {d.cells.map((n, i) => (
            <span key={i} className={n === d.day ? 'cal-day on' : 'cal-day'} aria-current={n === d.day ? 'date' : undefined}>
              {n === d.day && (
                <svg viewBox="0 0 32 30" aria-hidden="true" focusable="false"><path d="M16 28 C 6 20, 1 14, 1 8.5 C 1 4.4, 4.2 1.5, 8 1.5 C 11.3 1.5, 14 3.6, 16 6.4 C 18 3.6, 20.7 1.5, 24 1.5 C 27.8 1.5, 31 4.4, 31 8.5 C 31 14, 26 20, 16 28 Z" /></svg>
              )}
              <b>{n || ''}</b>
            </span>
          ))}
        </div>
      </div>
      <AddToCalendar slug="wd-chateau" event={{ location: [place?.name, place?.address].filter(Boolean).join(', ') }} className="link r" style={{ '--i': 8 }}>
        <Editable path="calendarButton" />
      </AddToCalendar>
      <a
        className="btn solid r" style={{ '--i': 9 }} href={editing ? undefined : '#wdc-rsvp'}
        onClick={(e) => { const el = document.getElementById('wdc-rsvp'); if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }) } }}
      >
        <Editable path="confirmButton" />
      </a>
    </Block>
  )
}

const mapUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || '')}`
const embedUrl = (q) => `https://maps.google.com/maps?q=${encodeURIComponent(q || '')}&z=15&output=embed`

// The reception's place, with a map that loads only when it comes near.
export function Venue() {
  const { data, editing } = useInvitationContent()
  const w = useWords()
  const place = data.places[1] || data.places[0] || {}
  const q = [place.name, place.address].filter(Boolean).join(', ')
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
    <Block className="venue">
      <Heading path="venueTitle" />
      <p className="pname r" style={{ '--i': 1 }}><Editable path="places.1.name" /></p>
      <p className="addr r" style={{ '--i': 2 }}><Editable path="places.1.address" /></p>
      <div className="map r" style={{ '--i': 3 }} ref={box}>
        {near && !editing && q
          ? <iframe title={`${w.map}: ${q}`} src={embedUrl(q)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          : <span className="map-ph" aria-hidden="true" />}
      </div>
      <a className="link r" style={{ '--i': 4 }} href={editing ? undefined : mapUrl(place.address || q)} target="_blank" rel="noopener noreferrer">
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
      <Heading path="dressCode.title" />
      <p className="small-caps r" style={{ '--i': 1 }}><Editable path="dressCode.text" /></p>
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

export function Schedule() {
  const { data } = useInvitationContent()
  const w = useWords()
  return (
    <Block className="schedule">
      <Heading path="scheduleTitle" />
      <ol className="tl">
        {data.schedule.map((_, i) => (
          <li key={i} className="r" style={{ '--i': i + 1 }}>
            <Editable as="time" path={`schedule.${i}.time`} />
            <i aria-hidden="true" />
            <Editable path={`schedule.${i}.label`} />
            <RowRemove list="schedule" index={i} />
          </li>
        ))}
      </ol>
      <RowAdd list="schedule" text={w.newItem} />
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
    <Block className="rsvp" id="wdc-rsvp">
      <Heading path="rsvp.title" />
      <p className="body r" style={{ '--i': 1 }}><Editable path="rsvp.intro" /></p>
      {thanks ? (
        <p className="thanks" role="status">{thanks}</p>
      ) : (
        <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
          <label className="field">
            <span className="lbl"><Editable path="rsvp.nameLabel" /></span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required defaultValue={guestName || ''}
              aria-invalid={err || undefined} aria-describedby={err ? 'wdc-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="wdc-err" className="err">{rsvp.nameError}</span>}
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
            <span className="lbl"><Editable path="rsvp.wishLabel" /></span>
            <textarea name="w" rows="3" />
          </label>
          <button className="btn solid send" type="submit"><Editable path="rsvp.button" /></button>
        </form>
      )}
    </Block>
  )
}

// A gift box that opens when tapped and shows the couple's note.
function GiftBox({ open }) {
  return (
    <svg className={`gbox${open ? ' open' : ''}`} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="182" rx="66" ry="8" fill="#1f3a6e" opacity=".08" />
      <rect x="44" y="96" width="112" height="82" rx="4" fill="#f4f7fc" stroke="#9fb6d8" strokeWidth="2" />
      <path d="M58 112 c 10 6, 20 -6, 30 0 M112 140 c 10 6, 20 -6, 30 0 M60 150 c 8 4, 14 -4, 22 0" stroke="#bcd0ea" strokeWidth="2" fill="none" />
      <rect x="92" y="96" width="16" height="82" fill="#a9c3e4" />
      <g className="lid">
        <rect x="36" y="76" width="128" height="24" rx="4" fill="#ffffff" stroke="#9fb6d8" strokeWidth="2" />
        <rect x="92" y="76" width="16" height="24" fill="#a9c3e4" />
        <path d="M100 76 C 82 50, 54 54, 66 70 C 74 80, 92 78, 100 76 Z M100 76 C 118 50, 146 54, 134 70 C 126 80, 108 78, 100 76 Z" fill="#c4d6ef" stroke="#8eabd5" strokeWidth="2" />
        <circle cx="100" cy="76" r="7" fill="#a9c3e4" stroke="#8eabd5" strokeWidth="2" />
      </g>
      <g className="spark" fill="#1f3a6e">
        <path d="M30 60 l 3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" />
        <path d="M168 48 l 2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" />
        <path d="M160 122 l 2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" />
      </g>
    </svg>
  )
}

export function Gift() {
  const { editing } = useInvitationContent()
  const w = useWords()
  const [open, setOpen] = useState(false)
  const shown = open || editing
  return (
    <Block className="gift">
      <Heading path="gift.title" />
      <button type="button" className="g-open r" style={{ '--i': 1 }} aria-expanded={shown} aria-controls="wdc-gift" onClick={() => setOpen(true)} disabled={editing}>
        <GiftBox open={shown} />
        {!shown && <span className="hint"><Editable path="gift.hint" /></span>}
        <span className="sr">{w.open}</span>
      </button>
      <p id="wdc-gift" className={`gift-text${shown ? ' shown' : ''}`} hidden={!shown}><Editable path="gift.text" /></p>
    </Block>
  )
}

export function Closing() {
  const { data } = useInvitationContent()
  return (
    <Block className="closing">
      <Florals />
      <p className="cline r" style={{ '--i': 1 }}><Editable path="closing.line" /></p>
      <p className="bignames r" style={{ '--i': 2 }}>{data.couple.first}<i className="amp" aria-hidden="true">&amp;</i>{data.couple.second}</p>
    </Block>
  )
}
