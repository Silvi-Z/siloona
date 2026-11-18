import { useInvitationContent } from './EditableContext'
import { getByPath } from './pathUtils'
import TimeSelect from './TimeSelect'
import { DateField } from './ArmenianDate'

function toLocalInputValue(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// The shared building block every invitation design uses for editable
// content. `type="text"` (default) edits in place via contentEditable,
// committed on blur only — so a re-render from a sibling field's edit
// never disturbs an in-progress keystroke/caret here. `type="date"`
// swaps to a native date picker + 24-hour time lists instead of free text, so the
// countdown and every derived date string can never go out of sync.
export default function Editable({ path, as: Tag = 'span', className, style, type = 'text', format }) {
  const { data, editing, setField } = useInvitationContent()
  const value = getByPath(data, path)

  if (!editing) {
    const display = type === 'date' && format ? format(value) : value
    return <Tag className={className} style={style}>{display}</Tag>
  }

  if (type === 'date') {
    // The Armenian calendar + a 24-hour time, the same on every phone.
    const local = toLocalInputValue(value)
    const [day, time] = local ? local.split('T') : ['', '']
    const commit = (d, t) => { if (d) setField(path, new Date(`${d}T${t || '12:00'}`).toISOString()) }
    return (
      <span className={`wdb-edit-dt ${className || ''}`.trim()} style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <DateField className="wdb-edit-input" value={day} onChange={(d) => commit(d, time)} />
        <TimeSelect value={time} onChange={(t) => commit(day, t)} className="wdb-edit-input" />
      </span>
    )
  }

  return (
    <Tag
      className={`wdb-editable ${className || ''}`.trim()}
      style={style}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => setField(path, e.target.textContent)}
    >
      {value}
    </Tag>
  )
}
