import { forwardRef, useEffect, useRef } from 'react'
import Editable from '../../shared/Editable'
import { useInvitationContent } from '../../shared/EditableContext'
import { ICONS } from '../lib/art'

// Scroll-reveal wrapper (`.rv` / `.sep` → `.on`, as in the source). Each
// element observes itself on mount, so parts shown again later from the
// editor reveal too. Keep the class off <Editable> itself.
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

export function Icon({ name }) {
  return <svg className="ic" viewBox="0 0 50 50" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] }} />
}

// Title letters drift in one by one (source's .ttl .ch); in edit mode the
// title is a plain editable field instead.
export function Title() {
  const { data, editing } = useInvitationContent()
  if (editing) return <h1 className="ttl"><Editable path="title" /></h1>
  return (
    <h1 className="ttl" aria-label={data.title}>
      {Array.from(String(data.title || '')).map((c, i) => (
        c === ' ' ? ' ' : <span key={i} className="ch" aria-hidden="true" style={{ '--i': i }}>{c}</span>
      ))}
    </h1>
  )
}

// One event place: time, what happens, venue, and a directions button.
export function Place({ index, icon }) {
  const { data } = useInvitationContent()
  const p = data.places[index]
  const query = [p.name, p.address].filter(Boolean).join(', ')
  return (
    <Rv className="inf rv">
      <Icon name={icon} />
      <Editable as="p" path={`places.${index}.time`} className="tm" />
      <Editable as="p" path={`places.${index}.title`} className="ev" />
      <Editable as="p" path={`places.${index}.name`} className="pl" />
      <Editable as="p" path={`places.${index}.address`} className="lc" />
      <a className="bt" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer">
        Տեսնել տեղը<i />
      </a>
    </Rv>
  )
}

// A "call mum / call dad" button. In edit mode the label is editable and
// the number shows underneath so it can be changed too.
export function CallButton({ index, className = 'bt' }) {
  const { data, editing } = useInvitationContent()
  const c = data.rsvp.contacts[index]
  if (!c) return null
  const tel = `tel:${String(c.phone || '').replace(/[^\d+]/g, '')}`
  if (editing) {
    return (
      <span className="call-edit">
        <span className={className}><Editable path={`rsvp.contacts.${index}.label`} /><i /></span>
        <Editable as="small" path={`rsvp.contacts.${index}.phone`} className="phone" />
      </span>
    )
  }
  return <a className={className} href={tel}>{c.label}<i style={index ? { animationDelay: '1.4s' } : undefined} /></a>
}
