import './bd-dots.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, Countdown, DressCode, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// Jost (Latin and Cyrillic) for the capitals and the text, Bad Script
// (Latin and Cyrillic) for the handwritten lines; Noto Sans Armenian
// wherever the text is Armenian, Noto Serif Armenian for its script lines.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&family=Bad+Script&family=Noto+Sans+Armenian:wght@300;400;500&family=Noto+Serif+Armenian:wght@400&display=swap'

// "Սոնայի 6-րդ ծննդյան տոնը" — a children's birthday, after the supplied
// reference card: a frame of watercolour dots all round textured paper,
// the words in a ring in the middle — a line curving over the top, a
// handwritten «join the fun», the title and the details, and the reply
// line curving under. The dots are laid out for each screen (lib/frame.js)
// from one sheet drawn for Siloona (see assets/CREDITS.md) and pop in one
// after another. The rest of the party follows, each part opened by three
// small dots. No intro screen.
export default function BdDotsInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('bdd-fonts', FONTS_HREF)
  return (
    <div className={`bdd${editing ? ' editing' : ''}`}>
      <main className="col">
        <Hero />
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="bd-dots" />
      </main>
    </div>
  )
}
