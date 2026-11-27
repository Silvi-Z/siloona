import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import TimeSelect from '../../shared/TimeSelect'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { pick, useInvLang } from '../../shared/invLang'
import { formatEventDate } from '../lib/date'
import { SHEET, frameDots } from '../lib/frame'
import AddToCalendar from '../../shared/AddToCalendar'
import { LiveStep, useLiveSchedule } from '../../shared/LiveSchedule'
import RsvpExtra from '../../shared/RsvpExtra'

// The design's own fixed words, in the invitation's language.
const WORDS = {
  hy: { invitation: 'Հրավեր', units: ['օր', 'ժամ', 'րոպե', 'վրկ'], answer: 'Ձեր պատասխանը', color: 'Գույն', newItem: 'Նոր կետ', end: 'Ավարտ' },
  ru: { invitation: 'Приглашение', units: ['дн', 'ч', 'мин', 'сек'], answer: 'Ваш ответ', color: 'Цвет', newItem: 'Новый пункт', end: 'Окончание' },
  en: { invitation: 'Invitation', units: ['days', 'hrs', 'min', 'sec'], answer: 'Your answer', color: 'Colour', newItem: 'New item', end: 'Ends' },
}
const useWords = () => pick(WORDS, useInvLang())

// No handwriting font covers Armenian: Armenian script lines are set in
// Noto Serif Armenian italic instead.
const ARM = /[Ա-֏]/
const scriptCls = (text) => (ARM.test(text || '') ? 'script arm' : 'script')

// Long title lines are set smaller so the longest one still fits the ring;
// Armenian letters run wider than Latin ones.
function titleFit(hero) {
  const lines = [hero.title1, hero.title2].map((t) => String(t || ''))
  const longest = Math.max(...lines.map((t) => [...t].length))
  const room = lines.some((t) => ARM.test(t)) ? 14.5 : 17
  return Math.min(1, room / Math.max(longest, 1)).toFixed(3)
}

// One dot of the sheet as a CSS background.
const dotBg = (k) => ({
  backgroundPosition: `${(k % SHEET.cols) * (100 / (SHEET.cols - 1))}% ${Math.floor(k / SHEET.cols) * (100 / (SHEET.rows - 1))}%`,
})

// A page section that gets `.in` once it scrolls into view; its `.r`
// children reveal from that, staggered by --i.
function Block({ className = '', label, children, innerRef }) {
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
  return (
    <section ref={(el) => { ref.current = el; if (innerRef) innerRef.current = el }} className={`blk ${className}`} aria-label={label}>
      {children}
    </section>
  )
}

// The frame of dots, laid out for the cover's real size and kept clear of
// the words; it is laid out again when either changes size.
function DotFrame({ heroRef, keepRef }) {
  const [dots, setDots] = useState([])
  useLayoutEffect(() => {
    const hero = heroRef.current
    const keep = keepRef.current
    if (!hero || !keep) return undefined
    let raf = 0
    const run = () => {
      const hb = hero.getBoundingClientRect()
      const kb = keep.getBoundingClientRect()
      const pad = 8
      setDots(frameDots(hb.width, hb.height, {
        l: kb.left - hb.left - pad, r: kb.right - hb.left + pad, t: kb.top - hb.top - pad, b: kb.bottom - hb.top + pad,
      }))
    }
    run()
    if (!('ResizeObserver' in window)) return undefined
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(run) })
    ro.observe(hero)
    ro.observe(keep)
    return () => { ro.disconnect(); cancelAnimationFrame(raf) }
  }, [heroRef, keepRef])
  return (
    <div className="dots" aria-hidden="true">
      {dots.map((d, i) => (
        <i
          key={i}
          className={d.f ? 'fl' : undefined}
          style={{
            left: d.x, top: d.y, width: d.s * 1.22, height: d.s * 1.22, ...dotBg(d.k),
            '--r': `${d.rot}deg`, '--d': `${Math.min(i * 26, 1500)}ms`, '--f': `${d.f || 6}s`,
          }}
        />
      ))}
    </div>
  )
}

// A line of text set along an arc of the ring: over the top or under it.
function Arc({ id, text, bottom }) {
  const n = [...String(text || '')].length
  const size = n > 34 ? (8.4 * 34) / n : 8.4
  // Over the top: left to right through the top. Under: left to right
  // through the bottom, the letters' tops towards the centre.
  const d = bottom ? 'M 8 100 A 92 92 0 0 0 192 100' : 'M 14 100 A 86 86 0 0 1 186 100'
  return (
    <>
      <path id={id} d={d} fill="none" />
      <text className="arc" style={{ fontSize: size }}>
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">{text}</textPath>
      </text>
    </>
  )
}

// The cover, after the reference card: dots all round, the words in a
// ring in the middle.
export function Hero() {
  const { data, editing, setField } = useInvitationContent()
  const lang = useInvLang()
  const w = useWords()
  const d = formatEventDate(data.eventDate, lang, data.endTime)
  const heroRef = useRef(null)
  const keepRef = useRef(null)
  return (
    <Block className="hero in" label={w.invitation} innerRef={heroRef}>
      <DotFrame heroRef={heroRef} keepRef={keepRef} />
      <div className="ring" ref={keepRef}>
        {!editing && (
          <svg className="arcs r" viewBox="0 0 200 200" aria-hidden="true">
            <Arc id={`bdd-top-${lang}`} text={data.hero.arcTop} />
            <Arc id={`bdd-bot-${lang}`} text={data.rsvpLine} bottom />
          </svg>
        )}
        <div className="words">
          {/* the curved lines, read out once (and edited as plain lines) */}
          {editing ? <p className="arc-edit"><Editable path="hero.arcTop" /></p> : <p className="sr">{data.hero.arcTop}</p>}
          <p className={`${scriptCls(data.hero.script)} join r`} style={{ '--i': 1 }}><Editable path="hero.script" /></p>
          <h1 className="title r" style={{ '--i': 2, '--fit': titleFit(data.hero) }}>
            <span><Editable path="hero.title1" /></span>
            <span><Editable path="hero.title2" /></span>
          </h1>
          <div className="details r" style={{ '--i': 3 }}>
            <p>{d.line}</p>
            {editing && (
              <p className="edit-when">
                <Editable path="eventDate" type="date" />
                <span className="wdb-edit-dt">{w.end}: <TimeSelect className="wdb-edit-input" value={data.endTime || ''} allowEmpty onChange={(v) => setField('endTime', v)} /></span>
              </p>
            )}
            <p><Editable path="hero.activities" /></p>
            <p><Editable path="venue.name" /></p>
          </div>
          {editing ? <p className="arc-edit"><Editable path="rsvpLine" /></p> : <p className="sr">{data.rsvpLine}</p>}
        </div>
      </div>
    </Block>
  )
}

// Three small dots opening each part.
function Trio({ k = 0 }) {
  return (
    <p className="trio r" aria-hidden="true">
      {[k, k + 7, k + 15].map((x, i) => <i key={i} style={dotBg(x % SHEET.count)} />)}
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
      <Trio k={0} />
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

// Each number sits on a dot of its own.
export function Countdown() {
  const { data, editing } = useInvitationContent()
  const lang = useInvLang()
  const w = useWords()
  const d = formatEventDate(data.eventDate, lang, data.endTime)
  const cd = useCountdown(data.eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  return (
    <Block className="count">
      <Trio k={3} />
      <p className="small r"><Editable path="countdownTitle" /></p>
      {cd && (
        <div className="cells r" style={{ '--i': 1 }} role="timer" aria-live="off">
          {[cd.d, pad(cd.h), pad(cd.m), pad(cd.s)].map((v, i) => (
            <span key={i} style={{ '--i': i }}>
              <i style={dotBg([1, 8, 5, 13][i])} aria-hidden="true" />
              <b key={v}>{v}</b>
              <small>{w.units[i]}</small>
            </span>
          ))}
        </div>
      )}
      <p className="long r" style={{ '--i': 2 }}>{d.long}</p>
      <AddToCalendar slug="bd-dots" event={{ location: [data.venue.name, data.venue.address].filter(Boolean).join(', '), endTime: data.endTime }} className="btn r" style={{ '--i': 3 }}>
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
      <Trio k={6} />
      <Title path="scheduleTitle" />
      <ol className="tl">
        {data.schedule.map((_, i) => (
          <li key={i} className={live.cls(i, 'r')} style={{ '--i': i + 1 }}>
            <i style={dotBg((i * 5 + 2) % SHEET.count)} aria-hidden="true" />
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
      <Trio k={9} />
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
      <Trio k={12} />
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
      <Trio k={15} />
      <Title path="rsvp.title" />
      <p className="body r" style={{ '--i': 1 }}><Editable path="rsvp.intro" /></p>
      {thanks ? (
        <p className={`thanks${ARM.test(thanks) ? ' arm' : ''}`} role="status">{thanks}</p>
      ) : (
        <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
          <label className="field">
            <span className="lbl"><Editable path="rsvp.nameLabel" /></span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required defaultValue={guestName || ''}
              aria-invalid={err || undefined} aria-describedby={err ? 'bdd-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="bdd-err" className="err">{rsvp.nameError}</span>}
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

export function Closing() {
  const { data } = useInvitationContent()
  return (
    <Block className="closing">
      <Trio k={18} />
      <p className={`${scriptCls(data.closing.line)} big r`} style={{ '--i': 1 }}><Editable path="closing.line" /></p>
      <p className="sig r" style={{ '--i': 2 }}><Editable path="closing.signature" /></p>
    </Block>
  )
}
