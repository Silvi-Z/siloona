import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { CLIP, DRESS, SUIT, VENUE_ART } from '../lib/art'
import { formatEventDate } from '../lib/date'
import { Art, Flourish, MaskHeading, Rv } from './parts'
import { LiveStep, useLiveSchedule } from '../../shared/LiveSchedule'
import AddToCalendar from '../../shared/AddToCalendar'
import RsvpExtra from '../../shared/RsvpExtra'

const DAYS = ['Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուր', 'Շբթ', 'Կիր']

export function Welcome() {
  const { data } = useInvitationContent()
  const isHidden = useSectionHidden()
  if (['greeting', 'message', 'story'].every(isHidden)) return null
  return (
    <section className="sec">
      <Section id="greeting">
        <MaskHeading><GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting></MaskHeading>
        <Flourish />
      </Section>
      <Section id="message"><Rv as="p"><Editable path="message" /></Rv></Section>
      <Section id="story">
        <Rv className="story rv">
          {data.story.map((_, i) => (
            <div key={i} style={{ '--i': i }}>
              <Editable as="b" path={`story.${i}.year`} /><Editable path={`story.${i}.text`} />
            </div>
          ))}
        </Rv>
      </Section>
    </section>
  )
}

function Countdown({ target }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const s = Math.max(0, Math.floor((target - now) / 1000))
  const pad = (n) => String(n).padStart(2, '0')
  const units = [[Math.floor(s / 86400), 'օր'], [pad(Math.floor((s % 86400) / 3600)), 'ժամ'], [pad(Math.floor((s % 3600) / 60)), 'րոպե'], [pad(s % 60), 'վայրկյան']]
  return (
    <Rv className="cd rv" aria-live="off">
      {units.map(([v, l]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}
    </Rv>
  )
}

// Month calendar with the wedding day in a beating heart, then the countdown.
export function CalendarCountdown() {
  const { data } = useInvitationContent()
  const isHidden = useSectionHidden()
  if (isHidden('calendar') && isHidden('countdown')) return null
  const d = formatEventDate(data.eventDate)
  const corner = { __html: '<use href="#wgr-corner"/>' }
  return (
    <section className="sec" style={{ paddingTop: 0 }} aria-label="Օրացույց">
      <Section id="calendar">
        <Rv className="cal rv">
          <svg className="co tl" aria-hidden="true" dangerouslySetInnerHTML={corner} /><svg className="co br" aria-hidden="true" dangerouslySetInnerHTML={corner} />
          <h3>{d.month}</h3>
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
      </Section>
      <Section id="countdown"><Countdown target={d.date.getTime()} /></Section>
      <Rv className="cal-add rv">
        <AddToCalendar slug="wd-green" event={{ location: [data.venue?.name, data.venue?.address].filter(Boolean).join(', ') }} className="btn" />
      </Rv>
    </section>
  )
}

export function Program() {
  const { data } = useInvitationContent()
  const live = useLiveSchedule()
  return (
    <section className="sec prog">
      <MaskHeading path="scheduleTitle" />
      <Rv className="clipwrap rv">
        <Art className="clip" viewBox="0 0 60 70" aria-hidden="true" svg={CLIP} />
        <ul className="paper grain" style={{ paddingLeft: '1.5rem' }}>
          {data.schedule.map((_, i) => (
            <li key={i} className={live.cls(i)} style={{ '--i': i }}><Editable as="time" path={`schedule.${i}.time`} /><Editable path={`schedule.${i}.label`} /><LiveStep live={live} i={i} /><RowRemove list="schedule" index={i} /></li>
          ))}
        </ul>
        <RowAdd list="schedule" />
      </Rv>
    </section>
  )
}

export function DressCode() {
  const { data, editing, setField } = useInvitationContent()
  const { colors = [], colorNames = [] } = data.dressCode
  return (
    <section className="sec" style={{ paddingTop: '2rem' }}>
      <MaskHeading path="dressCode.title" />
      <Rv as="p"><Editable path="dressCode.intro" /></Rv>
      <Rv className="ics rv">
        <Art className="ic" viewBox="0 0 100 100" aria-label="Տղամարդկանց համար" svg={SUIT} style={{ '--i': 0 }} />
        <Art className="ic" viewBox="0 0 100 100" aria-label="Կանանց համար" svg={DRESS} style={{ '--i': 1 }} />
      </Rv>
      <Rv className="pal rv" aria-label="Գունային գամմա">
        {colors.map((c, i) => (editing ? (
          <label key={i} className="pal-edit">
            <input type="color" className="color-edit" value={c} aria-label={`Գույն ${i + 1}`} onChange={(e) => setField('dressCode.colors', colors.map((x, j) => (j === i ? e.target.value : x)))} />
            <Editable path={`dressCode.colorNames.${i}`} />
          </label>
        ) : <i key={i} style={{ '--c': c, '--i': i }} title={colorNames[i]} />))}
      </Rv>
    </section>
  )
}

// Details text + the button that opens the RSVP dialog. Guest count is
// everyone coming (companions = count − 1).
export function Details() {
  const { data, onRsvp, guestName } = useInvitationContent()
  const { rsvp } = data
  const dlg = useRef(null)
  const [note, setNote] = useState('')
  const tel = `tel:${String(data.contacts.phone || '').replace(/[^\d+]/g, '')}`

  function open() { setNote(''); dlg.current?.showModal() }

  function submit(e) {
    if (e.nativeEvent.submitter?.value === 'cancel') return
    e.preventDefault()
    const f = e.target.elements
    const name = f.n.value.trim()
    const yes = f.a.value === 'yes'
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: yes ? Math.max(0, f.c.selectedIndex) : 0, note: '' })
    setNote(fillName(yes ? rsvp.thanksYes : rsvp.thanksNo, name))
  }

  return (
    <section className="sec" style={{ paddingTop: '2rem' }}>
      <MaskHeading path="details.title" />
      <Flourish />
      <Rv as="p"><Editable path="details.text" />{' '}<a href={tel}><Editable path="contacts.phone" /></a>։</Rv>
      <Section id="rsvp">
        <Rv as="button" className="btn rv" type="button" aria-haspopup="dialog" onClick={open}><Editable path="rsvp.button" /></Rv>
        <dialog ref={dlg} aria-labelledby="wgr-rsvp-t" onClick={(e) => { if (e.target === dlg.current) dlg.current.close() }}>
          <form method="dialog" onSubmit={submit}>
            <button className="x" value="cancel" formNoValidate aria-label="Փակել">×</button>
            <h2 id="wgr-rsvp-t">{rsvp.title}</h2>
            <label>Ձեր անունը
              <input
                type="text" name="n" required autoComplete="name" defaultValue={guestName || ''}
                onInvalid={(e) => e.target.setCustomValidity('Խնդրում ենք նշել ձեր անունը։')}
                onInput={(e) => e.target.setCustomValidity('')}
              />
            </label>
            <label>Հյուրերի թիվ<select name="c">{rsvp.guestOptions.map((o) => <option key={o}>{o}</option>)}</select></label>
            <fieldset>
              <label><input type="radio" name="a" value="yes" defaultChecked />Սիրով կմասնակցեմ</label>
              <label><input type="radio" name="a" value="no" />Ցավոք՝ չեմ կարողանա գալ</label>
            </fieldset>
            <RsvpExtra />
            <button className="btn" type="submit">Ուղարկել</button>
            <p className="note" role="status">{note}</p>
          </form>
        </dialog>
      </Section>
    </section>
  )
}

export function Venue() {
  const { data } = useInvitationContent()
  const { venue } = data
  const q = encodeURIComponent(venue.address || venue.name || '')
  return (
    <section className="venue">
      <div className="art2" aria-hidden="true">
        <Art svg={VENUE_ART} viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }} data-m="-5" />
      </div>
      <MaskHeading path="venue.title" />
      <Flourish />
      <Rv as="p">
        <Editable path="venue.intro" />{' '}<Editable path="venue.name" />։ Հասցե՝ <Editable path="venue.address" />։
      </Rv>
      <Rv as="a" className="pill rv" href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer">
        Տեսնել քարտեզում <span aria-hidden="true">→</span>
      </Rv>
    </section>
  )
}

export function Sign() {
  const { data } = useInvitationContent()
  return (
    <Section id="closing">
      <footer className="sign"><Rv as="p"><Editable path="sign" /> {data.couple.first} և {data.couple.second}</Rv></footer>
    </Section>
  )
}
