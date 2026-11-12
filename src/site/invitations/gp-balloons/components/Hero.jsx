import Editable from '../../shared/Editable'
import { formatEventDate } from '../lib/formatDate'
import Rv from './Rv'

const FLAG_COLORS = ['#8fc4e6', '#fbdde5', '#d8bb8c', '#ef9fb4', '#d9ecf8']
const FLAGS = Array.from({ length: 16 }, (_, i) => {
  const x = 25 + i * 48
  const y = 8 + Math.sin((i / 15) * Math.PI * 2) * 12
  return { d: `M${x - 14} ${y + 4}L${x + 14} ${y + 4}L${x} ${y + 44}Z`, fill: FLAG_COLORS[i % 5] }
})

function Balloon({ className, fill, string, stringColor }) {
  return (
    <svg className={className} viewBox="0 0 100 220">
      <use href="#gpb-balloon" fill={fill} />
      <ellipse cx="30" cy="30" rx="9" ry="16" fill="#fff" opacity=".45" transform="rotate(25 30 30)" />
      <path d={string} fill="none" stroke={stringColor} strokeWidth="1" />
    </svg>
  )
}

export default function Hero({ onOpen }) {
  return (
    <section className="hero wash" id="top">
      <svg className="bunting" viewBox="0 0 800 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 8Q200 40 400 12T800 8" fill="none" stroke="#d8bb8c" strokeWidth="1.2" />
        {FLAGS.map((f, i) => <path key={i} d={f.d} fill={f.fill} opacity=".9" />)}
      </svg>
      <div className="hero-in">
        <Rv as="p" className="kicker"><Editable path="kicker" /></Rv>
        <Rv as="h1">
          <Editable as="span" path="title.first" />
          <Editable as="span" path="title.or" className="or" />
          <Editable as="span" path="title.second" />
        </Rv>
        <div className="balloons" aria-hidden="true">
          <Balloon className="b1" fill="url(#gpb-gB)" string="M50 121C40 150 62 170 48 210" stringColor="#b9c7d1" />
          <Balloon className="b2" fill="url(#gpb-gP)" string="M50 121C60 150 38 170 52 210" stringColor="#d4bfc6" />
        </div>
        <Rv as="p" className="date">
          <Editable path="eventDate" type="date" format={(iso) => formatEventDate(iso).hero} />
        </Rv>
        <Rv as="p" className="who">
          <Editable path="parents.first" /> և <Editable path="parents.second" /> <Editable path="parents.trail" />
        </Rv>
        <Rv>
          <a className="scroll" href="#gpb-invite" onClick={onOpen}>ԲԱՑԵԼ ՀՐԱՎԵՐԸ</a>
        </Rv>
      </div>
    </section>
  )
}
