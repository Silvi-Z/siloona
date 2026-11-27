import { useRef, useState } from 'react'
import SplitWords from './SplitWords'
import Editable from '../../shared/Editable'
import { useInvitationContent } from '../../shared/EditableContext'

export default function RsvpForm({ data }) {
  const rsvp = data.rsvp
  const { onRsvp, guestName } = useInvitationContent()
  const [open, setOpen] = useState(false)
  const [nameError, setNameError] = useState(false)
  const [thanks, setThanks] = useState(null)
  const panelRef = useRef(null)
  const nameRef = useRef(null)

  function toggle() {
    const next = !open
    setOpen(next)
    if (next) {
      setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400)
    }
  }

  function submit(e) {
    e.preventDefault()
    const form = e.target
    const name = form.name.value.trim()
    setNameError(!name)
    if (!name) {
      nameRef.current?.focus()
      return
    }
    const yes = form.att.value === 'yes'
    // Hosts that record answers (the dashboard's guest view) get them here;
    // "2 հոգի" → one companion besides the guest.
    onRsvp?.({
      name,
      status: yes ? 'confirmed' : 'declined',
      plus: yes ? Math.max(0, (parseInt(form.n.value, 10) || 1) - 1) : 0,
      note: yes && form.d.value ? `Ըմպելիք՝ ${form.d.value}` : '',
    })
    setThanks({
      firstName: name.split(' ')[0],
      message: yes ? rsvp.thanksYes : rsvp.thanksNo,
    })
  }

  return (
    <section className="band" id="rsvp">
      <SplitWords text="Հարցաթերթիկ" as="h2" className="sub rv" style={{ fontSize: 'clamp(40px,11vw,58px)' }} />
      <p className="lab rv" style={{ marginTop: 2, fontSize: 'clamp(11px,2.6vw,12.5px)' }}>հյուրի</p>
      <Editable as="p" path="rsvp.intro" className="t rv" />
      <Editable as="p" path="rsvp.deadline" className="dl rv" />
      <button className="pill rv" type="button" aria-expanded={open} aria-controls="wdb-rsvp-panel" onClick={toggle}>
        {open ? 'Փակել' : 'Լրացնել'}
      </button>

      <div className={`panel${open ? ' open' : ''}`} id="wdb-rsvp-panel" ref={panelRef}>
        <div>
          {!thanks ? (
            <form onSubmit={submit} noValidate>
              <label className={`f${nameError ? ' bad' : ''}`}>
                Անուն և ազգանուն
                <input type="text" name="name" autoComplete="name" defaultValue={guestName || ''} ref={nameRef} />
                <span className="msgx">Խնդրում ենք գրել ձեր անունը</span>
              </label>

              <div className="f">
                Կմասնակցե՞ք
                <div className="opts">
                  <label><input type="radio" name="att" value="yes" defaultChecked />Այո, անպայման կգամ</label>
                  <label><input type="radio" name="att" value="no" />Ցավոք, չեմ կարող</label>
                </div>
              </div>

              <label className="f">
                Քանի հոգով
                <select name="n">
                  {rsvp.guestCountOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>

              <label className="f">
                Նախընտրած ըմպելիք
                <select name="d">
                  {rsvp.drinkOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>

              <button className="send" type="submit">Ուղարկել</button>
            </form>
          ) : (
            <div className="thanks" style={{ display: 'block' }} role="status">
              <h4>Շնորհակալություն, {thanks.firstName}</h4>
              <p className="t" style={{ marginTop: 8 }}>{thanks.message}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
