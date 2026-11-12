import PlaceholderPhoto from './PlaceholderPhoto'
import Editable from '../../shared/Editable'
import Section from '../../shared/Section'

export default function DetailsSection({ data }) {
  return (
    <section data-par="">
      <Section id="gifts">
        <h2 className="h rv">Մանրամասներ</h2>
        <p className="sub rv" style={{ '--dl': '.1s', marginTop: 18 }}>նվերներ</p>
        <Editable as="p" path="gift.flowersText" className="t rv" />

        <p className="sub rv" style={{ marginTop: 38 }}>ծրար</p>
        <Editable as="p" path="gift.envelopeText" className="t rv" />

        <Editable as="p" path="gift.signature" className="sig rv" style={{ fontSize: 'clamp(34px,9vw,48px)', marginTop: 46 }} />
      </Section>

      <div
        className="lc sq rv"
        role="img"
        aria-label="Զույգի գրկախառնությունը"
        style={{ width: 'min(80%,280px)', marginTop: 14, aspectRatio: '1/1.18', background: 'none', boxShadow: 'none' }}
      >
        <PlaceholderPhoto scene={1} src={data.photos[1]} style={{ inset: 0 }} />
      </div>

      <Editable as="p" path="closingNames" className="nmz rv" />
    </section>
  )
}
