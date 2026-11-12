import { useRef } from 'react'
import { useLaceFrame } from '../lib/useLaceFrame'

// The lace-bordered box used around the hero photo and the dress-code
// panel. Reusable for any future design that wants the same decorative
// frame treatment.
export default function LaceFrame({ square, ariaLabel, style, children }) {
  const boxRef = useRef(null)
  const svgRef = useLaceFrame(boxRef)

  return (
    <div
      ref={boxRef}
      className={`lc rv${square ? ' sq' : ''}`}
      style={style}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
    >
      <svg className="lace" ref={svgRef} aria-hidden="true" />
      {children}
    </div>
  )
}
