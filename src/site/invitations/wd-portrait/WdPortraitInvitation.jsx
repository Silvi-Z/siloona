import './wd-portrait.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Calendar, Closing, DressCode, Hero, Program, Rsvp, Seating, Story, Venue, Welcome, WishBook } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// A thin handwritten script for «Save the Date» (Latin only), Alegreya for
// numbers and Latin, Noto Serif Armenian for every Armenian letter.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,700;1,500&family=Noto+Serif+Armenian:wght@400;500;700&family=Monsieur+La+Doulaise&display=swap'

// "Լիլիթ & Արման" — Save the Date: two children looking at the framed
// portrait of the couple they will become.
export default function WdPortraitInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('wpt-fonts', FONTS_HREF)
  return (
    <div className={`wpt${editing ? ' editing' : ''}`}>
      <main className="sheet">
        <Section id="couple"><Hero /></Section>
        <Welcome />
        <Section id="story"><Story /></Section>
        <Section id="date"><Calendar /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        {/* only where the couple ordered seating — renders nothing otherwise */}
        <Seating />
        <Section id="dresscode"><DressCode /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        {/* only where the couple ordered the wishes book */}
        <WishBook />
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="wd-portrait" />
      </main>
    </div>
  )
}
