import './wd-line.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, DateBlock, DressCode, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// Light weights of Cormorant (numerals, ampersand) and Noto Serif
// Armenian aren't all in the site-wide font link.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Noto+Serif+Armenian:wght@200;300;400&display=swap'

// "Էրիկ & Սոնա" — white paper with fine gold line-art ribbons (from
// the supplied artwork). One continuous sheet: the cover reproduces the
// artwork, single ribbons accompany the pages along the edges, and the
// bottom ribbon closes the sheet. No intro screen.
export default function WdLineInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('wln-fonts', FONTS_HREF)
  return (
    <div className={`wln${editing ? ' editing' : ''}`}>
      <main className="sheet">
        <Hero />
        <Welcome />
        <Section id="countdown"><DateBlock /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="wd-line" />
      </main>
    </div>
  )
}
