import { forwardRef, useEffect, useRef } from 'react'
import Editable from '../../shared/Editable'

// Scroll-reveal wrapper: adds `.in` once the element scrolls into view
// (source's IntersectionObserver: threshold .18, bottom margin -6%). Each
// element observes itself on mount, so parts shown again later from the
// editor reveal too. Keep the reveal class off <Editable>.
export const Rv = forwardRef(function Rv({ as: Tag = 'div', className = 'rv', children, ...rest }, fwd) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('in'); io.disconnect() }
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const setRef = (el) => { ref.current = el; if (typeof fwd === 'function') fwd(el); else if (fwd) fwd.current = el }
  return <Tag ref={setRef} className={className} {...rest}>{children}</Tag>
})

// Static artwork markup (lib/art.js — never user content).
export function Art({ svg, as: Tag = 'svg', ...rest }) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: svg }} />
}

// A heading that slides up out of a mask.
export function MaskHeading({ path, children }) {
  return <Rv as="h2" className="h mask"><span>{children ?? <Editable path={path} />}</span></Rv>
}

// The drawn flourish under headings.
export function Flourish() {
  return <Rv as="svg" className="orn draw" viewBox="0 0 260 30" aria-hidden="true" dangerouslySetInnerHTML={{ __html: '<use href="#wgr-flourish"/>' }} />
}
