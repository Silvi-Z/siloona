import { useMemo } from 'react'
import { placeholderScene } from '../lib/svgAssets'

// The generated black & white "photograph" panel. Pass a real `src` (from
// data.photos) to use an actual image instead of the procedural scene.
export default function PlaceholderPhoto({ scene, src, style }) {
  const markup = useMemo(() => placeholderScene(scene, scene), [scene])

  if (src) {
    return (
      <div className="ph" style={style}>
        <img src={src} alt="" />
      </div>
    )
  }

  return <div className="ph" style={style} dangerouslySetInnerHTML={{ __html: markup }} />
}
