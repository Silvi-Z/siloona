import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import { sparkle } from '../lib/sparkle'
import { Crown } from './bits'
import castleImg from '../assets/castle.webp'
import { pick, useInvLang } from '../../shared/invLang'

const OPEN = { hy: 'Բացել հրավերը', ru: 'Открыть приглашение', en: 'Open the invitation' }

// The intro: the castle above a royal letter sealed with wax. Tapping the
// seal breaks it with a burst of stars, hands off to `onBegin`, fades out
// and unmounts. Skipped in edit mode and with reduced motion.
export default function Gate({ editing, onBegin, rootRef }) {
  const [phase, setPhase] = useState('closed') // closed -> open -> fade -> done
  const lang = useInvLang()
  const sealRef = useRef(null)
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
    const r = sealRef.current?.getBoundingClientRect()
    if (r) sparkle(rootRef.current, r.left + r.width / 2, r.top + r.height / 2, 22, 160)
    timers.current.push(setTimeout(onBegin, 900))
    timers.current.push(setTimeout(() => setPhase('fade'), 1000))
    timers.current.push(setTimeout(() => setPhase('done'), 2600))
  }

  if (phase === 'done') return null

  return (
    <div
      className={`bdc-gate${phase !== 'closed' ? ' gate-open' : ''}${phase === 'fade' ? ' fade' : ''}`}
      role="button" tabIndex={0} aria-label={pick(OPEN, lang)}
      onClick={open}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}
    >
      <div className="gc">
        <img className="gcastle" src={castleImg} alt="" />
        <Editable as="p" path="gate.kicker" className="gk" />
        <span className="seal" ref={sealRef}>
          <span className="half l" /><span className="half rt" />
          <Crown />
        </span>
        <Editable as="p" path="gate.hint" className="gh" />
      </div>
    </div>
  )
}
