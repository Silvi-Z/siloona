import { useEffect, useRef, useState } from 'react'

// The customer's own invitation, live — the real design in the preview
// route's `?embed` mode (as the dashboard shows it), fed `content` (built
// with orderContent.js from the order, or from the checkout's form),
// rendered at a phone's width (390px) and scaled to `width` ('fill': the
// width of the box it is put in). `mark` lays
// the faint «Նախադիտում» over it (until the order is paid). `still`: a
// small picture, not to be scrolled or tapped (the order list).

const PHONE_W = 390
const PHONE_H = 780

export default function InvitationLive({ slug, content, width = 280, mark = null, still = false, title }) {
  const frameRef = useRef(null)
  const json = content ? JSON.stringify(content) : null
  const latest = useRef(json)
  latest.current = json

  useEffect(() => {
    const send = () => {
      if (!latest.current) return
      frameRef.current?.contentWindow?.postMessage({ slug, type: 'siloona:invitation-content', data: JSON.parse(latest.current), editing: false, guestName: null, rsvp: false }, location.origin)
    }
    const onMessage = (e) => {
      if (e.origin === location.origin && e.source === frameRef.current?.contentWindow && e.data?.type === 'siloona:embed-ready') send()
    }
    window.addEventListener('message', onMessage)
    send() // the frame may be ready already (content changed)
    return () => window.removeEventListener('message', onMessage)
  }, [json, slug])

  const box = useRef(null)
  const [fill, setFill] = useState(0)
  useEffect(() => {
    if (width !== 'fill' || !box.current?.parentElement || typeof ResizeObserver === 'undefined') return undefined
    const parent = box.current.parentElement
    const ro = new ResizeObserver(() => setFill(parent.clientWidth))
    ro.observe(parent)
    setFill(parent.clientWidth)
    return () => ro.disconnect()
  }, [width])
  const w = width === 'fill' ? fill : width
  const k = w / PHONE_W
  return (
    <div ref={box} className={`inv-live${still ? ' still' : ''}`} style={{ width: width === 'fill' ? '100%' : w, height: Math.round(PHONE_H * k) }}>
      {json && (
        <iframe
          ref={frameRef} src={`/invitations/preview/${slug}?embed`} title={title} loading="lazy" tabIndex={still ? -1 : undefined}
          style={{ width: PHONE_W, height: PHONE_H, transform: `scale(${k})` }}
        />
      )}
      {mark && (
        <div className="inv-live-mark" aria-hidden="true" style={{ fontSize: Math.max(11, Math.round(30 * k * 1.39)) }}>
          {[0, 1, 2, 3].map((i) => <span key={i}>{mark}</span>)}
        </div>
      )}
    </div>
  )
}
