import Editable from './Editable'
import { useInvitationContent } from './EditableContext'
import { getByPath } from './pathUtils'

// A design's greeting line. Opened from a guest's personal link (the host
// passes `guestName`), it shows the design's personal template with
// {name} filled in; opened from the general link it shows the general
// greeting (`children`). In edit mode the template itself is editable,
// {name} placeholder included.
export function fillName(template, name) {
  return String(template || '').replace(/\{name\}/g, name)
}

export default function GuestGreeting({ personalPath, as: Tag = 'span', className, style, children }) {
  const { data, editing, guestName } = useInvitationContent()
  if (!guestName) return children
  if (editing) return <Editable as={Tag} path={personalPath} className={className} style={style} />
  return <Tag className={className} style={style}>{fillName(getByPath(data, personalPath), guestName)}</Tag>
}
