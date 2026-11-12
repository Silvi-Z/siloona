// The painted-garden artwork, ported verbatim from the source demo's
// generators: peonies, irises, white blossoms, hydrangeas, leaves, the bow,
// the postcard scene, the two flower clusters, the arch frame and the
// dress-code figures. All output is static SVG markup (no user content),
// rendered via dangerouslySetInnerHTML. Ids are prefixed `wgs-` so they
// can't collide with another design's defs on the same document.

function buildDefs() {
  let s = 7
  const R = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
  const g = '<linearGradient id="wgs-p1" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d8788c"/><stop offset="1" stop-color="#f9d8da"/></linearGradient><linearGradient id="wgs-p2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#cf6a80"/><stop offset="1" stop-color="#f5bcc4"/></linearGradient><linearGradient id="wgs-p3" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#c05b74"/><stop offset="1" stop-color="#eba3b0"/></linearGradient><linearGradient id="wgs-p4" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#b04a66"/><stop offset="1" stop-color="#e48ba2"/></linearGradient>' +
    '<linearGradient id="wgs-i1" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8f95d8"/><stop offset="1" stop-color="#cdd0f2"/></linearGradient><linearGradient id="wgs-i2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7279c4"/><stop offset="1" stop-color="#b3b8ea"/></linearGradient>' +
    '<linearGradient id="wgs-lg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6c8a63"/><stop offset="1" stop-color="#abc09b"/></linearGradient><linearGradient id="wgs-r1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#efc7c8"/><stop offset="1" stop-color="#c0808a"/></linearGradient><linearGradient id="wgs-sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd6e2"/><stop offset="1" stop-color="#f6ebd4"/></linearGradient>'
  let h = ''
  /* peony */
  let P = '<g id="wgs-py">'
  for (const [count, scale, rot, grad] of [[8, 0.98, 0, 'p1'], [7, 0.82, 22, 'p2'], [6, 0.64, 10, 'p3'], [5, 0.44, 36, 'p4']]) {
    for (let i = 0; i < count; i++) P += `<path d="M0 0C-17-11-26-32-13-46Q0-55 13-46C26-32 17-11 0 0Z" transform="rotate(${rot + i * 360 / count}) scale(${scale})" fill="url(#wgs-${grad})" stroke="rgba(150,50,70,.3)" stroke-width=".5"/>`
  }
  for (let i = 0; i < 16; i++) {
    const a = i * 2.4
    const d = 2 + i * 0.5
    P += `<circle cx="${(Math.cos(a) * d).toFixed(1)}" cy="${(Math.sin(a) * d).toFixed(1)}" r="1.3" fill="#e9b94f"/>`
  }
  h += P + '</g>'
  /* iris */
  h += '<g id="wgs-ir"><path d="M0 0C4 40-4 80 0 150" stroke="#6c8a63" stroke-width="2.4" fill="none"/>';
  [-24, 24, 0].forEach((r, i) => { h += `<path d="M0 0C-12-8-14-34 0-48C14-34 12-8 0 0Z" transform="rotate(${r})${i === 2 ? ' scale(.92)' : ''}" fill="url(#wgs-i1)" stroke="rgba(90,95,170,.3)" stroke-width=".5"/>` });
  [140, -140, 180].forEach((r) => { h += `<path d="M0 0C-16 4-26 20-13 34Q0 40 13 34C26 20 16 4 0 0Z" transform="rotate(${r}) scale(.92)" fill="url(#wgs-i2)" stroke="rgba(90,95,170,.3)" stroke-width=".5"/>` })
  h += '<path d="M0 0v10M-3 0l-2 8M3 0l2 8" stroke="#e5b84a" stroke-width="1.2"/></g>'
  /* white blossoms */
  h += '<g id="wgs-wb">'
  for (const [x, y, k] of [[0, 0, 1], [26, 14, 0.8], [-20, 22, 0.7], [8, -24, 0.6]]) {
    h += `<g transform="translate(${x} ${y}) scale(${k})">`
    for (let i = 0; i < 5; i++) h += `<ellipse cx="0" cy="-9" rx="6.4" ry="9.5" transform="rotate(${i * 72})" fill="#fffdf8" stroke="#e7dacd" stroke-width=".6"/>`
    h += '<circle r="3" fill="#e9b94f"/></g>'
  }
  h += '</g>'
  /* hydrangea */
  h += '<g id="wgs-hy">'
  const hc = ['#fff4ea', '#f8dede', '#f1c6cc', '#fbe9e0']
  for (let i = 0; i < 52; i++) {
    const a = R() * 6.283
    const d = Math.sqrt(R())
    h += `<circle cx="${(Math.cos(a) * d * 42).toFixed(1)}" cy="${(Math.sin(a) * d * 34).toFixed(1)}" r="${(4 + R() * 3.4).toFixed(1)}" fill="${hc[i % 4]}" stroke="rgba(190,130,130,.3)" stroke-width=".5"/>`
  }
  h += '</g>'
  /* leaf, bow, heart, scene */
  h += '<g id="wgs-lf"><path d="M0 0C14-15 42-17 66-2C42 13 14 15 0 0Z" fill="url(#wgs-lg)"/><path d="M2 0Q34-3 64-2" stroke="rgba(255,255,255,.45)" fill="none"/></g>'
  const L = '<path d="M0 0C-44-34-86-26-76 10C-68 38-22 22 0 0Z" fill="url(#wgs-r1)"/><path d="M-6 2C-34-14-62-8-60 8" stroke="rgba(255,255,255,.4)" fill="none"/>'
  h += `<g id="wgs-bw"><g>${L}</g><g transform="scale(-1 1)">${L}</g><path d="M-6 6C-26 50-14 104-40 160L-22 154L-10 172C2 120 6 64 4 6Z" fill="url(#wgs-r1)"/><path d="M6 6C26 46 18 96 46 150L26 148L16 166C2 116-2 62-4 6Z" fill="url(#wgs-r1)" opacity=".95"/><ellipse cx="0" cy="2" rx="9" ry="11" fill="#c4828c"/><ellipse cx="-2" cy="-1" rx="3" ry="4" fill="rgba(255,255,255,.4)"/></g>`
  h += '<symbol id="wgs-hrt" viewBox="0 0 40 36"><path d="M20 35C-8 16 2-4 20 8 38-4 48 16 20 35Z"/></symbol>'
  h += '<g id="wgs-sc"><rect width="160" height="110" fill="url(#wgs-sk)"/><path d="M0 62Q30 44 60 56T120 50T160 58V110H0Z" fill="#a8b895"/><rect x="62" y="50" width="46" height="28" fill="#f0dfbd"/><path d="M58 52L85 38L112 52Z" fill="#c98c6a"/><g fill="#6f8a62"><rect x="69" y="58" width="6" height="10"/><rect x="82" y="58" width="6" height="10"/><rect x="95" y="58" width="6" height="10"/></g><g fill="#405d3e"><ellipse cx="40" cy="62" rx="5" ry="22"/><ellipse cx="48" cy="68" rx="4" ry="17"/><ellipse cx="122" cy="58" rx="5" ry="24"/><ellipse cx="132" cy="66" rx="4" ry="18"/></g><path d="M0 84Q40 76 80 88T160 84V110H0Z" fill="#7f9b6c"/><path d="M70 110Q78 92 92 84L100 84Q92 96 98 110Z" fill="#e8dcc2"/>'
  for (let i = 0; i < 26; i++) h += `<circle cx="${(R() * 160).toFixed(0)}" cy="${(86 + R() * 22).toFixed(0)}" r="${(2 + R() * 2.4).toFixed(1)}" fill="${['#fff', '#f5c9cf', '#fbeee3'][i % 3]}"/>`
  h += '</g>'
  /* clusters */
  const Lf = (x, y, r, k) => `<use href="#wgs-lf" transform="translate(${x} ${y}) rotate(${r}) scale(${k})"/>`
  h += '<g id="wgs-clA"><path d="M0 330C70 290 110 220 112 120M20 260C60 220 80 160 110 120" stroke="#6c8a63" stroke-width="2" fill="none"/>' + Lf(40, 300, -30, 1.3) + Lf(60, 250, -55, 1.1) + Lf(90, 200, -85, 1) + Lf(30, 372, 20, 1.2) + Lf(120, 280, 10, 1) + Lf(150, 90, -20, 0.9) +
    '<use href="#wgs-ir" transform="translate(70 250) rotate(-14) scale(.95)"/><use href="#wgs-ir" transform="translate(24 330) rotate(18) scale(.85)"/><use href="#wgs-wb" transform="translate(236 70) scale(1.15)"/><use href="#wgs-py" transform="translate(112 118) scale(1.6)"/><use href="#wgs-py" transform="translate(206 168) scale(.55)"/><use href="#wgs-py" transform="translate(170 26) scale(.4)"/></g>'
  h += '<g id="wgs-clB"><path d="M200 0C190 80 170 150 150 230" stroke="#6c8a63" stroke-width="2" fill="none"/>' + Lf(170, 320, 100, 1.3) + Lf(150, 360, 80, 1.1) + Lf(190, 300, 130, 1.1) + Lf(120, 250, 70, 1) +
    '<use href="#wgs-hy" transform="translate(150 150) scale(1.7)"/><use href="#wgs-py" transform="translate(206 62) scale(.95)"/><use href="#wgs-hy" transform="translate(110 210) scale(1)"/><use href="#wgs-bw" transform="translate(140 200) rotate(14) scale(1.05)"/></g>'
  return g + h
}
export const DEFS = buildDefs()

const FRAME_PATH = 'M150 10C110 10 72 38 62 86C57 110 22 108 14 152L14 372C14 408 44 424 66 436C94 452 120 466 150 466C180 466 206 452 234 436C256 424 286 408 286 372L286 152C278 108 243 110 238 86C228 38 190 10 150 10Z'
// The arch ("cartouche") outline: a filled frame plus an inset hairline.
export const FRAME = `<path class="f1" pathLength="1" d="${FRAME_PATH}"/><path class="f2" d="${FRAME_PATH}" transform="translate(9 14.4) scale(.94)"/>`

export const SCENE = '<svg viewBox="0 0 160 110"><use href="#wgs-sc"/></svg>'

// Heart mask for the highlighted day in the week strip.
export const HEART_MASK = 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 40 36%27%3E%3Cpath d=%27M20 35C-8 16 2 -4 20 8 38 -4 48 16 20 35Z%27/%3E%3C/svg%3E")'

/* dress-code figures */
function head(hair, bun) {
  return `<circle cx="35" cy="17" r="8.4" fill="#f1d3c4"/><rect x="32" y="24" width="6" height="8" fill="#ecc8b6"/><path d="M26 17Q26 6 35 6Q44 6 44 17Q42 11 35 11Q29 11 26 17Z" fill="${hair}"/>` +
    (bun
      ? `<circle cx="35" cy="5" r="4" fill="${hair}"/><path d="M26 17Q24 28 29 36L31 24Z" fill="${hair}"/>`
      : `<path d="M26 14Q35 4 44 14Q44 9 35 7Q27 9 26 14Z" fill="${hair}"/>`)
}
function gown(a, b, hair, id, bq) {
  return `<svg viewBox="0 0 70 150"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><ellipse cx="35" cy="146" rx="24" ry="3" fill="rgba(91,58,68,.1)"/><path d="M24 34Q15 52 21 72M46 34Q55 52 49 72" stroke="#ecc8b6" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M26 60C20 90 8 118 5 142Q35 152 65 142C62 118 50 90 44 60Z" fill="url(#${id})"/><path d="M14 112Q35 122 56 112M10 128Q35 140 60 128" stroke="rgba(255,255,255,.35)" fill="none"/><path d="M25 32Q35 39 45 32L44 62Q35 67 26 62Z" fill="${a}"/>` +
    head(hair, true) +
    (bq ? '<circle cx="35" cy="70" r="6" fill="#f0b3bd"/><circle cx="31" cy="73" r="4" fill="#fff4ea"/><circle cx="39" cy="73" r="4" fill="#d98096"/>' : '') + '</svg>'
}
function suit(a, b, tie) {
  return `<svg viewBox="0 0 70 150"><ellipse cx="35" cy="146" rx="22" ry="3" fill="rgba(91,58,68,.1)"/><path d="M19 76H51L49 140H37L35 92L33 140H21Z" fill="${b}"/><path d="M22 32L48 32L52 78L18 78Z" fill="${a}"/><path d="M22 34L14 80L20 80L25 42ZM48 34L56 80L50 80L45 42Z" fill="${a}"/><path d="M31 32L35 52L39 32Z" fill="#f5efe6"/><path d="M34 36h2l1 16-2 4-2-4z" fill="${tie}"/><circle cx="17" cy="82" r="3" fill="#ecc8b6"/><circle cx="53" cy="82" r="3" fill="#ecc8b6"/><ellipse cx="27" cy="143" rx="6.5" ry="2.8" fill="#3a2a28"/><ellipse cx="43" cy="143" rx="6.5" ry="2.8" fill="#3a2a28"/>` + head('#5a3d33', false) + '</svg>'
}
function slim(a, b, hair, id) {
  return `<svg viewBox="0 0 70 150"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><ellipse cx="35" cy="146" rx="20" ry="3" fill="rgba(91,58,68,.1)"/><path d="M25 34Q35 40 45 34L47 72Q48 110 45 142L25 142Q22 110 23 72Z" fill="url(#${id})"/><path d="M25 36Q17 54 21 74M45 36Q53 54 49 74" stroke="#ecc8b6" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M27 60Q35 66 43 60" stroke="rgba(255,255,255,.35)" fill="none"/>` + head(hair, true) + '</svg>'
}
export const FIGURES = [
  gown('#bba8d8', '#9783c6', '#6a4a3c', 'wgs-fa', true),
  suit('#6f8057', '#55663f', '#3d4a2e'),
  gown('#dc939e', '#bd6e80', '#4a3228', 'wgs-fb', true),
  suit('#ebe3d1', '#d0c7af', '#869878'),
  slim('#98ab88', '#6f8a63', '#8a5a3c', 'wgs-fc'),
].map((x, i) => x.replace('<svg ', `<svg style="--k:${i}" `)).join('')

// Ambient falling petals — random per visit, as in the source.
export function petals() {
  const C = ['#c98a96', '#d6a3a8', '#b9a9d3', '#e4a9b0']
  let h = ''
  for (let i = 0; i < 11; i++) h += `<i style="left:${Math.random() * 100}%;--w:${9 + Math.random() * 9}px;--c:${C[i % 4]};--dx:${(Math.random() - 0.5) * 180}px;--du:${16 + Math.random() * 14}s;--dl:${-Math.random() * 24}s"></i>`
  return h
}

// Torn-paper edges as a clip-path polygon: `top` tears only the top edge
// (lavender sections), otherwise all four (deckled postcards).
export function ragged(n, a, top) {
  const p = []
  if (top) {
    for (let i = 0; i <= n; i++) p.push(`${(i / n * 100).toFixed(1)}% ${(Math.random() * a).toFixed(1)}px`)
    p.push('100% 100%', '0 100%')
  } else {
    for (let i = 0; i < n; i++) p.push(`${(i / n * 100).toFixed(1)}% ${(Math.random() * a).toFixed(1)}px`)
    for (let i = 0; i < n; i++) p.push(`calc(100% - ${(Math.random() * a).toFixed(1)}px) ${(i / n * 100).toFixed(1)}%`)
    for (let i = n; i > 0; i--) p.push(`${(i / n * 100).toFixed(1)}% calc(100% - ${(Math.random() * a).toFixed(1)}px)`)
    for (let i = n; i > 0; i--) p.push(`${(Math.random() * a).toFixed(1)}px ${(i / n * 100).toFixed(1)}%`)
  }
  return `polygon(${p.join(',')})`
}
