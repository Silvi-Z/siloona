import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import EditablePhoto from '../../shared/EditablePhoto'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { formatEventDate } from '../lib/date'

// One part of the page. Gets `.in` once it scrolls into view; its `.r`
// children fade up from that (staggered by --i) and the programme's red
// line draws itself.
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

// A capitals heading with a handwritten-style word under it.
function Heading({ title, sub, children }) {
  return (
    <div className="head r">
      <Editable as="h2" path={title} className="ht" />
      {children || <Editable as="p" path={sub} className="hs" />}
    </div>
  )
}

// The handwritten ribbon: a few slanted lines of the same words, drifting
// slowly sideways. Decorative — hidden from screen readers.
function Ribbon({ lines = 5, className = '' }) {
  const { data } = useInvitationContent()
  const text = `${data.hero.ribbon || ''}  ·  `.repeat(8)
  return (
    <div className={`ribbon ${className}`} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <p key={i} style={{ '--d': `${-(i * 7)}s`, '--dir': i % 2 ? 'reverse' : 'normal' }}><span>{text}</span><span>{text}</span></p>
      ))}
    </div>
  )
}

function Names({ className = '' }) {
  return (
    <span className={className}>
      <Editable path="couple.first" /><span className="amp"> &amp; </span><Editable path="couple.second" />
    </span>
  )
}

export function Hero() {
  const { data, editing } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const letters = Array.from(String(data.hero.word || ''))
  return (
    <header className="hero">
      <p className="names-top"><Names /></p>
      {/* Letters in pairs, each pair a step lower (L O / V E). */}
      <div className="love-wrap" style={{ height: `${Math.max(1, Math.ceil(letters.length / 2)) * 50 + 18}cqw` }}>
        <Ribbon lines={6} />
        {editing ? (
          <Editable as="p" path="hero.word" className="love-edit" />
        ) : (
          <h1 className="love" aria-label={data.hero.word}>
            {letters.map((ch, i) => <span key={i} className="l" aria-hidden="true" style={{ '--i': i, '--c': i % 2, '--r': Math.floor(i / 2) }}>{ch}</span>)}
          </h1>
        )}
      </div>
      {editing && <p className="ribbon-edit"><span>Ժապավենի տեքստը՝ </span><Editable path="hero.ribbon" /></p>}
      <p className="date-top"><Editable path="eventDate" type="date" format={() => d.long} /></p>
    </header>
  )
}

export function Welcome() {
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Block className="welcome" label="Հրավեր">
      <Section id="greeting">
        <Heading title="greeting.general">
          <p className="hs">
            <GuestGreeting personalPath="greeting.personal"><Editable path="greeting.sub" /></GuestGreeting>
          </p>
        </Heading>
      </Section>
      <Section id="message">
        <Editable as="p" path="message" className="body r" style={{ '--i': 1 }} />
        <Editable as="p" path="message2" className="body r" style={{ '--i': 2 }} />
      </Section>
    </Block>
  )
}

function useCountdownDays(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(t)
  }, [])
  return Math.max(0, Math.ceil((target - now) / 86400000))
}

export function BigDate() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const days = useCountdownDays(d.date.getTime())
  return (
    <Block className="bigdate" label="Ամսաթիվ">
      <div className="nums" aria-label={d.long}>
        <span className="n n0 r" aria-hidden="true">{d.dd}</span>
        <span className="n n1 r" style={{ '--i': 1 }} aria-hidden="true">{d.mm}</span>
        <span className="n n2 r" style={{ '--i': 2 }} aria-hidden="true">{d.yy}</span>
      </div>
      <p className="wt r" style={{ '--i': 3 }}>{d.weekdayTime}</p>
      <Section id="countdown">
        <p className="cdl r" style={{ '--i': 4 }}><Editable path="countdownTitle" /> <b>{days}</b> օր</p>
      </Section>
    </Block>
  )
}

export function Photos() {
  return (
    <Block className="photos" label="Լուսանկարներ">
      <Ribbon lines={7} className="behind" />
      <figure className="pola p1 r"><EditablePhoto path="photos.first" className="pola-ph" imgClassName="ph-img" /></figure>
      <figure className="pola p2 r" style={{ '--i': 1 }}><EditablePhoto path="photos.second" className="pola-ph" imgClassName="ph-img" /></figure>
    </Block>
  )
}

// The red line the programme hangs on: it swings to the side opposite
// each time, ties a small loop there, and crosses to the next. Drawn in
// the list's real pixel size (measured), so the stroke and its draw-in
// animation stay even at any width.
function ProgramLine({ listRef, count }) {
  const [box, setBox] = useState(null)
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => {
      const items = [...list.querySelectorAll(':scope > li')]
      setBox({
        w: list.offsetWidth,
        h: list.offsetHeight,
        ys: items.map((li) => li.offsetTop + Math.min(li.offsetHeight * 0.32, 70)),
        // where one item ends and the next begins: the line crosses there
        gaps: items.map((li) => li.offsetTop + li.offsetHeight),
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    return () => ro.disconnect()
  }, [listRef, count])
  if (!box || !box.ys.length) return null
  const { w, h, ys, gaps } = box
  const k = w / 100
  const X = (i) => (i % 2 ? 7 : 93) * k
  let d = `M ${96 * k} ${-20} C ${104 * k} ${ys[0] * 0.4}, ${86 * k} ${ys[0] * 0.7}, ${X(0)} ${ys[0]}`
  ys.forEach((y, i) => {
    const s = i % 2 ? -1 : 1
    // a small loop at the turn
    d += ` c ${s * 10 * k} ${-6 * k}, ${s * 10 * k} ${-22 * k}, ${-2 * s * k} ${-20 * k} c ${-10 * s * k} ${2 * k}, ${-6 * s * k} ${16 * k}, ${4 * s * k} ${18 * k}`
    const x = X(i) + 2 * s * k
    const yy = y - 2 * k
    if (i < ys.length - 1) {
      // down its own side, across in the gap between the items, then on
      // to the next turn — so the line never runs through the text
      const ny = ys[i + 1]
      const g = gaps[i]
      d += ` C ${x} ${g + (g - yy) * 0.15}, ${X(i + 1)} ${g - (ny - g) * 0.1}, ${X(i + 1)} ${ny}`
    } else {
      d += ` C ${x} ${yy + (h - yy) * 0.5}, ${50 * k} ${h - 10}, ${50 * k} ${h + 10}`
    }
  })
  return (
    <svg className="pline" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={d} pathLength="1" />
    </svg>
  )
}

export function Program() {
  const { data } = useInvitationContent()
  const listRef = useRef(null)
  return (
    <Block className="program" label="Օրվա ծրագիրը">
      <Heading title="scheduleTitle" sub="scheduleSub" />
      <div className="plist">
        <ProgramLine listRef={listRef} count={data.schedule.length} />
        <ol ref={listRef}>
          {data.schedule.map((_, i) => (
            <li key={i} className={`r ${i % 2 ? 'right' : 'left'}`} style={{ '--i': Math.min(i + 1, 6) }}>
              <Editable as="time" path={`schedule.${i}.time`} />
              <Editable as="p" path={`schedule.${i}.label`} />
              <RowRemove list="schedule" index={i} />
            </li>
          ))}
        </ol>
      </div>
      <RowAdd list="schedule" />
    </Block>
  )
}

export function Venue() {
  const { data, editing } = useInvitationContent()
  return (
    <Block className="venue" label="Վայրը">
      <Heading title="venueTitle" sub="venueSub" />
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

// Name, yes / no and party size (yes only). Guest count is everyone
// coming (companions = index of the chosen option).
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
    const idx = yes ? Math.max(0, f.g.selectedIndex) : 0
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: idx, note: yes ? `Հյուրեր՝ ${rsvp.guestOptions[idx]}` : '' })
    setThanks(fillName(yes ? rsvp.thanksYes : rsvp.thanksNo, name.split(/\s+/)[0]))
  }

  return (
    <Block className="rsvp" label="Ներկայության հաստատում">
      <Heading title="rsvp.title" sub="rsvp.sub" />
      <Editable as="p" path="rsvp.intro" className="body r" style={{ '--i': 1 }} />
      {thanks ? (
        <p className="thanks" role="status">{thanks}</p>
      ) : (
        <form className="form r" style={{ '--i': 2 }} noValidate onSubmit={submit}>
          <label className="field">
            <span className="lbl">Անուն, ազգանուն</span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required
              aria-invalid={err || undefined} aria-describedby={err ? 'wrg-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="wrg-err" className="err">{rsvp.nameError}</span>}
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
          <button className="btn-fill" type="submit"><Editable path="rsvp.button" /></button>
        </form>
      )}
    </Block>
  )
}

export function Closing() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <Block className="closing" label="Ավարտ">
      <Ribbon lines={5} className="behind low" />
      <figure className="pola p3 r"><EditablePhoto path="photos.closing" className="pola-ph" imgClassName="ph-img" /></figure>
      <Editable as="p" path="closing.line" className="cl r" style={{ '--i': 1 }} />
      <p className="cnames r" style={{ '--i': 2 }}><Names /></p>
      <p className="cdate r" style={{ '--i': 3 }}>{d.long}</p>
    </Block>
  )
}
