// Procedural SVG generators ported from the original demo. These are pure
// string builders (no DOM access), trusted/hardcoded output — not user
// input — so injecting them via dangerouslySetInnerHTML is safe, the same
// pattern the dashboard's icon system already uses.

// Seeded PRNG so the generated "photograph" scenes are stable across
// re-renders instead of reshuffling every time.
function makeRng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function monogramSvg(left, right) {
  return `<svg viewBox="0 0 200 250">
    <ellipse class="ln" pathLength="1" cx="100" cy="125" rx="86" ry="108" style="--d:0"/>
    <ellipse class="ln" pathLength="1" cx="100" cy="125" rx="78" ry="100" style="--d:.3;stroke-width:1.6"/>
    <text x="64" y="132" font-size="96" font-family="Noto Serif Armenian,Cormorant Garamond,serif" font-weight="300" text-anchor="middle">${left}</text>
    <text x="132" y="150" font-size="84" font-family="Noto Serif Armenian,Cormorant Garamond,serif" font-weight="300" text-anchor="middle">${right}</text>
    <text x="100" y="172" font-size="90" font-family="Pinyon Script,cursive" text-anchor="middle">&amp;</text>
  </svg>`
}

// A single decorative lace border, procedurally tiled around a box of the
// given pixel size. Returns the inner markup for an <svg> with a matching
// viewBox — mirrors the original's ring()/`.lc[data-lace]` builder.
export function laceFrameSvg(w, h) {
  w = Math.max(1, w || 300)
  h = Math.max(1, h || 430)
  let o = ''
  let n = 0

  function ring(inset, sym, step) {
    const W = w - inset * 2
    const H = h - inset * 2
    const cw = Math.max(2, Math.round(W / step))
    const ch = Math.max(2, Math.round(H / step))
    for (let i = 0; i < cw; i++) {
      const x = inset + (W * (i + 0.5)) / cw
      o += `<use style="--k:${n++ % 40}" href="#${sym}" x="${x.toFixed(1)}" y="${inset}"/>`
      o += `<use style="--k:${n++ % 40}" href="#${sym}" x="${x.toFixed(1)}" y="${h - inset}" transform="rotate(180 ${x.toFixed(1)} ${h - inset})"/>`
    }
    for (let i = 0; i < ch; i++) {
      const y = inset + (H * (i + 0.5)) / ch
      o += `<use style="--k:${n++ % 40}" href="#${sym}" x="${inset}" y="${y.toFixed(1)}" transform="rotate(-90 ${inset} ${y.toFixed(1)})"/>`
      o += `<use style="--k:${n++ % 40}" href="#${sym}" x="${w - inset}" y="${y.toFixed(1)}" transform="rotate(90 ${w - inset} ${y.toFixed(1)})"/>`
    }
  }

  ring(12, 'wdb-lm', 24)
  ring(25, 'wdb-ls', 12)
  o += `<rect x="19" y="19" width="${w - 38}" height="${h - 38}" fill="none" stroke="#fff" stroke-width=".9" stroke-dasharray="1.5 3.5"/>`
  o += `<rect x="30" y="30" width="${w - 60}" height="${h - 60}" fill="none" stroke="#fff" stroke-width=".8"/>`
  return o
}

// Generated black & white "photograph" placeholder. k=0 is the beach/hero
// scene, k=1 is the closing embrace scene — same two compositions as the
// original. Replace via data.photos to use real images instead.
export function placeholderScene(k, uid) {
  const rnd = makeRng(k ? 5 : 9)
  const id = `wdb-sc${uid}-${k}`
  let s = `<svg viewBox="0 0 300 440" preserveAspectRatio="xMidYMid slice"><defs>
    <linearGradient id="sk${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${k ? '#8f8f8f' : '#b8b8b8'}"/><stop offset="1" stop-color="${k ? '#d9d9d9' : '#efefef'}"/></linearGradient>
    <linearGradient id="se${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d6d6d"/><stop offset="1" stop-color="#a9a9a9"/></linearGradient>
    <linearGradient id="sa${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8b8b8"/><stop offset="1" stop-color="#8e8e8e"/></linearGradient>
    <radialGradient id="sn${id}" cx="50%" cy="48%" r="45%"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <filter id="bl${id}"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>`
  s += `<rect width="300" height="440" fill="url(#sk${id})"/>`

  if (k) {
    for (let i = 0; i < 9; i++) {
      s += `<ellipse cx="${rnd() * 300}" cy="${30 + rnd() * 150}" rx="${60 + rnd() * 80}" ry="${16 + rnd() * 26}" fill="${i % 2 ? '#f3f3f3' : '#7c7c7c'}" opacity=".5" filter="url(#bl${id})"/>`
    }
    s += `<rect y="190" width="300" height="60" fill="url(#se${id})"/>`
  } else {
    s += `<circle cx="150" cy="210" r="130" fill="url(#sn${id})"/><rect y="210" width="300" height="110" fill="url(#se${id})"/>`
    for (let i = 0; i < 22; i++) {
      s += `<path d="M${rnd() * 260} ${214 + i * 5}h${20 + rnd() * 60}" stroke="#e9e9e9" stroke-opacity="${0.15 + rnd() * 0.3}" stroke-width="1.2"/>`
    }
    s += `<path d="M0 320Q150 300 300 322V440H0Z" fill="url(#sa${id})"/><path d="M0 322Q150 304 300 324" stroke="#e5e5e5" stroke-width="3" fill="none" opacity=".7"/><ellipse cx="150" cy="420" rx="90" ry="10" fill="#555" opacity=".35"/>`
  }

  if (k) {
    s += `<path d="M0 440V300C20 250 80 236 130 262C150 250 190 250 214 270C246 262 280 290 300 330V440Z" fill="#232323"/><path d="M96 262C110 210 160 208 176 252C186 280 170 320 160 440H110C90 340 84 300 96 262Z" fill="#c9c9c9"/><path d="M92 250C96 214 126 196 156 206C174 214 184 236 178 262C170 240 150 226 126 232C110 238 100 246 92 270Z" fill="#1b1b1b"/><path d="M168 300C190 290 216 300 232 320C214 316 190 316 170 324Z" fill="#dcdcdc"/><circle cx="214" cy="316" r="2.6" fill="#fff"/>`
  } else {
    s += `<path d="M108 322V256C108 236 120 228 134 228L146 228C156 230 160 240 160 256V322Z" fill="#1e1e1e"/><circle cx="130" cy="212" r="14" fill="#1e1e1e" transform="rotate(14 130 212)"/><path d="M148 322C142 290 150 258 162 244C174 236 186 240 190 254C196 280 200 304 206 322Z" fill="#dedede"/><circle cx="158" cy="226" r="12" fill="#cfcfcf" transform="rotate(-16 158 226)"/><path d="M148 218C152 202 170 200 176 214C180 226 176 244 184 262C170 250 156 244 150 230Z" fill="#232323"/><path d="M156 258C140 262 128 270 118 282" stroke="#1e1e1e" stroke-width="7" stroke-linecap="round" fill="none"/>`
  }
  return s + '</svg>'
}
