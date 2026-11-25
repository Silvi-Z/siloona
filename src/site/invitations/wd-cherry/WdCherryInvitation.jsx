import './wd-cherry.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { CalendarCard, Closing, DressCode, Hero, Plan, Rsvp, Venue, Welcome, Wishes } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// No handwriting font draws Armenian, so Armenian text uses Noto Serif
// Armenian italic for the hand-written feel; numbers (times, the date,
// the calendar) are in Caveat, a real handwriting.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&family=Noto+Serif+Armenian:wght@300;400;500;600&display=swap'

// "Անի & Դավիթ" — a playful cherry-and-cream love note.
// On a wide screen the paper column sits on a deep cherry background.
export default function WdCherryInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('wch-fonts', FONTS_HREF)
  return (
    <div className={`wch${editing ? ' editing' : ''}`}>
      <main className="sheet">
        <Section id="couple"><Hero /></Section>
        <Welcome />
        <Section id="calendar"><CalendarCard /></Section>
        <Section id="schedule"><Plan /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="wishes"><Wishes /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="wd-cherry" />
      </main>
    </div>
  )
}
