import Editable from '../../shared/Editable'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { Decor, Rv, SplitHeading } from './bits'

const IDS = ['details', 'schedule', 'dressCode', 'gifts']

// Venue, day program and the two note cards (dress code, gifts) share one
// page section; each hides on its own, the section only when all do.
export default function VenueSection() {
  const { data } = useInvitationContent()
  const isHidden = useSectionHidden()
  if (IDS.every(isHidden)) return null
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.venue.address || data.venue.name)}`
  return (
    <section>
      <Decor id="d3" />
      <div className="z3">
        <Section id="details">
          <SplitHeading text="Տոնի վայրը" />
          <Rv className="vn rv" style={{ '--dl': '.1s' }}>
            <svg className="pin" viewBox="0 0 24 32" aria-hidden="true"><path d="M12 0C5 0 0 5 0 12c0 9 12 20 12 20s12-11 12-20C24 5 19 0 12 0Zm0 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" /></svg>
            <Editable as="p" path="venue.name" className="v" />
            <Editable as="p" path="venue.address" className="a" />
            <a className="btn" href={mapUrl} target="_blank" rel="noopener noreferrer">Բացել քարտեզը</a>
          </Rv>
        </Section>
        <Section id="schedule">
          <SplitHeading text="Օրվա ծրագիր" style={{ marginTop: isHidden('details') ? 0 : 'clamp(60px,11vw,90px)' }} />
          <Rv className="tl rv">
            {data.schedule.map((_, i) => (
              <div key={i}>
                <Editable as="time" path={`schedule.${i}.time`} />
                <Editable path={`schedule.${i}.label`} />
              </div>
            ))}
          </Rv>
        </Section>
        {!(isHidden('dressCode') && isHidden('gifts')) && (
          <div className="nts">
            <Section id="dressCode">
              <Rv className="cd rv"><b>Հագուստ</b><Editable as="p" path="dressCode.text" /></Rv>
            </Section>
            <Section id="gifts">
              <Rv className="cd rv" style={{ '--dl': '.1s' }}><b>Նվերներ</b><Editable as="p" path="gifts.text" /></Rv>
            </Section>
          </div>
        )}
      </div>
    </section>
  )
}
