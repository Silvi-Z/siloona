// Hand-drawn line illustrations for wd-fete — thin strokes in a few soft
// colours (dusty-blue chairs, blush flowers, sage leaves, raspberry bows),
// as if sketched with coloured pens. All drawn here in SVG; decorative,
// hidden from screen readers.

const C = {
  blue: '#7E93BA', blush: '#E28E9C', pink: '#C9506F', sage: '#7E8C55', sand: '#D4A27E',
  rasp: '#A3204A', gold: '#D3A03A', ink: '#4A4038', orange: '#DD6B33',
}
const PAPER = '#FCF8F0'
const S = (color, w = 1.4) => ({ fill: 'none', stroke: color, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' })

// A little flower: five loops round a centre.
function Bloom({ x, y, r = 7, color = C.blush, center = C.pink }) {
  const petals = [0, 72, 144, 216, 288].map((a) => {
    const rad = (a * Math.PI) / 180
    const cx = x + Math.cos(rad) * r * 0.62
    const cy = y + Math.sin(rad) * r * 0.62
    return <ellipse key={a} cx={cx} cy={cy} rx={r * 0.48} ry={r * 0.36} transform={`rotate(${a} ${cx} ${cy})`} {...S(color, 1.1)} />
  })
  return <g>{petals}<circle cx={x} cy={y} r={r * 0.18} fill={center} /></g>
}

function Leaf({ x, y, a = 0, l = 12 }) {
  return <path d={`M${x} ${y} q ${l * 0.5} ${-l * 0.45} ${l} 0 q ${-l * 0.5} ${l * 0.45} ${-l} 0z`} transform={`rotate(${a} ${x} ${y})`} {...S(C.sage, 1.1)} />
}

function Candle({ x, y, h = 34 }) {
  return (
    <g>
      <path d={`M${x} ${y} v ${-h}`} {...S(C.sand, 1.6)} />
      <path d={`M${x} ${y - h - 3} c 2.5 -3 2.5 -6 0 -9 c -2.5 3 -2.5 6 0 9z`} {...S(C.gold, 1.1)} />
      <path d={`M${x - 4} ${y} h 8`} {...S(C.ink, 1)} />
    </g>
  )
}

function Glass({ x, y, s = 1, tilt = 0, color = C.ink }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
      <path d="M-6 -30 C -6 -18, -3 -12, 0 -11 C 3 -12, 6 -18, 6 -30 Z" {...S(color, 1.2)} />
      <path d="M-5 -24 C -3 -22, 3 -22, 5 -24" {...S(C.blush, 1)} />
      <path d="M0 -11 V 0 M -5 0 H 5" {...S(color, 1.2)} />
    </g>
  )
}

function Chair({ x, y, s = 1, color = C.blue, flip }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M0 0 V -52 C 0 -64, 22 -64, 22 -52 V -18" {...S(color, 1.6)} />
      <path d="M4 -50 C 6 -58, 16 -58, 18 -50 M4 -40 H 18 M4 -30 H 18" {...S(color, 1.1)} />
      <path d="M-2 -18 H 26 L 28 -12 H -4 Z" {...S(color, 1.4)} />
      <path d="M0 -12 L -2 22 M24 -12 L 27 22 M8 -12 L 8 16 M18 -12 L 19 16" {...S(color, 1.4)} />
    </g>
  )
}

// The cover's banquet table: a long draped table running into the
// distance, chairs along the far side, flowers, candles and glasses.
export function BanquetTable({ className }) {
  return (
    <svg className={className} viewBox="0 0 400 270" aria-hidden="true">
      {/* chairs behind the table */}
      <Chair x={150} y={150} s={1.05} />
      <Chair x={215} y={138} s={0.95} />
      <Chair x={272} y={128} s={0.86} />
      <Chair x={322} y={120} s={0.78} />
      {/* the table hides what's behind it: cloth and top filled with paper */}
      <path d="M40 170 L 330 120 L 372 130 C 376 150, 370 168, 376 184 C 340 190, 300 202, 264 212 C 210 226, 140 246, 98 252 C 80 252, 60 248, 40 240 C 46 216, 36 196, 40 170 Z" fill={PAPER} />
      {/* table top + tablecloth drape */}
      <path d="M40 170 L 330 120 L 372 130 L 92 196 Z" {...S(C.sand, 1.5)} />
      <path d="M92 196 C 96 214, 90 236, 98 252 M 120 189 C 118 214, 128 232, 124 248 M 160 180 C 166 206, 156 226, 164 242 M 210 168 C 208 192, 218 210, 212 228 M 262 156 C 266 178, 258 196, 264 212 M 312 144 C 312 164, 320 180, 316 194 M 372 130 C 376 150, 370 168, 376 184" {...S(C.sand, 1.2)} />
      <path d="M98 252 C 140 246, 210 226, 264 212 C 300 202, 340 190, 376 184" {...S(C.sand, 1.2)} />
      <path d="M40 170 C 36 196, 46 216, 40 240 M 40 240 C 60 248, 80 252, 98 252" {...S(C.sand, 1.2)} />
      {/* plates */}
      <ellipse cx="120" cy="178" rx="15" ry="5" {...S(C.ink, 1)} />
      <ellipse cx="200" cy="162" rx="13" ry="4.4" {...S(C.ink, 1)} />
      <ellipse cx="275" cy="146" rx="11" ry="3.8" {...S(C.ink, 1)} />
      {/* candles */}
      <Candle x={150} y={170} h={40} />
      <Candle x={236} y={154} h={36} />
      <Candle x={300} y={141} h={30} />
      {/* glasses */}
      <Glass x={100} y={180} s={0.9} color={C.ink} />
      <Glass x={180} y={168} s={0.85} />
      <Glass x={255} y={152} s={0.75} />
      {/* flower arrangements */}
      <g>
        <path d="M70 170 C 66 150, 74 136, 70 120 M 76 168 C 84 150, 86 140, 96 128" {...S(C.sage, 1.2)} />
        <Leaf x={66} y={146} a={-60} /><Leaf x={84} y={150} a={-20} />
        <Bloom x={70} y={118} r={9} /><Bloom x={96} y={126} r={7} color={C.pink} center={C.rasp} /><Bloom x={60} y={134} r={6} />
      </g>
      <g>
        <path d="M200 160 C 196 140, 204 128, 200 112 M 206 158 C 214 142, 218 132, 226 122" {...S(C.sage, 1.2)} />
        <Leaf x={196} y={136} a={-70} /><Leaf x={214} y={140} a={-25} />
        <Bloom x={200} y={110} r={8} color={C.pink} center={C.rasp} /><Bloom x={226} y={120} r={6.5} /><Bloom x={188} y={124} r={5.5} />
      </g>
      <g>
        <path d="M318 136 C 316 122, 322 112, 318 100" {...S(C.sage, 1.1)} />
        <Leaf x={316} y={118} a={-60} l={10} />
        <Bloom x={318} y={98} r={6.5} /><Bloom x={334} y={106} r={5} color={C.pink} center={C.rasp} />
      </g>
      {/* chair in front */}
      <Chair x={48} y={232} s={1.15} flip />
    </svg>
  )
}

export function DiscoBall({ className }) {
  const rows = [-14, -7, 0, 7, 14]
  return (
    <svg className={className} viewBox="0 0 100 110" aria-hidden="true">
      <path d="M50 2 V 26" {...S(C.ink, 1.2)} />
      <circle cx="50" cy="62" r="34" {...S(C.sand, 1.6)} />
      {rows.map((dy) => <ellipse key={dy} cx="50" cy={62 + dy * 2} rx={Math.sqrt(34 * 34 - (dy * 2) ** 2)} ry={3} {...S(C.sand, 1)} />)}
      {[-24, -12, 0, 12, 24].map((dx) => <ellipse key={dx} cx="50" cy="62" rx={Math.abs(dx) + 0.5} ry="34" {...S(C.sand, 1)} />)}
      <path d="M78 22 v 8 M 74 26 h 8 M 16 30 v 6 M 13 33 h 6 M 88 54 l 6 -3 M 10 70 l -6 2" {...S(C.gold, 1.3)} />
      <path d="M58 46 l 6 -6 M 62 52 l 8 -4" {...S(C.blush, 1.2)} />
    </svg>
  )
}

// A bistro chair with a big raspberry bow tied to its back.
export function BowChair({ className }) {
  return (
    <svg className={className} viewBox="0 0 150 200" aria-hidden="true">
      <path d="M40 30 C 40 14, 96 14, 96 30 V 96" {...S(C.blue, 1.8)} />
      <path d="M40 30 V 100 M 48 30 V 96 M 88 30 V 96" {...S(C.blue, 1.2)} />
      <path d="M30 100 H 112 L 118 112 H 24 Z" {...S(C.blue, 1.6)} />
      <path d="M28 112 L 22 190 M 114 112 L 122 190 M 46 112 L 44 176 M 98 112 L 102 176 M 34 156 H 112" {...S(C.blue, 1.5)} />
      {/* bow */}
      <path d="M68 46 C 46 26, 22 34, 34 52 C 42 64, 60 54, 68 46 Z" {...S(C.rasp, 1.6)} />
      <path d="M68 46 C 92 24, 122 34, 108 54 C 98 66, 78 56, 68 46 Z" {...S(C.rasp, 1.6)} />
      <path d="M64 44 C 66 40, 72 40, 73 46 C 72 52, 66 52, 64 48 Z" {...S(C.rasp, 1.6)} />
      <path d="M66 50 C 58 76, 46 104, 30 130 C 40 128, 44 132, 46 138 M 71 50 C 82 82, 96 110, 112 150 C 104 146, 98 150, 96 156" {...S(C.rasp, 1.6)} />
      <path d="M40 46 C 46 44, 54 46, 60 48 M 98 44 C 92 44, 84 46, 76 48" {...S(C.pink, 1)} />
    </svg>
  )
}

// Little sketches for the day's plan, by name; ICON_NAMES is the order a
// plan item's sketch cycles through when tapped while editing.
export const ICON_NAMES = ['glasses', 'rings', 'plate', 'cake', 'disco', 'music', 'heart']

export function Sketch({ name, className }) {
  const box = { className, viewBox: '0 0 80 70', 'aria-hidden': 'true' }
  switch (name) {
    case 'rings':
      return (
        <svg {...box}>
          <circle cx="32" cy="42" r="15" {...S(C.ink, 1.6)} />
          <circle cx="48" cy="42" r="15" {...S(C.ink, 1.6)} />
          <path d="M44 22 l 4 -6 l 4 6 l -4 4 z" {...S(C.blue, 1.3)} />
          <path d="M16 18 v 5 M 13.5 20.5 h 5 M 66 22 v 4 M 64 24 h 4" {...S(C.gold, 1.2)} />
        </svg>
      )
    case 'plate':
      return (
        <svg {...box}>
          <ellipse cx="40" cy="44" rx="20" ry="14" {...S(C.ink, 1.4)} />
          <ellipse cx="40" cy="44" rx="13" ry="9" {...S(C.ink, 1)} />
          <path d="M12 30 v 26 M 9 30 v 6 c 0 3 6 3 6 0 v -6 M 68 30 c -4 3 -4 10 0 12 v 14" {...S(C.ink, 1.3)} />
          <path d="M40 36 c -8 -8 -16 -2 -10 4 c 4 3 8 0 10 -4 z M 40 36 c 8 -8 16 -2 10 4 c -4 3 -8 0 -10 -4 z M 38 38 l -5 10 M 42 38 l 5 10" {...S(C.rasp, 1.3)} />
        </svg>
      )
    case 'cake':
      return (
        <svg {...box}>
          <path d="M18 62 h 44 M 22 62 v -16 h 36 v 16 M 28 46 v -12 h 24 v 12" {...S(C.ink, 1.4)} />
          <path d="M22 52 c 4 3 8 3 12 0 s 8 -3 12 0 s 8 3 12 0" {...S(C.blush, 1.3)} />
          <path d="M40 34 v -8 M 40 22 c -2 -2 -2 -4 0 -6 c 2 2 2 4 0 6 z" {...S(C.gold, 1.2)} />
          <circle cx="34" cy="40" r="1.6" fill={C.rasp} /><circle cx="46" cy="40" r="1.6" fill={C.rasp} />
        </svg>
      )
    case 'disco':
      return (
        <svg {...box}>
          <path d="M40 4 V 14" {...S(C.ink, 1.1)} />
          <circle cx="40" cy="38" r="22" {...S(C.sand, 1.5)} />
          <path d="M18 38 h 44 M 21 28 h 38 M 21 48 h 38 M 40 16 c -8 6 -8 38 0 44 M 40 16 c 8 6 8 38 0 44" {...S(C.sand, 1)} />
          <path d="M66 12 v 6 M 63 15 h 6 M 12 22 v 5 M 9.5 24.5 h 5" {...S(C.gold, 1.2)} />
        </svg>
      )
    case 'music':
      return (
        <svg {...box}>
          <path d="M28 52 V 22 l 26 -6 v 30" {...S(C.ink, 1.4)} />
          <ellipse cx="23" cy="53" rx="6" ry="4.4" {...S(C.ink, 1.4)} />
          <ellipse cx="49" cy="47" rx="6" ry="4.4" {...S(C.ink, 1.4)} />
          <path d="M28 30 l 26 -6" {...S(C.ink, 1.2)} />
          <path d="M64 14 v 6 M 61 17 h 6 M 12 36 l -4 -2 M 66 58 l 4 2" {...S(C.blush, 1.2)} />
        </svg>
      )
    case 'heart':
      return (
        <svg {...box}>
          <path d="M40 60 C 22 46, 12 36, 14 24 C 16 12, 32 10, 40 24 C 48 10, 64 12, 66 24 C 68 36, 58 46, 40 60 Z" {...S(C.rasp, 1.6)} />
          <path d="M26 24 c 2 -4 6 -6 10 -4" {...S(C.blush, 1.2)} />
        </svg>
      )
    default: // glasses
      return (
        <svg {...box}>
          <g transform="translate(32 60) rotate(-14)"><path d="M-7 -40 C -7 -24, -4 -17, 0 -16 C 4 -17, 7 -24, 7 -40 Z" {...S(C.ink, 1.4)} /><path d="M-6 -32 C -3 -30, 3 -30, 6 -32" {...S(C.gold, 1.1)} /><path d="M0 -16 V 0 M -6 0 H 6" {...S(C.ink, 1.4)} /></g>
          <g transform="translate(48 60) rotate(14)"><path d="M-7 -40 C -7 -24, -4 -17, 0 -16 C 4 -17, 7 -24, 7 -40 Z" {...S(C.ink, 1.4)} /><path d="M-6 -32 C -3 -30, 3 -30, 6 -32" {...S(C.gold, 1.1)} /><path d="M0 -16 V 0 M -6 0 H 6" {...S(C.ink, 1.4)} /></g>
          <path d="M40 10 c -2 -3 -7 -3 -7 1 c 0 3 4 5 7 8 c 3 -3 7 -5 7 -8 c 0 -4 -5 -4 -7 -1 z" fill={C.rasp} />
          <path d="M28 14 l -4 -3 M 52 14 l 4 -3" {...S(C.gold, 1.2)} />
        </svg>
      )
  }
}

// The «details» sketch: a vase of flowers, a gift with a bow, grapes, and
// a little cake on a stand.
export function DetailsSketch({ className }) {
  return (
    <svg className={className} viewBox="0 0 320 130" aria-hidden="true">
      {/* vase + flowers */}
      <path d="M40 122 C 26 110, 28 86, 40 76 H 70 C 82 86, 84 110, 70 122 Z" {...S(C.blue, 1.5)} />
      <path d="M44 76 C 40 60, 34 50, 28 42 M 55 76 C 56 58, 58 44, 56 30 M 66 76 C 72 62, 80 52, 88 46" {...S(C.sage, 1.2)} />
      <Leaf x={36} y={60} a={-120} l={11} /><Leaf x={58} y={52} a={-70} l={11} /><Leaf x={76} y={58} a={-30} l={11} />
      <Bloom x={28} y={38} r={9} /><Bloom x={56} y={26} r={10} color={C.pink} center={C.rasp} /><Bloom x={90} y={42} r={8} /><Bloom x={42} y={46} r={6} color={C.pink} center={C.rasp} />
      {/* gift */}
      <path d="M116 120 V 84 H 172 V 120 Z M 112 72 H 176 V 84 H 112 Z M 144 72 V 120" {...S(C.ink, 1.4)} />
      <path d="M144 72 C 128 54, 112 62, 124 72 M 144 72 C 160 54, 176 62, 164 72 M 132 84 L 124 100 M 156 84 L 166 102" {...S(C.rasp, 1.6)} />
      {/* grapes */}
      {[[206, 70], [218, 70], [230, 70], [212, 82], [224, 82], [218, 94], [200, 82]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="6.5" {...S(C.pink, 1.3)} />)}
      <path d="M218 62 c 0 -8 4 -12 10 -14 M 222 54 c 10 -6 18 -2 20 6" {...S(C.sage, 1.3)} />
      {/* cake on a stand */}
      <path d="M262 122 h 36 M 280 122 v -14 M 256 108 h 48 M 264 108 v -16 h 32 v 16" {...S(C.ink, 1.4)} />
      <path d="M264 98 c 4 3 8 3 12 0 s 8 -3 12 0 s 6 3 8 0" {...S(C.blush, 1.3)} />
      <path d="M280 92 c -6 -6 -12 -2 -8 2 c 3 2 6 0 8 -2 z M 280 92 c 6 -6 12 -2 8 2 c -3 2 -6 0 -8 -2 z" {...S(C.rasp, 1.2)} />
      <path d="M100 30 l 6 6 M 106 30 l -6 6 M 236 30 l 5 5 M 241 30 l -5 5 M 186 112 h 6" {...S(C.rasp, 1.3)} />
    </svg>
  )
}

// A candle chandelier with crystal drops, bead garlands swagged to both sides.
export function Chandelier({ className }) {
  const drops = [96, 118, 140, 162, 184, 206, 228]
  return (
    <svg className={className} viewBox="0 0 320 150" aria-hidden="true">
      <path d="M-4 18 C 40 42, 90 44, 126 28 M 324 18 C 280 42, 230 44, 194 28" {...S(C.sand, 1.2)} strokeDasharray="0.1 6" strokeWidth="3.4" />
      <path d="M-4 40 C 30 58, 70 60, 104 48 M 324 40 C 290 58, 250 60, 216 48" {...S(C.sand, 1.2)} strokeDasharray="0.1 6" strokeWidth="3" />
      <path d="M160 0 V 34" {...S(C.ink, 1.2)} />
      <circle cx="160" cy="40" r="6" {...S(C.ink, 1.2)} />
      <path d="M160 46 V 92 M 148 92 h 24 l -4 10 h -16 z" {...S(C.ink, 1.3)} />
      <path d="M160 72 C 140 72, 118 76, 106 90 M 160 72 C 180 72, 202 76, 214 90 M 160 62 C 146 62, 132 64, 126 74 M 160 62 C 174 62, 188 64, 194 74" {...S(C.ink, 1.3)} />
      {[106, 126, 160, 194, 214].map((x, i) => (
        <g key={x}>
          <path d={`M${x - 6} ${[90, 74, 46, 74, 90][i]} h 12`} {...S(C.ink, 1.2)} />
          <Candle x={x} y={[90, 74, 46, 74, 90][i]} h={[26, 30, 24, 30, 26][i]} />
        </g>
      ))}
      <path d="M104 96 C 120 112, 200 112, 216 96" {...S(C.blush, 1.2)} />
      {drops.map((x, i) => <path key={x} d={`M${x} ${106 + Math.sin(i) * 3} l 3 6 l -3 7 l -3 -7 z`} {...S(C.pink, 1)} />)}
      <path d="M160 102 v 12 l 4 8 l -4 9 l -4 -9 l 4 -8" {...S(C.pink, 1.1)} />
    </svg>
  )
}

// One heart for the colour palette; `wob` bends it a little so the row
// looks hand-drawn rather than stamped.
export function PaletteHeart({ color, wob = 0 }) {
  return (
    <svg viewBox="0 0 60 56" aria-hidden="true">
      <path d={`M30 ${52 + wob} C ${12 - wob} 38, 2 28, 4 16 C 6 4, ${22 + wob} 0, 30 ${14 - wob} C ${38 - wob} 0, 54 4, 56 16 C 58 28, ${48 + wob} 38, 30 ${52 + wob} Z`} fill={color} />
    </svg>
  )
}
