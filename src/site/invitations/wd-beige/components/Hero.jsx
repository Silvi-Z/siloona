import Monogram from './Monogram'
import SplitName from './SplitName'
import LaceFrame from './LaceFrame'
import PlaceholderPhoto from './PlaceholderPhoto'
import Editable from '../../shared/Editable'
import Section from '../../shared/Section'
import GuestGreeting from '../../shared/GuestGreeting'
import { useInvitationContent } from '../../shared/EditableContext'
import { formatEventDate } from '../lib/formatDate'
import { calendarUrl } from '../lib/calendar'

export default function Hero({ data }) {
  const { editing } = useInvitationContent()
  const cal = calendarUrl({
    title: `${data.couple.groomFirst} և ${data.couple.brideFirst} · հարսանիք`,
    iso: data.eventDate,
    location: [data.venue.name, data.venue.address].filter(Boolean).join(', '),
  })

  return (
    <section className="hero" id="top">
      <Monogram left={data.couple.monogramLeft} right={data.couple.monogramRight} />

      {editing ? (
        <h1 className="names" style={{ transform: 'none' }}>
          <Editable path="couple.groomFirst" />
          <span className="am">&amp;</span>
          <Editable path="couple.brideFirst" />
        </h1>
      ) : (
        <SplitName groomFirst={data.couple.groomFirst} brideFirst={data.couple.brideFirst} />
      )}

      <Editable
        as="p" path="eventDate" type="date" format={(iso) => formatEventDate(iso).label}
        className="lab dt seq" style={{ '--i': 8 }}
      />

      <LaceFrame ariaLabel="Հարսանեկան պահ">
        <PlaceholderPhoto scene={0} src={data.photos[0]} />
      </LaceFrame>

      <div style={{ marginTop: 'clamp(56px,10vw,84px)' }}>
        <Section id="greeting">
          <p className="lab rv">
            <GuestGreeting personalPath="greeting.personal">
              <Editable path="greeting.lead" /><br /><Editable path="greeting.trail" />
            </GuestGreeting>
          </p>
        </Section>
        <Section id="message">
          <Editable as="p" path="greeting.text" className="t rv" style={{ '--dl': '.1s' }} />
        </Section>
        <p className="big rv" style={{ '--dl': '.2s' }}>{formatEventDate(data.eventDate).big}</p>
        {cal && (
          <a className="cal rv" style={{ '--dl': '.3s' }} href={cal} target="_blank" rel="noopener noreferrer">
            Ավելացնել օրացույցում
          </a>
        )}
      </div>

    </section>
  )
}
