import Editable from '../../shared/Editable'
import { useInvitationContent } from '../../shared/EditableContext'
import Rv from './Rv'

export default function DressCode() {
  const { data, editing, setField } = useInvitationContent()
  const colors = data.dressCode.colors || []
  return (
    <section className="sand">
      <div className="wrap">
        <Rv as="h2">Դրես-կոդ</Rv>
        <Rv><Editable as="p" path="dressCode.text" className="lead" /></Rv>
        <Rv className="sw" role="img" aria-label="Տոնի գունապնակը">
          {colors.map((c, i) => (
            editing ? (
              <input
                key={i} type="color" className="color-edit" value={c} aria-label={`Գույն ${i + 1}`}
                onChange={(e) => setField('dressCode.colors', colors.map((x, j) => (j === i ? e.target.value : x)))}
              />
            ) : (
              <span key={i} style={{ background: c }} />
            )
          ))}
        </Rv>
      </div>
    </section>
  )
}
