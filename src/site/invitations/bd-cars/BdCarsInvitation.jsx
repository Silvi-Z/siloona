import './bd-cars.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, Countdown, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// The heavy weights for the race-day titles aren't in the site-wide font
// link.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Armenian:wght@400;500;700;800;900&display=swap'

// "Մարկի 4 տարեկանը" — watercolour race cars at a desert party (the
// supplied artwork, cut out of its white background). Race day: a race
// number for the age, a road with a rolling centre line, a pit board
// countdown, the programme along a road, a checkered finish line.
// No intro screen.
export default function BdCarsInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('bcr-fonts', FONTS_HREF)
  return (
    <div className={`bcr${editing ? ' editing' : ''}`}>
      <main className="sheet">
        <Hero />
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="bd-cars" />
      </main>
    </div>
  )
}
