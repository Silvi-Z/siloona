import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { formatEventDate } from '../lib/date'
import flowerTop from '../assets/flower-top.webp'
import flowerBottom from '../assets/flower-bottom.webp'
import AddToCalendar from '../../shared/AddToCalendar'
import { SeatDialog, SeatForm, useSeatFinder } from '../../shared/Seating'

// A page section that gets `.in` once it scrolls into view; its `.r`
// children reveal from that, staggered by --i.
function Block({ className = '', label, children, innerRef }) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { setSeen(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect() }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <section
      ref={(n) => { ref.current = n; if (innerRef) innerRef.current = n }}
      className={`blk ${className}${seen ? ' in' : ''}`} aria-label={label}
    >
      {children}
    </section>
  )
}

// The sculpted flowers, cut from the artwork. Each is cut off by the
// artwork's own edges, so it is always placed against an edge: the top
// one in a top-left corner, the bottom one in a bottom-right corner.
function Flower({ which, className = '', eager }) {
  return (
    <img
      className={`flw flw-${which} ${className}`}
      src={which === 'top' ? flowerTop : flowerBottom}
      alt="" aria-hidden="true" decoding="async" loading={eager ? 'eager' : 'lazy'}
    />
  )
}

function Names({ sep = ' & ' }) {
  return <><Editable path="couple.first" /><i className="amp">{sep}</i><Editable path="couple.second" /></>
}

// The cover: the velvet arch on plaster with the two flowers, exactly as
// in the artwork; the names sit inside the arch. The flowers drift a
// little with scrolling.
export function Hero() {
  const { data } = useInvitationContent()
  const isHidden = useSectionHidden()
  // The bottom flower is cut by the cover's lower edge; the velvet band
  // below hides that edge. Without the band, the cut is faded instead.
  const banded = !(isHidden('greeting') && isHidden('message'))
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const tick = () => {
      raf = 0
      const y = Math.min(window.scrollY, el.offsetHeight)
      el.style.setProperty('--sy', y.toFixed(0))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(tick) }
    window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); if (raf) cancelAnimationFrame(raf) }
  }, [])
  const d = formatEventDate(data.eventDate)
  return (
    <Block className={`hero${banded ? '' : ' unbanded'}`} label="Հրավեր" innerRef={ref}>
      <div className="arch" aria-hidden="true" />
      <Flower which="top" className="h-top" eager />
      <Flower which="bottom" className="h-bot" eager />
      <div className="htxt">
        <p className="caps r" style={{ '--i': 0 }}><Editable path="hero.kicker" /></p>
        <p className="line r" style={{ '--i': 1 }}><Editable path="hero.line" /></p>
        <h1 className="names r" style={{ '--i': 2 }}>
          <Editable path="couple.first" /><i className="amp">&amp;</i><Editable path="couple.second" />
        </h1>
        <span className="rule r" style={{ '--i': 3 }} />
        <p className="caps date r" style={{ '--i': 4 }}>{d.short}</p>
      </div>
    </Block>
  )
}

export function Welcome() {
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <Block className="velvet welcome">
      <div className="pad">
        <Section id="greeting">
          <h2 className="title r">
            <GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting>
          </h2>
          <span className="rule r" style={{ '--i': 1 }} />
        </Section>
        <Section id="message"><p className="body r" style={{ '--i': 2 }}><Editable path="message" /></p></Section>
      </div>
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
  return {
    done: diff === 0,
    d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60,
  }
}

// The date inside an outlined arch: weekday, the big day, month and time,
// then the countdown and the calendar link.
export function DateArch() {
  const { data, editing } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const cd = useCountdown(data.eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  const place = data.places?.[1] || data.places?.[0] || {}
  return (
    <Block className="date">
      <div className="frame">
        <h2 className="title ink r"><Editable path="dateTitle" /></h2>
        <p className="caps r" style={{ '--i': 1 }}>{d.weekday}</p>
        {editing ? (
          <div className="r" style={{ '--i': 2 }}><Editable path="eventDate" type="date" /></div>
        ) : (
          <p className="day r" style={{ '--i': 2 }}>{d.day}</p>
        )}
        <p className="caps r" style={{ '--i': 3 }}>{d.monthYear}</p>
        <p className="time r" style={{ '--i': 4 }}>Ժամը {d.time}</p>
      </div>
      {cd && (
        <div className="cd r" style={{ '--i': 5 }}>
          <p className="caps small"><Editable path="countdownTitle" /></p>
          <div className="cells" role="timer" aria-live="off">
            <span><b>{cd.d}</b>օր</span>
            <span><b>{pad(cd.h)}</b>ժամ</span>
            <span><b>{pad(cd.m)}</b>րոպե</span>
            <span><b>{pad(cd.s)}</b>վայրկյան</span>
          </div>
        </div>
      )}
      <AddToCalendar slug="wd-velvet" event={{ location: [place?.name, place?.address].filter(Boolean).join(', ') }} className="btn r" style={{ '--i': 6 }}>
        <Editable path="calendarButton" />
      </AddToCalendar>
    </Block>
  )
}

export function Program() {
  const { data } = useInvitationContent()
  return (
    <Block className="program">
      <h2 className="title ink r"><Editable path="scheduleTitle" /></h2>
      <span className="rule dark r" style={{ '--i': 1 }} />
      <ol className="tl">
        {data.schedule.map((_, i) => (
          <li key={i} className="r" style={{ '--i': i + 2 }}>
            <Editable as="time" path={`schedule.${i}.time`} />
            <i aria-hidden="true" />
            <Editable path={`schedule.${i}.label`} />
            <RowRemove list="schedule" index={i} />
          </li>
        ))}
      </ol>
      <RowAdd list="schedule" />
    </Block>
  )
}

const mapUrl = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`

export function Venue() {
  const { data, editing } = useInvitationContent()
  return (
    <Block className="venue">
      <h2 className="title ink r"><Editable path="venueTitle" /></h2>
      <span className="rule dark r" style={{ '--i': 1 }} />
      {data.places.map((p, i) => (
        <div className="place r" key={i} style={{ '--i': i + 2 }}>
          <p className="caps"><Editable path={`places.${i}.label`} /></p>
          <p className="ptime"><Editable path={`places.${i}.time`} /></p>
          <p className="pname"><Editable path={`places.${i}.name`} /></p>
          <p className="paddr"><Editable path={`places.${i}.address`} /></p>
          <a className="btn dark" href={editing ? undefined : mapUrl(p.address)} target="_blank" rel="noopener noreferrer">
            <Editable path="mapButton" />
          </a>
        </div>
      ))}
    </Block>
  )
}

// Swatches are little arches, echoing the cover.
export function DressCode() {
  const { data, editing, setField } = useInvitationContent()
  const { colors, colorNames = [] } = data.dressCode
  return (
    <Block className="dress">
      <h2 className="title ink r"><Editable path="dressCode.title" /></h2>
      <span className="rule dark r" style={{ '--i': 1 }} />
      <p className="body ink r" style={{ '--i': 2 }}><Editable path="dressCode.intro" /></p>
      <div className="sw r" style={{ '--i': 3 }}>
        {colors.map((c, i) => (
          editing ? (
            <input key={i} type="color" className="sw-edit" value={c} aria-label={`Գույն ${i + 1}`} onChange={(e) => setField(`dressCode.colors.${i}`, e.target.value)} />
          ) : (
            <span key={i} className="sw-i" style={{ '--c': c }} title={colorNames[i] || undefined}><i /></span>
          )
        ))}
      </div>
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
      <h2 className="title ink r">{f.t.title}</h2>
      <span className="rule dark r" style={{ '--i': 1 }} />
      <div className="seat-card r" style={{ '--i': 2 }} tabIndex={f.result ? -1 : undefined} data-seat-return>
        {!f.revealed ? (
          <p className="seat-soon ink body">{f.soon}</p>
        ) : f.result ? (
          <div className="seat-res" role="status">
            <p className={`seat-table${f.result.table.length > 3 ? ' long' : ''}`}>{f.result.table}</p>
            <button type="button" className="seat-again" onClick={f.another}>{f.t.other}</button>
          </div>
        ) : (
          <>
            <p className="seat-teaser ink body">{f.t.teaser}</p>
            <button type="button" className="btn seat-cta" onClick={f.open} aria-haspopup="dialog">{f.t.button}</button>
          </>
        )}
      </div>
      <SeatDialog finder={f} className="sd-seat wvl-seat">
        {(titleId) => <SeatForm finder={f} titleId={titleId} />}
      </SeatDialog>
    </Block>
  )
}

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
    <Block className="velvet rsvp">
      <div className="pad">
        <h2 className="title r"><Editable path="rsvp.title" /></h2>
        <span className="rule r" style={{ '--i': 1 }} />
        <p className="body r" style={{ '--i': 2 }}><Editable path="rsvp.intro" /></p>
        {thanks ? (
          <p className="thanks" role="status">{thanks}</p>
        ) : (
          <form className="form r" style={{ '--i': 3 }} noValidate onSubmit={submit}>
            <label className="field">
              <span className="caps small"><Editable path="rsvp.nameLabel" /></span>
              <input
                ref={nameRef} type="text" name="n" autoComplete="name" defaultValue={guestName || ''} required
                aria-invalid={err || undefined} aria-describedby={err ? 'wvl-err' : undefined}
                onInput={() => err && setErr(false)}
              />
              {err && <span id="wvl-err" className="err">{rsvp.nameError}</span>}
            </label>
            <div className="choice" role="radiogroup" aria-label="Ձեր պատասխանը">
              <label className={yes ? 'on' : ''}><input type="radio" name="a" checked={yes} onChange={() => setYes(true)} /><Editable path="rsvp.yes" /></label>
              <label className={!yes ? 'on' : ''}><input type="radio" name="a" checked={!yes} onChange={() => setYes(false)} /><Editable path="rsvp.no" /></label>
            </div>
            {yes && (
              <label className="field">
                <span className="caps small"><Editable path="rsvp.guestLabel" /></span>
                <select name="g">{rsvp.guestOptions.map((o) => <option key={o}>{o}</option>)}</select>
              </label>
            )}
            <label className="field">
              <span className="caps small"><Editable path="rsvp.wishLabel" /></span>
              <textarea name="w" rows="2" />
            </label>
            <button className="send" type="submit"><Editable path="rsvp.button" /></button>
          </form>
        )}
      </div>
    </Block>
  )
}

// The flowers return: one tucked under the velvet above (top-left), one
// in the page's bottom-right corner, as on the cover.
export function Closing() {
  const isHidden = useSectionHidden()
  return (
    <Block className={`closing${isHidden('rsvp') ? ' unbanded' : ''}`}>
      <Flower which="top" className="c-top" />
      <div className="ctxt">
        <p className="title ink r"><Editable path="closing.line" /></p>
        <p className="caps r" style={{ '--i': 1 }}><Editable path="closing.sign" /></p>
        <p className="names ink r" style={{ '--i': 2 }}><Names /></p>
      </div>
      <Flower which="bottom" className="c-bot" />
    </Block>
  )
}
