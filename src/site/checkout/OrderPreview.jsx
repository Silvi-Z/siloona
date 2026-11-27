import { useEffect, useMemo, useRef, useState } from 'react'
import { useText } from '../i18n'

// The customer's own invitation on their order page: the real design,
// running live in the preview route's `?embed` mode (as in the dashboard),
// filled with what the order says. Until the order is paid it carries a
// faint «Նախադիտում» mark; guests can't open it before payment anyway
// (the /i/<code> link exists only for paid orders).

const TEXT = {
  hy: { eyebrow: 'Նախադիտում', title: 'Ձեր հրավերը', mark: 'Նախադիտում', note: 'Հյուրերի համար հրավերը կբացվի վճարումից հետո, և այս նշումը կանհետանա։', frame: 'Հրավերի նախադիտում' },
  ru: { eyebrow: 'Предпросмотр', title: 'Ваше приглашение', mark: 'Предпросмотр', note: 'Для гостей приглашение откроется после оплаты, и эта отметка исчезнет.', frame: 'Предпросмотр приглашения' },
  en: { eyebrow: 'Preview', title: 'Your invitation', mark: 'Preview', note: 'Guests can open the invitation once it’s paid, and this mark will disappear.', frame: 'Invitation preview' },
}

export default function OrderPreview({ slug, preview, paid }) {
  const t = useText(TEXT)
  const frameRef = useRef(null)
  const [data, setData] = useState(null)

  // the content builders are heavy (every design's demo) — load them lazily
  useEffect(() => {
    let alive = true
    import('../orderContent').then((m) => { if (alive) setData(m.orderInvitationContent(slug, preview)) })
    return () => { alive = false }
  }, [slug, preview])

  const json = useMemo(() => (data ? JSON.stringify(data) : null), [data])
  useEffect(() => {
    if (!json) return
    const send = () => frameRef.current?.contentWindow?.postMessage({ slug, type: 'siloona:invitation-content', data: JSON.parse(json), editing: false, guestName: null, rsvp: false }, location.origin)
    const onMessage = (e) => {
      if (e.origin === location.origin && e.source === frameRef.current?.contentWindow && e.data?.type === 'siloona:embed-ready') send()
    }
    window.addEventListener('message', onMessage)
    send() // in case the frame was ready first
    return () => window.removeEventListener('message', onMessage)
  }, [json, slug])

  return (
    <section className="co-preview" aria-label={t.frame}>
      <p className="eyebrow">{paid ? t.title : t.eyebrow}</p>
      <div className="co-preview-phone">
        <div className="co-preview-screen">
          {json && <iframe ref={frameRef} src={`/invitations/preview/${slug}?embed`} title={t.frame} loading="lazy" />}
          {!paid && (
            <div className="co-preview-mark" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => <span key={i}>{t.mark}</span>)}
            </div>
          )}
        </div>
      </div>
      {!paid && <p className="co-preview-note">{t.note}</p>}
    </section>
  )
}
