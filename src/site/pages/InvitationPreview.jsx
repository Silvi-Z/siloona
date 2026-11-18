import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { INVITATION_PREVIEWS } from '../invitationRegistry'
import { InvitationEditProvider, InvitationContentProvider, useInvitationContent } from '../invitations/shared/EditableContext'
import { detailFields, syncNames, applyDetails } from '../invitationDetails'
import EditBar from '../invitations/shared/EditBar'
import { WEB_DESIGNS, CARD_DESIGNS } from '../designCatalog'
import { floatingBtnStyle, floatingTopLeft } from '../invitations/shared/chromeStyles'

const backBtnStyle = { ...floatingTopLeft, ...floatingBtnStyle }

const noop = () => {}

// The editing wizard (EditWizard.jsx): opens by itself the first time a
// visitor starts editing a design they haven't changed yet, and again
// from the edit bar's «Քայլ առ քայլ».
const EditWizard = lazy(() => import('../editor/EditWizard'))
const wizardKey = (slug) => `siloona:wizard-done:${slug}`
const wizardDone = (slug) => { try { return !!localStorage.getItem(wizardKey(slug)) } catch { return false } }
const markWizardDone = (slug) => { try { localStorage.setItem(wizardKey(slug), '1') } catch { /* private mode */ } }

function WizardHost({ slug, open, setOpen }) {
  const { editing, dirty, data, replaceData } = useInvitationContent()
  useEffect(() => {
    if (editing && !dirty && !wizardDone(slug)) setOpen(true)
  }, [editing]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!open || !editing) return null
  const close = () => { markWizardDone(slug); setOpen(false) }
  return (
    <Suspense fallback={null}>
      <EditWizard
        slug={slug} data={data} fromContent={dirty}
        onSkip={close}
        onDone={(details) => { replaceData(applyDetails(slug, data, details)); close() }}
      />
    </Suspense>
  )
}

// `?embed` — the chrome-less mode the dashboard loads in an <iframe>: the
// «Իմ հրավերը» live preview, and the published/guest view. The design runs
// against its own window, scroll and viewport exactly as on a guest's phone.
// Same-origin postMessage only, both ways:
//   parent → embed  siloona:invitation-content {data, editing, guestName, rsvp}
//                     show this content. Text changes update in place;
//                     visibility/guest changes re-render the page fresh.
//                   siloona:invitation-mode {editing}   view ↔ edit in place
//                   siloona:invitation-focus {id, intro}
//                     scroll to + briefly highlight that section
//   embed → parent  siloona:invitation-edit {data}  a field edited in place
//                   siloona:rsvp {name, status, plus, note}  (if `rsvp`)
// Editing uses the same InvitationContentProvider + <Editable> stack as
// every other host; the parent owns persistence.
const FOCUS_CSS = '.sil-sec-focus{outline:2px solid rgba(107,29,44,.6);outline-offset:8px;border-radius:6px;transition:outline-color .6s}'
const hiddenKey = (data) => JSON.stringify(data?.hidden || {})

function EmbeddedInvitation({ slug, Invitation, defaultData }) {
  const embedded = window.parent !== window
  const [view, setView] = useState(embedded ? null : { data: defaultData, editing: false, guestName: null, rsvp: false, skipIntro: false, rev: 0 })
  // Freshest content, including in-place edits not yet echoed back by the parent.
  const latest = useRef(defaultData)

  useEffect(() => {
    if (!embedded) return
    const post = (msg) => window.parent.postMessage({ slug, ...msg }, location.origin)
    const focus = (id) => {
      const el = document.querySelector(`[data-sec="${id}"]`)?.firstElementChild
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('sil-sec-focus')
      setTimeout(() => el.classList.remove('sil-sec-focus'), 1600)
    }
    const onMessage = (e) => {
      if (e.origin !== location.origin || e.source !== window.parent) return
      const m = e.data
      if (m?.slug !== slug) return
      if (m.type === 'siloona:invitation-content') {
        latest.current = m.data
        setView((prev) => {
          const base = { data: m.data, editing: !!m.editing, guestName: m.guestName || null, rsvp: !!m.rsvp }
          if (!prev) return { ...base, skipIntro: false, rev: 1 }
          // Text-only change: update in place (no flicker, keeps scroll).
          // A section appearing/disappearing re-renders fresh so its
          // scroll-reveal animation is set up — straight to the content.
          const fresh = hiddenKey(prev.data) !== hiddenKey(m.data) || prev.guestName !== base.guestName
          return fresh ? { ...base, skipIntro: true, rev: prev.rev + 1 } : { ...prev, ...base }
        })
      } else if (m.type === 'siloona:invitation-mode') {
        // Commit a field still being typed in (Editable saves on blur)
        // before re-rendering, so switching mode never drops an edit.
        document.activeElement?.blur?.()
        setView((prev) => prev && ({ ...prev, data: latest.current, editing: !!m.editing, skipIntro: true, rev: prev.rev + 1 }))
      } else if (m.type === 'siloona:invitation-focus') {
        // The intro (envelope/curtain) is only visible before opening.
        const wantIntro = !!m.intro
        setView((prev) => {
          if (!prev || prev.skipIntro === !wantIntro) return prev
          return { ...prev, data: latest.current, skipIntro: !wantIntro, rev: prev.rev + 1 }
        })
        if (!wantIntro) setTimeout(() => focus(m.id), 180)
      }
    }
    window.addEventListener('message', onMessage)
    post({ type: 'siloona:embed-ready' })
    return () => window.removeEventListener('message', onMessage)
  }, [embedded, slug])

  if (!view) return null
  const onSave = (next) => {
    latest.current = next
    window.parent.postMessage({ type: 'siloona:invitation-edit', slug, data: next }, location.origin)
  }
  const onRsvp = view.rsvp ? (answer) => window.parent.postMessage({ type: 'siloona:rsvp', slug, ...answer }, location.origin) : undefined
  return (
    <>
      <style>{FOCUS_CSS}</style>
      <InvitationContentProvider
        key={view.rev}
        live
        defaultData={view.data}
        onSave={embedded ? onSave : undefined}
        editing={view.editing}
        setEditing={noop}
        guestName={view.guestName}
        onRsvp={onRsvp}
        skipIntro={view.skipIntro}
      >
        <Invitation />
      </InvitationContentProvider>
    </>
  )
}

// Rendered outside <SiteLayout/> (see App.jsx) so it carries no site
// header/footer — the invitation occupies the entire page, exactly as
// the source demo does. The floating "back" control is this route's own
// minimal navigation, not part of the invitation itself.
export default function InvitationPreview() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const entry = INVITATION_PREVIEWS[slug]

  if (!entry) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: '-apple-system,"Segoe UI",Roboto,sans-serif', textAlign: 'center', gap: 16 }}>
        <div>
          <p style={{ marginBottom: 12 }}>Հրավիրատոմսը չի գտնվել։</p>
          <Link to="/invitations">← Վերադառնալ հավաքածուին</Link>
        </div>
      </div>
    )
  }

  const Invitation = entry.component
  // The catalog design this page belongs to, if it's on sale.
  const orderable = [...WEB_DESIGNS, ...CARD_DESIGNS].find((d) => d.previewSlug === slug && d.available !== false)
  return searchParams.has('embed')
    ? <EmbeddedInvitation slug={slug} Invitation={Invitation} defaultData={entry.defaultData} />
    : <EditablePreview slug={slug} entry={entry} orderable={orderable} />
}

function EditablePreview({ slug, entry, orderable }) {
  const Invitation = entry.component
  const [wizardOpen, setWizardOpen] = useState(false)
  // A renamed person carries into the sentences built from their name.
  const transform = useCallback((prev, next) => syncNames(slug, prev, next), [slug])
  const hasWizard = !!detailFields(slug)
  return (
    <InvitationEditProvider slug={slug} defaultData={entry.defaultData} transform={transform}>
      <Link to="/invitations" style={backBtnStyle} aria-label="Վերադառնալ հավաքածուին">← Հավաքածու</Link>
      <EditBar orderTo={orderable ? `/checkout/${orderable.id}` : null} onWizard={hasWizard ? () => setWizardOpen(true) : undefined} />
      <Invitation />
      {hasWizard && <WizardHost slug={slug} open={wizardOpen} setOpen={setWizardOpen} />}
    </InvitationEditProvider>
  )
}
