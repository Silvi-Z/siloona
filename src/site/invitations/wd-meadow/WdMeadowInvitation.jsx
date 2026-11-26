import './wd-meadow.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, DateBlock, DressCode, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// Light weights of Cormorant (numerals, ampersand) and Noto Serif
// Armenian aren't all in the site-wide font link.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Noto+Serif+Armenian:wght@200;300;400&display=swap'

// "Արեն & Նանե" — an impressionist oil painting of a flowering meadow
// (the supplied artwork). The painting has no empty paper, so text sits
// in cream "mist": a clearing on the cover and at the end, a circle for
// the date, a panel for the RSVP; strips of the painting, fading like
// mist, pass between the paper pages. No intro screen.
export default function WdMeadowInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('wmd-fonts', FONTS_HREF)
  return (
    <div className={`wmd${editing ? ' editing' : ''}`}>
      <main className="sheet">
        <Hero />
        <Welcome />
        <Section id="countdown"><DateBlock /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="wd-meadow" />
      </main>
    </div>
  )
}
