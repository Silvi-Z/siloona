import './ce-jingle.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, Countdown, DressCode, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// Caveat (bold) for the red brush script, Cormorant Garamond for the
// spaced capitals and the text (both have Cyrillic); Noto Serif Armenian
// wherever the text is Armenian.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Noto+Serif+Armenian:wght@400;500;600&display=swap'

// "Զնգոց ու ծիծաղ" — a corporate Christmas / New Year party, after the
// supplied reference card: cute watercolour characters all round white
// paper — a gingerbread man, a candy cane, a Santa gnome, a tree, a
// stocking, a snowman, a star cookie, a stack of gifts and a fawn — each
// popping in and then moving a little on its own; a red brush-script
// title, spaced serif capitals and the date between hairlines. The
// characters are drawn for Siloona (see assets/CREDITS.md).
export default function CeJingleInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('cjg-fonts', FONTS_HREF)
  return (
    <div className={`cjg${editing ? ' editing' : ''}`}>
      <main className="col">
        <Hero />
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="ce-jingle" />
      </main>
    </div>
  )
}
