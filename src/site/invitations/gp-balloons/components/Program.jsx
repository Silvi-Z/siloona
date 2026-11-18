import Editable from '../../shared/Editable'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import { useInvitationContent } from '../../shared/EditableContext'
import Rv from './Rv'

// The source demo's four line icons; a longer program cycles through them.
const ICONS = [
  'M12 3l7 16H5zM5 19h14M9 12h6',
  'M5 4h6l-1 6a2 2 0 01-4 0zM8 12v8M17 4v16M17 4c-2 2-2 6 0 8',
  'M4 20l4-12 8 8zM12 5l1-2M16 8l2-1M15 4h.01M19 11h.01',
  'M12 4a3 3 0 110 6 3 3 0 010-6zM6 20c0-5 3-8 6-8s6 3 6 8M5 12l3 1M19 12l-3 1',
]

export default function Program() {
  const { data } = useInvitationContent()
  return (
    <section className="sand">
      <div className="wrap">
        <Rv as="h2">Երեկոյի ծրագիրը</Rv>
        <Rv as="ul" className="tl">
          {data.schedule.map((_, i) => (
            <li key={i}>
              <span className="ico"><svg viewBox="0 0 24 24"><path d={ICONS[i % ICONS.length]} /></svg></span>
              <div>
                <Editable as="time" path={`schedule.${i}.time`} />
                <Editable as="p" path={`schedule.${i}.label`} />
              </div>
              <RowRemove list="schedule" index={i} />
            </li>
          ))}
        </Rv>
        <RowAdd list="schedule" />
      </div>
    </section>
  )
}
