import './card-mouse.css'
import Editable from '../shared/Editable'
import Section from '../shared/Section'
import { InvitationContentProvider, useInvitationContent } from '../shared/EditableContext'
import { cardMouseDefaultData } from './data'
import mouse from './assets/mouse.webp'
import cloud1 from './assets/cloud1.webp'
import cloud2 from './assets/cloud2.webp'
import stars from './assets/stars.webp'

const WEEKDAYS = ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ']
const MONTHS_GEN = ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի']

function dateParts(iso) {
  let d = new Date(iso)
  if (Number.isNaN(d.getTime())) d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return { weekday: WEEKDAYS[d.getDay()], day: d.getDate(), month: MONTHS_GEN[d.getMonth()], time: `${pad(d.getHours())}:${pad(d.getMinutes())}` }
}

// The printed A5 card itself (1200 × 1697 in the source; everything is
// placed in % / cqw of the card so it scales as one piece).
function Card() {
  const { data, editing } = useInvitationContent()
  const d = dateParts(data.eventDate)
  return (
    <div className="cmo-card">
      <img className="spr cloud1" src={cloud1} alt="" aria-hidden="true" />
      <img className="spr stars" src={stars} alt="" aria-hidden="true" />
      <img className="spr mouse" src={mouse} alt="" aria-hidden="true" />
      <img className="spr cloud2" src={cloud2} alt="" aria-hidden="true" />

      <h1 className="name"><Editable path="child.name" /></h1>
      <p className="age"><Editable path="ageLine" /></p>
      <p className="sub"><Editable path="subtitle" /></p>

      <div className="when">
        <span className="side l">{d.weekday}</span>
        <span className="mid">
          {editing
            ? <Editable path="eventDate" type="date" />
            : <><b>{d.day}</b><span>{d.month}</span></>}
        </span>
        <span className="side r">Ժամը {d.time}</span>
      </div>

      <Section id="venue">
        <p className="addr"><Editable path="venue.name" /><br /><Editable path="venue.address" /></p>
      </Section>
    </div>
  )
}

// The card on its page (preview, dashboard, published link).
export default function CardMouseInvitation() {
  return (
    <div className="cmo">
      <div className="cmo-sheet"><Card /></div>
    </div>
  )
}

// The catalog thumbnail: the same card, rendered from its default content.
export function CardMouseArt() {
  return (
    <div className="cmo-art">
      <InvitationContentProvider defaultData={cardMouseDefaultData} editing={false}>
        <div className="cmo-sheet"><Card /></div>
      </InvitationContentProvider>
    </div>
  )
}
