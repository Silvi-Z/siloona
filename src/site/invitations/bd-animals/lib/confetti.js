// Ambient background confetti field + click-triggered bursts, ported from
// the source demo's two IIFEs. Appended to the invitation's own root ref
// (not document.body) so the invitation stays self-contained — same
// safety note as wd-beige/lib/dust.js: the root must not sit under a
// transformed/filtered ancestor, or position:fixed bursts would misplace.
const PAL = ['#e48a79', '#e8b550', '#86b4a4', '#b6a3d2', '#f1b9c1', '#9fc3dd', '#f2b296']

export function ambientConfetti(container) {
  if (!container) return
  const n = window.innerWidth < 600 ? 26 : 44
  const shapes = [
    'border-radius:50%',
    'border-radius:50%;background:transparent!important;border:2px solid',
    'border-radius:3px',
    'clip-path:polygon(50% 0,61% 36%,98% 38%,68% 60%,79% 96%,50% 74%,21% 96%,32% 60%,2% 38%,39% 36%)',
  ]
  let html = ''
  for (let i = 0; i < n; i++) {
    const col = PAL[i % 7]
    const z = 6 + Math.random() * 10
    const shape = shapes[i % 4]
    const colorRule = i % 4 === 1 ? `border-color:${col}` : `background:${col}`
    const w = i % 4 === 2 ? z * 1.8 : z
    html += `<span style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${w}px;height:${z}px;${shape};${colorRule};--dx:${(Math.random() - 0.5) * 50}px;--dy:${(Math.random() - 0.5) * 60}px;--rt:${Math.random() * 160 - 80}deg;--du:${5 + Math.random() * 7}s;--dl:${-Math.random() * 8}s"></span>`
  }
  container.innerHTML = html
}

export function burst(root, x, y, count = 22, reduceMotion = false) {
  if (!root || reduceMotion) return
  for (let i = 0; i < count; i++) {
    const el = document.createElement('i')
    el.className = 'bda-b'
    const angle = Math.random() * 6.283
    const dist = 50 + Math.random() * 130
    const z = 6 + Math.random() * 8
    el.style.cssText = `left:${x}px;top:${y}px;width:${z}px;height:${z}px;background:${PAL[i % 7]};--tx:${Math.cos(angle) * dist}px;--ty:${Math.sin(angle) * dist - 40}px;--rt:${Math.random() * 360}deg${i % 3 ? '' : ';border-radius:2px'}`
    root.appendChild(el)
    setTimeout(() => el.remove(), 1200)
  }
}
