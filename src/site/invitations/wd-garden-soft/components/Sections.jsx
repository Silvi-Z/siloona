import { useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { FIGURES, SCENE } from '../lib/art'
import { Art, Cluster, Frame, Rv, SplitHeading, useRagged } from './parts'

// A lavender section with a torn top edge.
function Lav({ className = '', style, children }) {
  const torn = useRagged(70, 16, true)
  return <section className={`lav torn ${className}`.trim()} data-par="" style={{ clipPath: torn, ...style }}>{children}</section>
}

export function Venue() {
  const { data } = useInvitationContent()
  const deckle = useRagged(22, 3.4, false)
  const stamp = useRagged(22, 3.4, false)
  return (
    <Lav>
      <div className="in">
        <SplitHeading text="Տոնի վայրը" />
        <div className="pcwrap" aria-hidden="true">
          <Art className="pc2" style={{ clipPath: deckle }} svg={SCENE} />
          <Art className="st" style={{ clipPath: stamp }} svg={SCENE} />
        </div>
        <Rv as="h3" className="vn rv"><Editable path="venue.name" /></Rv>
        <Rv as="span" className="addr rv"><Editable path="venue.address" /></Rv>
        <Rv><Editable as="p" path="venue.note" className="t" style={{ marginTop: 22 }} /></Rv>
        <Rv
          as="a" className="pill rv" target="_blank" rel="noopener noreferrer"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.venue.address || data.venue.name)}`}
        >
          Բացել քարտեզը
        </Rv>
      </div>
      <Cluster k="A" className="vflw" style={{ '--px': 10, '--py': -60 }} delay="0s" still />
    </Lav>
  )
}

export function Timeline() {
  const { data } = useInvitationContent()
  return (
    <section className="tls" data-par="">
      <div className="stripes" />
      <div className="cw">
        <Frame />
        <Cluster k="A" className="pA" delay="0s" still />
        <Cluster k="B" className="pB" delay="0s" still />
        <div className="ci">
          <SplitHeading text="Ժամանակացույց" className="rv" />
          <div className="dv" style={{ margin: '3.4cqw 0 1.6cqw' }}><i /></div>
          <Editable as="p" path="scheduleSub" className="mar" style={{ fontStyle: 'normal', fontSize: '4.2cqw' }} />
          <Rv as="ul" className="tl rv">
            {data.schedule.map((_, i) => (
              <li key={i} style={{ '--k': i }}>
                <Editable as="time" path={`schedule.${i}.time`} /><i /><Editable path={`schedule.${i}.label`} />
                <RowRemove list="schedule" index={i} />
              </li>
            ))}
          </Rv>
          <RowAdd list="schedule" />
          <Editable as="p" path="scheduleCaption" className="cap2" />
        </div>
      </div>
    </section>
  )
}

export function DressCode() {
  const { data, editing, setField } = useInvitationContent()
  const { colors = [], colorNames = [] } = data.dressCode
  return (
    <section className="paper" style={{ paddingTop: 'calc(var(--gap)*.4)' }}>
      <div className="in">
        <SplitHeading text="Դրես-կոդ" />
        <Rv><Editable as="p" path="dressCode.intro" className="t" /></Rv>
        <Rv className="sws rv">
          {colors.map((c, i) => (
            <figure key={i}>
              {editing
                ? <input type="color" className="color-edit" value={c} aria-label={`Գույն ${i + 1}`} onChange={(e) => setField('dressCode.colors', colors.map((x, j) => (j === i ? e.target.value : x)))} />
                : <i style={{ '--c': c }} />}
              <figcaption>
                {editing ? <Editable path={`dressCode.colorNames.${i}`} /> : colorNames[i]}
              </figcaption>
            </figure>
          ))}
        </Rv>
        <Rv as={Art} className="fgs" aria-hidden="true" svg={FIGURES} />
        <Rv><Editable as="p" path="dressCode.note" className="nt2" /></Rv>
      </div>
    </section>
  )
}

const CARDS = ['gifts', 'contribution', 'kids']

export function Details() {
  const isHidden = useSectionHidden()
  if (CARDS.every(isHidden)) return null
  return (
    <Lav>
      <div className="in" style={{ maxWidth: 980 }}>
        <SplitHeading path="detailsTitle" />
        <div className="cards">
          {CARDS.map((id, i) => (
            <Section key={id} id={id}>
              <Rv className="cd rv" style={{ '--dl': `${i * 0.12}s` }}>
                <Editable as="b" path={`${id}.title`} />
                <Editable as="p" path={`${id}.text`} />
              </Rv>
            </Section>
          ))}
        </div>
      </div>
    </Lav>
  )
}

// Guest questionnaire. Party size index = companions; chosen drinks and
// party size go to the host as the RSVP note.
export function Rsvp() {
  const { data, onRsvp } = useInvitationContent()
  const rsvp = data.rsvp
  const [nameError, setNameError] = useState(false)
  const [thanks, setThanks] = useState(null)
  const nameRef = useRef(null)

  function submit(e) {
    e.preventDefault()
    const f = e.target.elements
    const name = f.name.value.trim()
    setNameError(!name)
    if (!name) { nameRef.current?.focus(); return }
    const yes = f.att.value === 'yes'
    const idx = Math.max(0, Number(f.n.value) || 0)
    const drinks = [...e.target.querySelectorAll('input[name=drink]:checked')].map((x) => x.value)
    const note = yes ? [rsvp.guestOptions[idx], drinks.length && `Ըմպելիքներ՝ ${drinks.join(', ')}`].filter(Boolean).join(' · ') : ''
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: yes ? idx : 0, note })
    setThanks({ firstName: name.split(/\s+/)[0], message: yes ? rsvp.thanksYes : rsvp.thanksNo })
  }

  return (
    <section className="paper" id="wgs-rsvp">
      <div className="in">
        <SplitHeading text="Հյուրի հարցաթերթիկ" />
        <Rv><Editable as="p" path="rsvp.intro" className="t" /></Rv>
        <Rv className="rv">
          {!thanks ? (
            <form onSubmit={submit} noValidate>
              <label className={`f${nameError ? ' bad' : ''}`}>
                Անուն և ազգանուն
                <input type="text" name="name" autoComplete="name" ref={nameRef} aria-invalid={nameError} />
                <span className="msgx">Խնդրում ենք գրել ձեր անունը</span>
              </label>
              <div className="f">
                Կմասնակցե՞ք տոնին
                <div className="opts r">
                  <label><input type="radio" name="att" value="yes" defaultChecked />Այո, անպայման կգամ</label>
                  <label><input type="radio" name="att" value="no" />Ցավոք, չեմ կարող գալ</label>
                </div>
              </div>
              <label className="f">
                Քանի հոգով
                <select name="n" defaultValue="0">
                  {rsvp.guestOptions.map((o, i) => <option key={i} value={i}>{o}</option>)}
                </select>
              </label>
              <div className="f">
                Նախընտրած ըմպելիքներ
                <div className="opts c">
                  {rsvp.drinkOptions.map((o) => <label key={o}><input type="checkbox" name="drink" value={o} />{o}</label>)}
                </div>
              </div>
              <button className="send" type="submit">Ուղարկել</button>
            </form>
          ) : (
            <div className="thanks" role="status">
              <svg className="hr" viewBox="0 0 40 36" aria-hidden="true"><use href="#wgs-hrt" /></svg>
              <h4>Շնորհակալություն, {thanks.firstName}։</h4>
              <p>{thanks.message}</p>
            </div>
          )}
        </Rv>
      </div>
    </section>
  )
}

export function Contacts() {
  const { data } = useInvitationContent()
  const isHidden = useSectionHidden()
  if (isHidden('contacts') && isHidden('closing')) return null
  const tel = `tel:${String(data.contacts.phone || '').replace(/[^\d+]/g, '')}`
  return (
    <Lav className="end" style={{ paddingBottom: 'calc(var(--gap)*1.2)' }}>
      <div className="in">
        <Section id="contacts">
          <SplitHeading text="Կոնտակտներ" />
          <Rv><Editable as="p" path="contacts.intro" className="t" /></Rv>
          <Rv as="a" className="tel rv" href={tel}>
            <Editable path="contacts.name" /> · <Editable path="contacts.phone" />
          </Rv>
        </Section>
        <Rv as="p" className="nmz rv"><Editable path="couple.first" /><i>&amp;</i><Editable path="couple.second" /></Rv>
        <Section id="closing">
          <Rv><Editable as="p" path="closing" className="t" style={{ color: 'var(--sage-d)' }} /></Rv>
        </Section>
      </div>
      <Cluster k="B" className="vflw" style={{ left: 'auto', right: '-10%', top: '24%', '--px': -10, '--py': -50 }} delay="0s" still />
    </Lav>
  )
}
