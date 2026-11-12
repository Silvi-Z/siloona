import { forwardRef, useEffect, useMemo, useRef } from 'react'
import Editable from '../../shared/Editable'
import { useInvitationContent } from '../../shared/EditableContext'
import { getByPath } from '../../shared/pathUtils'
import { FRAME, ragged } from '../lib/art'

// Scroll-reveal wrapper (`.rv`, split headings, figures, week strip → `.on`,
// as in the source). Each element observes itself on mount, so parts shown
// again later from the editor reveal too. Keep the class off <Editable>.
export const Rv = forwardRef(function Rv({ as: Tag = 'div', className = 'rv', children, ...rest }, fwd) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { el.classList.add('on'); return }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('on'); io.disconnect() }
    }, { threshold: 0.18 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const setRef = (el) => { ref.current = el; if (typeof fwd === 'function') fwd(el); else if (fwd) fwd.current = el }
  return <Tag ref={setRef} className={className} {...rest}>{children}</Tag>
})

// Static generated artwork (lib/art.js — never user content).
export const Art = forwardRef(function Art({ svg, as: Tag = 'div', ...rest }, ref) {
  return <Tag ref={ref} {...rest} dangerouslySetInnerHTML={{ __html: svg }} />
})

function words(text) {
  return String(text || '').split(/\s+/).filter(Boolean).map((w, i) => (
    <span key={i}><span className="w"><i style={{ '--k': i }}>{w}</i></span>{' '}</span>
  ))
}

// A heading whose words rise in one by one (source's [data-split]). With a
// `path` it's editable, and a plain editable heading in edit mode.
export function SplitHeading({ path, text, className = '', style }) {
  const { data, editing } = useInvitationContent()
  const content = path
    ? (editing ? <Editable path={path} /> : words(getByPath(data, path)))
    : words(text)
  return <Rv as="h2" className={`split ${className}`.trim()} style={style}>{content}</Rv>
}

// The arch frame drawn behind a card's content.
export function Frame() {
  return <svg className="fr" viewBox="0 0 300 480" aria-hidden="true" dangerouslySetInnerHTML={{ __html: FRAME }} />
}

// A floating flower cluster ("A" peonies & irises, "B" hydrangeas & bow).
// `still` clusters are shown at once (no bloom), as in the source.
const STILL = { opacity: 1, transform: 'none', animation: 'none' }
export function Cluster({ k, className = '', style, delay = '2s', origin, r0, still }) {
  const svgStyle = { '--d': delay, ...(origin && { '--o': origin }), ...(r0 && { '--r0': r0 }), ...(still && STILL) }
  return (
    <div className={`par ${className}`.trim()} style={style} aria-hidden="true">
      <svg className="cl" viewBox="0 0 300 440" style={svgStyle} dangerouslySetInnerHTML={{ __html: `<use href="#wgs-cl${k}"/>` }} />
    </div>
  )
}

// Torn-paper clip-path, generated once per mount (random, as in the source).
export function useRagged(n, a, top) {
  return useMemo(() => ragged(n, a, top), [n, a, top])
}
