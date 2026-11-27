import './wd-chateau.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Ceremony, Closing, Divider, DressCode, Gallery, Gift, Hero, Reception, Rsvp, Schedule, Seating, Venue } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// Cormorant Garamond (Latin and Cyrillic) for the names, the text and the
// spaced bold capitals; Noto Serif Armenian wherever the text is Armenian.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Noto+Serif+Armenian:wght@300;400;600;700&display=swap'

// "Դավիթ & Մարիամ" — a wedding invitation in navy and soft blue, after the
// supplied reference: a watercolour chateau with cypresses, hydrangeas and
// a fountain under the couple's names, the families and both places, a
// swipeable photo gallery, the reception with a month calendar (a heart on
// the day), a live map, the dress code, the day's schedule, the reply,
// and a gift box that opens. The art is drawn for Siloona; the demo photos
// are from Unsplash (assets/CREDITS.md) and are replaced by the couple's.
export default function WdChateauInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('wdc-fonts', FONTS_HREF)
  return (
    <div className={`wdc${editing ? ' editing' : ''}`}>
      <main className="col">
        <Hero />
        <Section id="ceremony"><Ceremony /></Section>
        <Section id="gallery"><Gallery /></Section>
        <Divider />
        <Section id="reception"><Reception /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="schedule"><Schedule /></Section>
        {/* only where the couple ordered seating — renders nothing otherwise */}
        <Seating />
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="gift"><Gift /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="wd-chateau" />
      </main>
    </div>
  )
}
