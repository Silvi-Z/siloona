import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import EditablePhoto from '../../shared/EditablePhoto'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { calendarWeeks, formatEventDate } from '../lib/date'
import AddToCalendar from '../../shared/AddToCalendar'
import { SeatDialog, SeatForm, useSeatFinder } from '../../shared/Seating'
import { LiveStep, useLiveSchedule } from '../../shared/LiveSchedule'

// One part of the page. Gets `.in` once it scrolls into view; its `.r`
// children fade up from that (staggered by --i), lines draw themselves.
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

const HEART = 'M0 -6c-3-6-12-6-12 1 0 6 8 10 12 15 4-5 12-9 12-15 0-7-9-7-12-1z'

function Heart({ x, y, s = 1 }) {
  return <path className="heart" d={HEART} transform={`translate(${x} ${y}) scale(${s})`} />
}

// The cover's wavy line with a heart in the middle.
function TopLine() {
  return (
    <svg className="topline" viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden="true">
      <path className="draw" d="M -10 34 C 60 10, 110 70, 175 58 C 192 55, 196 50, 200 46 C 204 50, 208 55, 225 58 C 290 70, 340 6, 410 26" pathLength="1" />
      <Heart x={200} y={52} s={1.1} />
    </svg>
  )
}

export function Hero() {
  return (
    <header className="hero">
      <TopLine />
      <p className="kicker"><Editable path="hero.kicker" /></p>
      <h1 className="title"><Editable path="hero.title" /></h1>
      <div className="talk">
        <Editable as="p" path="hero.her" className="say her" />
        <Editable as="p" path="hero.him" className="say him" />
      </div>
      <div className="sticker">
        <EditablePhoto path="photos.kids" className="sticker-ph" imgClassName="ph-img" loading="eager" />
      </div>
      <Ribbon />
    </header>
  )
}

// The burgundy band with «Դուք հրավիրված եք» running along it.
function Ribbon() {
  const { data, editing } = useInvitationContent()
  if (editing) return <p className="band band-edit"><Editable path="hero.ribbon" /></p>
  const items = Array.from({ length: 8 }, (_, i) => <span key={i}>{data.hero.ribbon}</span>)
  return (
    <div className="band" aria-label={data.hero.ribbon}>
      <div className="band-run" aria-hidden="true">{items}{items}</div>
    </div>
  )
}

export function Welcome() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const isHidden = useSectionHidden()
  return (
    <Block className="welcome" label="Հրավեր">
      <Section id="greeting">
        <p className="greet r"><GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting></p>
      </Section>
      <Section id="message"><Editable as="p" path="message" className="body r" style={{ '--i': 1 }} /></Section>
      <p className="bigd r" style={{ '--i': isHidden('message') ? 1 : 2 }}><Editable path="eventDate" type="date" format={() => d.dots} /></p>
    </Block>
  )
}

const WEEK = ['Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուր', 'Շբթ', 'Կիր']

// the calendar entry's place: the celebration (the second place), else the first
const calendarPlace = (places = []) => { const p = places[1] || places[0] || {}; return [p.name, p.address].filter(Boolean).join(', ') }

export function CalendarCard() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const weeks = calendarWeeks(d.date)
  return (
    <Block className="cal" label={`Օրացույց՝ ${d.monthName}`}>
      <div className="card r">
        <i className="tape" aria-hidden="true" />
        <p className="month">{d.monthName}</p>
        <div className="grid" role="presentation">
          {WEEK.map((w) => <span key={w} className="wd">{w}</span>)}
          {weeks.flat().map((c, i) => (
            <span key={i} className={`day${c.other ? ' other' : ''}${c.event ? ' event' : ''}`}>
              {c.day}
              {c.event && (
                <svg className="circle" viewBox="0 0 60 60" aria-hidden="true">
                  <path className="draw" d="M 46 12 C 30 2, 6 10, 6 31 C 6 50, 26 57, 41 51 C 55 45, 58 28, 50 17 C 46 11, 38 7, 31 7" pathLength="1" />
                </svg>
              )}
            </span>
          ))}
        </div>
        <p className="note"><Editable path="calendarNote" /><svg viewBox="0 0 40 30" aria-hidden="true"><path d="M3 4 C 12 22, 24 26, 35 20 M 35 20 l -7 -1 M 35 20 l -3 6" /></svg></p>
      </div>
      <div className="cal-add r" style={{ '--i': 2 }}>
        <AddToCalendar slug="wd-cherry" event={{ location: calendarPlace(data.places) }} className="btn-wine" />
      </div>
    </Block>
  )
}

// The day's plan on a looping line: it swings past each time, ties a
// loop in the gap before the next, and ends in a heart. Drawn in the
// list's real pixel size (measured) so it stays even at any width.
function PlanLine({ listRef, count }) {
  const [box, setBox] = useState(null)
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => {
      const items = [...list.querySelectorAll(':scope > li')]
      setBox({
        w: list.offsetWidth,
        h: list.offsetHeight,
        mids: items.map((li) => li.offsetTop + li.offsetHeight / 2),
        // the middle of the space after each item (the loop goes there)
        gaps: items.map((li, i) => {
          const bottom = li.offsetTop + li.offsetHeight
          const next = items[i + 1]
          return next ? (bottom + next.offsetTop) / 2 : bottom + (list.offsetHeight - bottom) * 0.35
        }),
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    return () => ro.disconnect()
  }, [listRef, count])
  if (!box || !box.mids.length) return null
  const { w, h, mids, gaps } = box
  const k = w / 100
  const side = (i) => (i % 2 ? 26 : 74) * k // the line passes beside each time
  let d = `M ${56 * k} ${-24} C ${88 * k} ${mids[0] * 0.1}, ${side(0)} ${mids[0] * 0.45}, ${side(0)} ${mids[0]}`
  mids.forEach((m, i) => {
    const g = gaps[i]
    const last = i === mids.length - 1
    const loopX = 50 * k
    const endY = last ? h - 28 : mids[i + 1]
    // down to the gap, a loop there, on to the next time (or the heart)
    d += ` C ${side(i)} ${m + (g - m) * 0.8}, ${loopX + (i % 2 ? -18 : 18) * k} ${g}, ${loopX} ${g}`
    d += ` c ${-9 * k} ${-1 * k}, ${-10 * k} ${-13 * k}, 0 ${-13 * k} c ${10 * k} 0, ${9 * k} ${12 * k}, 0 ${13 * k}`
    d += last
      ? ` C ${loopX - 6 * k} ${g + 20}, ${loopX} ${endY - 24}, ${loopX} ${endY}`
      : ` C ${loopX + (i % 2 ? 18 : -18) * k} ${g}, ${side(i + 1)} ${endY - (endY - g) * 0.8}, ${side(i + 1)} ${endY}`
  })
  return (
    <svg className="planline" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path className="draw" d={d} pathLength="1" />
      <Heart x={50 * k} y={h - 22} s={1.15} />
    </svg>
  )
}

export function Plan() {
  const { data } = useInvitationContent()
  const live = useLiveSchedule()
  const listRef = useRef(null)
  return (
    <Block className="plan" label="Օրվա ծրագիրը">
      <Editable as="h2" path="scheduleTitle" className="plan-title" />
      <div className="plist">
        <PlanLine listRef={listRef} count={data.schedule.length} />
        <ol ref={listRef}>
          {data.schedule.map((_, i) => (
            <li key={i} className={live.cls(i, `r ${i % 2 ? 'r-side' : 'l-side'}`)} style={{ '--i': Math.min(i + 1, 6) }}>
              <Editable as="time" path={`schedule.${i}.time`} />
              <Editable as="p" path={`schedule.${i}.label`} />
              <LiveStep live={live} i={i} />
              <RowRemove list="schedule" index={i} />
            </li>
          ))}
        </ol>
      </div>
      <RowAdd list="schedule" />
    </Block>
  )
}

export function DressCode() {
  const { data, editing, setField } = useInvitationContent()
  const { colors = [] } = data.dressCode
  return (
    <Block className="dress wine" label="Դրես-կոդ">
      <Editable as="h2" path="dressCode.title" className="h r" />
      <div className="card r" style={{ '--i': 1 }}>
        <i className="tape" aria-hidden="true" />
        <Editable as="p" path="dressCode.text" className="body" />
        <ul className="pal" aria-label="Հարսանիքի գույները">
          {colors.map((c, i) => (
            <li key={i}>
              {editing
                ? <input type="color" className="color-edit" value={c} aria-label={`Գույն ${i + 1}`} onChange={(e) => setField('dressCode.colors', colors.map((x, j) => (j === i ? e.target.value : x)))} />
                : <i style={{ '--c': c }} />}
            </li>
          ))}
        </ul>
      </div>
      <p className="refs-note r" style={{ '--i': 2 }}>
        <Editable path="dressCode.refsNote" />
        <svg viewBox="0 0 60 20" aria-hidden="true"><path d="M2 12 C 14 2, 26 18, 38 9 C 44 5, 50 8, 56 10 M 56 10 l -6 -5 M 56 10 l -7 4" /></svg>
      </p>
      <div className="refs r" style={{ '--i': 3 }}>
        <EditablePhoto path="photos.dress" className="ref" imgClassName="ph-img" />
        <EditablePhoto path="photos.suit" className="ref" imgClassName="ph-img" />
        <EditablePhoto path="photos.red" className="ref" imgClassName="ph-img" />
      </div>
    </Block>
  )
}

// A wine bottle drawn in ink, with a little gift tag.
function Bottle() {
  return (
    <svg className="bottle" viewBox="0 0 80 220" aria-hidden="true">
      <path className="glass" d="M32 6h16v52c0 10 16 18 16 40v108a8 8 0 0 1-8 8H24a8 8 0 0 1-8-8V98c0-22 16-30 16-40z" />
      <path className="foil" d="M32 6h16v34H32z" />
      <path className="label" d="M20 118h40v58H20z" />
      <path className="ink" d="M27 132h26M30 142h20M33 150h14" />
      <path className="heart" d={HEART} transform="translate(40 164) scale(.42)" />
      <path className="string" d="M48 30c8 4 10 14 18 18" />
      <rect className="tag" x="58" y="44" width="18" height="12" rx="2" transform="rotate(24 67 50)" />
    </svg>
  )
}

export function Wishes() {
  return (
    <Block className="wishes" label="Ցանկություններ">
      <Editable as="h2" path="wishes.title" className="h r" />
      <Editable as="p" path="wishes.text" className="body r" style={{ '--i': 1 }} />
      <div className="wine-row r" style={{ '--i': 2 }}>
        <Bottle />
        <Editable as="p" path="wishes.note" className="hand note2" />
      </div>
    </Block>
  )
}

export function Venue() {
  const { data, editing } = useInvitationContent()
  return (
    <Block className="venue wine" label="Վայրը">
      <Editable as="h2" path="venueTitle" className="h r" />
      {data.places.map((p, i) => (
        <div key={i} className="place r" style={{ '--i': i + 1 }}>
          <p className="pl"><Editable path={`places.${i}.label`} /> · <Editable as="span" className="num" path={`places.${i}.time`} /></p>
          <Editable as="h3" path={`places.${i}.name`} />
          <Editable as="p" className="addr" path={`places.${i}.address`} />
          <a
            className="btn-light" target="_blank" rel="noopener noreferrer"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address || p.name || '')}`}
            onClick={editing ? (e) => e.preventDefault() : undefined}
          >
            <Editable path="mapButton" />
          </a>
        </div>
      ))}
    </Block>
  )
}

// ---------- «Ձեր սեղանը» (only on invitations with seating) ----------
// The guest types their name and sees their table (shared/Seating.jsx);
// before the reveal only the date. Nothing renders without seating.
export function Seating() {
  const f = useSeatFinder()
  if (!f.on) return null
  return (
    <Block className="seat" label={f.t.title}>
      <h2 className="h r">{f.t.title}</h2>
      <div className="seat-card r" style={{ '--i': 2 }} tabIndex={f.result ? -1 : undefined} data-seat-return>
        {!f.revealed ? (
          <p className="seat-soon body">{f.soon}</p>
        ) : f.result ? (
          <div className="seat-res" role="status">
            <p className={`seat-table${f.result.table.length > 3 ? ' long' : ''}`}>{f.result.table}</p>
            <button type="button" className="seat-again" onClick={f.another}>{f.t.other}</button>
          </div>
        ) : (
          <>
            <p className="seat-teaser body">{f.t.teaser}</p>
            <button type="button" className="btn-wine seat-cta" onClick={f.open} aria-haspopup="dialog">{f.t.button}</button>
          </>
        )}
      </div>
      <SeatDialog finder={f} className="sd-seat wch-seat">
        {(titleId) => <SeatForm finder={f} titleId={titleId} />}
      </SeatDialog>
    </Block>
  )
}

// Name, yes / no and party size (yes only). Guest count is everyone
// coming (companions = index of the chosen option).
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
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: idx, note: yes ? `Հյուրեր՝ ${rsvp.guestOptions[idx]}` : '' })
    setThanks(fillName(yes ? rsvp.thanksYes : rsvp.thanksNo, name.split(/\s+/)[0]))
  }

  return (
    <Block className="rsvp" label="Ներկայության հաստատում">
      <Editable as="h2" path="rsvp.title" className="h r" />
      <Editable as="p" path="rsvp.intro" className="body r" style={{ '--i': 1 }} />
      {thanks ? (
        <p className="thanks" role="status">{thanks}</p>
      ) : (
        <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
          <label className="field">
            <span className="lbl">Անուն, ազգանուն</span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" defaultValue={guestName || ''} required
              aria-invalid={err || undefined} aria-describedby={err ? 'wch-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="wch-err" className="err">{rsvp.nameError}</span>}
          </label>
          <div className="choice" role="radiogroup" aria-label="Ձեր պատասխանը">
            <label className={yes ? 'on' : ''}><input type="radio" name="a" checked={yes} onChange={() => setYes(true)} /><Editable path="rsvp.yes" /></label>
            <label className={!yes ? 'on' : ''}><input type="radio" name="a" checked={!yes} onChange={() => setYes(false)} /><Editable path="rsvp.no" /></label>
          </div>
          {yes && (
            <label className="field">
              <span className="lbl"><Editable path="rsvp.guestLabel" /></span>
              <select name="g">{rsvp.guestOptions.map((o) => <option key={o}>{o}</option>)}</select>
            </label>
          )}
          <button className="btn-wine" type="submit"><Editable path="rsvp.button" /></button>
        </form>
      )}
    </Block>
  )
}

export function Closing() {
  return (
    <Block className="closing" label="Ավարտ">
      <svg className="endline" viewBox="0 0 400 70" preserveAspectRatio="none" aria-hidden="true">
        <path className="draw" d="M -10 50 C 70 64, 120 10, 185 30 C 194 33, 197 38, 200 42 C 203 38, 206 33, 215 30 C 280 10, 330 64, 410 50" pathLength="1" />
        <Heart x={200} y={40} s={1} />
      </svg>
      <Editable as="p" path="closing.line" className="hand r" />
      <p className="cnames r" style={{ '--i': 1 }}>
        <Editable path="couple.first" /> <span className="amp">&amp;</span> <Editable path="couple.second" />
      </p>
    </Block>
  )
}
