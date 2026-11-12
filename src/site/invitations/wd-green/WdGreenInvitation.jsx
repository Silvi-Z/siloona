import { useEffect, useRef, useState } from 'react'
import './wd-green.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { SYMBOLS } from './lib/art'
import { Curtain, Hero } from './components/Opening'
import { CalendarCountdown, Details, DressCode, Program, Sign, Venue, Welcome } from './components/Sections'

// Cormorant 300 and Noto Serif Armenian 200/300 aren't in the site-wide
// font link.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Noto+Serif+Armenian:wght@200;300;400&display=swap'

const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Scroll parallax + gentle mouse drift for the [data-m] art layers.
function useParallax(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || calm()) return
    const layers = [...root.querySelectorAll('[data-m]')]
    let y = window.scrollY, px = 0, py = 0, raf = 0
    const paint = () => {
      raf = 0
      layers.forEach((l) => {
        const k = +l.dataset.m
        l.style.transform = `translate3d(${px * k}px,${y * k * 0.02 + py * k}px,0) scale(1.06)`
      })
    }
    const ask = () => { if (!raf) raf = requestAnimationFrame(paint) }
    const onScroll = () => { y = window.scrollY; ask() }
    const onMove = (e) => { if (e.pointerType === 'mouse') { px = e.clientX / window.innerWidth - 0.5; py = e.clientY / window.innerHeight - 0.5; ask() } }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [rootRef])
}

function WdGreenBody({ editing }) {
  const rootRef = useRef(null)
  const [opened, setOpened] = useState(editing)
  const [heroIn, setHeroIn] = useState(editing)

  useDesignFonts('wgr-fonts', FONTS_HREF)
  useParallax(rootRef)

  // Curtain opens on tap or by itself after 4.4s; the hero text rises in
  // .7s later. Page scroll is locked until then (source's body.locked).
  useEffect(() => {
    if (opened) {
      const t = setTimeout(() => setHeroIn(true), 700)
      return () => clearTimeout(t)
    }
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const t = setTimeout(() => setOpened(true), calm() ? 100 : 4400)
    return () => { clearTimeout(t); document.documentElement.style.overflow = prev }
  }, [opened])

  return (
    <div className={`wgr${opened ? ' opened' : ''}`} ref={rootRef}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: SYMBOLS }} />
      {!editing && <Curtain onOpen={() => setOpened(true)} />}
      <main>
        <Hero shown={heroIn} />
        <div className="sheet">
          <Welcome />
          <CalendarCountdown />
          <Section id="schedule"><Program /></Section>
          <Section id="dressCode"><DressCode /></Section>
          <Details />
          <Section id="venue"><Venue /></Section>
          <Sign />
        </div>
      </main>
    </div>
  )
}

// "Նարե և Արամ" — sage & olive misty-garden wedding invitation, ported
// from the supplied HTML demo.
export default function WdGreenInvitation() {
  const { editing: isEditing, skipIntro } = useInvitationContent()
  const editing = isEditing || skipIntro

  // Leaving edit mode remounts the invitation so the curtain and the
  // reveals replay cleanly — same as the other designs.
  const [viewKey, setViewKey] = useState(0)
  const wasEditing = useRef(isEditing)
  useEffect(() => {
    if (wasEditing.current && !isEditing) setViewKey((k) => k + 1)
    wasEditing.current = isEditing
  }, [isEditing])

  return <WdGreenBody key={viewKey} editing={editing} />
}
