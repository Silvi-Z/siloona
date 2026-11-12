// Static artwork for the "wd-garden" invitation, ported from the source
// demo (wd_garden.html). Ids are prefixed `wgd-` so they can never clash
// with another design's inline SVG on the same document.

export const SYMBOLS = `<defs>
  <g id="wgd-flw"><g fill="#fbf7e8" stroke="#cdc39d" stroke-width=".6">
    <ellipse cx="0" cy="-9" rx="6.6" ry="10"/><ellipse cx="0" cy="-9" rx="6.6" ry="10" transform="rotate(72)"/><ellipse cx="0" cy="-9" rx="6.6" ry="10" transform="rotate(144)"/><ellipse cx="0" cy="-9" rx="6.6" ry="10" transform="rotate(216)"/><ellipse cx="0" cy="-9" rx="6.6" ry="10" transform="rotate(288)"/></g>
    <circle r="3" fill="#c8a24a"/><g stroke="#8a6a2a" stroke-width=".6"><path d="M0 0v-6M0 0l5-3M0 0l-5-3M0 0l3 5M0 0l-3 5"/></g></g>
  <filter id="wgd-soft"><feGaussianBlur stdDeviation="7"/></filter>
  <linearGradient id="wgd-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fbfd6"/><stop offset=".42" stop-color="#e9d3b4"/><stop offset=".62" stop-color="#efb98a"/><stop offset="1" stop-color="#8d9a5a"/></linearGradient>
  <g id="wgd-far">
    <ellipse cx="420" cy="430" rx="190" ry="55" fill="#fff2dc" opacity=".65" filter="url(#wgd-soft)"/><ellipse cx="170" cy="330" rx="150" ry="36" fill="#f6d9b5" opacity=".7" filter="url(#wgd-soft)"/>
    <path d="M0 560C120 520 220 545 330 525S520 510 600 540V640H0Z" fill="#8fa3ae" opacity=".8"/>
    <path d="M0 590C160 560 280 600 420 575S560 570 600 585V680H0Z" fill="#7e9267"/>
    <g transform="translate(404 520)" fill="#d8cdb5"><rect x="-22" y="14" width="44" height="4"/><rect x="-18" y="2" width="3" height="12"/><rect x="-8" y="2" width="3" height="12"/><rect x="3" y="2" width="3" height="12"/><rect x="13" y="2" width="3" height="12"/><path d="M-24 2L0 -12L24 2Z"/></g>
  </g>
  <g id="wgd-near">
    <path d="M0 640C140 610 300 650 460 625S580 620 600 630V900H0Z" fill="#5e7a3a"/>
    <path d="M0 720C180 690 360 740 600 700V900H0Z" fill="#46602d"/>
  </g>
  <g id="wgd-trees" fill="none" stroke="#5a4330" stroke-linecap="round">
    <path d="M-30 900C50 720 80 560 36 380C16 300 50 230 130 150" stroke-width="40"/>
    <path d="M52 470C100 420 150 410 200 340M60 330C20 290 30 230 70 190" stroke-width="14"/>
    <path d="M650 900C570 740 560 600 620 470" stroke-width="26"/><path d="M590 560C540 500 540 440 580 390" stroke-width="10"/>
  </g>
</defs>`

export const SKY = '<rect width="600" height="900" fill="url(#wgd-sky)"/>'

// Butterfly body; the two colours differ per butterfly.
export const butterfly = (a, b) => `<g><path d="M20 15C14 2 2 0 2 8c0 6 8 10 18 7ZM20 15C26 2 38 0 38 8c0 6-8 10-18 7Z" fill="${a}"/><path d="M20 15C12 22 6 28 12 28c5 0 8-6 8-13ZM20 15c8 7 14 13 8 13-5 0-8-6-8-13Z" fill="${b}"/></g>`

// Procedural blossom branch (viewBox 0 0 600 260), seeded so every band
// always grows the same way. `flip` mirrors it for bottom bands. Twigs draw
// in and every flower blooms once the band gets `.in`.
const W = 600, H = 260
const greens = ['#2f4a2c', '#3f5a35', '#53733f', '#6a8a4c']
const rng = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
const cache = new Map()

export function blossoms(seed, flip) {
  const key = `${seed}${flip ? 'b' : 't'}`
  if (cache.has(key)) return cache.get(key)
  const r = rng(seed)
  const Y = (y) => (flip ? H - y : y)
  const pts = [], tw = []
  let leaves = '', flows = ''
  for (let k = 0; k < 9; k++) {
    const x0 = r() * W, y0 = H * 0.02, x1 = x0 + (r() - 0.5) * 190, y1 = H * (0.4 + r() * 0.55), cx = x0 + (r() - 0.5) * 120, cy = y1 * 0.35
    tw.push(`<path class="tw" pathLength="1" d="M${x0} ${Y(y0)}Q${cx} ${Y(cy)} ${x1} ${Y(y1)}" fill="none" stroke="#5a4630" stroke-width="${1.2 + r() * 1.6}" stroke-linecap="round"/>`)
    for (let i = 0; i < 9; i++) { const t = (i + 1) / 9, u = 1 - t; pts.push([u * u * x0 + 2 * u * t * cx + t * t * x1 + (r() - 0.5) * 34, u * u * y0 + 2 * u * t * cy + t * t * y1 + (r() - 0.5) * 26]) }
  }
  for (let i = 0; i < 70; i++) pts.push([r() * W, H * 0.78 * Math.pow(r(), 1.6)])
  pts.forEach(([x, y], i) => {
    const a = r() * 360, s = 0.65 + r() * 0.8
    leaves += `<path d="M0 0C7-7 18-7 25 0C18 7 7 7 0 0Z" fill="${greens[i % 4]}" opacity=".95" transform="translate(${x} ${Y(y)}) rotate(${a}) scale(${s})"/>`
    if (r() > 0.22) { const fs = 0.55 + r() * 0.75; flows += `<g transform="translate(${x + (r() - 0.5) * 14} ${Y(y) + (r() - 0.5) * 14}) rotate(${r() * 72}) scale(${fs})"><use href="#wgd-flw" class="fw" style="--d:${(x / W * 0.9 + r() * 0.5).toFixed(2)}s"/></g>` }
  })
  const out = tw.join('') + leaves + flows
  cache.set(key, out)
  return out
}
