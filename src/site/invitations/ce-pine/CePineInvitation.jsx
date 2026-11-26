import './ce-pine.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, Countdown, DressCode, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// Cormorant Garamond (Latin and Cyrillic) for the capitals and the text,
// Marck Script (Latin and Cyrillic) for the handwritten lines, Noto Serif
// Armenian wherever the text is Armenian.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Marck+Script&family=Noto+Serif+Armenian:wght@300;400;500&display=swap'

// Snow: scattered specks in a 420 × 420 tile, the same on every visit.
const SNOW = (() => {
  let s = 20261225
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
  let dots = ''
  for (let i = 0; i < 70; i++) {
    const big = r() < 0.18
    dots += `<circle cx="${(r() * 420).toFixed(1)}" cy="${(r() * 420).toFixed(1)}" r="${(big ? 1.6 + r() * 1.2 : 0.6 + r() * 0.8).toFixed(2)}" fill-opacity="${(0.35 + r() * 0.55).toFixed(2)}"/>`
  }
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420' fill='#f3f1ea'>${dots}</svg>`)}")`
})()

// "Ամանորյա երեկույթ" — a holiday party at home, after the supplied
// reference card: watercolour pine sweeping across the top and down the
// right side of a deep green card, gold-glitter capitals, a handwritten
// line and a little snow. The rest of the evening (countdown, programme,
// the address, dress code and the reply) follows on the same green, each
// part opened by a pine sprig. The pine is drawn for Siloona (see
// assets/CREDITS.md). No intro screen.
export default function CePineInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('cep-fonts', FONTS_HREF)
  return (
    <div className={`cep${editing ? ' editing' : ''}`} style={{ '--snow': SNOW }}>
      <main className="col">
        <Hero />
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="ce-pine" />
      </main>
    </div>
  )
}
