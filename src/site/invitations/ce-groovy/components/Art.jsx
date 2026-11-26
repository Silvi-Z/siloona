// The cover's pieces, drawn for Siloona in the reference card's flat
// retro style (assets/CREDITS.md): a disco ball on a string, a cluster of
// bells on a red ribbon, a stack of gifts and four-pointed sparkles. All
// inline SVG — crisp at any size, a few KB, and the parts can move (see
// ce-groovy.css, "motion"). Outlines are one warm dark brown.
const INK = '#3d2b26'
const C = { red: '#c8513b', mustard: '#e0a83c', green: '#5f8f6c', pink: '#eaa597', blue: '#9cc0d3', cream: '#f6e7da', peach: '#f0bf8e' }

// The disco ball hanging from the top of the arch; the CSS swings it from
// the top of its string.
const TILES = (() => {
  const pal = [C.pink, C.green, C.mustard, C.blue, C.red, C.cream, C.peach]
  let s = 7
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
  const out = []
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) out.push({ x: 18 + x * 13, y: 162 + y * 13, c: pal[Math.floor(r() * pal.length)], t: r() < 0.22 })
  return out
})()
export function DiscoBall() {
  return (
    <svg className="disco" viewBox="0 0 140 280" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="cgr-ball"><circle cx="70" cy="214" r="52" /></clipPath>
        <radialGradient id="cgr-shine" cx=".32" cy=".3" r=".8">
          <stop offset="0" stopColor="#fff" stopOpacity=".5" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor={INK} stopOpacity=".28" />
        </radialGradient>
      </defs>
      <path d="M70 0 V 156" stroke={INK} strokeWidth="2" />
      <rect x="60" y="152" width="20" height="12" rx="2" fill={C.mustard} stroke={INK} strokeWidth="2" />
      <g clipPath="url(#cgr-ball)">
        {TILES.map((t, i) => (
          <rect key={i} className={t.t ? 'tile glint' : 'tile'} x={t.x} y={t.y} width="13" height="13" fill={t.c} stroke={INK} strokeWidth="1.2" style={{ '--d': `${(i % 9) * 0.35}s` }} />
        ))}
        <circle cx="70" cy="214" r="52" fill="url(#cgr-shine)" />
      </g>
      <circle cx="70" cy="214" r="52" fill="none" stroke={INK} strokeWidth="2.4" />
    </svg>
  )
}

// One bell: body, rim and clapper, with a little pattern on it.
function Bell({ x, y, rot, fill, mark, s = 1, cls = '' }) {
  return (
    <g className={`bell ${cls}`} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <g className="bell-swing">
        <path d="M30 6 C 18 6, 12 16, 12 28 C 12 38, 8 44, 2 50 L 58 50 C 52 44, 48 38, 48 28 C 48 16, 42 6, 30 6 Z" fill={fill} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        <ellipse cx="30" cy="50" rx="29" ry="6.5" fill={fill} stroke={INK} strokeWidth="2.2" />
        <ellipse cx="30" cy="50" rx="21" ry="3.6" fill={INK} opacity=".25" />
        <circle cx="30" cy="57" r="5" fill={C.cream} stroke={INK} strokeWidth="2" />
        <path d="M24 6 Q 30 -4 36 6" fill="none" stroke={INK} strokeWidth="2.2" />
        {mark === 'flower' && [0, 72, 144, 216, 288].map((a) => <circle key={a} cx={30 + Math.cos((a * Math.PI) / 180) * 5} cy={28 + Math.sin((a * Math.PI) / 180) * 5} r="3.4" fill={C.red} opacity=".85" />)}
        {mark === 'flower' && <circle cx="30" cy="28" r="2.4" fill={C.mustard} />}
        {mark === 'star' && <path d="M30 20 l 2.6 6 6.4 .6 -4.8 4.2 1.5 6.3 -5.7 -3.3 -5.7 3.3 1.5 -6.3 -4.8 -4.2 6.4 -.6 Z" fill={C.mustard} stroke={INK} strokeWidth="1.2" />}
        {mark === 'dots' && [[22, 22], [36, 20], [28, 34], [40, 34], [18, 36]].map(([cx, cy]) => <circle key={cx + cy} cx={cx} cy={cy} r="2.2" fill={C.red} />)}
      </g>
    </g>
  )
}

// The bells along the left edge, tied on one red ribbon.
export function Bells() {
  return (
    <svg className="bells" viewBox="0 0 180 440" aria-hidden="true" focusable="false">
      <path className="ribbon" d="M70 40 C 40 90, 90 120, 50 170 C 20 210, 80 240, 40 290 C 10 330, 70 360, 40 410" fill="none" stroke={C.red} strokeWidth="7" strokeLinecap="round" />
      <path d="M70 40 C 40 90, 90 120, 50 170 C 20 210, 80 240, 40 290 C 10 330, 70 360, 40 410" fill="none" stroke={INK} strokeWidth="1.4" opacity=".45" />
      <g className="bow">
        <path d="M70 40 C 40 4, 10 20, 30 40 C 42 52, 60 46, 70 40 Z M70 40 C 104 2, 140 20, 116 42 C 102 54, 80 46, 70 40 Z" fill={C.red} stroke={INK} strokeWidth="2" />
        <path d="M66 42 C 60 60, 48 70, 34 76 M74 42 C 84 62, 100 70, 118 72" fill="none" stroke={C.red} strokeWidth="6" strokeLinecap="round" />
        <circle cx="70" cy="41" r="7" fill={C.red} stroke={INK} strokeWidth="2" />
      </g>
      <Bell x={26} y={70} rot={-14} fill={C.pink} mark="flower" cls="b1" />
      <Bell x={92} y={110} rot={16} fill={C.blue} mark="star" s={0.95} cls="b2" />
      <Bell x={10} y={170} rot={-8} fill={C.mustard} mark="dots" cls="b3" />
      <Bell x={70} y={228} rot={12} fill={C.peach} mark="flower" s={0.9} cls="b4" />
      <Bell x={4} y={288} rot={-18} fill={C.blue} mark="flower" s={0.95} cls="b5" />
      <Bell x={74} y={330} rot={10} fill={C.pink} mark="dots" s={0.92} cls="b6" />
      <Bell x={20} y={372} rot={-6} fill={C.mustard} mark="star" s={0.88} cls="b7" />
    </svg>
  )
}

// The stack of three gifts in the bottom right corner.
export function Gifts() {
  const flower = (cx, cy, c) => (
    <g key={`${cx}-${cy}`}>
      {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={cx + Math.cos((a * Math.PI) / 180) * 4.4} cy={cy + Math.sin((a * Math.PI) / 180) * 4.4} r="3.2" fill={c} />)}
      <circle cx={cx} cy={cy} r="2.2" fill={C.cream} />
    </g>
  )
  return (
    <svg className="gifts" viewBox="0 0 160 240" aria-hidden="true" focusable="false">
      <g className="box3">
        <rect x="12" y="160" width="136" height="74" rx="3" fill={C.red} stroke={INK} strokeWidth="2.2" />
        {[[34, 182], [70, 196], [110, 180], [130, 212], [50, 218], [92, 222]].map(([x, y]) => flower(x, y, C.peach))}
        <rect x="72" y="160" width="16" height="74" fill={C.mustard} stroke={INK} strokeWidth="2" />
        <rect x="12" y="186" width="136" height="12" fill={C.mustard} stroke={INK} strokeWidth="2" />
      </g>
      <g className="box2">
        <rect x="26" y="102" width="108" height="58" rx="3" fill={C.green} stroke={INK} strokeWidth="2.2" />
        <rect x="72" y="102" width="16" height="58" fill={C.mustard} stroke={INK} strokeWidth="2" />
        <rect x="26" y="124" width="108" height="12" fill={C.mustard} stroke={INK} strokeWidth="2" />
      </g>
      <g className="box1">
        <rect x="40" y="56" width="80" height="46" rx="3" fill={C.pink} stroke={INK} strokeWidth="2.2" />
        <rect x="73" y="56" width="14" height="46" fill={C.red} stroke={INK} strokeWidth="2" />
        <path d="M80 56 C 66 30, 44 34, 54 50 C 60 58, 72 58, 80 56 Z M80 56 C 94 30, 116 34, 106 50 C 100 58, 88 58, 80 56 Z" fill={C.red} stroke={INK} strokeWidth="2" />
        <circle cx="80" cy="55" r="5" fill={C.red} stroke={INK} strokeWidth="2" />
      </g>
    </svg>
  )
}

// A four-pointed sparkle.
export function Sparkle({ className = '' }) {
  return (
    <svg className={`sparkle ${className}`.trim()} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M20 2 L 22 18 L 38 20 L 22 22 L 20 38 L 18 22 L 2 20 L 18 18 Z" fill="none" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

// A little rainbow, opening each part below the cover.
export function MiniRainbow() {
  const bands = [C.blue, C.red, C.mustard, C.green, C.pink]
  return (
    <svg className="mini-rb" viewBox="0 0 100 54" aria-hidden="true" focusable="false">
      {bands.map((c, i) => <path key={c} className="mb" style={{ '--k': i }} d={`M${4 + i * 8} 52 A ${46 - i * 8} ${46 - i * 8} 0 0 1 ${96 - i * 8} 52`} fill="none" stroke={c} strokeWidth="7" />)}
    </svg>
  )
}
