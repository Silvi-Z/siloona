import Editable from '../../shared/Editable'
import { useInvitationContent } from '../../shared/EditableContext'
import { formatEventDate } from '../lib/formatDate'
import Rv from './Rv'

export default function Place() {
  const { data } = useInvitationContent()
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.venue.address || data.venue.name)}`
  return (
    <section>
      <div className="wrap">
        <Rv as="h2">Վայրը</Rv>
        <Rv className="card">
          <div className="minimap" aria-hidden="true"><i /></div>
          <Editable as="h3" path="venue.name" />
          <p>
            <Editable path="venue.address" /><br />
            {formatEventDate(data.eventDate).venue}
          </p>
          <a className="btn" href={mapUrl} target="_blank" rel="noopener noreferrer">ԲԱՑԵԼ ՔԱՐՏԵԶԸ</a>
        </Rv>
      </div>
    </section>
  )
}
