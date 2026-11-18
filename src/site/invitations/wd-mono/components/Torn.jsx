import { useMemo } from 'react'

// A torn paper edge laid over a photo's top or bottom: the paper colour
// with a jagged, fibrous line, and behind it a lighter grey "deckle" strip
// (the torn paper's thickness) that shows a few pixels beyond it. Each
// edge has its own seed, so no two tears look alike. Pure SVG, scales to
// any width (the jag size stays proportional).

function rng(seed) {
  let s = seed >>> 0 || 1
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32 }
}

// A jagged line across a 400-wide box: big slow "mountains" plus fine teeth.
function tearLine(seed, base, amp) {
  const r = rng(seed)
  const pts = []
  let x = 0
  let swell = 0
  while (x <= 400) {
    swell += (r() - 0.5) * amp * 0.9
    swell = Math.max(-amp, Math.min(amp, swell * 0.88))
    const tooth = (r() - 0.5) * amp * 0.55
    pts.push([x, base + swell + tooth])
    x += 2 + r() * 6
  }
  pts.push([400, pts.at(-1)[1]])
  return pts
}

export default function Torn({ side = 'bottom', seed = 1, color = 'var(--paper)', deckle = 'var(--deckle)', height = 34 }) {
  const { paper, back } = useMemo(() => {
    const line = tearLine(seed, 18, 13)
    const back2 = tearLine(seed * 7 + 3, 13, 15)
    const toPath = (pts) => `M0 40 L${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} L400 40 Z`
    return { paper: toPath(line), back: toPath(back2) }
  }, [seed])
  return (
    <svg
      className={`torn torn-${side}`} viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true"
      style={{ height, transform: side === 'top' ? 'scaleY(-1)' : undefined }}
    >
      <path d={back} fill={deckle} />
      <path d={paper} fill={color} />
    </svg>
  )
}
