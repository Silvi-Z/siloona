import './ce-toast.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, Countdown, DressCode, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// Marck Script for the big handwritten lines, Caveat for the smaller ones
// (both have Cyrillic); Noto Serif Armenian italic wherever the text is
// Armenian, which no handwriting font covers.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Marck+Script&family=Caveat:wght@500;600&family=Noto+Serif+Armenian:wght@400;500;600&display=swap'

// "Ձմեռ Պապի կենացը" — a corporate New Year party, after the supplied
// reference card: Santa tumbling into a coupe glass with an olive held
// high, drawn in retro ink with the red slightly out of register, tilted
// handwritten lines in black and red, sparkles, textured paper. Santa
// drops into the glass when the page opens and the drawing keeps moving a
// little (the legs, the olive, the bubbles, the sparkles). The evening
// follows below, each part opened by three sparkles. No intro screen.
export default function CeToastInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('ctt-fonts', FONTS_HREF)
  return (
    <div className={`ctt${editing ? ' editing' : ''}`}>
      <main className="col">
        <Hero />
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="ce-toast" />
      </main>
    </div>
  )
}
