import { useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { useInvitationContent } from '../../shared/EditableContext'
import Rv from './Rv'

const GUESS_LABEL = { boy: 'Տղա', girl: 'Աղջիկ' }

// Guests confirm attendance and make their boy/girl guess. The guess and
// wishes go to the host as the RSVP note, so organizers see every guess.
export default function RsvpForm({ onConfirmed }) {
  const { data, onRsvp } = useInvitationContent()
  const [nameError, setNameError] = useState(false)
  const [thanks, setThanks] = useState(null)
  const nameRef = useRef(null)

  function submit(e) {
    e.preventDefault()
    const f = e.target
    const name = f.elements.name.value.trim()
    setNameError(!name)
    if (!name) { nameRef.current?.focus(); return }
    const yes = f.elements.att.value === 'yes'
    const guess = f.elements.g.value
    const wishes = f.elements.w.value.trim()
    const count = Math.min(6, Math.max(1, parseInt(f.elements.n.value, 10) || 1))
    const note = [guess && `Գուշակություն՝ ${GUESS_LABEL[guess]}`, wishes].filter(Boolean).join(' · ')
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: yes ? count - 1 : 0, note })
    setThanks({
      firstName: name.split(/\s+/)[0],
      message: yes ? data.rsvp.thanksYes : data.rsvp.thanksNo,
      guess: yes && guess ? `Ձեր գուշակությունը՝ ${GUESS_LABEL[guess].toLowerCase()}։` : '',
    })
    if (yes) onConfirmed?.()
  }

  return (
    <section id="gpb-rsvp">
      <div className="wrap">
        <Rv as="h2">Կլինե՞ք մեզ հետ</Rv>
        <Rv><Editable as="p" path="rsvp.intro" className="lead" /></Rv>
        {!thanks ? (
          <Rv as="form" onSubmit={submit} noValidate>
            <label className={`f${nameError ? ' err' : ''}`}>
              ՁԵՐ ԱՆՈՒՆԸ
              <input type="text" name="name" autoComplete="name" placeholder="Անուն, ազգանուն" ref={nameRef} aria-invalid={nameError} />
              <span className="err-msg">Խնդրում ենք գրել ձեր անունը</span>
            </label>
            <div className="attend">
              <label><input type="radio" name="att" value="yes" defaultChecked />Սիրով կգամ</label>
              <label><input type="radio" name="att" value="no" />Ցավոք, չեմ կարող</label>
            </div>
            <label className="f">
              ՀՅՈՒՐԵՐԻ ՔԱՆԱԿԸ
              <input type="number" name="n" min="1" max="6" defaultValue="1" inputMode="numeric" />
            </label>
            <fieldset>
              <legend className="f">ՁԵՐ ԳՈՒՇԱԿՈՒԹՅՈՒՆԸ</legend>
              <div className="picks">
                <label className="pick boy"><input type="radio" name="g" value="boy" />Տղա<small>կապույտ</small></label>
                <label className="pick girl"><input type="radio" name="g" value="girl" />Աղջիկ<small>վարդագույն</small></label>
              </div>
            </fieldset>
            <label className="f">
              ՄԱՂԹԱՆՔ ՓՈՔՐԻԿԻՆ
              <textarea name="w" rows="3" placeholder="Մի քանի ջերմ խոսք" />
            </label>
            <button className="btn" type="submit">ՈՒՂԱՐԿԵԼ</button>
          </Rv>
        ) : (
          <div className="thanks" role="status">
            Շնորհակալություն, {thanks.firstName}։
            <small>{thanks.message}{thanks.guess && <> {thanks.guess}</>}</small>
          </div>
        )}
      </div>
    </section>
  )
}
