import './bd-stitch.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, Countdown, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// The heavy weights for the embroidered titles aren't in the site-wide
// font link.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Armenian:wght@400;500;700;800&family=Noto+Serif+Armenian:wght@400;500;600&display=swap'

// "Սոֆիի 2 տարեկանը" — storybook friends embroidered on linen (the
// supplied artwork). Everything is needlework: woven linen pages, running
// stitches, felt labels and patches, and pieces of the artwork held in
// wooden embroidery hoops. No intro screen.
export default function BdStitchInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('bst-fonts', FONTS_HREF)
  return (
    <div className={`bst${editing ? ' editing' : ''}`}>
      <main className="sheet">
        <Hero />
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="bd-stitch" />
      </main>
    </div>
  )
}
