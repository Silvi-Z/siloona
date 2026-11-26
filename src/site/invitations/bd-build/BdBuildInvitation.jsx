import './bd-build.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, Countdown, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// The heavy weights for the titles and the felt number aren't in the
// site-wide font link.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Armenian:wght@400;500;700;800;900&display=swap'

// "Հայկի 2 տարեկանը" — a watercolour construction site (the supplied
// artwork, cut into pieces): the cover rebuilds the artwork piece by
// piece; the pages use its hard hat, cone, hammer, vest and clouds, with
// site signs for the countdown and caution tape on the RSVP. No intro
// screen.
export default function BdBuildInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('bbd-fonts', FONTS_HREF)
  return (
    <div className={`bbd${editing ? ' editing' : ''}`}>
      <main className="sheet">
        <Hero />
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="bd-build" />
      </main>
    </div>
  )
}
