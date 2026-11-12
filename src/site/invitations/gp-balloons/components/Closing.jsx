import Editable from '../../shared/Editable'
import Rv from './Rv'

export default function Closing() {
  return (
    <section className="end wash">
      <div className="wrap">
        <Rv as="h2"><Editable path="closing.title" /></Rv>
        <Rv className="mini" aria-hidden="true">
          <svg viewBox="0 0 100 100" stroke="#4f9ccc" strokeWidth="2.2"><use href="#gpb-shoe" fill="#d9ecf8" /></svg>
          <svg viewBox="0 0 100 100" stroke="#d9708e" strokeWidth="2.2"><use href="#gpb-shoe" fill="#fbdde5" transform="translate(100 0) scale(-1 1)" /></svg>
        </Rv>
        <Rv><Editable as="p" path="closing.signature" className="sig" /></Rv>
      </div>
    </section>
  )
}
