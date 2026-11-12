import { useEffect } from 'react'

// Ports the source's scroll parallax for decorations ([data-sp] → --o) and
// pointer drift (--mx on the root). Scoped to this invitation's root.
export function useParallax(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = [...root.querySelectorAll('[data-sp]')]
    const vis = new Set()
    let raf = 0
    let io
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((x) => (x.isIntersecting ? vis.add(x.target) : vis.delete(x.target)))
      }, { rootMargin: '30% 0px' })
      els.forEach((el) => io.observe(el))
    }
    const frame = () => {
      raf = 0
      vis.forEach((el) => {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--o', `${((r.top + r.height / 2 - window.innerHeight / 2) * -Number(el.dataset.sp)).toFixed(1)}px`)
      })
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(frame) }
    const onMove = (e) => root.style.setProperty('--mx', (e.clientX / window.innerWidth * 2 - 1).toFixed(3))
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
      io?.disconnect()
    }
  }, [rootRef])
}
