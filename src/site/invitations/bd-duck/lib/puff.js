import { feather, seedEl } from './art'

// A little burst of feathers and dandelion seeds from (x, y) — the source
// demo's reward for tapping a goose, opening the gate or confirming.
// Appended to the invitation's own root (not document.body); the root must
// not sit under a transformed ancestor or these position:fixed bits would
// misplace.
export function puff(root, x, y, n) {
  if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  for (let i = 0; i < n; i++) {
    const s = document.createElement('div')
    s.className = 'sf'
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6
    const d = 60 + Math.random() * 140
    s.style.cssText = `left:${x}px;top:${y}px;--w:${14 + Math.random() * 14}px;--tx:${Math.cos(a) * d}px;--ty:${Math.sin(a) * d + 40}px;--r:${Math.random() * 160 - 80}deg;animation-delay:${Math.random() * 0.2}s`
    s.innerHTML = i % 3 ? feather() : seedEl()
    root.appendChild(s)
    setTimeout(() => s.remove(), 3300)
  }
}

// The tap-a-goose hop: restart the `.honk` animation and puff from its head.
export function honk(root, g, n = 8) {
  g.classList.remove('honk')
  g.getBoundingClientRect() // reflow so the animation restarts
  g.classList.add('honk')
  const r = g.getBoundingClientRect()
  puff(root, r.left + r.width / 2, r.top + r.height * 0.3, n)
}
