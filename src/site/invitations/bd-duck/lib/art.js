// The watercolour storybook artwork, ported verbatim from the source demo's
// generators. Each returns static SVG markup (no user content), rendered via
// dangerouslySetInnerHTML. Gradient ids are prefixed `bdd-` so they can't
// collide with another design's defs on the same document.

export const DEFS =
  '<radialGradient id="bdd-gw" cx="35%" cy="30%" r="85%"><stop offset="0" stop-color="#fffefb"/><stop offset=".6" stop-color="#f2eadd"/><stop offset="1" stop-color="#e0d4c0"/></radialGradient>' +
  '<linearGradient id="bdd-gb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#efbb62"/><stop offset="1" stop-color="#cf8e34"/></linearGradient>' +
  '<linearGradient id="bdd-pk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eeb0ad"/><stop offset="1" stop-color="#c9777a"/></linearGradient>' +
  '<linearGradient id="bdd-lp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0c6bf"/><stop offset="1" stop-color="#d68e8c"/></linearGradient>' +
  '<linearGradient id="bdd-wp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7cdcd"/><stop offset="1" stop-color="#e49ca2"/></linearGradient>' +
  '<radialGradient id="bdd-fp" cx="50%" cy="60%" r="60%"><stop offset="0" stop-color="#e58f93"/><stop offset="1" stop-color="#f3c0bf"/></radialGradient>'

export function gosling(inner, shut) {
  let h = (inner ? '' : '<g class="gs">') +
    '<g class="lgA"><path d="M42 80L40 94M58 80L60 94" stroke="#d99c42" stroke-width="3" stroke-linecap="round"/><path d="M40 94l-7 4h14zM60 94l-7 4h14z" fill="#d99c42"/></g><ellipse cx="50" cy="62" rx="28" ry="22" fill="url(#bdd-gw)" stroke="#d9ccb6"/><path d="M26 62q-10-6-8-14q10 2 14 8" fill="url(#bdd-gw)" stroke="#d9ccb6"/><path d="M36 64q10-10 24-4" fill="none" stroke="#d2c5ad"/><circle cx="68" cy="38" r="16" fill="url(#bdd-gw)" stroke="#d9ccb6"/><path d="M82 36L96 42L82 47Z" fill="url(#bdd-gb)"/>' +
    (shut
      ? '<path d="M68 34q4-5 8 0" fill="none" stroke="#4a342b" stroke-width="1.5" stroke-linecap="round"/>'
      : '<circle cx="74" cy="34" r="2.4" fill="#3b2a24"/><circle cx="74.8" cy="33.2" r=".8" fill="#fff"/>') +
    '<circle cx="66" cy="46" r="4" fill="#f2a9a3" opacity=".4"/>'
  return h + (inner ? '' : '</g>')
}

export function goose(o = {}) {
  let h = '<g class="gs" tabindex="0" role="button" aria-label="Սագուհի">'
  h += '<ellipse cx="130" cy="262" rx="88" ry="7" fill="rgba(140,110,90,.14)"/>'
  h += '<g class="lgA"><path d="M112 204L108 250" stroke="#d99c42" stroke-width="7" stroke-linecap="round"/><path d="M108 250C98 252 90 258 88 264C100 264 118 264 124 256C120 250 114 248 108 250Z" fill="url(#bdd-gb)"/></g><g class="lgB"><path d="M156 204L160 250" stroke="#d99c42" stroke-width="7" stroke-linecap="round"/><path d="M160 250C150 252 142 258 140 264C152 264 170 264 176 256C172 250 166 248 160 250Z" fill="url(#bdd-gb)"/></g>'
  h += '<path d="M34 156C32 114 84 98 138 104C188 110 232 130 238 162C242 194 200 210 148 210C88 210 36 198 34 156Z" fill="url(#bdd-gw)" stroke="#d9ccb6"/><path d="M36 150C14 140 8 122 18 108C32 112 46 124 52 138Z" fill="url(#bdd-gw)" stroke="#d9ccb6"/>'
  h += '<path d="M70 150C84 132 130 126 170 136C196 142 214 156 212 172C200 184 150 190 108 184C80 180 62 168 70 150Z" fill="rgba(255,255,255,.7)" stroke="#dcd0ba" stroke-width=".9"/>'
  for (let r = 0; r < 3; r++) for (let x = 88 + r * 8; x < 190 - r * 8; x += 20) h += `<path d="M${x} ${150 + r * 13}q10 -12 20 0" fill="none" stroke="#d2c5ad" stroke-width=".9"/>`
  h += '<g class="hd"><path d="M152 142C146 112 156 78 172 60C184 46 208 50 210 68C211 84 200 94 198 110C196 126 204 140 212 152C196 158 168 158 152 142Z" fill="url(#bdd-gw)" stroke="#d9ccb6"/><ellipse cx="192" cy="58" rx="24" ry="21" fill="url(#bdd-gw)" stroke="#d9ccb6"/><path d="M212 54L242 63L212 74Z" fill="url(#bdd-gb)"/><path d="M214 63H236" stroke="#b97a26" stroke-width=".8"/>'
  h += (o.shut
    ? '<path d="M193 52q6-7 12 0" fill="none" stroke="#4a342b" stroke-width="1.8" stroke-linecap="round"/>'
    : '<circle cx="201" cy="52" r="3.2" fill="#3b2a24"/><circle cx="202" cy="51" r="1" fill="#fff"/><path d="M196 47q5-4 10 0" fill="none" stroke="#4a342b" stroke-width="1" stroke-linecap="round"/>') +
    '<circle cx="190" cy="66" r="6" fill="#f2a9a3" opacity=".4"/></g>'
  h += '<path d="M178 104C160 90 144 100 150 114C156 122 172 114 178 104Z" fill="url(#bdd-pk)"/><path d="M178 104C196 90 212 100 206 114C200 122 184 114 178 104Z" fill="url(#bdd-pk)"/><g class="rb"><path d="M176 108C170 128 172 142 164 158L172 156L176 164C182 148 182 128 180 110Z" fill="url(#bdd-pk)"/><path d="M182 108C192 124 188 140 198 154L190 154L188 162C178 148 178 126 180 108Z" fill="url(#bdd-pk)" opacity=".9"/></g><circle cx="179" cy="107" r="5" fill="#c9777a"/>'
  if (o.chick) h += `<g transform="translate(96 74) scale(.52)">${gosling(1)}</g>`
  return o.flip ? `<g transform="translate(260 0) scale(-1 1)">${h}</g></g>` : `${h}</g>`
}

export const gooseSvg = (o) => `<svg viewBox="-6 0 280 280" aria-hidden="true">${goose(o)}</svg>`
export const goslingSvg = (shut) => `<svg viewBox="0 0 100 100" aria-hidden="true">${gosling(0, shut)}</svg>`
export const paradeSvg = () => gooseSvg() + goslingSvg() + goslingSvg(1)

export function bow() {
  return '<svg viewBox="0 0 100 80" aria-hidden="true"><path d="M50 36C30 14 8 20 12 40C16 54 38 50 50 36Z" fill="url(#bdd-pk)"/><path d="M50 36C70 14 92 20 88 40C84 54 62 50 50 36Z" fill="url(#bdd-pk)"/><path d="M46 42C40 62 44 70 34 80L46 76L50 80C56 66 54 54 52 42Z" fill="url(#bdd-pk)"/><path d="M54 42C62 60 58 68 70 78L58 76L54 80C48 66 48 54 50 42Z" fill="url(#bdd-pk)" opacity=".9"/><circle cx="50" cy="38" r="7" fill="#c9777a"/></svg>'
}

function bfly() {
  return '<svg viewBox="0 0 70 56" aria-hidden="true"><g class="wing"><path d="M35 28C20 2 2 8 6 26C8 38 26 40 35 28Z" fill="url(#bdd-wp)" stroke="#d98a92" stroke-width=".7"/><path d="M35 28C50 2 68 8 64 26C62 38 44 40 35 28Z" fill="url(#bdd-wp)" stroke="#d98a92" stroke-width=".7"/><path d="M35 30C24 36 18 50 28 52C34 52 36 40 35 30Z" fill="#f2b6b9" stroke="#d98a92" stroke-width=".6"/><path d="M35 30C46 36 52 50 42 52C36 52 34 40 35 30Z" fill="#f2b6b9" stroke="#d98a92" stroke-width=".6"/></g><path d="M35 18V40M35 18Q30 8 26 6M35 18Q40 8 44 6" fill="none" stroke="#a8736f" stroke-width="1.4" stroke-linecap="round"/></svg>'
}

function sprig() {
  let s = '<svg viewBox="0 0 80 160" aria-hidden="true"><path d="M40 160C38 110 46 50 40 6" fill="none" stroke="#cfa49b" stroke-width="1.6" stroke-linecap="round"/>'
  for (let i = 0; i < 8; i++) {
    const y = 140 - i * 17
    const sd = i % 2 ? 1 : -1
    s += `<path d="M${40 - i * 0.3} ${y}C${40 + sd * 16} ${y - 8} ${40 + sd * 30} ${y - 4} ${40 + sd * 34} ${y - 16}C${40 + sd * 20} ${y - 20} ${40 + sd * 6} ${y - 12} 40 ${y}Z" fill="url(#bdd-lp)" stroke="rgba(190,120,120,.4)" stroke-width=".5"/>`
  }
  return s + '<path d="M40 6C32 14 32 26 40 34C48 26 48 14 40 6Z" fill="url(#bdd-lp)"/></svg>'
}

function flower() {
  let s = '<svg viewBox="0 0 90 140" aria-hidden="true"><path d="M44 52C46 80 40 110 46 140" fill="none" stroke="#c9a095" stroke-width="1.6"/><path d="M44 96C30 90 24 78 28 70C40 72 44 84 44 96Z" fill="url(#bdd-lp)"/><path d="M45 112C58 108 66 98 62 90C50 92 44 102 45 112Z" fill="url(#bdd-lp)"/><g transform="translate(44 40)">'
  for (let k = 0; k < 5; k++) s += `<ellipse cx="0" cy="-15" rx="11" ry="16" transform="rotate(${k * 72})" fill="url(#bdd-fp)" stroke="rgba(190,110,115,.4)" stroke-width=".6"/>`
  return s + '<circle r="7" fill="#b45a62"/><circle r="2.6" fill="#f3d58c"/></g></svg>'
}

export function feather() {
  return '<svg viewBox="0 0 40 90" aria-hidden="true"><path d="M20 4C6 24 4 56 20 86C36 56 34 24 20 4Z" fill="#fbf6ea" stroke="#e1d4bd" stroke-width="1"/><path d="M20 6V86M20 30L10 40M20 46L9 58M20 30L30 40M20 46L31 58" stroke="#e1d4bd" stroke-width=".8" fill="none"/></svg>'
}

export function seedEl() {
  let s = '<svg viewBox="-20 -20 40 40" aria-hidden="true"><path d="M0 14L0 0" stroke="#bda98f" stroke-width="1"/>'
  for (let k = 0; k < 9; k++) {
    const a = -2.6 + k * 0.4
    const x = (Math.cos(a) * 15).toFixed(1)
    const y = (Math.sin(a) * 15).toFixed(1)
    s += `<path d="M0 0L${x} ${y}" stroke="#cdbba3" stroke-width=".8"/><circle cx="${x}" cy="${y}" r="1" fill="#d8c9b3"/>`
  }
  return s + '</svg>'
}

function blos() {
  let s = '<svg viewBox="0 0 80 100" aria-hidden="true"><path d="M30 100C34 70 28 40 36 8" fill="none" stroke="#cfb6a0" stroke-width="1.4"/>'
  for (const [px, py] of [[36, 12], [26, 34], [42, 50], [24, 66]]) {
    s += `<g transform="translate(${px} ${py})">`
    for (let k = 0; k < 5; k++) s += `<ellipse cx="0" cy="-5" rx="3.6" ry="5.6" transform="rotate(${k * 72})" fill="#f6ead2" stroke="#dcc7a0" stroke-width=".5"/>`
    s += '<circle r="1.8" fill="#d9a553"/></g>'
  }
  return s + '</svg>'
}

const ART = { bfly, sprig, flower, feather, seed: seedEl, blos }
const MOTION = { bfly: 'flt', sprig: 'swy', flower: 'swy', feather: 'drift', seed: 'seed', blos: 'swy' }

// Same seeded generator and call order as the source, so every piece
// drifts with exactly the timing the demo had.
let seed = 29
function R() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }

// [kind, left%, top%, width px, _, scroll-parallax factor, pointer factor]
const LAYOUTS = {
  d0: [['bfly', 6, 6, 46, 0, 0.06, 8], ['flower', 82, 8, 56, 0, 0.08, -8], ['sprig', 4, 40, 50, 0, 0.05, 6], ['feather', 88, 36, 26, 0, 0.1, -6], ['seed', 18, 22, 34], ['seed', 70, 26, 30], ['blos', 86, 62, 50, 0, 0.07, -10], ['bfly', 78, 48, 40, 0, 0.1, 10], ['sprig', 90, 80, 44], ['seed', 30, 60, 28]],
  d1: [['sprig', 4, 6, 56, 0, 0.05], ['flower', 86, 10, 54, 0, 0.07], ['bfly', 10, 56, 42, 0, 0.1], ['feather', 90, 60, 26, 0, 0.08], ['seed', 72, 34, 32], ['blos', 4, 80, 46]],
  d2: [['bfly', 8, 10, 44, 0, 0.1], ['sprig', 90, 16, 50, 0, 0.05], ['flower', 4, 60, 52, 0, 0.07], ['feather', 86, 70, 26, 0, 0.1], ['seed', 60, 6, 30]],
  d3: [['flower', 88, 6, 52, 0, 0.07], ['blos', 4, 14, 48, 0, 0.06], ['bfly', 84, 50, 42, 0, 0.1], ['sprig', 4, 62, 50, 0, 0.05], ['seed', 40, 92, 30]],
  d4: [['bfly', 6, 8, 44, 0, 0.1], ['sprig', 88, 10, 50, 0, 0.05], ['flower', 4, 70, 50, 0, 0.07], ['feather', 90, 60, 26, 0, 0.1], ['seed', 70, 86, 30]],
  d5: [['bfly', 10, 8, 46, 0, 0.1], ['flower', 86, 14, 54, 0, 0.07], ['sprig', 4, 40, 48, 0, 0.05], ['blos', 90, 52, 46, 0, 0.06]],
}

export const SCATTER = Object.fromEntries(Object.entries(LAYOUTS).map(([id, items]) => [
  id,
  items.map(([kind, left, top, width, , sp, px]) => ({
    kind, left, top, width, sp: sp || 0.05, px: px || 0,
    motion: MOTION[kind],
    du: `${(8 + R() * 10).toFixed(1)}s`,
    dl: `${(-R() * 10).toFixed(1)}s`,
    svg: ART[kind](),
  })),
]))
