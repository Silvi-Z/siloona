import { useEffect, useRef, useState } from 'react'
import { spawnDust } from '../lib/dust'
import { formatEventDate } from '../lib/formatDate'

// The envelope + wax-seal intro. Tapping (or Enter/Space) runs one
// sequence: the seal breaks, the flap folds back, the letter with the
// couple's names rises out of the pocket, then the whole gate fades into
// the invitation. Skipped entirely in edit mode (same as
// prefers-reduced-motion) so editing never requires replaying it.
const T_BEGIN = 2900 // hand off to the page (its own reveals start here)
const T_FADE = 2800 // gate starts fading
const T_DONE = 4300 // gate removed

export default function Gate({ data, editing, onBegin, rootRef }) {
  const [phase, setPhase] = useState('closed') // closed -> open -> fade -> done
  const sealRef = useRef(null)
  const openedRef = useRef(false)
  const timers = useRef([])

  // Re-checked whenever `editing` changes (not just on mount) so toggling
  // edit mode on while the gate is still up dismisses it immediately,
  // instead of only taking effect on the next full page load.
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
    if (openedRef.current) return
    openedRef.current = true
    const r = sealRef.current.getBoundingClientRect()
    spawnDust(rootRef.current, r.left + r.width / 2, r.top + r.height / 2)
    setPhase('open')
    timers.current.push(setTimeout(() => setPhase('fade'), T_FADE))
    timers.current.push(setTimeout(onBegin, T_BEGIN))
    timers.current.push(setTimeout(() => setPhase('done'), T_DONE))
  }

  if (phase === 'done') return null

  const { couple } = data
  const date = formatEventDate(data.eventDate)
  const cls = `wdb-gate${phase !== 'closed' ? ' gate-open' : ''}${phase === 'fade' ? ' fade' : ''}`
  const face = (
    <b className="face">
      <span>{couple.monogramLeft}</span><em>&amp;</em><span>{couple.monogramRight}</span>
    </b>
  )

  return (
    <div className={cls}>
      <div className="gc">
        <div className="gt">
          <p className="lab">Հրավիրատոմս</p>
          <p className="sub gsub">{data.eventType}</p>
          <h1 className="nm">
            <span>{couple.groomFirst}</span><b>&amp;</b><span>{couple.brideFirst}</span>
          </h1>
        </div>

        <div
          className="env"
          role="button"
          tabIndex={0}
          aria-label="Բացել ծրարը"
          onClick={open}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}
        >
          <div className="back" />

          <div className="letter" aria-hidden="true">
            <span className="l-lab">Հրավիրատոմս</span>
            <span className="l-nm">{couple.groomFirst} <b>&amp;</b> {couple.brideFirst}</span>
            <span className="l-dt">{date.short}</span>
          </div>

          <svg className="pocket" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true">
            <path className="ps" d="M0 0L148 112Q150 113.5 152 112L300 0V200H0Z" />
            <path className="pb" d="M0 200L146 106Q150 103.5 154 106L300 200Z" />
            <path className="pe" d="M0 0L148 112Q150 113.5 152 112L300 0M0 200L146 106Q150 103.5 154 106L300 200" />
          </svg>

          <div className="flap">
            <svg viewBox="0 0 300 118" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="wdb-flap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#f6ece6" />
                  <stop offset="1" stopColor="#ecdcd3" />
                </linearGradient>
              </defs>
              <path d="M0 0H300L153 116Q150 118 147 116Z" fill="url(#wdb-flap)" />
              <path d="M0 .5L147 116Q150 118 153 116L300 .5" fill="none" stroke="rgba(150,115,95,.28)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          <div className="seal" ref={sealRef}>
            <i className="ring" />
            <i className="half a">{face}</i>
            <i className="half b">{face}</i>
          </div>
        </div>

        <small><b>Սեղմեք</b>բացելու համար</small>
      </div>
    </div>
  )
}
