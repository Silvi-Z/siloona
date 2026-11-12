// One floating, clickable animal illustration — used ×3 in Hero's "crew"
// (with `seq`/`i` set, so it gets the curtain-opening pop-in stagger) and
// ×2 in RsvpForm's "duo" (no pop-in in the source demo, just the float).
// A real shared component since it's the same element 5 times with only
// the asset/sizing/parallax factor differing.
export default function AnimalFigure({ src, alt, height, duration = '5s', delay = '0s', k = 0, i, seq = false, onClick }) {
  function handleClick(e) {
    const img = e.currentTarget
    img.classList.remove('boop')
    // eslint-disable-next-line no-unused-expressions
    img.offsetWidth // force reflow so re-adding the class restarts the animation
    img.classList.add('boop')
    onClick?.(e)
  }

  return (
    <div className={`an-w${seq ? ' seq' : ''}`} style={{ '--k': k, ...(seq ? { '--i': i } : {}) }}>
      <img
        className="an"
        style={{ '--h': height, '--d': duration, '--dl': delay }}
        src={src}
        alt={alt}
        onClick={handleClick}
      />
    </div>
  )
}
