import { useEffect, useMemo, useRef, useState } from 'react'
import './bp-blue.css'
import Editable from '../shared/Editable'
import GuestGreeting from '../shared/GuestGreeting'
import Section, { useSectionHidden } from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { CROSS, CURVE, DEFS, SILHOUETTE, cluster, florets } from './lib/art'
import { formatEventDate } from './lib/formatDate'
import { Art, CallButton, Icon, Place, Rv, Title } from './components/parts'
import SiloonaCredit from '../shared/SiloonaCredit'
import AddToCalendar from '../shared/AddToCalendar'

// Thin Noto Serif Armenian / Sans weights and Cormorant 300 (+ italic for
// the city lines) — not in the site-wide font link.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Noto+Sans+Armenian:wght@300;400;600;700&family=Noto+Serif+Armenian:wght@200;300;400&display=swap'

const CLUSTER_TR = cluster(1)
const CLUSTER_BL = cluster(2)

// The veil that lifts by itself after a moment (tap to skip). Skipped in
// edit mode and with reduced motion.
function Veil({ editing, onBegin }) {
  const [phase, setPhase] = useState('up') // up -> gone -> done
  const timers = useRef([])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || editing) { setPhase('done'); onBegin(); return }
    timers.current.push(setTimeout(begin, 3400))
    return () => timers.current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  function begin() {
    setPhase((p) => {
      if (p !== 'up') return p
      onBegin()
      timers.current.push(setTimeout(() => setPhase('done'), 2300))
      return 'gone'
    })
  }

  if (phase === 'done') return null
  return (
    <div
      className={`bpb-veil${phase === 'gone' ? ' gone' : ''}`} role="button" tabIndex={0} aria-label="Բացել հրավիրատոմսը"
      onClick={begin} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); begin() } }}
    >
      <div className="vc">
        <i className="ring" /><i className="ring" />
        <svg viewBox="-30 -30 60 60" aria-hidden="true"><g className="fl"><use href="#bpb-fl1" transform="scale(2)" /></g></svg>
        <Editable as="p" path="veil" />
      </div>
    </div>
  )
}

function PeopleBlock({ id }) {
  return (
    <>
      <Rv as="p" className="lb rv" style={{ marginTop: id === 'parents' ? 34 : 14 }}><Editable path={`${id}.label`} /></Rv>
      <Rv as="p" className="pp rv" style={{ '--dl': '.1s' }}>
        <Editable path={`${id}.first`} /><br /><Editable path={`${id}.second`} />
      </Rv>
    </>
  )
}

function BpBlueBody({ editing }) {
  const { data, guestName, editing: isEditing } = useInvitationContent()
  const rootRef = useRef(null)
  const [go, setGo] = useState(editing)
  const isHidden = useSectionHidden()
  const drift = useMemo(florets, [])
  const d = formatEventDate(data.eventDate)

  useDesignFonts('bpb-fonts', FONTS_HREF)

  // Locks page scroll while the veil is up (source's `html.intro`).
  useEffect(() => {
    if (go) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = prev }
  }, [go])

  // Pointer drift (--mx) and scroll depth (--sy) for the hydrangeas.
  useEffect(() => {
    const root = rootRef.current
    const onMove = (e) => root.style.setProperty('--mx', (e.clientX / window.innerWidth * 2 - 1).toFixed(3))
    const onScroll = () => root.style.setProperty('--sy', (window.scrollY / window.innerHeight).toFixed(3))
    window.addEventListener('pointermove', onMove)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('scroll', onScroll) }
  }, [])

  function begin() {
    setGo(true)
    window.scrollTo(0, 0)
  }

  // Separators sit between visible place / RSVP blocks only.
  const blocks = ['church', 'party', 'rsvp'].filter((id) => !isHidden(id))
  const sepBefore = (id) => blocks.indexOf(id) > 0 && <Rv className="sep" />

  return (
    <div className={`bpb${go ? ' go' : ''}`} ref={rootRef}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs dangerouslySetInnerHTML={{ __html: DEFS }} />
      </svg>
      <Veil editing={editing} onBegin={begin} />

      <main className="card">
        <i className="wash w1" /><i className="wash w2" /><i className="wash w3" />
        <svg className="crv c1" viewBox="0 0 200 220" aria-hidden="true"><path pathLength="1" d={CURVE} /></svg>
        <svg className="crv c2" viewBox="0 0 200 220" aria-hidden="true"><path pathLength="1" d={CURVE} /></svg>
        <Art className="cl tr" style={{ '--px': -6, '--py': -14 }} svg={CLUSTER_TR} />
        <Art className="cl bl" style={{ '--px': 6, '--py': 14 }} svg={CLUSTER_BL} />
        <Art className="dr" aria-hidden="true" svg={drift} />

        <div className="in">
          <Art svg={CROSS} />
          <Section id="prayer">
            <div className="seq" style={{ '--i': 2 }}><Editable as="p" path="prayer" className="pr" /></div>
          </Section>
          <p className="nm seq" style={{ '--i': 9 }}><Editable path="childName" /></p>
          <Title />

          <Section id="parents"><PeopleBlock id="parents" /></Section>
          <Section id="godparents"><PeopleBlock id="godparents" /></Section>

          <Section id="greeting">
            {(guestName || data.greeting.general || isEditing) && (
              <Rv className="rv gr-wrap">
                <GuestGreeting personalPath="greeting.personal" as="p" className="gr">
                  <Editable as="p" path="greeting.general" className="gr" />
                </GuestGreeting>
              </Rv>
            )}
          </Section>
          <Section id="message">
            <Rv><Editable as="p" path="message" className="ms" /></Rv>
          </Section>

          <Rv className="dt rv">
            <span className="mo">{d.month}</span>
            <span className="sd a"><span>{d.weekday}</span></span>
            <Editable as="span" path="eventDate" type="date" className="nu" format={(iso) => formatEventDate(iso).day} />
            <span className="sd b"><span>{d.year}</span></span>
          </Rv>
          <Rv className="rv cal-rv">
            <AddToCalendar slug="bp-blue" className="bt">Ավելացնել օրացույցում<i /></AddToCalendar>
          </Rv>

          <Section id="church"><Place index={0} icon="chu" /></Section>
          <Section id="party">{sepBefore('party')}<Place index={1} icon="cup" /></Section>
          <Section id="rsvp">
            {sepBefore('rsvp')}
            <Rv className="inf rv">
              <Icon name="ph" />
              <Editable as="p" path="rsvp.title" className="ev" />
              <Editable as="p" path="rsvp.text" className="pl note" />
              <CallButton index={0} /><br />
              <CallButton index={1} className="bt b2" />
            </Rv>
          </Section>

          <Section id="dressCode">
            <Rv className="inf rv dress">
              <Editable as="p" path="dressCode.title" className="ev" />
              <Art svg={SILHOUETTE} />
              <Editable as="p" path="dressCode.text" className="tm" />
            </Rv>
          </Section>

          <Section id="closing">
            <Rv><Editable as="p" path="closing.line" className="pl closing-line" /></Rv>
            <Rv style={{ '--dl': '.15s' }}><Editable as="p" path="closing.thanks" className="thx" /></Rv>
          </Section>
        </div>
        <SiloonaCredit design="bp-blue" />
      </main>
    </div>
  )
}

// "Սամվելի մկրտությունը" — blue hydrangea baptism invitation, ported from
// the supplied HTML demo.
export default function BpBlueInvitation() {
  const { editing: isEditing, skipIntro } = useInvitationContent()
  const editing = isEditing || skipIntro

  // Leaving edit mode remounts the invitation so the veil, the title
  // letters and the reveals replay cleanly — same as bd-animals.
  const [viewKey, setViewKey] = useState(0)
  const wasEditing = useRef(isEditing)
  useEffect(() => {
    if (wasEditing.current && !isEditing) setViewKey((k) => k + 1)
    wasEditing.current = isEditing
  }, [isEditing])

  return <BpBlueBody key={viewKey} editing={editing} />
}
