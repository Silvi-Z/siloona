import { useEffect } from 'react'

// Ports the original demo's single page-level IIFE: scroll-reveal for
// `.rv` / `[data-split]` / `.lc` elements, a subtle parallax drift on the
// lace-framed photos (`.ph`), and the timeline's fill-line + dot/label
// reveal as the user scrolls past it. Scoped to the invitation's own
// container (not `document`) so it never touches anything outside it.
export function useInvitationMotion(containerRef) {
  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const reveal = root.querySelectorAll('.rv,[data-split],.lc')
    const photos = Array.from(root.querySelectorAll('.ph'))
    const tl = root.querySelector('.tl')
    const visible = new Set()
    let raf = 0

    let dots = []
    let spans = []
    function measureTimeline() {
      if (!tl) return
      let m = 0
      tl.querySelectorAll('time').forEach((t) => { m = Math.max(m, t.offsetWidth) })
      tl.style.setProperty('--tw', m + 'px')
      dots = Array.from(tl.querySelectorAll('i'))
      spans = Array.from(tl.querySelectorAll('span'))
    }
    measureTimeline()
    window.addEventListener('resize', measureTimeline)

    let revealObserver
    let photoObserver
    if ('IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('on')
            revealObserver.unobserve(entry.target)
          }
        })
      }, { threshold: 0.18 })
      reveal.forEach((el) => revealObserver.observe(el))

      photoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target)
          else visible.delete(entry.target)
        })
      }, { rootMargin: '30% 0px' })
      photos.forEach((el) => photoObserver.observe(el))
    } else {
      reveal.forEach((el) => el.classList.add('on'))
    }

    function frame() {
      raf = 0
      visible.forEach((el) => {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--o', ((r.top + r.height / 2 - window.innerHeight / 2) * -0.07).toFixed(1) + 'px')
      })
      if (tl) {
        const r = tl.getBoundingClientRect()
        const p = Math.min(1, Math.max(0, (window.innerHeight * 0.7 - r.top) / r.height))
        tl.style.setProperty('--p', p.toFixed(3))
        dots.forEach((d, i) => {
          const on = p >= i / dots.length + 0.04
          d.classList.toggle('on', on)
          if (spans[i]) spans[i].classList.toggle('on', on)
        })
      }
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', frame)
    frame()

    return () => {
      window.removeEventListener('resize', measureTimeline)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', frame)
      if (raf) cancelAnimationFrame(raf)
      if (revealObserver) revealObserver.disconnect()
      if (photoObserver) photoObserver.disconnect()
    }
  }, [containerRef])
}
