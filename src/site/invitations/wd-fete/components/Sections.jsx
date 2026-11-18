import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import EditablePhoto from '../../shared/EditablePhoto'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { formatEventDate } from '../lib/date'
import { BanquetTable, BowChair, Chandelier, DetailsSketch, DiscoBall, ICON_NAMES, PaletteHeart, Sketch } from './Art'

// One part of the page. Gets `.in` once it scrolls into view; its `.r`
// children fade up from that, staggered by --i.
function Block({ className = '', children, label }) {
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

// The size of an element in pixels, kept up to date.
function useBox(ref, deps = []) {
  const [box, setBox] = useState(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setBox({ w: el.offsetWidth, h: el.offsetHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  return box
}

// A hand-drawn wavy frame (photos, the organizer card), with a small
// heart at the top and bottom middle. Drawn in the box's own pixel size.
function WavyFrame({ children, className = '' }) {
  const ref = useRef(null)
  const box = useBox(ref)
  let d = ''
  if (box) {
    const { w, h } = box
    const m = 6 // inset
    const wave = (x1, y1, x2, y2, n, amp) => {
      let s = ''
      for (let i = 1; i <= n; i++) {
        const t0 = (i - 1) / n
        const t1 = i / n
        const mx = x1 + (x2 - x1) * ((t0 + t1) / 2)
        const my = y1 + (y2 - y1) * ((t0 + t1) / 2)
        const nx = x1 + (x2 - x1) * t1
        const ny = y1 + (y2 - y1) * t1
        const dx = -(y2 - y1)
        const dy = x2 - x1
        const len = Math.hypot(dx, dy) || 1
        const a = (i % 2 ? amp : -amp)
        s += ` Q ${mx + (dx / len) * a} ${my + (dy / len) * a} ${nx} ${ny}`
      }
      return s
    }
    const nx = Math.max(4, Math.round(w / 34))
    const ny = Math.max(4, Math.round(h / 34))
    const r = 14
    d = `M ${m + r} ${m}${wave(m + r, m, w - m - r, m, nx, 3)} Q ${w - m} ${m}, ${w - m} ${m + r}`
    d += `${wave(w - m, m + r, w - m, h - m - r, ny, 3)} Q ${w - m} ${h - m}, ${w - m - r} ${h - m}`
    d += `${wave(w - m - r, h - m, m + r, h - m, nx, 3)} Q ${m} ${h - m}, ${m} ${h - m - r}`
    d += `${wave(m, h - m - r, m, m + r, ny, 3)} Q ${m} ${m}, ${m + r} ${m} Z`
  }
  const heart = (x, y) => `M${x} ${y + 4}c-2.6-2-4.6-3.6-4.6-5.6 0-1.6 1.2-2.6 2.4-2.6 1 0 1.7.5 2.2 1.2.5-.7 1.2-1.2 2.2-1.2 1.2 0 2.4 1 2.4 2.6 0 2-2 3.6-4.6 5.6z`
  return (
    <div ref={ref} className={`wavy ${className}`}>
      {box && (
        <svg className="wavy-line" viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
          <path d={d} />
          <path className="wavy-heart" d={heart(box.w / 2, 0)} />
          <path className="wavy-heart" d={heart(box.w / 2, box.h - 8)} />
        </svg>
      )}
      <div className="wavy-in">{children}</div>
    </div>
  )
}

export function Hero() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <header className="hero">
      <p className="corner"><Editable path="hero.left" /><Editable path="hero.right" /></p>
      <h1 className="names">
        <Editable path="couple.first" /> <span className="amp">&amp;</span><br /><Editable path="couple.second" />
      </h1>
      <div className="date-row">
        <p className="bigdate" aria-label={`${d.dd}.${d.mm}.${d.yyyy}`}>
          <Editable path="eventDate" type="date" format={() => `${d.dd}.\n${d.mm}.\n${d.yyyy}`} />
        </p>
        <DiscoBall className="disco" />
      </div>
      <BanquetTable className="table" />
    </header>
  )
}

export function Welcome() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const isHidden = useSectionHidden()
  return (
    <Block className="welcome" label="Հրավեր">
      {!(isHidden('greeting') && isHidden('message')) && (
        <>
          <Section id="greeting">
            <p className="greet r"><GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting></p>
          </Section>
          <Section id="message"><Editable as="p" path="message" className="body r" style={{ '--i': 1 }} /></Section>
        </>
      )}
      <div className="week r" style={{ '--i': 2 }} aria-label={d.short}>
        {d.week.map((n, i) => (n == null ? (
          <span key={i} className="hday">
            <svg viewBox="0 0 120 108" aria-hidden="true"><path d="M60 104 C 26 80, 4 62, 6 36 C 8 12, 40 4, 60 30 C 80 4, 112 12, 114 36 C 116 62, 94 80, 60 104 Z" /></svg>
            <b>{d.short}</b>
          </span>
        ) : <span key={i} className="wday" aria-hidden="true">{n}</span>))}
      </div>
    </Block>
  )
}

export function Venue() {
  const { data, editing } = useInvitationContent()
  return (
    <Block className="venue" label="Վայրը">
      {data.places.map((p, i) => (
        <div key={i} className={`place r ${i % 2 ? 'flip' : ''}`} style={{ '--i': i }}>
          {i === 0 ? <BowChair className="vart" /> : <Sketch name="glasses" className="vart small" />}
          <div className="vtext">
            <p className="vlabel"><Editable path={`places.${i}.label`} /> · <Editable path={`places.${i}.time`} /></p>
            <Editable as="h3" path={`places.${i}.name`} />
            <Editable as="p" className="addr" path={`places.${i}.address`} />
            <a
              className="btn rasp" target="_blank" rel="noopener noreferrer"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address || p.name || '')}`}
              onClick={editing ? (e) => e.preventDefault() : undefined}
            >
              <Editable path="mapButton" />
            </a>
          </div>
        </div>
      ))}
    </Block>
  )
}

// The day's plan: items zig-zag down a dotted path, each with a sketch.
function DottedPath({ listRef, count }) {
  const [pts, setPts] = useState(null)
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => {
      const items = [...list.querySelectorAll(':scope > li')]
      setPts({ w: list.offsetWidth, h: list.offsetHeight, ys: items.map((li) => li.offsetTop + li.offsetHeight * 0.32) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    return () => ro.disconnect()
  }, [listRef, count])
  if (!pts || !pts.ys.length) return null
  const { w, h, ys } = pts
  const x = (i) => w * (i % 2 ? 0.34 : 0.66)
  let d = `M ${w * 0.62} 0 C ${w * 0.7} ${ys[0] * 0.4}, ${x(0)} ${ys[0] * 0.6}, ${x(0)} ${ys[0]}`
  for (let i = 1; i < ys.length; i++) {
    const my = (ys[i - 1] + ys[i]) / 2
    d += ` C ${x(i - 1)} ${my}, ${x(i)} ${my}, ${x(i)} ${ys[i]}`
  }
  d += ` C ${x(ys.length - 1)} ${(ys.at(-1) + h) / 2}, ${w * 0.5} ${h - 20}, ${w * 0.5} ${h}`
  return <svg className="dotted" viewBox={`0 0 ${w} ${h}`} aria-hidden="true"><path d={d} /></svg>
}

export function Plan() {
  const { data, editing, setField } = useInvitationContent()
  const listRef = useRef(null)
  const cycle = (i) => {
    const cur = data.schedule[i].icon
    setField(`schedule.${i}.icon`, ICON_NAMES[(ICON_NAMES.indexOf(cur) + 1) % ICON_NAMES.length])
  }
  return (
    <Block className="plan" label="Օրվա ծրագիրը">
      <Editable as="h2" path="scheduleTitle" className="h r" />
      <div className="plist">
        <DottedPath listRef={listRef} count={data.schedule.length} />
        <ol ref={listRef}>
          {data.schedule.map((s, i) => {
            const icon = s.icon || ICON_NAMES[i % ICON_NAMES.length]
            return (
              <li key={i} className={`r ${i % 2 ? 'left' : 'right'}`} style={{ '--i': Math.min(i + 1, 6) }}>
                {editing
                  ? <button type="button" className="ico-btn" onClick={() => cycle(i)} title="Փոխել նկարը" aria-label="Փոխել նկարը"><Sketch name={icon} className="sk" /></button>
                  : <Sketch name={icon} className="sk" />}
                <Editable as="time" path={`schedule.${i}.time`} />
                <Editable as="p" path={`schedule.${i}.label`} />
                <RowRemove list="schedule" index={i} />
              </li>
            )
          })}
        </ol>
      </div>
      <RowAdd list="schedule" />
    </Block>
  )
}

const WOBBLE = [1.5, -1, 2, -2, 0.5, -1.5, 2.5, -0.5]
const TILT = [-8, 6, -4, 10, -6, 5, -10, 7]

export function DressCode() {
  const { data, editing, setField } = useInvitationContent()
  const { colors = [] } = data.dressCode
  return (
    <Block className="dress" label="Դրես-կոդ">
      <p className="dtitle r"><Editable path="dressCode.title" className="rasp-t" /> <Editable path="dressCode.style" /></p>
      <Editable as="p" path="dressCode.text" className="body r" style={{ '--i': 1 }} />
      <ul className="hearts r" style={{ '--i': 2 }} aria-label="Հարսանիքի գույները">
        {colors.map((c, i) => (
          <li key={i} style={{ '--t': `${TILT[i % TILT.length]}deg` }}>
            {editing
              ? <label className="heart-edit"><PaletteHeart color={c} wob={WOBBLE[i % WOBBLE.length]} /><input type="color" value={c} aria-label={`Գույն ${i + 1}`} onChange={(e) => setField('dressCode.colors', colors.map((x, j) => (j === i ? e.target.value : x)))} /></label>
              : <PaletteHeart color={c} wob={WOBBLE[i % WOBBLE.length]} />}
          </li>
        ))}
      </ul>
      <div className="frames r" style={{ '--i': 3 }}>
        <WavyFrame className="pframe t1"><EditablePhoto path="photos.guests1" className="fph" imgClassName="ph-img" /></WavyFrame>
        <WavyFrame className="pframe t2"><EditablePhoto path="photos.guests2" className="fph" imgClassName="ph-img" /></WavyFrame>
      </div>
      {data.dressCode.link && (
        <a className="btn olive r" style={{ '--i': 4 }} href={data.dressCode.link} target="_blank" rel="noopener noreferrer" onClick={editing ? (e) => e.preventDefault() : undefined}>
          <Editable path="dressCode.button" />
        </a>
      )}
    </Block>
  )
}

export function Details() {
  const isHidden = useSectionHidden()
  return (
    <Block className="details" label="Մանրամասներ">
      <Editable as="h2" path="details.title" className="h right r" />
      <DetailsSketch className="dsketch r" />
      <Editable as="p" path="details.gifts" className="body r" style={{ '--i': 1 }} />
      <p className="star r" aria-hidden="true">✳</p>
      <Editable as="p" path="details.wine" className="body r" style={{ '--i': 2 }} />
      {!isHidden('organizer') && <Organizer />}
    </Block>
  )
}

const telLink = (v) => `tel:${String(v || '').replace(/[^\d+]/g, '')}`
const tgLink = (v) => {
  const s = String(v || '').trim()
  if (/^\+?[\d\s()-]{7,}$/.test(s)) return `https://t.me/${s.replace(/[^\d+]/g, '').replace(/^(?!\+)/, '+')}`
  return `https://t.me/${s.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '')}`
}

function Organizer() {
  const { data, editing } = useInvitationContent()
  const o = data.organizer
  const stop = editing ? (e) => e.preventDefault() : undefined
  return (
    <WavyFrame className="org r">
      <Editable as="p" path="organizer.text" className="body" />
      <div className="org-btns">
        {o.telegram && <a className="btn rasp" href={tgLink(o.telegram)} target="_blank" rel="noopener noreferrer" onClick={stop}><Editable path="organizer.tgButton" /></a>}
        {o.phone && <a className="btn line" href={telLink(o.phone)} onClick={stop}><Editable path="organizer.callButton" /></a>}
      </div>
      {editing && (
        <p className="org-edit">
          <span>Telegram՝ <Editable path="organizer.telegram" /></span>
          <span>Հեռախոս՝ <Editable path="organizer.phone" /></span>
        </p>
      )}
    </WavyFrame>
  )
}

// The questionnaire: name, coming or not, then (if coming) a transfer and
// the drinks they like. Everything beyond yes/no goes into the RSVP note.
export function Rsvp() {
  const { data, editing, onRsvp } = useInvitationContent()
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
    let note = ''
    if (yes) {
      const transfer = f.t?.value === 'yes' ? rsvp.transferYes : f.t?.value === 'no' ? rsvp.transferNo : ''
      const drinks = rsvp.drinks.filter((_, i) => f[`d${i}`]?.checked)
      note = [transfer && `Տրանսֆեր՝ ${transfer}`, drinks.length && `Խմիչքներ՝ ${drinks.join(', ')}`].filter(Boolean).join(' · ')
    }
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: 0, note })
    setThanks(fillName(yes ? rsvp.thanksYes : rsvp.thanksNo, name.split(/\s+/)[0]))
  }

  return (
    <Block className="rsvp" label="Հյուրի հարցաթերթիկ">
      <Editable as="h2" path="rsvp.title" className="h r" />
      <Editable as="p" path="rsvp.intro" className="body r" style={{ '--i': 1 }} />
      {thanks ? (
        <p className="thanks" role="status">{thanks}</p>
      ) : (
        <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
          <label className="field">
            <Editable path="rsvp.nameLabel" className="q" />
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required
              aria-invalid={err || undefined} aria-describedby={err ? 'wft-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="wft-err" className="err">{rsvp.nameError}</span>}
          </label>
          <fieldset className="opts">
            <legend className="q"><Editable path="rsvp.attendQ" /></legend>
            <label><input type="radio" name="a" checked={yes} onChange={() => setYes(true)} /><i className="dot" /><Editable path="rsvp.yes" /></label>
            <label><input type="radio" name="a" checked={!yes} onChange={() => setYes(false)} /><i className="dot" /><Editable path="rsvp.no" /></label>
          </fieldset>
          {yes && (
            <>
              <fieldset className="opts">
                <legend className="q"><Editable path="rsvp.transferQ" /></legend>
                <label><input type="radio" name="t" value="yes" /><i className="dot" /><Editable path="rsvp.transferYes" /></label>
                <label><input type="radio" name="t" value="no" /><i className="dot" /><Editable path="rsvp.transferNo" /></label>
              </fieldset>
              <fieldset className="opts">
                <legend className="q"><Editable path="rsvp.drinksQ" /></legend>
                {rsvp.drinks.map((dr, i) => (
                  <label key={i}><input type="checkbox" name={`d${i}`} /><i className="box" /><Editable path={`rsvp.drinks.${i}`} /></label>
                ))}
              </fieldset>
            </>
          )}
          <button className="btn rasp send" type="submit"><Editable path="rsvp.button" /></button>
        </form>
      )}
    </Block>
  )
}

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const s = Math.max(0, Math.floor((target - now) / 1000))
  const pad = (n) => String(n).padStart(2, '0')
  return [[Math.floor(s / 86400), 'օր'], [pad(Math.floor((s % 86400) / 3600)), 'ժամ'], [pad(Math.floor((s % 3600) / 60)), 'րոպե'], [pad(s % 60), 'վայրկյան']]
}

export function Countdown() {
  const { data } = useInvitationContent()
  const units = useCountdown(formatEventDate(data.eventDate).date.getTime())
  return (
    <Block className="count" label="Հետհաշվարկ">
      <Chandelier className="chand r" />
      <Editable as="h2" path="countdownTitle" className="h r" style={{ '--i': 1 }} />
      <div className="cd r" style={{ '--i': 2 }} aria-live="off">
        {units.map(([v, l]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}
      </div>
    </Block>
  )
}

export function Closing() {
  return (
    <Block className="closing" label="Ավարտ">
      <Editable as="p" path="closing.line" className="r" />
      <p className="sign r" style={{ '--i': 1 }}><Editable path="couple.first" /> և <Editable path="couple.second" /></p>
    </Block>
  )
}
