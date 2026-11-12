import Editable from '../../shared/Editable'
import { paradeSvg } from '../lib/art'
import { Art, Decor, Rv } from './bits'

export default function Closing() {
  return (
    <section className="end">
      <Decor id="d5" />
      <div className="z3">
        <Rv><Editable as="p" path="closing.title" className="we" /></Rv>
        <Rv style={{ marginTop: 14 }}><Editable as="p" path="closing.signature" className="lab" /></Rv>
      </div>
      <div className="parade"><Art svg={paradeSvg()} style={{ animationDuration: '46s', animationDelay: '-14s' }} /></div>
    </section>
  )
}
