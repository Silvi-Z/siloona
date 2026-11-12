import './wd-velvet.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, DateArch, DressCode, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'

// Light weights of Cormorant (for the ampersand and numerals) aren't in
// the site-wide font link.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Noto+Serif+Armenian:wght@200;300;400&display=swap'

// "Արման & Լիլիթ" — a burgundy velvet arch on warm plaster with two
// sculpted cream flowers (from the supplied artwork). One continuous
// sheet: the cover, velvet bands for the welcome and the RSVP, plaster
// pages in between, and the flowers again at the end. No intro screen.
export default function WdVelvetInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('wvl-fonts', FONTS_HREF)
  return (
    <div className={`wvl${editing ? ' editing' : ''}`}>
      <main className="sheet">
        <Hero />
        <Welcome />
        <Section id="countdown"><DateArch /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
      </main>
    </div>
  )
}
