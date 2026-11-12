import { useMemo } from 'react'
import { monogramSvg } from '../lib/svgAssets'

export default function Monogram({ left, right }) {
  const markup = useMemo(() => monogramSvg(left, right), [left, right])
  return <div className="mono" aria-hidden="true" dangerouslySetInnerHTML={{ __html: markup }} />
}
