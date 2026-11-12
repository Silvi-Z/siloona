const COLORS = ['#8fc4e6', '#ef9fb4', '#d8bb8c', '#fbdde5', '#d9ecf8']

// The source demo's one celebratory moment: a canvas confetti burst after
// a guest confirms they're coming. The canvas belongs to the invitation's
// own root (position:fixed, pointer-events:none).
export function confetti(canvas) {
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const ctx = canvas.getContext('2d')
  const w = (canvas.width = window.innerWidth)
  const h = (canvas.height = window.innerHeight)
  const parts = Array.from({ length: 140 }, (_, i) => ({
    x: w / 2 + (Math.random() - 0.5) * 80,
    y: h * 0.65,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 17 - 5,
    s: 4 + Math.random() * 6,
    r: Math.random() * 6,
    vr: (Math.random() - 0.5) * 0.3,
    c: COLORS[i % COLORS.length],
  }))
  let frame = 0
  ;(function step() {
    ctx.clearRect(0, 0, w, h)
    for (const p of parts) {
      p.vy += 0.4; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.r += p.vr
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r)
      ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2)
      ctx.restore()
    }
    if (++frame < 150) requestAnimationFrame(step)
    else ctx.clearRect(0, 0, w, h)
  })()
}
