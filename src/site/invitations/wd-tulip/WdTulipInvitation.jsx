import './wd-tulip.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, DateCard, DressCode, Hero, Program, Rsvp, Venue, Welcome } from './components/Cards'

// Light weights of Cormorant and Noto Serif Armenian aren't in the
// site-wide font link.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Noto+Serif+Armenian:wght@200;300;400&display=swap'

// "Դավիթ & Մարիամ" — a burgundy tulip on linen: stacked linen cards, the
// same painted tulip in a new pose on each, gold-foil letter-spaced caps.
// No intro screen — the first card is the cover.
export default function WdTulipInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('wtl-fonts', FONTS_HREF)
  return (
    <div className={`wtl${editing ? ' editing' : ''}`}>
      <main className="stack">
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
