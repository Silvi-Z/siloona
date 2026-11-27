import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { INVITATION_PREVIEWS } from '../invitationRegistry'
import { InvitationContentProvider } from '../invitations/shared/EditableContext'
import { deepMerge } from '../invitations/shared/pathUtils'
import { findDesign } from '../designCatalog'
import { prefillFromEvent } from '../invitationPrefill'
import { orderInvitationContent } from '../orderContent'

// The invitation guests open — /i/:code[/:token]. Two kinds, the server
// tells which (GET /api/invitations):
//   order  a purchased invitation: the design with the checkout details and
//          the customer's own edits; RSVPs are recorded for the order
//   event  a dashboard event: the design the organizer chose, filled from
//          the event's details and their edits; on a guest's own link the
//          greeting has their name. RSVPs go to the organizer's guest list.
// Full page, no site chrome.

const noop = () => {}

function Message({ title, text }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#FBF7F0', color: '#211C28', textAlign: 'center' }}>
      <div style={{ maxWidth: 420 }}>
        <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontSize: 22, letterSpacing: '.12em', color: '#4A0611', margin: '0 0 18px' }}>SILOONA</p>
        <h1 style={{ fontFamily: '"Noto Serif Armenian",Georgia,serif', fontWeight: 500, fontSize: 24, margin: '0 0 10px' }}>{title}</h1>
        {text && <p style={{ fontFamily: '"Noto Sans Armenian",sans-serif', fontSize: 15, color: '#4B4256', margin: 0 }}>{text}</p>}
      </div>
    </div>
  )
}

// An RSVP is retried a few times so a brief connection drop on a guest's
// phone doesn't lose the answer.
async function sendRsvp(body) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (r.ok || r.status < 500) return
    } catch { /* network — retry */ }
    await new Promise((res) => setTimeout(res, 1500 * (i + 1)))
  }
}

// «Թողեք մաղթանք»: a wish for the couple. → { ok, status, message }
async function sendWish(body) {
  try {
    const r = await fetch('/api/invitations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wish: true, ...body }) })
    const data = await r.json().catch(() => null)
    return { ok: r.ok, status: r.status, message: r.ok ? '' : data?.message }
  } catch {
    return { ok: false, status: 0 }
  }
}

// «Ձեր սեղանը»: asks the server for one guest's table. Resolves to
// { status: 'found'|'ambiguous'|'not_found'|'empty', table? } or
// { status: 'not_open' | 'busy' | 'error' }.
async function findSeat(code, name) {
  try {
    const r = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seat: true, code, name }),
    })
    const data = await r.json().catch(() => null)
    if (r.ok && data?.status) return data
    if (r.status === 409) return { status: 'not_open' }
    if (r.status === 429) return { status: 'busy' }
    if (r.status === 422) return { status: 'empty' }
    return { status: 'error' }
  } catch {
    return { status: 'error' }
  }
}

// The event as the dashboard's prefill expects it (dates as Date objects).
function reviveEvent(e) {
  const date = e.date ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(e.date) ? `${e.date}T00:00:00` : e.date) : undefined
  return {
    ...e,
    date,
    locations: e.locations || [],
    schedule: e.schedule || [],
    inv: { ...(e.inv || {}), deadline: e.inv?.deadline ? new Date(e.inv.deadline) : undefined },
  }
}

// The invitation's language, as the order's content records it.
const invLangOf = (data) => (data?.kind !== 'event' && INVITATION_WORD[data?.content?.lang] ? data.content.lang : 'hy')
const INVITATION_WORD = { hy: 'Հրավեր', ru: 'Приглашение', en: 'Invitation' }

export default function SharedInvitation() {
  const { code, token } = useParams()
  const [state, setState] = useState({ status: 'loading' })
  // the couple's own RSVP questions: the form writes the answers here
  const rsvpAnswers = useRef({})

  useEffect(() => {
    let alive = true
    const qs = new URLSearchParams({ code })
    if (token) qs.set('t', token)
    fetch(`/api/invitations?${qs}`)
      .then(async (r) => {
        const data = await r.json().catch(() => null)
        if (!alive) return
        if (r.ok) setState({ status: 'ok', data })
        else setState({ status: r.status === 410 ? 'gone' : r.status === 429 ? 'busy' : 'missing', message: data?.message })
      })
      .catch(() => alive && setState({ status: 'error' }))
    return () => { alive = false }
  }, [code, token])

  const data = state.data
  const slug = data ? findDesign(data.designId)?.previewSlug : null
  const entry = slug ? INVITATION_PREVIEWS[slug] : null

  const content = useMemo(() => {
    if (!entry || !data) return null
    if (data.kind === 'event') {
      // Same layering as the dashboard preview: design ← event details ← the organizer's edits.
      const base = deepMerge(entry.defaultData, prefillFromEvent(slug, reviveEvent(data.event)))
      return deepMerge(base, data.designContent?.[slug])
    }
    // Purchased: design ← checkout details ← the customer's edits (orderContent.js).
    return orderInvitationContent(slug, data)
  }, [entry, slug, data])

  // Only when the server says this invitation has seating.
  const seating = useMemo(
    () => (data?.seating ? { ...data.seating, key: code, find: (name) => findSeat(code, name) } : null),
    [data, code],
  )

  useEffect(() => {
    if (!data) return
    const names = data.kind === 'event'
      ? [data.event.person1?.first, data.event.person2?.first].filter(Boolean).join(' & ') || data.event.title
      : data.customization?.names
    const lang = invLangOf(data)
    if (names) document.title = `${names} · ${INVITATION_WORD[lang]}`
    document.documentElement.lang = lang
  }, [data])

  if (state.status === 'loading') return <div style={{ minHeight: '100vh', background: '#FBF7F0' }} />
  if (state.status === 'gone') return <Message title="Հրավերն այլևս հասանելի չէ" text={state.message} />
  if (state.status === 'busy') return <Message title="Մի պահ" text="Շատ հարցումներ ստացանք։ Թարմացրեք էջը մեկ րոպեից։" />
  if (state.status === 'error') return <Message title="Չհաջողվեց բացել հրավերը" text="Ստուգեք ինտերնետ կապը և թարմացրեք էջը։" />
  if (state.status === 'missing') return <Message title="Հրավերը չի գտնվել" text="Ստուգեք հղումը։" />
  if (!entry) return <Message title="Հրավերը պատրաստվում է" text="Շուտով այն հասանելի կլինի այս հղումով։" />

  const Invitation = entry.component
  const isEvent = data.kind === 'event'
  // A guest's own link: a purchased invitation's personal link (the server
  // sends `personal` only when it has the personal_greeting add-on), or a
  // dashboard event's guest.
  const guestName = data.personal?.name || (isEvent && data.event.inv?.personalize !== false ? data.guest?.first || null : null)
  const rsvpOn = !isEvent || data.event.inv?.rsvp !== false
  // add-on features this invitation has (the server decides)
  const features = Array.isArray(data.features) ? data.features : []
  const onRsvp = rsvpOn
    ? (answer) => {
      const answers = data.rsvpQuestions?.length ? { answers: rsvpAnswers.current } : {}
      sendRsvp(isEvent ? { slug: code, t: data.personal ? undefined : token, ...answer } : { code, t: token, ...answer, ...answers })
    }
    : undefined
  return (
    <InvitationContentProvider defaultData={content} editing={false} setEditing={noop} guestName={guestName} onRsvp={onRsvp} seating={seating} features={features} rsvpQuestions={data.rsvpQuestions || null} rsvpAnswers={rsvpAnswers}
      wishes={data.wishes || null} onWish={(w) => sendWish({ code, t: token, ...w })}>
      <Invitation />
    </InvitationContentProvider>
  )
}
