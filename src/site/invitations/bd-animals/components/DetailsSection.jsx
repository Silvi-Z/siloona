import Editable from '../../shared/Editable'
import { useInvitationContent } from '../../shared/EditableContext'
import { formatEventDate } from '../lib/formatDate'

// The date/venue section. `eventDate` is the single editable control (the
// day number doubles as it, matching wd-beige/components/Hero.jsx's "one
// Editable field, every other display derives from it" pattern) — the
// weekday/month/year/time labels around it are plain derived text, never
// independently editable, so they can't drift out of sync with each other.
export default function DetailsSection() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)

  return (
    <section>
      <svg className="spr" viewBox="0 0 80 220" style={{ left: 0, bottom: '6%', animationDelay: '-2s' }} aria-hidden="true"><use href="#bda-sprig" /></svg>
      <svg className="spr" viewBox="0 0 80 220" style={{ right: 0, top: '10%', animationDelay: '-4s', scale: '-1 1' }} aria-hidden="true"><use href="#bda-sprig" /></svg>
      <div className="col">
        <div className="dates rv">
          <div className="s"><b>{d.weekday}</b></div>
          <div className="c">
            <span className="lab">{d.month}</span>
            <Editable as="strong" path="eventDate" type="date" format={(iso) => formatEventDate(iso).day} />
            <span className="lab">{d.year}</span>
          </div>
          <div className="s"><b>Ժամը {d.time}</b></div>
        </div>
        <div className="where rv" style={{ '--dl': '.12s' }}>
          <Editable as="h2" path="venue.name" />
          <Editable as="p" path="venue.address" />
          <a
            className="pill"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.venue.address)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Տեսնել քարտեզում
          </a>
        </div>
      </div>
    </section>
  )
}
