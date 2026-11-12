import './gp-stork.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, Countdown, DressCode, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'

// Light weights of Cormorant (numerals, question marks) and Noto Serif
// Armenian aren't all in the site-wide font link.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Noto+Serif+Armenian:wght@200;300;400&display=swap'

// "Տղա՞, թե՞ աղջի՞կ" — a painted stork carrying a baby in a bundle (the
// supplied artwork, shown whole on its own white). Airy painterly pages
// with blue-to-pink brush strokes; the RSVP asks for the guest's boy/girl
// guess. No intro screen.
export default function GpStorkInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('gps-fonts', FONTS_HREF)
  return (
    <div className={`gps${editing ? ' editing' : ''}`}>
      <main className="sheet">
        <Hero />
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="details"><Venue /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
      </main>
    </div>
  )
}
