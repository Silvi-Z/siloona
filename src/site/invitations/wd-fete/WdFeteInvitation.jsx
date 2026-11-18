import './wd-fete.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, Countdown, Details, DressCode, Hero, Plan, Rsvp, Venue, Welcome } from './components/Sections'

// Thin Noto Serif Armenian for the big names and text, light Cormorant
// for the raspberry date and the numbers.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Noto+Serif+Armenian:wght@200;300;400;500&display=swap'

// "Նարինե & Գոռ" — a garden-party wedding sketched in coloured pens.
// On a wide screen the paper column sits on a deep evergreen background.
export default function WdFeteInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('wft-fonts', FONTS_HREF)
  return (
    <div className={`wft${editing ? ' editing' : ''}`}>
      <main className="sheet">
        <Section id="couple"><Hero /></Section>
        <Welcome />
        <Section id="venue"><Venue /></Section>
        <Section id="schedule"><Plan /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="details"><Details /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="countdown"><Countdown /></Section>
        <Section id="closing"><Closing /></Section>
      </main>
    </div>
  )
}
