import { useEffect } from 'react'

const FLAG_COLORS = [
  ['#e8b550', 'z'], ['#9bc0b0', ''], ['#e48a79', 'd'], ['#f2b296', 's'],
  ['#b6a3d2', 'd'], ['#9bc0b0', ''], ['#f1b9c1', 's'], ['#b6a3d2', 'd'], ['#e8b550', 'z'],
]

function buildBunting(svg) {
  const w = svg.parentElement?.clientWidth || 600
  const n = Math.max(6, Math.round(w / 88))
  const sag = w < 600 ? 16 : 26
  let fw = 0
  let body = `<path d="M0 8Q${w / 2} ${8 + sag * 2} ${w} 8" fill="none" stroke="#a5b99c" stroke-width="2"/>`
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n
    const x = u * w
    const y = 8 + 4 * sag * u * (1 - u)
    const [color, pattern] = FLAG_COLORS[i % FLAG_COLORS.length]
    fw = Math.min(40, (w / n) * 0.46)
    body += `<g class="flag" style="animation-delay:${-i * 0.5}s;animation-duration:${3.4 + (i % 3) * 0.6}s">` +
      `<path d="M${x - fw} ${y}L${x + fw} ${y}L${x} ${y + fw * 2.1}Z" fill="${color}" opacity=".95"/>` +
      (pattern ? `<path d="M${x - fw} ${y}L${x + fw} ${y}L${x} ${y + fw * 2.1}Z" fill="url(#bda-p${pattern})"/>` : '') +
      '</g>'
  }
  svg.setAttribute('viewBox', `0 0 ${w} ${8 + sag + fw * 2.4}`)
  svg.innerHTML = body
}

// Ports the source demo's page-level script: scroll-reveal for `.rv`
// elements, pointer-driven parallax (`--mx`/`--my`), and sizing the hand-
// drawn SVG bunting ribbon to its container. Scoped to this invitation's
// own root (not document), matching wd-beige/lib/useInvitationMotion.js's
// isolation convention — this design gets its own hook rather than
// reusing that one, since there's no timeline/lace-photo logic here.
export function useSceneMotion(rootRef, buntingRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reveal = root.querySelectorAll('.rv')
    let revealObserver
    if ('IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            revealObserver.unobserve(entry.target)
          }
        })
      }, { threshold: 0.15 })
      reveal.forEach((el) => revealObserver.observe(el))
    } else {
      reveal.forEach((el) => el.classList.add('in'))
    }

    const onPointerMove = (e) => {
      root.style.setProperty('--mx', (e.clientX / window.innerWidth * 2 - 1).toFixed(3))
      root.style.setProperty('--my', (e.clientY / window.innerHeight * 2 - 1).toFixed(3))
    }
    window.addEventListener('pointermove', onPointerMove)

    let resizeTimer
    const sizeBunting = () => { if (buntingRef.current) buildBunting(buntingRef.current) }
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(sizeBunting, 150) }
    sizeBunting()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimer)
      if (revealObserver) revealObserver.disconnect()
    }
  }, [rootRef, buntingRef])
}
