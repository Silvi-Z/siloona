import './ce-groovy.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, Countdown, DressCode, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// Shrikhand for the chunky Latin lettering, Unbounded for its Cyrillic
// (Shrikhand has none), Jost for the spaced capitals and the text; Noto
// Sans Armenian (heavy) wherever the text is Armenian.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Shrikhand&family=Unbounded:wght@700;800&family=Jost:wght@400;500;600&family=Noto+Sans+Armenian:wght@400;500;600;800;900&display=swap'

// "Զնգ-զնգ ու պար" — a corporate Christmas / New Year party in a retro
// seventies style, after the supplied reference card: a rainbow arch over
// a blush panel, chunky green and red lettering with a dark offset shadow,
// a disco ball swinging on its string, bells ringing down the left, a
// stack of gifts in the corner. Everything is drawn for Siloona as SVG
// (components/Art.jsx). The evening follows below, each part opened by a
// small rainbow.
export default function CeGroovyInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('cgr-fonts', FONTS_HREF)
  return (
    <div className={`cgr${editing ? ' editing' : ''}`}>
      <main className="col">
        <Hero />
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="ce-groovy" />
      </main>
    </div>
  )
}
