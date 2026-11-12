import { useInvitationContent } from './EditableContext'

// Visibility for one named part of an invitation. Hiding is stored as
// `hidden: { [id]: true }` inside the same content object as the texts, so
// it travels with them everywhere (editor, preview, published copy) and
// never touches the section's own content — showing it again restores it
// exactly. The ids are declared per design in its sections.js.
export function useSectionHidden() {
  const { data } = useInvitationContent()
  return (id) => !!data.hidden?.[id]
}

// `display: contents` keeps the wrapper out of layout (no design CSS uses
// child combinators that it could break); `data-sec` lets the dashboard
// scroll to and highlight the section being edited.
export default function Section({ id, children }) {
  const isHidden = useSectionHidden()
  if (isHidden(id)) return null
  return <div data-sec={id} style={{ display: 'contents' }}>{children}</div>
}
