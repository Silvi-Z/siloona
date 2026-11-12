import SplitWords from './SplitWords'
import Editable from '../../shared/Editable'
import Section, { useSectionHidden } from '../../shared/Section'

const mapUrl = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`

function Place({ path, place }) {
  return (
    <div className="pl rv">
      <Editable as="p" path={`${path}.title`} className="lab" />
      <Editable as="p" path={`${path}.time`} className="pl-tm" />
      <p className="t">
        <Editable path={`${path}.name`} /><br /><Editable path={`${path}.address`} className="pl-ad" />
      </p>
      <a className="pill" href={mapUrl(place.address)} target="_blank" rel="noopener noreferrer">Բացել քարտեզը</a>
    </div>
  )
}

// The ceremony (church) and the celebration, each with its own time and
// map link. Either can be hidden; the section goes when both are.
export default function PlacesSection({ data }) {
  const isHidden = useSectionHidden()
  const both = !isHidden('ceremony') && !isHidden('venue')
  if (isHidden('ceremony') && isHidden('venue')) return null
  return (
    <section className="places">
      <SplitWords text="Վայրը" className="sub rv" style={{ fontSize: 'clamp(40px,11vw,60px)' }} />
      <Section id="ceremony"><Place path="ceremony" place={data.ceremony} /></Section>
      {both && <i className="pl-sep rv" aria-hidden="true" />}
      <Section id="venue"><Place path="venue" place={data.venue} /></Section>
    </section>
  )
}
