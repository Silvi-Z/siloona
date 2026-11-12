import LaceFrame from './LaceFrame'
import Editable from '../../shared/Editable'
import { useInvitationContent } from '../../shared/EditableContext'

export default function DressCode() {
  const { data, editing, setField } = useInvitationContent()
  const colors = data.dressCode.colors

  return (
    <LaceFrame square style={{ marginTop: 'clamp(54px,9vw,80px)' }}>
      <div className="in">
        <h2 className="h">Դրես-կոդ</h2>
        <p className="sub">կոդ</p>
        <Editable as="p" path="dressCode.intro" className="t" />
        <Editable as="p" path="dressCode.note" className="t" />
        <div className="sw">
          {colors.map((c, i) => (
            editing ? (
              <input
                key={i} type="color" className="wdb-color-edit" value={c}
                onChange={(e) => setField(`dressCode.colors.${i}`, e.target.value)}
              />
            ) : (
              <i key={i} style={{ '--c': c }} />
            )
          ))}
        </div>
      </div>
    </LaceFrame>
  )
}
