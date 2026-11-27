import './wd-calla.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, DateBlock, DressCode, Hero, Program, Rsvp, Seating, Venue, Welcome, WishBook } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// Light weights of Cormorant (numerals, ampersand) and Noto Serif
// Armenian aren't all in the site-wide font link.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Noto+Serif+Armenian:wght@200;300;400&display=swap'

// "Ռուբեն & Էլեն" — white calla lilies and sage leaves climbing the left
// edge of textured cream paper (the supplied artwork). The cover is the
// artwork; the pages follow a thin sage "stem" line down the left side,
// a small leaf marking each heading; the lowest lilies close the sheet.
// No intro screen.
export default function WdCallaInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('wcl-fonts', FONTS_HREF)
  return (
    <div className={`wcl${editing ? ' editing' : ''}`}>
      <main className="sheet">
        <Hero />
        <div className="stem">
          <Welcome />
          <Section id="countdown"><DateBlock /></Section>
          <Section id="schedule"><Program /></Section>
          <Section id="venue"><Venue /></Section>
          <Section id="dressCode"><DressCode /></Section>
          {/* only where the couple ordered seating — renders nothing otherwise */}
          <Seating />
          <Section id="rsvp"><Rsvp /></Section>
        </div>
        {/* only where the couple ordered the wishes book */}
        <WishBook />
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="wd-calla" />
      </main>
    </div>
  )
}
