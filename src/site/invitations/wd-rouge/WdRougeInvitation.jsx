import './wd-rouge.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { BigDate, Closing, Hero, Photos, Program, Rsvp, Venue, Welcome } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// Hairline Cormorant for «LOVE» and the numerals, thin Noto Serif Armenian
// capitals for headings, and a handwritten script for the Latin ribbon.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Noto+Serif+Armenian:wght@200;300;400&family=Mrs+Saint+Delafield&display=swap'

// "Տիգրան & Անի" — an editorial love letter in wine red on cream.
// On a wide screen the paper column sits on a deep wine background.
export default function WdRougeInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('wrg-fonts', FONTS_HREF)
  return (
    <div className={`wrg${editing ? ' editing' : ''}`}>
      <main className="sheet">
        <Section id="couple"><Hero /></Section>
        <Welcome />
        <Section id="date"><BigDate /></Section>
        <Section id="photos"><Photos /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="wd-rouge" />
      </main>
    </div>
  )
}
