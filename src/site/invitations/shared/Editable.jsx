import { useInvitationContent } from './EditableContext'
import { getByPath } from './pathUtils'

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
// swaps to a native datetime picker instead of free text, so the
// countdown and every derived date string can never go out of sync.
export default function Editable({ path, as: Tag = 'span', className, style, type = 'text', format }) {
  const { data, editing, setField } = useInvitationContent()
  const value = getByPath(data, path)

  if (!editing) {
    const display = type === 'date' && format ? format(value) : value
    return <Tag className={className} style={style}>{display}</Tag>
  }

  if (type === 'date') {
    return (
      <input
        type="datetime-local"
        className={`wdb-edit-input ${className || ''}`.trim()}
        value={toLocalInputValue(value)}
        onChange={(e) => {
          if (!e.target.value) return
          setField(path, new Date(e.target.value).toISOString())
        }}
      />
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
