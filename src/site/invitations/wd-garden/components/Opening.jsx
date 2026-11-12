import { useEffect, useState } from 'react'
import Editable from '../../shared/Editable'
import { useInvitationContent } from '../../shared/EditableContext'
import { SKY } from '../lib/art'
import { Band } from './parts'

// The names in the scalloped cream cartouche, rising one line at a time.
function Cartouche({ editable }) {
  const { data } = useInvitationContent()
  const { first, second } = data.couple
  return (
    <div className="cart">
      <span>{editable ? <Editable path="couple.first" /> : first}</span>
      <span><i>և</i></span>
      <span>{editable ? <Editable path="couple.second" /> : second}</span>
    </div>
  )
}

// The cream entrance: blossom bands grow in at once; tap (or wait 4.6s)
// and it zooms away. Its `.go` comes from the parent's `opened`.
export function Gate({ opened, onOpen }) {
  const { data } = useInvitationContent()
  const [grown, setGrown] = useState(false)
  useEffect(() => { const r = requestAnimationFrame(() => setGrown(true)); return () => cancelAnimationFrame(r) }, [])
  const key = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }
  return (
    <div className={`gate${opened ? ' go' : ''}`} role="button" tabIndex={0} aria-label="Բացել հրավերը" onClick={onOpen} onKeyDown={key}>
      <Band seed={3} className="t" on={grown} />
      <Cartouche />
      <Band seed={9} bottom className="b" on={grown} />
      <small>{data.gate.hint}</small>
    </div>
  )
}

// Golden-hour garden scene; layers carry data-m for the parallax. The
// bands bloom .5s after the gate opens.
export function Hero({ bloom }) {
  return (
    <header className="hero">
      <svg className="sc" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g dangerouslySetInnerHTML={{ __html: SKY }} />
        <g data-m="3"><use href="#wgd-far" /></g><g data-m="7"><use href="#wgd-near" /></g><g data-m="14"><use href="#wgd-trees" /></g>
      </svg>
      <Band seed={21} className="bt" on={bloom} />
      <p className="lab"><Editable path="hero.label" /></p>
      <Cartouche editable />
      <Band seed={34} bottom className="bb" on={bloom} />
      <div className="scrollcue" aria-hidden="true" />
    </header>
  )
}

export function Footer() {
  const { data } = useInvitationContent()
  return (
    <footer className="foot">
      <svg className="sc" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g dangerouslySetInnerHTML={{ __html: SKY }} /><g data-m="-4"><use href="#wgd-far" /></g><g data-m="-8"><use href="#wgd-trees" /></g>
      </svg>
      <p className="t2">{data.couple.second}<i>և</i>{data.couple.first}<small><Editable path="closing.line" /></small></p>
    </footer>
  )
}
