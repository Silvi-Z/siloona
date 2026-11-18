import './ce-garland.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, Countdown, DressCode, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'

// Thin serif capitals for the title and numbers (Cormorant Garamond +
// light Noto Serif Armenian), spaced sans capitals for the small lines
// (Jost + Noto Sans Armenian), as on the printed card.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Noto+Serif+Armenian:wght@300;400&family=Jost:wght@400;500&family=Noto+Sans+Armenian:wght@400;500&display=swap'

// «Սուրբ Ծննդյան երեկո» — a corporate Christmas card: a watercolour fir
// garland with a sage bow over deep green spaced capitals.
export default function CeGarlandInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('ceg-fonts', FONTS_HREF)
  return (
    <div className={`ceg${editing ? ' editing' : ''}`}>
      <main className="sheet">
        <Section id="hero"><Hero /></Section>
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
      </main>
    </div>
  )
}
