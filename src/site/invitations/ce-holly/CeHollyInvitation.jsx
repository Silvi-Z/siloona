import './ce-holly.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, Countdown, DressCode, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// Playfair Display (heavy) for the big title, Great Vibes for the
// handwritten words, Inter for the text (all three have Cyrillic); Noto
// Serif / Sans Armenian wherever the text is Armenian.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Great+Vibes&family=Inter:wght@400;500;600&family=Noto+Serif+Armenian:wght@400;700;800&family=Noto+Sans+Armenian:wght@400;500;600&display=swap'

// "Ամանորյա երեկույթ" — a corporate New Year party, after the supplied
// reference card: cream paper in a thin green frame, watercolour greenery
// (pine, holly, a pinecone, dried oranges, eucalyptus) in the top right
// corner, a red bauble swinging top left, a stocking and a gift with
// greenery along the bottom, a heavy green serif title with a handwritten
// word under it. The art is drawn for Siloona (see assets/CREDITS.md). The
// evening follows below, each part opened by a sprig of holly.
export default function CeHollyInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('ceh-fonts', FONTS_HREF)
  return (
    <div className={`ceh${editing ? ' editing' : ''}`}>
      <main className="col">
        <Hero />
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="ce-holly" />
      </main>
    </div>
  )
}
