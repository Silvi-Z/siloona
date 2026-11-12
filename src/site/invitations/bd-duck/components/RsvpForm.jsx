import { useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { useInvitationContent } from '../../shared/EditableContext'
import { gooseSvg } from '../lib/art'
import { puff } from '../lib/puff'
import { Art, Decor, Rv, SplitHeading } from './bits'

const THANKS_GOOSE = gooseSvg({ shut: 1 })

// Party size is a fixed list (data.rsvp.guestOptions); its index is the
// number of companions beyond the guest answering. Allergies/questions and
// the chosen party size go to the host as the RSVP note.
export default function RsvpForm({ rootRef }) {
  const { data, onRsvp } = useInvitationContent()
  const rsvp = data.rsvp
  const [nameError, setNameError] = useState(false)
  const [thanks, setThanks] = useState(null)
  const nameRef = useRef(null)
  const formRef = useRef(null)

  function submit(e) {
    e.preventDefault()
    const f = e.target.elements
    const name = f.name.value.trim()
    setNameError(!name)
    if (!name) { nameRef.current?.focus(); return }
    const yes = f.att.value === 'yes'
    const idx = Math.max(0, Number(f.n.value) || 0)
    const note = [yes && rsvp.guestOptions[idx], f.c.value.trim()].filter(Boolean).join(' · ')
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: yes ? idx : 0, note })
    setThanks({ firstName: name.split(/\s+/)[0], message: yes ? rsvp.thanksYes : rsvp.thanksNo })
    if (yes) {
      const r = formRef.current?.getBoundingClientRect()
      if (r) puff(rootRef.current, r.left + r.width / 2, r.top + r.height * 0.5, 14)
    }
  }

  return (
    <section id="bdd-rsvp">
      <Decor id="d4" />
      <div className="z3">
        <SplitHeading text="Հաստատեք ձեր ներկայությունը" />
        <Rv style={{ '--dl': '.1s' }}><Editable as="p" path="rsvp.intro" className="t" /></Rv>
        <Rv className="rv formwrap">
          {!thanks ? (
            <form ref={formRef} onSubmit={submit} noValidate>
              <label className={`f${nameError ? ' bad' : ''}`}>
                Անուն և ազգանուն
                <input type="text" name="name" autoComplete="name" ref={nameRef} aria-invalid={nameError} />
                <span className="msgx">Խնդրում ենք գրել ձեր անունը</span>
              </label>
              <div className="f">
                Կգա՞ք
                <div className="opts">
                  <label><input type="radio" name="att" value="yes" defaultChecked />Այո, անպայման կգանք</label>
                  <label><input type="radio" name="att" value="no" />Ցավոք, չենք կարող</label>
                </div>
              </div>
              <label className="f">
                Քանի հոգով
                <select name="n" defaultValue="0">
                  {rsvp.guestOptions.map((o, i) => <option key={i} value={i}>{o}</option>)}
                </select>
              </label>
              <label className="f">Ալերգիաներ կամ հարցեր<input type="text" name="c" /></label>
              <button className="send" type="submit">Հաստատել</button>
            </form>
          ) : (
            <div className="thanks" role="status">
              <Art className="gg" svg={THANKS_GOOSE} />
              <h4>Շնորհակալություն, {thanks.firstName}։</h4>
              <p>{thanks.message}</p>
            </div>
          )}
        </Rv>
      </div>
    </section>
  )
}
