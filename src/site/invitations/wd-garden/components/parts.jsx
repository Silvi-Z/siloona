import { forwardRef, useEffect, useRef } from 'react'
import Editable from '../../shared/Editable'
import { blossoms } from '../lib/art'

// Adds `.in` to the element once it scrolls into view (source's
// IntersectionObserver: threshold .15, bottom margin −5%). Skipped when
// `manual` — the caller then sets `.in` itself.
function useReveal(ref, manual) {
  useEffect(() => {
    const el = ref.current
    if (!el || manual) return
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('in'); io.disconnect() }
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, manual])
}

// Scroll-reveal wrapper. Keep the reveal class off <Editable>.
export const Rv = forwardRef(function Rv({ as: Tag = 'div', className = 'rv', children, ...rest }, fwd) {
  const ref = useRef(null)
  useReveal(ref)
  const setRef = (el) => { ref.current = el; if (typeof fwd === 'function') fwd(el); else if (fwd) fwd.current = el }
  return <Tag ref={setRef} className={className} {...rest}>{children}</Tag>
})

// A blossom branch band. Twigs draw in and flowers bloom on `.in`: by
// scrolling into view, or — with `on` given — when `on` turns true.
export function Band({ seed, bottom, className, on }) {
  const ref = useRef(null)
  const manual = on !== undefined
  useReveal(ref, manual)
  useEffect(() => { if (manual && on) ref.current?.classList.add('in') }, [manual, on])
  return (
    <svg
      ref={ref}
      className={`band ${className}${bottom ? ' flip' : ''}`}
      viewBox="0 0 600 260"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: blossoms(seed, bottom) }}
    />
  )
}

// A heading that slides up out of a mask.
export function MaskHeading({ path }) {
  return <Rv as="h2" className="h mask"><span><Editable path={path} /></span></Rv>
}

export const Heart = ({ className }) => <i className={`heart ${className}`} />
