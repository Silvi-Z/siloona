import { useRef } from 'react'
import './gp-balloons.css'
import Section from '../shared/Section'
import { confetti } from './lib/confetti'
import Hero from './components/Hero'
import InviteSection from './components/InviteSection'
import Program from './components/Program'
import Place from './components/Place'
import DressCode from './components/DressCode'
import RsvpForm from './components/RsvpForm'
import Closing from './components/Closing'

// Balloon / bootee artwork, defined once and reused via <use>.
function ArtDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <radialGradient id="gpb-gB" cx="35%" cy="28%" r="80%"><stop offset="0" stopColor="#e6f3fc" /><stop offset=".45" stopColor="#a9d3ee" /><stop offset="1" stopColor="#5fa6d4" /></radialGradient>
        <radialGradient id="gpb-gP" cx="35%" cy="28%" r="80%"><stop offset="0" stopColor="#fdeaf0" /><stop offset=".45" stopColor="#f4aabf" /><stop offset="1" stopColor="#d9708e" /></radialGradient>
        <g id="gpb-balloon">
          <path d="M50 0C22 0 4 24 4 52c0 30 22 56 46 62 24-6 46-32 46-62C96 24 78 0 50 0z" />
          <path d="M44 112l6 9 6-9z" />
        </g>
        <g id="gpb-shoe" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 56c0-18 10-30 22-34l20 14c8 6 20 6 34 10 6 2 8 8 4 12H12c-3 0-4-2-4-4z" />
          <path d="M12 62h76" />
          <path d="M30 22l-4-10M24 34l12 6" />
        </g>
      </defs>
    </svg>
  )
}

// "Տղա՞, թե՞ Աղջիկ" — gender party invitation with balloons, ported from
// the supplied HTML demo. No intro gate: the hero is the opening screen.
export default function GpBalloonsInvitation() {
  const fxRef = useRef(null)

  function openInvite(e) {
    e.preventDefault()
    document.getElementById('gpb-invite')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="gpb">
      <ArtDefs />
      <main>
        <Hero onOpen={openInvite} />
        <InviteSection />
        <Section id="schedule"><Program /></Section>
        <Section id="details"><Place /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Section id="rsvp"><RsvpForm onConfirmed={() => confetti(fxRef.current)} /></Section>
        <Section id="closing"><Closing /></Section>
      </main>
      <canvas className="fx" ref={fxRef} aria-hidden="true" />
    </div>
  )
}
