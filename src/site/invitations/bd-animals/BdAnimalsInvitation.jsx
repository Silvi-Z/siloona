import { useEffect, useRef, useState } from 'react'
import './bd-animals.css'
import { useInvitationContent } from '../shared/EditableContext'
import { useSceneMotion } from './lib/useSceneMotion'
import Gate from './components/Gate'
import Hero from './components/Hero'
import DetailsSection from './components/DetailsSection'
import RsvpForm from './components/RsvpForm'
import Section from '../shared/Section'

// The shared decorative vine, referenced via <use> from Hero and
// DetailsSection — defined once here rather than duplicated per section.
function SprigDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <g id="bda-sprig">
          <path d="M40 218C38 160 46 90 38 8" fill="none" stroke="#7fa595" strokeWidth="2.2" strokeLinecap="round" />
          <g fill="#97bcad">
            <ellipse cx="52" cy="40" rx="15" ry="6" transform="rotate(-35 52 40)" />
            <ellipse cx="26" cy="64" rx="15" ry="6" transform="rotate(32 26 64)" />
            <ellipse cx="55" cy="92" rx="16" ry="6.5" transform="rotate(-32 55 92)" />
            <ellipse cx="24" cy="120" rx="16" ry="6.5" transform="rotate(30 24 120)" />
            <ellipse cx="56" cy="150" rx="16" ry="6.5" transform="rotate(-30 56 150)" />
            <ellipse cx="25" cy="180" rx="15" ry="6" transform="rotate(28 25 180)" />
            <ellipse cx="40" cy="8" rx="9" ry="5" transform="rotate(-80 40 8)" />
          </g>
        </g>
      </defs>
    </svg>
  )
}

function BdAnimalsBody({ editing }) {
  const rootRef = useRef(null)
  const buntingRef = useRef(null)
  const [go, setGo] = useState(editing)

  useSceneMotion(rootRef, buntingRef)

  // Locks page scroll while the curtains are up, same as the source
  // demo's `html.intro{overflow:hidden}` — applied imperatively so it
  // only ever touches the real document while this page is mounted.
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
    <div className={`bda${go ? ' go' : ''}`} ref={rootRef}>
      <SprigDefs />
      <Gate editing={editing} onBegin={begin} rootRef={rootRef} />
      <main>
        <Hero buntingRef={buntingRef} rootRef={rootRef} />
        <Section id="details"><DetailsSection /></Section>
        <RsvpForm rootRef={rootRef} />
      </main>
    </div>
  )
}

export default function BdAnimalsInvitation() {
  const { editing: isEditing, skipIntro } = useInvitationContent()
  // Curtain skipped while editing and when the host opens straight to content.
  const editing = isEditing || skipIntro

  // Leaving edit mode remounts the whole invitation (fresh `key`) instead
  // of just flipping state, so the curtain intro and every reveal
  // animation reset cleanly — same reasoning as WdBeigeInvitation.jsx.
  const [viewKey, setViewKey] = useState(0)
  const wasEditing = useRef(isEditing)
  useEffect(() => {
    if (wasEditing.current && !isEditing) setViewKey((k) => k + 1)
    wasEditing.current = isEditing
  }, [isEditing])

  return <BdAnimalsBody key={viewKey} editing={editing} />
}
