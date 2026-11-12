import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { gooseSvg } from '../lib/art'
import { puff } from '../lib/puff'
import { Art } from './bits'

const GATE_GOOSE = `<svg viewBox="-6 0 280 280" aria-hidden="true"><g class="bobg">${gooseSvg({ chick: 1, shut: 1 }).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g></svg>`

// "Tap the goose" intro. Opening makes the goose hop, puffs feathers, hands
// off to `onBegin`, fades out, then unmounts. Skipped in edit mode and with
// reduced motion — same pattern as bd-animals/components/Gate.jsx.
export default function Gate({ editing, onBegin, rootRef }) {
  const [phase, setPhase] = useState('closed') // closed -> open -> fade -> done
  const ggRef = useRef(null)
  const timers = useRef([])

  useEffect(() => {
    if (phase === 'done') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || editing) { setPhase('done'); onBegin() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function open() {
    if (phase !== 'closed') return
    setPhase('open')
    const r = ggRef.current?.getBoundingClientRect()
    if (r) puff(rootRef.current, r.left + r.width / 2, r.top + r.height * 0.3, 16)
    timers.current.push(setTimeout(onBegin, 1100))
    timers.current.push(setTimeout(() => setPhase('fade'), 1500))
    timers.current.push(setTimeout(() => setPhase('done'), 3600))
  }

  if (phase === 'done') return null

  return (
    <div
      className={`bdd-gate${phase !== 'closed' ? ' gate-open' : ''}${phase === 'fade' ? ' fade' : ''}`}
      role="button" tabIndex={0} aria-label="Բացել հրավերը"
      onClick={open}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}
    >
      <div className="gc">
        <Editable as="p" path="gate.kicker" className="k" />
        <Art className="gg" svg={GATE_GOOSE} ref={ggRef} />
        <Editable as="p" path="gate.hint" />
      </div>
    </div>
  )
}
