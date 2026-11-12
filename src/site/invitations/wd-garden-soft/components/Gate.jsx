import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { Cluster, Frame } from './parts'

// "Tap anywhere, fly through the arch." Opening zooms the arch away, starts
// the music (the tap is the user gesture browsers require), hands off to
// `onBegin`, fades, then unmounts. Skipped in edit mode and with reduced
// motion — same pattern as the other designs' gates.
export default function Gate({ editing, onBegin, onOpen }) {
  const [phase, setPhase] = useState('closed') // closed -> open -> fade -> done
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
    onOpen?.()
    timers.current.push(setTimeout(onBegin, 700))
    timers.current.push(setTimeout(() => setPhase('fade'), 1100))
    timers.current.push(setTimeout(() => setPhase('done'), 2800))
  }

  if (phase === 'done') return null

  return (
    <div
      className={`wgs-gate${phase !== 'closed' ? ' open' : ''}${phase === 'fade' ? ' fade' : ''}`}
      role="button" tabIndex={0} aria-label="Բացել հրավիրատոմսը"
      onClick={open} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}
    >
      <div className="stripes" />
      <div className="cw gcw">
        <Frame />
        <div className="ci">
          <Editable as="p" path="gate.lead" className="g0" />
          <p className="g1" style={{ marginTop: '6cqw' }}><Editable path="gate.line1" /><br /><Editable path="gate.line2" /></p>
          <div className="dv"><i /></div>
          <p className="mar" style={{ fontStyle: 'normal' }}><Editable path="couple.first" /> &amp; <Editable path="couple.second" /></p>
        </div>
        <Cluster k="A" style={{ left: '-30%', top: '-8%', width: '58%' }} delay=".5s" still />
      </div>
      <p className="gh"><Editable path="gate.hint1" /><br /><Editable path="gate.hint2" /></p>
    </div>
  )
}
