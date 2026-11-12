import Editable from '../../shared/Editable'
import Section, { useSectionHidden } from '../../shared/Section'
import { gooseSvg } from '../lib/art'
import { Art, Decor, GreetingHeading, Rv } from './bits'

const MAMA = gooseSvg({ chick: 1, shut: 1, flip: 1 }).replace('aria-hidden="true"', 'role="img" aria-label="Մայր սագը՝ ճտիկով"')

// Greeting + message + mother goose. Each text can be hidden on its own;
// the section disappears only when both are.
export default function MessageSection() {
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message')) return null
  return (
    <section>
      <Decor id="d1" />
      <div className="z3">
        <Section id="greeting"><GreetingHeading /></Section>
        <Section id="message">
          <Rv style={{ '--dl': '.1s' }}><Editable as="p" path="message" className="t" /></Rv>
        </Section>
        <Rv><Art className="mama" svg={MAMA} /></Rv>
      </div>
    </section>
  )
}
