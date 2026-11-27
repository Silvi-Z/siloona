import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { getByPath } from '../../shared/pathUtils'
import { SeatDialog, SeatForm, useSeatFinder } from '../../shared/Seating'
import { WEEK_SHORT, caps, formatEventDate } from '../lib/date'
import sceneArt from '../assets/scene.webp'
import portraitArt from '../assets/portrait.webp'
import AddToCalendar from '../../shared/AddToCalendar'
import { LiveStep, useLiveSchedule } from '../../shared/LiveSchedule'
import RsvpExtra from '../../shared/RsvpExtra'
import WishForm, { useWishBook, useWishWords } from '../../shared/WishForm'

// the calendar entry's place: the celebration (the second place), else the first
const calendarPlace = (places = []) => { const p = places[1] || places[0] || {}; return [p.name, p.address].filter(Boolean).join(', ') }

// One part of the page. Gets `.in` once it scrolls into view; its `.r`
// children fade up from that (staggered by --i).
function Block({ className = '', children, label }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect() }
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <section ref={ref} className={`blk ${className}`} aria-label={label}>{children}</section>
}

// Text shown in spaced capitals (names, headings); plain and editable in
// edit mode.
function CapsName({ path, as: Tag = 'span', className }) {
  const { data, editing } = useInvitationContent()
  if (editing) return <Editable as={Tag} path={path} className={className} />
  return <Tag className={className}>{caps(getByPath(data, path))}</Tag>
}

function Names() {
  return <><CapsName path="couple.first" /><span className="amp"> &amp; </span><CapsName path="couple.second" /></>
}

function Heading({ path }) {
  return <CapsName as="h2" path={path} className="ht" />
}

export function Hero() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <header className="hero">
      <h1 className="script"><Editable path="hero.script" /></h1>
      <p className="names"><Names /></p>
      <p className="line"><Editable path="hero.line" /></p>
      <p className="date"><Editable path="eventDate" type="date" format={() => d.long} /></p>
      <figure className="scene">
        <img src={sceneArt} width="580" height="778" alt="Երկու երեխա նայում են հարսի և փեսայի նկարին" />
      </figure>
    </header>
  )
}

export function Welcome() {
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Block className="welcome" label="Հրավեր">
      <Section id="greeting">
        <p className="greet r">
          <GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting>
        </p>
      </Section>
      <Section id="message">
        <Editable as="p" path="message" className="body r" style={{ '--i': 1 }} />
      </Section>
    </Block>
  )
}

export function Story() {
  return (
    <Block className="story" label="Մեր պատմությունը">
      <div className="r"><Heading path="story.title" /></div>
      <Editable as="p" path="story.text" className="body r" style={{ '--i': 1 }} />
    </Block>
  )
}

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])
  const left = Math.max(0, target - now)
  return {
    days: Math.floor(left / 86400000),
    hours: Math.floor(left / 3600000) % 24,
    minutes: Math.floor(left / 60000) % 60,
  }
}

// The month as a small calendar in a thin frame, the day circled by hand.
export function Calendar() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const c = useCountdown(d.date.getTime())
  return (
    <Block className="cal" label="Ամսաթիվ">
      <div className="r"><Heading path="dateTitle" /></div>
      <div className="frame cal-box r" style={{ '--i': 1 }}>
        <p className="cal-m">{d.month}</p>
        <div className="grid" role="presentation">
          {WEEK_SHORT.map((w) => <span key={w} className="wd">{w}</span>)}
          {d.cells.map((n, i) => (
            <span key={i} className={n === d.day ? 'day on' : 'day'}>
              {n}
              {n === d.day && (
                <svg viewBox="0 0 60 50" aria-hidden="true"><path pathLength="1" d="M33 6C18 4 5 13 6 26c1 13 15 19 28 17 13-2 21-11 20-21C53 11 41 4 27 7" /></svg>
              )}
            </span>
          ))}
        </div>
        <p className="cal-wt">{d.weekdayTime}</p>
      </div>
      <Section id="countdown">
        <div className="cd r" style={{ '--i': 2 }}>
          <Editable as="p" path="countdownTitle" className="cd-t" />
          <div className="cd-n">
            <span><b>{c.days}</b>օր</span>
            <span><b>{c.hours}</b>ժամ</span>
            <span><b>{c.minutes}</b>րոպե</span>
          </div>
        </div>
      </Section>
      <div className="cal-add r" style={{ '--i': 3 }}>
        <AddToCalendar slug="wd-portrait" event={{ location: calendarPlace(data.places) }} className="btn-line" />
      </div>
    </Block>
  )
}

export function Program() {
  const { data } = useInvitationContent()
  const live = useLiveSchedule()
  return (
    <Block className="program" label="Օրվա ծրագիրը">
      <div className="r"><Heading path="scheduleTitle" /></div>
      <ol className="plist">
        {data.schedule.map((_, i) => (
          <li key={i} className={live.cls(i, 'r')} style={{ '--i': Math.min(i + 1, 6) }}>
            <Editable as="time" path={`schedule.${i}.time`} />
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

export function Venue() {
  const { data, editing } = useInvitationContent()
  return (
    <Block className="venue" label="Վայրերը">
      <div className="r"><Heading path="venueTitle" /></div>
      {data.places.map((p, i) => (
        <div key={i} className="place r" style={{ '--i': i + 1 }}>
          <p className="pl"><Editable path={`places.${i}.label`} /> · <Editable path={`places.${i}.time`} /></p>
          <Editable as="h3" path={`places.${i}.name`} />
          <Editable as="p" className="addr" path={`places.${i}.address`} />
          <a
            className="btn-line" target="_blank" rel="noopener noreferrer"
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

export function DressCode() {
  return (
    <Block className="dress" label="Դրես-կոդ">
      <div className="r"><Heading path="dresscode.title" /></div>
      <Editable as="p" path="dresscode.text" className="body r" style={{ '--i': 1 }} />
      <div className="swatches r" style={{ '--i': 2 }} aria-hidden="true">
        <i style={{ background: '#F7F3EA' }} /><i style={{ background: '#DCD3C4' }} /><i style={{ background: '#B9AFA4' }} /><i style={{ background: '#6E625A' }} />
      </div>
    </Block>
  )
}

// «Ձեր սեղանը» — only on an invitation with seating (shared/Seating.jsx
// holds the behaviour). Here: the portrait's thin frame around the table
// number, the dialog on the same ivory paper.
// A round table seen from above, drawn in the same thin hand line as the
// calendar's circled day: the table first, then the chairs one by one.
function TableArt() {
  const chairs = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2
    return [60 + Math.cos(a) * 31, 40 + Math.sin(a) * 31]
  })
  return (
    <svg className="seat-art" viewBox="0 0 120 80" aria-hidden="true">
      <path className="tb" pathLength="1" d="M61 21c11 0 19 8 19 19s-9 19-20 19-20-8-20-19 9-19 21-19" />
      {chairs.map(([x, y], i) => (
        <circle key={i} className="ch" cx={x.toFixed(1)} cy={y.toFixed(1)} r="5" pathLength="1" style={{ '--c': i }} />
      ))}
    </svg>
  )
}

export function Seating() {
  const f = useSeatFinder()
  if (!f.on) return null
  return (
    <Block className="seat" label={f.t.title}>
      <div className="seat-frame frame r" tabIndex={f.result ? -1 : undefined} data-seat-return>
        <TableArt />
        <h2 className="ht">{caps(f.t.title)}</h2>
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
            <button type="button" className="btn-fill seat-cta" onClick={f.open} aria-haspopup="dialog">{f.t.button}</button>
          </>
        )}
      </div>
      <SeatDialog finder={f} className="wpt-seat">
        {(titleId) => <SeatForm finder={f} titleId={titleId} title={caps(f.t.title)} />}
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
      <div className="r"><Heading path="rsvp.title" /></div>
      <Editable as="p" path="rsvp.intro" className="body r" style={{ '--i': 1 }} />
      {thanks ? (
        <p className="thanks" role="status">{thanks}</p>
      ) : (
        <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
          <label className="field">
            <span className="lbl">Անուն, ազգանուն</span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required defaultValue={guestName || ''}
              aria-invalid={err || undefined} aria-describedby={err ? 'wpt-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="wpt-err" className="err">{rsvp.nameError}</span>}
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
          <RsvpExtra />
          <button className="btn-fill" type="submit"><Editable path="rsvp.button" /></button>
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
    <Block className="wish" label={t.title}>
      <h2 className="ht">{caps(t.title)}</h2>
      <div className="wish-in r" style={{ '--i': 2 }}>
        <WishForm btnClass="btn-fill" bodyClass="wish-txt" />
      </div>
    </Block>
  )
}

// The portrait again, without the children: now it's the couple's own day.
export function Closing() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <Block className="closing" label="Ավարտ">
      <figure className="frame portrait r">
        <img src={portraitArt} width="535" height="273" alt="Հարսի և փեսայի ուրվապատկերը" loading="lazy" />
      </figure>
      <p className="cscript r" style={{ '--i': 1 }}><Editable path="closing.script" /></p>
      <Editable as="p" path="closing.line" className="cl r" style={{ '--i': 2 }} />
      <p className="names r" style={{ '--i': 3 }}><Names /></p>
      <p className="cdate r" style={{ '--i': 4 }}>{d.long}</p>
    </Block>
  )
}
