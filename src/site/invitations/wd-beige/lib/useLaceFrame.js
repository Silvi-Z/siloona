import { useEffect, useRef } from 'react'
import { laceFrameSvg } from './svgAssets'

// Measures the lace-framed box once on mount and injects the matching
// procedural border pattern, sized to that box's exact pixel dimensions
// (mirrors the original's `.lc[data-lace]` ring-builder). The box scales
// responsively afterwards via the SVG's own viewBox-to-container stretch,
// same as the source demo — no resize re-generation needed.
export function useLaceFrame(boxRef) {
  const svgRef = useRef(null)

  useEffect(() => {
    const box = boxRef.current
    const svg = svgRef.current
    if (!box || !svg) return
    const w = box.clientWidth || 300
    const h = box.clientHeight || 430
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
    svg.innerHTML = laceFrameSvg(w, h)
  }, [boxRef])

  return svgRef
}
