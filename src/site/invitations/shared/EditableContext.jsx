import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getByPath, setByPath, deepMerge } from './pathUtils'
import { loadOverride, saveOverride, clearOverride } from './storage'
import { addonById } from '../../addons'

const Ctx = createContext(null)

// The live-editing core every invitation design's components use via
// useInvitationContent(). It knows nothing about *where* edits are kept or
// how edit mode is toggled — the host decides that through props:
//   defaultData  the design's base content
//   saved        previously saved edits, merged on top of defaultData
//   onSave(next) called with the full edited content after every change
//   onReset()    called when the user discards their edits
//   editing / setEditing  controlled edit-mode flag
// Hosts today: InvitationEditProvider below (public /invitations preview:
// ?edit query param + localStorage) and the dashboard's InvitationStudio
// (local state + the event's own record in the database).
//
// This is the "all invitations will have this functionality" piece: any
// new design just needs to register a slug + defaultData and build its
// text with <Editable path="..."/> — it gets edit mode, persistence and
// reset for free, with no invitation-specific editing code of its own.
//   guestName    the guest this copy is for (personal link) — designs show
//                their personalized greeting with it (see GuestGreeting.jsx)
//   onRsvp       called with {name, status, plus, note} when a guest
//                submits the design's RSVP form, if the host records RSVPs
//   seating      «Ձեր սեղանը» on this copy — { revealAt, open, key, find(name) }
//                from the published page only (see Seating.jsx); null elsewhere
//   features     the add-on features (src/site/addons.js) this copy has —
//                an array from the published page (the server decides);
//                null = a demo / preview, which shows every feature that
//                is switched on. Read it with useFeature(id).
//   skipIntro    open straight to the content (no envelope/curtain)
//   live         keep following `defaultData` when the host replaces it
//                (the dashboard preview while settings change)
//   transform(prev, next)  optional: adjusts content after each edit — the
//                public preview uses it to carry a renamed person into the
//                sentences built from their name (invitationDetails.js)
export function InvitationContentProvider({ defaultData, saved, onSave, onReset, editing, setEditing, guestName = null, onRsvp, seating = null, features = null, skipIntro = false, live = false, transform, children }) {
  const [data, setData] = useState(() => deepMerge(defaultData, saved))
  const [dirty, setDirty] = useState(() => saved != null)
  // Latest content, read synchronously so onSave (which may update the
  // host's own state) runs outside any setState updater.
  const dataRef = useRef(data)

  useEffect(() => {
    if (!live) return
    const next = deepMerge(defaultData, saved)
    dataRef.current = next
    setData(next)
  }, [live, defaultData]) // eslint-disable-line react-hooks/exhaustive-deps

  function setField(path, value) {
    const prev = dataRef.current
    if (getByPath(prev, path) === value) return
    let next = setByPath(prev, path, value)
    if (transform) next = transform(prev, next)
    dataRef.current = next
    setData(next)
    setDirty(true)
    onSave?.(next)
  }

  // Several changes at once (the editing wizard's answers).
  function replaceData(next) {
    dataRef.current = next
    setData(next)
    setDirty(true)
    onSave?.(next)
  }

  function reset() {
    dataRef.current = defaultData
    setData(defaultData)
    setDirty(false)
    onReset?.()
  }

  const value = useMemo(
    () => ({ data, editing, setEditing, setField, replaceData, reset, dirty, guestName, onRsvp, seating, features, skipIntro }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, editing, dirty, guestName, onRsvp, seating, features, skipIntro],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// Public /invitations/preview/:slug host — edit mode lives in the `?edit`
// query param, edits persist in this browser's localStorage per slug (and
// per invitation language, `lang`).
export function InvitationEditProvider({ slug, lang, defaultData, transform, children }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [saved] = useState(() => loadOverride(slug, lang))
  const editing = searchParams.has('edit')

  function setEditing(next) {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev)
      if (next) p.set('edit', '1')
      else p.delete('edit')
      return p
    }, { replace: true })
  }

  return (
    <InvitationContentProvider
      defaultData={defaultData}
      saved={saved}
      onSave={(next) => saveOverride(slug, next, lang)}
      onReset={() => clearOverride(slug, lang)}
      editing={editing}
      setEditing={setEditing}
      transform={transform}
    >
      {children}
    </InvitationContentProvider>
  )
}

// Whether this copy shows an add-on feature (src/site/addons.js).
export function useFeature(id) {
  const { features } = useInvitationContent()
  if (Array.isArray(features)) return features.includes(id)
  return !!addonById(id)?.enabled
}

export function useInvitationContent() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useInvitationContent must be used within an InvitationContentProvider')
  return ctx
}
