import { useEffect, useRef, useState } from 'react'
import './wd-garden.css'
import Section from '../shared/Section'
import { useInvitationContent } from '../shared/EditableContext'
import { useDesignFonts } from '../shared/useDesignFonts'
import { SYMBOLS, butterfly } from './lib/art'
import { Footer, Gate, Hero } from './components/Opening'
import { DateSection, Program, Rsvp, Story, Venue } from './components/Sections'

// Playfair Display, Montserrat and the 300 Armenian weights aren't in the
// site-wide font link.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Montserrat:wght@300;400&family=Noto+Serif+Armenian:wght@300;400&family=Noto+Sans+Armenian:wght@300;400&display=swap'

const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Scroll parallax for the [data-m] scene layers, relative to the centre of
// their own hero / footer (source's rAF paint).
function useParallax(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const layers = [...root.querySelectorAll('[data-m]')]
    let raf = 0
    const paint = () => {
      raf = 0
      layers.forEach((l) => {
        const box = l.closest('.hero,.foot').getBoundingClientRect()
        const c = box.top + box.height / 2 - window.innerHeight / 2
        l.style.transform = `translate3d(0,${c * +l.dataset.m * -0.012}px,0)`
      })
    }
    paint()
    if (calm()) return
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [rootRef])
}

function WdGardenBody({ editing }) {
  const rootRef = useRef(null)
  const [opened, setOpened] = useState(editing)
  const [bloom, setBloom] = useState(editing)

  useDesignFonts('wgd-fonts', FONTS_HREF)
  useParallax(rootRef)

  // The gate opens on tap or by itself after 4.6s; the hero's branches
  // bloom .5s later. Page scroll is locked until then (source's body.locked).
  useEffect(() => {
    if (opened) {
      const t = setTimeout(() => setBloom(true), 500)
      return () => clearTimeout(t)
    }
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const t = setTimeout(() => setOpened(true), calm() ? 100 : 4600)
    return () => { clearTimeout(t); document.documentElement.style.overflow = prev }
  }, [opened])

  return (
    <div className="wgd" ref={rootRef}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: SYMBOLS }} />
      <div className="bg" aria-hidden="true" />
      <svg className="bf" style={{ '--t': '28s', '--dl': '-4s' }} viewBox="0 0 40 30" aria-hidden="true" dangerouslySetInnerHTML={{ __html: butterfly('#c9a35e', '#a98245') }} />
      <svg className="bf" style={{ '--t': '36s', '--dl': '-16s', width: 24 }} viewBox="0 0 40 30" aria-hidden="true" dangerouslySetInnerHTML={{ __html: butterfly('#e5d3a3', '#c8b07a') }} />
      {!editing && <Gate opened={opened} onOpen={() => setOpened(true)} />}
      <main className="ribbon">
        <Hero bloom={bloom} />
        <Section id="story"><Story /></Section>
        <Section id="date"><DateSection /></Section>
        <Section id="venue"><Venue /></Section>
        <Section id="schedule"><Program /></Section>
        <Section id="rsvp"><Rsvp /></Section>
        <Section id="closing"><Footer /></Section>
      </main>
    </div>
  )
}

// "Նարե և Արամ" — blossom branches over a golden-hour garden, ported from
// the supplied HTML demo (wd_garden.html).
export default function WdGardenInvitation() {
  const { editing: isEditing, skipIntro } = useInvitationContent()
  const editing = isEditing || skipIntro

  // Leaving edit mode remounts the invitation so the gate and the reveals
  // replay cleanly — same as the other designs.
  const [viewKey, setViewKey] = useState(0)
  const wasEditing = useRef(isEditing)
  useEffect(() => {
    if (wasEditing.current && !isEditing) setViewKey((k) => k + 1)
    wasEditing.current = isEditing
  }, [isEditing])

  return <WdGardenBody key={viewKey} editing={editing} />
}
