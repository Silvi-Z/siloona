import { useEffect, useRef, useState } from 'react'
import './wd-beige.css'
import { useInvitationContent } from '../shared/EditableContext'
import { useInvitationMotion } from './lib/useInvitationMotion'
import LaceDefs from './components/LaceDefs'
import Background from './components/Background'
import Gate from './components/Gate'
import Hero from './components/Hero'
import CountdownBand from './components/CountdownBand'
import ScheduleSection from './components/ScheduleSection'
import RsvpForm from './components/RsvpForm'
import DetailsSection from './components/DetailsSection'
import StorySection from './components/StorySection'
import PlacesSection from './components/PlacesSection'
import Section from '../shared/Section'

function WdBeigeBody({ content, editing }) {
  const rootRef = useRef(null)
  const [go, setGo] = useState(editing)

  useInvitationMotion(rootRef)

  // Locks page scroll while the envelope gate is up, same as the demo's
  // `html.intro{overflow:hidden}` — applied imperatively so it only ever
  // touches the real document while this page is mounted.
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
    <div className={`wdb${go ? ' go' : ''}`} ref={rootRef}>
      <Background />
      <LaceDefs />
      <Gate data={content} editing={editing} onBegin={begin} rootRef={rootRef} />

      <main className="sheet">
        <Hero data={content} />
        <StorySection data={content} />
        <PlacesSection data={content} />
        <Section id="countdown"><CountdownBand data={content} /></Section>
        <ScheduleSection data={content} />
        <Section id="rsvp"><RsvpForm data={content} /></Section>
        <DetailsSection data={content} />
      </main>
    </div>
  )
}

export default function WdBeigeInvitation() {
  const { data: content, editing: isEditing, skipIntro } = useInvitationContent()
  // The envelope is skipped while editing and when the host asks to open
  // straight to the content (e.g. the dashboard preview after a change).
  const editing = isEditing || skipIntro

  // Leaving edit mode remounts the whole invitation (fresh `key`) instead
  // of just flipping state, so the envelope gate and every reveal
  // animation reset cleanly — the editor can replay the exact experience
  // a guest would see, with their edits in place.
  const [viewKey, setViewKey] = useState(0)
  const wasEditing = useRef(isEditing)
  useEffect(() => {
    if (wasEditing.current && !isEditing) setViewKey((k) => k + 1)
    wasEditing.current = isEditing
  }, [isEditing])

  return <WdBeigeBody key={viewKey} content={content} editing={editing} />
}
