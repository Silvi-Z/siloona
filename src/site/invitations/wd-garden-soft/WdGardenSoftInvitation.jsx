import { useEffect, useMemo, useRef, useState } from 'react'
import './wd-garden-soft.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { DEFS, HEART_MASK, petals } from './lib/art'
import { createMusic } from './lib/music'
import Gate from './components/Gate'
import Hero from './components/Hero'
import { Contacts, Details, DressCode, Rsvp, Timeline, Venue } from './components/Sections'
import { Art } from './components/parts'

// Noto Serif Armenian 300 and Cormorant 300 (+ italic for the ampersands)
// aren't in the site-wide font link.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Noto+Serif+Armenian:wght@300;400;500;600&display=swap'

// Section parallax (--sy per visible [data-par] section) and pointer drift
// (--mx on the root) for the floating flowers — the source's scroll script,
// scoped to this invitation's root.
function useParallax(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const sections = [...root.querySelectorAll('[data-par]')]
    const vis = new Set()
    let raf = 0
    let io
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((x) => (x.isIntersecting ? vis.add(x.target) : vis.delete(x.target)))
      }, { rootMargin: '20% 0px' })
      sections.forEach((el) => io.observe(el))
    } else sections.forEach((el) => vis.add(el))
    const frame = () => {
      raf = 0
      vis.forEach((el) => el.style.setProperty('--sy', (el.getBoundingClientRect().top / window.innerHeight).toFixed(3)))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(frame) }
    const onMove = (e) => root.style.setProperty('--mx', (e.clientX / window.innerWidth * 2 - 1).toFixed(3))
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onMove)
    frame()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
      io?.disconnect()
    }
  }, [rootRef])
}

function MusicButton({ on, onToggle }) {
  return (
    <button className={`mus${on ? ' on' : ''}`} type="button" aria-label="Երաժշտություն" aria-pressed={on} onClick={onToggle}>
      <svg className="off" viewBox="0 0 24 24"><path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" /><path d="M3 3l18 18" /></svg>
      <svg className="onl" viewBox="0 0 24 24"><path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" /></svg>
    </button>
  )
}

function WdGardenSoftBody({ editing }) {
  const rootRef = useRef(null)
  const [go, setGo] = useState(editing)
  const [musicOn, setMusicOn] = useState(false)
  const music = useMemo(createMusic, [])
  const petalField = useMemo(petals, [])

  useDesignFonts('wgs-fonts', FONTS_HREF)
  useParallax(rootRef)

  // Music never outlives the page.
  useEffect(() => () => music.stop(), [music])

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

  return (
    <div className={`wgs${go ? ' go' : ''}`} ref={rootRef} style={{ '--hm': HEART_MASK }}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs dangerouslySetInnerHTML={{ __html: DEFS }} />
      </svg>
      <Art className="pts" aria-hidden="true" svg={petalField} />
      <Gate editing={editing} onBegin={begin} onOpen={() => setMusicOn(music.toggle())} />
      <MusicButton on={musicOn} onToggle={() => setMusicOn(music.toggle())} />
      <main>
        <Hero />
        <Section id="venue"><Venue /></Section>
        <Section id="schedule"><Timeline /></Section>
        <Section id="dressCode"><DressCode /></Section>
        <Details />
        <Section id="rsvp"><Rsvp /></Section>
        <Contacts />
      </main>
    </div>
  )
}

// "Աննա & Միքայել" — lavender-striped painted garden wedding invitation,
// ported from the supplied HTML demo.
export default function WdGardenSoftInvitation() {
  const { editing: isEditing, skipIntro } = useInvitationContent()
  const editing = isEditing || skipIntro

  // Leaving edit mode remounts the invitation so the gate, the name letters
  // and the reveals replay cleanly — same as the other designs.
  const [viewKey, setViewKey] = useState(0)
  const wasEditing = useRef(isEditing)
  useEffect(() => {
    if (wasEditing.current && !isEditing) setViewKey((k) => k + 1)
    wasEditing.current = isEditing
  }, [isEditing])

  return <WdGardenSoftBody key={viewKey} editing={editing} />
}
