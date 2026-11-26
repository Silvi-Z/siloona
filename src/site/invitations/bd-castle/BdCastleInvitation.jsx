import { useEffect, useRef, useState } from 'react'
import './bd-castle.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import Gate from './components/Gate'
import { Closing, Countdown, DressCode, Hero, Program, Rsvp, Venue, Welcome } from './components/Sections'
import SiloonaCredit from '../shared/SiloonaCredit'

// Fonts: Noto Serif/Sans Armenian and Cormorant Garamond (the age numeral)
// at the weights used here are already in the site-wide font link.

function BdCastleBody({ editing, isEditing }) {
  const rootRef = useRef(null)
  const [go, setGo] = useState(editing)

  // Locks page scroll while the sealed letter is up.
  useEffect(() => {
    if (go) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = prev }
  }, [go])

  function begin() {
    setGo(true)
    window.scrollTo(0, 0)
  }

  return (
    <div className={`bdc${go ? ' go' : ''}${isEditing ? ' editing' : ''}`} ref={rootRef}>
      <Gate editing={editing} onBegin={begin} rootRef={rootRef} />
      <main className="sheet">
        <Hero />
        <Welcome />
        <Section id="countdown"><Countdown /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Closing /></Section>
        <SiloonaCredit design="bd-castle" />
      </main>
    </div>
  )
}

// "Էլենի 4 տարեկանը" — a royal fairy-tale birthday invitation around the
// supplied artwork: a pink watercolour castle with storybook princesses and
// princes. Opens with a wax-sealed letter; the characters appear in gold
// portrait frames through the page.
export default function BdCastleInvitation() {
  const { editing: isEditing, skipIntro } = useInvitationContent()
  const editing = isEditing || skipIntro

  // Leaving edit mode remounts the invitation so the letter and the
  // reveals replay cleanly.
  const [viewKey, setViewKey] = useState(0)
  const wasEditing = useRef(isEditing)
  useEffect(() => {
    if (wasEditing.current && !isEditing) setViewKey((k) => k + 1)
    wasEditing.current = isEditing
  }, [isEditing])

  return <BdCastleBody key={viewKey} editing={editing} isEditing={isEditing} />
}
