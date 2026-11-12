// The hydrangea artwork and line icons, ported verbatim from the source
// demo's generators. All output is static SVG markup (no user content),
// rendered via dangerouslySetInnerHTML. Ids are prefixed `bpb-` so they
// can't collide with another design's defs on the same document.

const COL = [['#a9c0e8', '#bfd0ee'], ['#8aa7da', '#a3bbe4'], ['#7f9dd2', '#9bb4de'], ['#b3b0e0', '#c6c4ec'], ['#cddbf2', '#e0e9f7']]

function buildDefs() {
  let d = '<linearGradient id="bpb-gv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a6a22"/><stop offset=".4" stop-color="#e9d08a"/><stop offset=".7" stop-color="#b78f3f"/><stop offset="1" stop-color="#7b5b1c"/></linearGradient><linearGradient id="bpb-gh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c8"/><stop offset="1" stop-color="#8a6a22"/></linearGradient>' +
    '<linearGradient id="bpb-eg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9cdb8"/><stop offset="1" stop-color="#84a58c"/></linearGradient><linearGradient id="bpb-lg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5e8c68"/><stop offset="1" stop-color="#8db394"/></linearGradient>'
  COL.forEach((c, i) => {
    d += `<g id="bpb-fl${i}">`
    for (let k = 0; k < 4; k++) d += `<ellipse cx="0" cy="-5.8" rx="4.9" ry="6.2" transform="rotate(${k * 90 + 20})" fill="${c[0]}" stroke="rgba(255,255,255,.6)" stroke-width=".5"/>`
    d += `<circle r="2" fill="${c[1]}"/><circle r=".8" fill="#fff" opacity=".8"/></g>`
  })
  d += '<g id="bpb-eu"><ellipse cx="0" cy="-10" rx="8" ry="10.5" fill="url(#bpb-eg)" stroke="rgba(80,110,90,.35)" stroke-width=".5"/><path d="M0 0V-19" stroke="rgba(255,255,255,.5)" stroke-width=".6"/></g>' +
    '<g id="bpb-gl"><path d="M0 0C14-10 38-8 54 6C38 20 14 14 0 0Z" fill="url(#bpb-lg)" stroke="rgba(60,100,70,.35)" stroke-width=".6"/><path d="M2 1Q28 4 52 6" stroke="rgba(255,255,255,.45)" fill="none" stroke-width=".8"/></g>'
  return d
}
export const DEFS = buildDefs()

// One hydrangea cluster with leaves and eucalyptus; `v` seeds it, exactly
// as in the source (1 = top-right corner, 2 = bottom-left).
export function cluster(v) {
  let seed = v * 53 + 7
  const R = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
  let n = 0
  let o = ''
  const cx = 214
  const cy = 96
  const P = []
  for (let i = 0; i < 9; i++) {
    const a = (100 + i * 18 + R() * 12) * Math.PI / 180
    R() // the source draws (and discards) a radius here; kept so the sequence matches
    o += `<g class="lv" style="--i:${n++}"><use href="#bpb-gl" transform="translate(${(cx + Math.cos(a) * 30).toFixed(1)} ${(cy + Math.sin(a) * 30).toFixed(1)}) rotate(${(a * 57.3).toFixed(0)}) scale(${(1.2 + R() * 0.7).toFixed(2)})"/></g>`
  }
  for (const [x0, y0, x1, y1] of [[150, 200, 40, 262], [190, 170, 86, 282]]) {
    const qx = (x0 + x1) / 2 - 10
    const qy = (y0 + y1) / 2 - 30
    o += `<path d="M${x0} ${y0}Q${qx} ${qy} ${x1} ${y1}" fill="none" stroke="#9db79f" stroke-width="1.3"/>`
    for (let i = 1; i < 8; i++) {
      const t = i / 8
      const x = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * qx + t * t * x1
      const y = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * qy + t * t * y1
      o += `<g class="lv" style="--i:${n++}"><use href="#bpb-eu" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((i % 2 ? -60 : 40) + R() * 20).toFixed(0)}) scale(${(0.9 + R() * 0.4).toFixed(2)})"/></g>`
    }
  }
  for (let i = 0; i < 110; i++) {
    const a2 = R() * 6.283
    const rr = Math.sqrt(R()) * 84
    P.push([cx + Math.cos(a2) * rr * 1.05, cy + Math.sin(a2) * rr * 0.95, Math.floor(R() * 5), 0.8 + R() * 0.55, R() * 90])
  }
  P.sort((a, b) => a[1] - b[1])
  P.forEach((p) => {
    if (p[0] > 300 || p[1] < -10) return
    o += `<g class="fb" style="--i:${n++ % 80}"><use href="#bpb-fl${p[2]}" transform="translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(${p[4].toFixed(0)}) scale(${p[3].toFixed(2)})"/></g>`
  })
  for (let i = 0; i < 14; i++) {
    const a3 = (120 + R() * 120) * Math.PI / 180
    const r3 = 88 + R() * 30
    o += `<circle class="lv" style="--i:${n++}" cx="${(cx + Math.cos(a3) * r3).toFixed(1)}" cy="${(cy + Math.sin(a3) * r3).toFixed(1)}" r="${(2 + R() * 1.6).toFixed(1)}" fill="${i % 2 ? '#c3b6e6' : '#ecbfcf'}"/>`
  }
  return `<svg viewBox="0 0 300 300" aria-hidden="true">${o}</svg>`
}

const S = 'stroke="#5c77a6" stroke-width="1.3"'
export const ICONS = {
  chu: `<path class="ln" ${S} pathLength="1" d="M25 4V12M21.500 7.500H28.500"/><path class="ln" ${S} pathLength="1" d="M25 13L12 24V44H38V24Z"/><path class="ln" ${S} style="--d:.3" pathLength="1" d="M19 44V34A6 6 0 0 1 31 34V44M5 44H45M12 24H4V44M38 24H46V44"/>`,
  cup: `<g transform="rotate(-14 17 30)"><path class="ln" ${S} pathLength="1" d="M11 8H23L21 28C21 34 13 34 13 28Z"/><path class="ln" ${S} style="--d:.3" pathLength="1" d="M17 33V44M11 44H23"/></g><g transform="rotate(14 33 30)"><path class="ln" ${S} pathLength="1" d="M27 8H39L37 28C37 34 29 34 29 28Z"/><path class="ln" ${S} style="--d:.3" pathLength="1" d="M33 33V44M27 44H39"/></g><path class="ln" ${S} style="--d:.6" pathLength="1" d="M25 3V8M18 5L20 9M32 5L30 9"/>`,
  ph: `<circle class="ln" ${S} pathLength="1" cx="25" cy="25" r="18"/><path class="ln" ${S} style="--d:.3" pathLength="1" d="M18 15C18 13 20 12 21 14L23 18C24 20 22 21 21 23C23 27 27 31 31 33C33 32 34 30 36 31L39 33C41 34 40 37 38 38C32 40 22 34 16 24C13 20 15 17 18 15Z"/>`,
}

// Falling florets — random per visit, as in the source.
export function florets() {
  let h = ''
  for (let i = 0; i < 9; i++) {
    h += `<svg viewBox="-12 -12 24 24" style="left:${Math.random() * 100}%;--w:${12 + Math.random() * 12}px;--dx:${(Math.random() - 0.5) * 160}px;--du:${20 + Math.random() * 16}s;--dl:${-Math.random() * 30}s"><use href="#bpb-fl${i % 3}"/></svg>`
  }
  return h
}

export const CROSS = '<svg class="cross seq" style="--i:0" viewBox="0 0 40 70" aria-hidden="true"><defs><clipPath id="bpb-cc"><rect x="16" y="0" width="8" height="70"/><rect x="2" y="17" width="36" height="8"/></clipPath></defs><rect x="16" y="0" width="8" height="70" fill="url(#bpb-gv)"/><rect x="2" y="17" width="36" height="8" fill="url(#bpb-gv)"/><rect x="2" y="17" width="36" height="8" fill="url(#bpb-gh)" opacity=".5"/><g clip-path="url(#bpb-cc)"><rect class="gl" x="-30" y="-10" width="16" height="90" fill="rgba(255,255,255,.75)" transform="skewX(-20)"/></g></svg>'

export const SILHOUETTE = '<svg class="sil" viewBox="0 0 90 100" aria-hidden="true"><g fill="#1f2a3c"><circle cx="26" cy="14" r="7"/><path d="M14 28C14 24 18 22 26 22S38 24 38 28V62H33V98H19V62H14Z"/><path d="M26 22L22 30L26 40L30 30Z" fill="#fff"/><circle cx="62" cy="14" r="6.5"/><path d="M55 24C58 22 66 22 69 24L70 38L66 40C70 60 76 82 82 98H44C50 82 56 60 58 40L54 38Z"/></g></svg>'

export const CURVE = 'M16 170C60 120 150 150 134 70C122 14 70 18 40 60C14 98 24 140 4 214'
