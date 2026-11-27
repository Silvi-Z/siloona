import { useCallback, useState } from 'react'
import './wd-noir.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import SiloonaCredit from '../shared/SiloonaCredit'
import { Closing, Countdown, DateCard, Details, DressCode, Gallery, Gate, Hero, Program, Rsvp, Seating, Story, Venue, Welcome, WishBook } from './components/Sections'

// Cormorant Garamond for Latin, numerals and the ampersand; Noto Serif
// Armenian (light weights) for every Armenian letter.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Noto+Serif+Armenian:wght@200;300;400;500&display=swap'

// "Ալեն & Միլենա" — Noir. The most complete Siloona wedding invitation:
// a sealed black card with the couple's monogram opens onto a cinematic
// cover photo; then the greeting, a live countdown, their story in three
// chapters, a gallery, the month calendar, every place of the day (the
// houses, the ceremony, the reception with its map), the seating finder
// where ordered, the programme, the dress code, the details, the reply
// and a closing photograph. Black and ivory parts alternate; champagne
// gold is the only accent. The demo photos are from Unsplash
// (assets/CREDITS.md) and are replaced by the couple's own.
export default function WdNoirInvitation() {
  const { editing } = useInvitationContent()
  useDesignFonts('wnr-fonts', FONTS_HREF)
  // `opened`: the cover's entrance plays once the seal is broken (or at
  // once, when there is no opening to play).
  const [opened, setOpened] = useState(false)
  const onOpen = useCallback(() => setOpened(true), [])
  return (
    <div className={`wnr${editing ? ' editing' : ''}${opened ? ' opened' : ''}`}>
      <Section id="intro"><Gate onOpen={onOpen} /></Section>
      <main className="col">
        <Section id="couple"><Hero /></Section>
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="story"><Story /></Section>
        <Section id="gallery"><Gallery /></Section>
        <Section id="date"><DateCard /></Section>
        <Section id="venue"><Venue /></Section>
        {/* only where the couple ordered seating — renders nothing otherwise */}
        <Seating />
        <Section id="schedule"><Program /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="details"><Details /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        {/* only where the couple ordered the wishes book */}
        <WishBook />
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="wd-noir" className="wnr-credit" />
      </main>
    </div>
  )
}
