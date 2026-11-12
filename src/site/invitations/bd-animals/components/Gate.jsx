import { useEffect, useRef, useState } from 'react'
import { burst } from '../lib/confetti'
import Editable from '../../shared/Editable'
import lionTeaser from '../assets/lion.webp'

// The storybook-curtain intro. Opening slides the two curtain halves
// apart, hands off to `onBegin` once the scene behind it is ready to
// animate in, then unmounts. Skipped entirely in edit mode (same as
// prefers-reduced-motion) so editing never requires replaying it — same
// pattern as wd-beige/components/Gate.jsx's envelope.
export default function Gate({ editing, onBegin, rootRef }) {
  const [phase, setPhase] = useState('closed') // closed -> open -> done
  const btnRef = useRef(null)
  const timers = useRef([])

  useEffect(() => {
    if (phase === 'done') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || editing) {
      setPhase('done')
      onBegin()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function open() {
    setPhase('open')
    const r = btnRef.current?.getBoundingClientRect()
    timers.current.push(setTimeout(() => {
      onBegin()
      if (r) burst(rootRef.current, r.left + r.width / 2, r.top, 46)
    }, 600))
    timers.current.push(setTimeout(() => setPhase('done'), 2300))
  }

  if (phase === 'done') return null

  return (
    <div className={`bda-gate${phase === 'open' ? ' open' : ''}`}>
      <div className="cur l"><i /></div>
      <div className="cur r"><i /></div>
      <div className="gc">
        <img src={lionTeaser} alt="" className="gimg" />
        <Editable as="p" path="gate.teaser" className="gt" />
        <button ref={btnRef} type="button" className="gbtn" onClick={open}>Բացել հրավիրատոմսը</button>
      </div>
    </div>
  )
}
