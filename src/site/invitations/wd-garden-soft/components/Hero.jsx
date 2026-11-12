import Editable from '../../shared/Editable'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { SCENE } from '../lib/art'
import { formatEventDate } from '../lib/formatDate'
import { Art, Cluster, Frame, Rv, SplitHeading, useRagged } from './parts'

const WEEKDAYS = ['Երկ', 'Երք', 'Չոր', 'Հնգ', 'Ուր', 'Շաբ', 'Կիր']

// "Աննա & Միքայել" letter by letter (source's .nm .ch, one running index
// across both names and the ampersand). Plain editable fields in edit mode.
function Names() {
  const { data, editing } = useInvitationContent()
  if (editing) {
    return <h1 className="nm"><Editable path="couple.first" /><span className="amp">&amp;</span><Editable path="couple.second" /></h1>
  }
  let k = 0
  const chars = (s) => Array.from(String(s || '')).map((c) => <span key={k} className="ch" style={{ '--i': k++ }}>{c}</span>)
  const first = chars(data.couple.first)
  const amp = <span className="amp"><span className="ch" style={{ '--i': k++ }}>&amp;</span></span>
  const second = chars(data.couple.second)
  return <h1 className="nm" aria-label={`${data.couple.first} և ${data.couple.second}`}>{first}{amp}{second}</h1>
}

function Greeting() {
  const { data, editing, guestName } = useInvitationContent()
  if (editing) {
    return (
      <Rv as="h2" className="split" style={{ marginTop: 34 }}>
        <GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting>
      </Rv>
    )
  }
  return <SplitHeading text={guestName ? fillName(data.greeting.personal, guestName) : data.greeting.general} style={{ marginTop: 34 }} />
}

function WeekStrip() {
  const { data } = useInvitationContent()
  const { week, dayIndex } = formatEventDate(data.eventDate)
  return (
    <Rv className="wk rv">
      {WEEKDAYS.map((d) => <span key={d} className="h">{d}</span>)}
      {week.map((n, i) => <span key={i} className={i === dayIndex ? 'ev' : undefined}>{n}</span>)}
    </Rv>
  )
}

export default function Hero() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const deckle = useRagged(22, 3.4, false)
  return (
    <section className="hero paper" id="top" data-par="">
      <div className="stripes" />
      <div className="cw" style={{ marginTop: 'clamp(20px,5vw,50px)' }}>
        <Frame />
        <Cluster k="A" className="pA" delay="2s" />
        <div className="par pcw" aria-hidden="true"><Art className="pc" style={{ clipPath: deckle }} svg={SCENE} /></div>
        <Cluster k="B" className="pB" delay="2.5s" origin="100% 0" r0="12deg" />
        <div className="par nt"><Rv className="note rv" style={{ '--dl': '.6s' }}><Editable path="hero.note" /></Rv></div>
        <div className="ci">
          <p className="dt">{d.short}</p>
          <Names />
          <div className="dv"><i /></div>
          <Editable as="p" path="hero.line" className="mar" />
          <Editable as="p" path="hero.caption" className="cap" />
        </div>
      </div>
      <div className="below">
        <Rv as="p" className="city rv"><Editable path="hero.city" /></Rv>
        <Rv as="p" className="big rv" style={{ '--dl': '.1s' }}>
          <Editable path="eventDate" type="date" format={(iso) => formatEventDate(iso).long} />
        </Rv>
        <Rv as="svg" className="spr rv" viewBox="0 0 34 44" aria-hidden="true">
          <path d="M17 42V8M17 30c-8-2-11-8-10-14 8 2 11 8 10 14zM17 22c8-2 11-8 10-14-8 2-11 8-10 14zM17 12c-4-1-6-4-5-8 4 1 6 4 5 8z" />
        </Rv>
        <Section id="greeting"><Greeting /></Section>
        <Section id="message">
          <Rv><Editable as="p" path="message" className="t" /></Rv>
          <Rv><Editable as="p" path="message2" className="t" /></Rv>
        </Section>
        <Section id="calendar"><WeekStrip /></Section>
      </div>
    </section>
  )
}
