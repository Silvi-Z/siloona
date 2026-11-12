import Editable from '../../shared/Editable'
import { useInvitationContent } from '../../shared/EditableContext'
import { bow, goslingSvg, paradeSvg } from '../lib/art'
import { Art, Decor } from './bits'

const z3 = { position: 'relative', zIndex: 3 }

// Name letters drift in one by one (source's .nm .ch); in edit mode the
// line is a plain editable field instead.
function NameLine() {
  const { data, editing } = useInvitationContent()
  if (editing) return <h1 className="nm" style={z3}><Editable path="title" /></h1>
  return (
    <h1 className="nm" style={z3} aria-label={data.title}>
      {Array.from(String(data.title || '')).map((c, i) => (
        c === ' ' ? ' ' : <span key={i} className="ch" aria-hidden="true" style={{ '--i': i }}>{c}</span>
      ))}
    </h1>
  )
}

export default function Hero() {
  return (
    <section className="hero" id="top">
      <Decor id="d0" />
      <p className="kick seq" style={{ '--i': 0, ...z3 }}><Editable path="kicker" /></p>
      <NameLine />
      <div className="five" style={z3}>
        <Editable as="b" path="age" />
        <Art className="perch" aria-hidden="true" svg={goslingSvg()} />
        <Art className="bw" aria-hidden="true" svg={bow()} />
      </div>
      <p className="yrs seq" style={{ '--i': 7, ...z3 }}><Editable path="ageLabel" /></p>
      <div className="seq" style={{ '--i': 8, ...z3 }}><Editable as="p" path="heroText" className="t" /></div>
      <div className="parade"><Art svg={paradeSvg()} /></div>
    </section>
  )
}
