import { useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import Section from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import AnimalFigure from './AnimalFigure'
import { burst } from '../lib/confetti'
import monkey from '../assets/monkey.webp'

// Local-only RSVP (no backend submission) — same as the source demo and
// the same scope decision as wd-beige/components/RsvpForm.jsx: the
// guest-facing RSVP persistence path is a separate, not-yet-built piece.
export default function RsvpForm({ rootRef }) {
  const { data, onRsvp, guestName } = useInvitationContent()
  const rsvp = data.rsvp
  const [nameError, setNameError] = useState(false)
  const [thanks, setThanks] = useState(null)
  const nameRef = useRef(null)

  const boop = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    burst(rootRef.current, r.left + r.width / 2, r.top + r.height * 0.2, 22)
  }

  function submit(e) {
    e.preventDefault()
    const form = e.target
    const name = form.name.value.trim()
    setNameError(!name)
    if (!name) { nameRef.current?.focus(); return }
    const yes = form.att.value === 'yes'
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: 0, note: '' })
    setThanks({ firstName: name.split(' ')[0], message: yes ? rsvp.thanksYes : rsvp.thanksNo })
    if (yes) {
      const r = form.getBoundingClientRect()
      burst(rootRef.current, r.left + r.width / 2, r.top + r.height / 2, 40)
    }
  }

  return (
    <section className="rs">
      <div className="col">
        <Section id="rsvp">
        <div className="duo" aria-hidden="false">
          <AnimalFigure src={monkey} alt="Կապիկիկ՝ տոնական գլխարկով" height="clamp(110px,22vw,160px)" duration="6.2s" delay="-2s" k={-6} onClick={boop} />
        </div>
        <div className="card rv">
          <h3>Խնդրում ենք հաստատել</h3>
          <Editable as="p" path="rsvp.deadlineLabel" className="sub" />
          <a className="tel" href={`tel:${(rsvp.contactPhone || '').replace(/[^\d+]/g, '')}`}>
            <Editable path="rsvp.contactName" />՝ <Editable path="rsvp.contactPhone" />
          </a>
          {!thanks ? (
            <form onSubmit={submit} noValidate>
              <label className={nameError ? 'bad' : ''}>
                <input type="text" name="name" autoComplete="name" defaultValue={guestName || ''} ref={nameRef} placeholder="Ձեր անունը" />
                <span className="msgx">Խնդրում ենք գրել ձեր անունը</span>
              </label>
              <div className="opts">
                <label><input type="radio" name="att" value="yes" defaultChecked />Անպայման կգանք</label>
                <label><input type="radio" name="att" value="no" />Ցավոք, չենք կարող գալ</label>
              </div>
              <button className="send" type="submit">Ուղարկել</button>
            </form>
          ) : (
            <div className="thanks" style={{ display: 'block' }} role="status">
              <h4>Շնորհակալություն, {thanks.firstName}։</h4>
              <p>{thanks.message}</p>
            </div>
          )}
        </div>
        </Section>
        <Section id="signature">
          <Editable as="p" path="signature" className="sig rv" />
        </Section>
      </div>
    </section>
  )
}
