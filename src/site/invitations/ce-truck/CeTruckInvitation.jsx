import './ce-truck.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, Countdown, DressCode, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// Playfair Display for the red title, Lora for the spaced details and the
// text, Caveat for the handwritten lines (all three have Cyrillic); Noto
// Serif Armenian wherever the text is Armenian.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Lora:ital,wght@0,400;0,500;1,400&family=Caveat:wght@500;600&family=Noto+Serif+Armenian:wght@300;400;500&display=swap'

// "Փոքրիկ ամանորյա երեկույթ" — a holiday party at home, after the
// supplied reference card: a watercolour red pickup bringing home three
// decorated trees, «join us» written in red above it, a red serif title
// and the details in spaced black capitals and italics on soft paper. The
// evening follows below, each part opened by a small red star; the truck
// drives off at the end. The art is drawn for Siloona (see
// assets/CREDITS.md). No intro screen.
export default function CeTruckInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('cet-fonts', FONTS_HREF)
  return (
    <div className={`cet${editing ? ' editing' : ''}`}>
      <main className="col">
        <Hero />
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="ce-truck" />
      </main>
    </div>
  )
}
