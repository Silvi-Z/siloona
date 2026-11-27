import './wd-mono.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { Closing, Countdown, Hero, Instagram, PhotoBand, Places, Playlist, Program, Rsvp, Seating, WishBook } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// Light Noto Serif Armenian weights, Cormorant for figures, and a script
// face for Latin names and the ampersand.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Noto+Serif+Armenian:wght@200;300;400&family=Pinyon+Script&display=swap'

// "Լիանա & Հայկ" — a black & white photo story on ivory paper with torn
// edges: the couple's photographs, fine ink icons, a live countdown.
// On a wide screen the paper column sits over a soft, blurred copy of the
// cover photo.
export default function WdMonoInvitation() {
  const { data, editing } = useInvitationContent()
  useDesignFonts('wmn-fonts', FONTS_HREF)
  return (
    <div className={`wmn${editing ? ' editing' : ''}`}>
      <div className="backdrop" aria-hidden="true" style={{ backgroundImage: `url("${data.photos?.hero || ''}")` }} />
      <main className="sheet">
        <Section id="couple"><Hero /></Section>
        <Countdown />
        <Section id="venue"><Places /></Section>
        <Section id="photoStory"><PhotoBand path="photos.story" seed={21} tall /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="photoTogether"><PhotoBand path="photos.together" seed={31} /></Section>
        <Section id="instagram"><Instagram /></Section>
        <Section id="playlist"><Playlist /></Section>
        {/* only where the couple ordered seating — renders nothing otherwise */}
        <Seating />
        <Section id="rsvp"><Rsvp /></Section>
        {/* only where the couple ordered the wishes book */}
        <WishBook />
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="wd-mono" />
      </main>
    </div>
  )
}
