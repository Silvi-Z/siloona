// A small burst of gold and rose stars at a viewport point (clientX/Y),
// appended to the design's root and removed when each star finishes.
// Skipped entirely with reduced motion.
const COLORS = ['#e9c46a', '#f6dfa0', '#e79bb0', '#ffffff']

export function sparkle(host, x, y, n = 12, reach = 90) {
  if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.6
    const d = reach * (0.45 + Math.random() * 0.55)
    const s = document.createElement('i')
    s.className = 'bdc-spark'
    s.setAttribute('aria-hidden', 'true')
    s.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;--s:${0.6 + Math.random() * 0.9};--c:${COLORS[i % COLORS.length]};animation-delay:${Math.random() * 0.12}s`
    s.addEventListener('animationend', () => s.remove())
    host.appendChild(s)
  }
}
