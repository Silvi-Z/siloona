import './ce-ornament.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, DateCard, DressCode, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'

// Great Vibes writes Latin names in script; Armenian names fall back to
// Noto Serif Armenian italic (no script font covers Armenian). Light
// Cormorant for the numerals.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=Noto+Serif+Armenian:wght@300;400;500&display=swap'

// "Ամանորյա երեկո" — a corporate Christmas / New Year invitation after the
// supplied photo of a printed set: a red watercolour ornament with the
// guest's own name on it, hung on a cream satin bow, white ornament cards
// fanned behind. The pages are white cards hanging on the same warm wall.
// No intro screen.
export default function CeOrnamentInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('ceo-fonts', FONTS_HREF)
  return (
    <div className={`ceo${editing ? ' editing' : ''}`}>
      <main className="sheet">
        <Hero />
        <Welcome />
        <Section id="countdown"><DateCard /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
      </main>
    </div>
  )
}
