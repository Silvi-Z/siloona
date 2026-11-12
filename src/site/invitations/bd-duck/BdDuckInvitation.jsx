import { useEffect, useRef, useState } from 'react'
import './bd-duck.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { DEFS } from './lib/art'
import { honk } from './lib/puff'
import { useParallax } from './lib/useParallax'
import Gate from './components/Gate'
import Hero from './components/Hero'
import MessageSection from './components/MessageSection'
import DateSection from './components/DateSection'
import VenueSection from './components/VenueSection'
import RsvpForm from './components/RsvpForm'
import Closing from './components/Closing'

// The source's thin display weights (Noto Serif Armenian 200/300, Noto
// Sans Armenian 300, Cormorant 300/400 for numerals) aren't in the
// site-wide font link, so this design adds them only while it's mounted.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500&family=Noto+Sans+Armenian:wght@300;400;500&family=Noto+Serif+Armenian:wght@200;300;400&display=swap'

function BdDuckBody({ editing }) {
  const rootRef = useRef(null)
  const [go, setGo] = useState(editing)

  useDesignFonts('bdd-fonts', FONTS_HREF)
  useParallax(rootRef)

  // Locks page scroll while the gate is up (source's `html.intro`).
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

  // Tap any goose or gosling: a happy hop and a little burst of feathers.
  function onClick(e) {
    const g = e.target.closest?.('.sheet .gs')
    if (g && go) honk(rootRef.current, g)
  }

  return (
    <div className={`bdd${go ? ' go' : ''}`} ref={rootRef} onClick={onClick}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs dangerouslySetInnerHTML={{ __html: DEFS }} />
      </svg>
      <Gate editing={editing} onBegin={begin} rootRef={rootRef} />
      <main className="sheet">
        <Hero />
        <MessageSection />
        <DateSection />
        <VenueSection />
        <Section id="rsvp"><RsvpForm rootRef={rootRef} /></Section>
        <Section id="closing"><Closing /></Section>
      </main>
    </div>
  )
}

// "Լիլիթի 5 տարեկանը" — a watercolour geese storybook birthday invitation,
// ported from the supplied HTML demo.
export default function BdDuckInvitation() {
  const { editing: isEditing, skipIntro } = useInvitationContent()
  const editing = isEditing || skipIntro

  // Leaving edit mode remounts the invitation so the gate, the letter-by-
  // letter name and the reveals replay cleanly — same as bd-animals.
  const [viewKey, setViewKey] = useState(0)
  const wasEditing = useRef(isEditing)
  useEffect(() => {
    if (wasEditing.current && !isEditing) setViewKey((k) => k + 1)
    wasEditing.current = isEditing
  }, [isEditing])

  return <BdDuckBody key={viewKey} editing={editing} />
}
