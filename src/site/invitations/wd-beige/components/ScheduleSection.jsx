import Timeline from './Timeline'
import DressCode from './DressCode'
import Section, { useSectionHidden } from '../../shared/Section'

// Schedule and dress code share one page section; each can be hidden on
// its own, and the section disappears only when both are.
export default function ScheduleSection({ data }) {
  const isHidden = useSectionHidden()
  if (isHidden('schedule') && isHidden('dressCode')) return null
  return (
    <section data-par="">
      <Section id="schedule">
        <h2 className="h rv">Ժամանակացույց</h2>
        <p className="sub rv" style={{ '--dl': '.1s' }}>միջոցառման</p>
        <Timeline items={data.schedule} />
      </Section>
      <Section id="dressCode">
        <DressCode />
      </Section>
    </section>
  )
}
