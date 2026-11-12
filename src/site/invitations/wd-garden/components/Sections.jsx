import { useState } from 'react'
import Editable from '../../shared/Editable'
import { fillName } from '../../shared/GuestGreeting'
import { useInvitationContent } from '../../shared/EditableContext'
import { daysLeft, formatEventDate } from '../lib/date'
import { Band, Heart, MaskHeading, Rv } from './parts'

const DAYS = ['Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուր', 'Շբթ', 'Կիր']

export function Story() {
  return (
    <section className="sec">
      <MaskHeading path="story.title" />
      <Rv as="p" className="lead rv"><Editable path="story.text" /></Rv>
    </section>
  )
}

// The date, days left, and the month calendar with the day in a heart.
export function DateSection() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <section className="sec" style={{ paddingTop: '1rem' }}>
      <MaskHeading path="date.title" />
      <Rv className="date rv"><Editable path="eventDate" type="date" format={(iso) => formatEventDate(iso).short} /></Rv>
      <Rv as="p" className="cd rv"><Editable path="date.before" /> <b>{daysLeft(d.date)}</b> <Editable path="date.after" /></Rv>
      <Rv className="cal rv">
        <h3>{d.calTitle}</h3>
        <div className="grid">
          {DAYS.map((x) => <b key={x}>{x}</b>)}
          {Array.from({ length: d.lead }, (_, i) => <span key={`l${i}`} />)}
          {Array.from({ length: d.total }, (_, i) => {
            const n = i + 1
            return n === d.day
              ? <span key={n} style={{ '--i': n + d.lead }} className="on" aria-label="Հարսանիքի օրը">{n}</span>
              : <span key={n} style={{ '--i': n + d.lead }}>{n}</span>
          })}
        </div>
      </Rv>
    </section>
  )
}

export function Venue() {
  const { data, editing } = useInvitationContent()
  const { venue } = data
  const q = encodeURIComponent(venue.address || venue.name || '')
  return (
    <section className="sec venue" style={{ paddingTop: '2rem' }}>
      <MaskHeading path="venue.title" />
      <Rv as="p"><Editable as="b" path="venue.name" /><Editable path="venue.address" /><br /><Editable path="venue.note" /></Rv>
      <Rv
        as="a" className="btn rv" target="_blank" rel="noopener noreferrer"
        href={`https://www.google.com/maps/search/?api=1&query=${q}`}
        onClick={editing ? (e) => e.preventDefault() : undefined}
      >
        <Editable path="venue.button" />
      </Rv>
    </section>
  )
}

// Program inside the blush arch: the line draws down, items slide in from
// alternating sides.
export function Program() {
  const { data } = useInvitationContent()
  return (
    <div className="archwrap">
      <Band seed={45} className="bt" />
      <section className="arch">
        <MaskHeading path="scheduleTitle" />
        <Rv className="tl">
          <div className="ln" /><Heart className="hh h1" /><Heart className="hh h2" />
          {data.schedule.map((_, i) => (
            <div key={i} className={`it ${i % 2 ? 'r' : 'l'}`} style={{ '--i': i }}>
              <div><Editable as="time" path={`schedule.${i}.time`} /><Editable path={`schedule.${i}.label`} /></div>
              <Heart className="m" />
            </div>
          ))}
        </Rv>
      </section>
      <Band seed={57} bottom className="bb" />
    </div>
  )
}

// Name, drink, party size. There's no decline option in this design, so
// every answer is an acceptance; drink and party size go in the note.
export function Rsvp() {
  const { data, editing, onRsvp } = useInvitationContent()
  const { rsvp } = data
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (editing) return
    const f = e.target.elements
    const name = f.n.value.trim()
    if (!name) { setNote(rsvp.nameError); f.n.focus(); return }
    const drink = f.d.value
    const idx = Math.max(0, rsvp.guestOptions.indexOf(f.g.value))
    onRsvp?.({ name, status: 'confirmed', plus: idx, note: [drink && `Խմիչք՝ ${drink}`, `Հյուրեր՝ ${rsvp.guestOptions[idx]}`].filter(Boolean).join(' · ') })
    setSent(true)
    setNote(fillName(rsvp.thanks, name))
  }

  return (
    <section className="sec" style={{ paddingTop: '2rem' }}>
      <MaskHeading path="rsvp.title" />
      <Rv as="form" className={`f rv${sent ? ' sent' : ''}`} noValidate onSubmit={submit}>
        <input type="text" name="n" placeholder={rsvp.placeholder} aria-label="Ձեր անունը" autoComplete="name" required onInput={() => setNote('')} />
        <fieldset><legend><Editable path="rsvp.drinkQuestion" /></legend>
          {rsvp.drinks.map((x, i) => (
            <label key={i}><input type="radio" name="d" value={x} defaultChecked={i === 0} /><Editable path={`rsvp.drinks.${i}`} /></label>
          ))}
        </fieldset>
        <fieldset><legend><Editable path="rsvp.guestQuestion" /></legend>
          {rsvp.guestOptions.map((x, i) => (
            <label key={x}><input type="radio" name="g" value={x} defaultChecked={i === 0} />{x}</label>
          ))}
        </fieldset>
        <button className="btn go" type="submit">{sent ? rsvp.sentButton : <Editable path="rsvp.button" />}</button>
        <p className="note" role="status">{note}</p>
      </Rv>
    </section>
  )
}
