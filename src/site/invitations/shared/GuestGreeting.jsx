import { useLayoutEffect, useRef, useState } from 'react'
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
  // A design that sets its greeting in capitals with CSS would turn the
  // «և» of «Արամ և Անի» into «ԵՒ»; written «եվ» it becomes «ԵՎ», as in
  // modern spelling (the designs' caps() does the same).
  const ref = useRef(null)
  const [upper, setUpper] = useState(false)
  useLayoutEffect(() => {
    if (ref.current && typeof getComputedStyle !== 'undefined') setUpper(getComputedStyle(ref.current).textTransform === 'uppercase')
  }, [guestName])
  if (!guestName) return children
  if (editing) return <Editable as={Tag} path={personalPath} className={className} style={style} />
  const text = fillName(getByPath(data, personalPath), guestName)
  return <Tag ref={ref} className={className} style={style}>{upper ? text.replace(/և/g, 'եվ') : text}</Tag>
}
