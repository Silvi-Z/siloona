import { forwardRef, useEffect, useRef } from 'react'
import Editable from '../../shared/Editable'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import { useInvitationContent } from '../../shared/EditableContext'
import { getByPath } from '../../shared/pathUtils'
import { SCATTER } from '../lib/art'

// Scroll-reveal wrapper (`.rv` / split headings → `.on`, as in the source).
// Each element observes itself on mount, so parts shown again later from
// the editor reveal too. Keep the class off <Editable> itself — its
// className changes in edit mode and would drop `.on`.
export function Rv({ as: Tag = 'div', className = 'rv', children, ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { el.classList.add('on'); return }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('on'); io.disconnect() }
    }, { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <Tag ref={ref} className={className} {...rest}>{children}</Tag>
}

// Static generated artwork (lib/art.js — never user content).
export const Art = forwardRef(function Art({ svg, as: Tag = 'div', ...rest }, ref) {
  return <Tag ref={ref} {...rest} dangerouslySetInnerHTML={{ __html: svg }} />
})

// One section's scattered butterflies / sprigs / flowers / feathers.
export function Decor({ id }) {
  return (
    <div aria-hidden="true">
      {SCATTER[id].map((d, i) => (
        <div key={i} className="dec" data-sp={d.sp} style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.width, '--px': d.px }}>
          <Art className={d.motion} style={{ '--du': d.du, '--dl': d.dl }} svg={d.svg} />
        </div>
      ))}
    </div>
  )
}

function words(text) {
  return String(text || '').split(/\s+/).filter(Boolean).map((w, i) => (
    <span key={i}><span className="w"><i style={{ '--k': i }}>{w}</i></span>{' '}</span>
  ))
}

// A heading whose words rise in one by one (source's [data-split]). In edit
// mode it's a plain editable heading instead.
export function SplitHeading({ path, text, style }) {
  const { data, editing } = useInvitationContent()
  const content = path
    ? (editing ? <Editable path={path} /> : words(getByPath(data, path)))
    : words(text)
  return <Rv as="h2" className="rv split" style={style}>{content}</Rv>
}

export function GreetingHeading() {
  const { data, editing, guestName } = useInvitationContent()
  if (editing) {
    return (
      <Rv as="h2" className="rv split">
        <GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting>
      </Rv>
    )
  }
  const text = guestName ? fillName(data.greeting.personal, guestName) : data.greeting.general
  return <SplitHeading text={text} />
}
