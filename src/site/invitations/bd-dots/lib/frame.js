// Where the watercolour dots of the cover go, for a W × H cover: they fill
// everything outside an oval round the words (`keep`, the box the words
// take), touching and overlapping a little, running off the page edges —
// as in the reference. The same size always gives the same frame (seeded),
// so it doesn't reshuffle between visits.
//
// Each dot: { x, y } its centre, s its diameter (px), k which of the 24
// dots in assets/dots.webp, rot a turn, f a float duration (s) or 0.

export const SHEET = { cols: 6, rows: 4, count: 24 }

function rng(seed) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

export function frameDots(W, H, keep, seed = 417) {
  if (!(W > 0 && H > 0)) return []
  const R = rng(seed)
  const unit = Math.min(W, 560)
  const sMin = unit * 0.12
  const sMax = unit * 0.2
  // The oval the words sit in, a little larger than their box.
  const k = keep || { l: W / 2, r: W / 2, t: H / 2, b: H / 2 }
  const cx = (k.l + k.r) / 2
  const cy = (k.t + k.b) / 2
  const a = Math.max(1, ((k.r - k.l) / 2) * 1.02)
  const b = Math.max(1, ((k.b - k.t) / 2) * 1.1)
  // Distance (px, roughly) from a point to the oval's edge; < 0 inside.
  const fromOval = (x, y) => (Math.sqrt(((x - cx) / a) ** 2 + ((y - cy) / b) ** 2) - 1) * Math.min(a, b)

  const dots = []
  for (let tries = 0; tries < 2600 && dots.length < 170; tries++) {
    const s = sMin + R() * (sMax - sMin)
    const x = -s * 0.3 + R() * (W + s * 0.6)
    const y = -s * 0.3 + R() * (H + s * 0.6)
    if (fromOval(x, y) < s * 0.5) continue
    // touching, overlapping by a quarter at most
    if (dots.some((d) => Math.hypot(d.x - x, d.y - y) < (d.s + s) * 0.37)) continue
    dots.push({
      x, y, s,
      k: Math.floor(R() * SHEET.count),
      rot: Math.round(R() * 360),
      f: R() < 0.3 ? 5 + R() * 4 : 0,
    })
  }
  // Ordered around the centre, so they can appear one after another.
  for (const d of dots) d.a = Math.atan2(d.y - cy, d.x - cx)
  return dots.sort((p, q) => p.a - q.a)
}
