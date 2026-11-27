import { useEffect, useState } from 'react'
import { useText } from '../i18n'
import InvitationLive from './InvitationLive'
import './invitationLive.css'

// The customer's own invitation on their order page: the real design,
// filled with what the order says (orderContent.js — the same as the page
// guests open), in a phone outline. Until the order is paid it carries a
// faint «Նախադիտում» mark; guests can't open it before payment anyway
// (the /i/<code> link exists only for paid orders).

export const PREVIEW_TEXT = {
  hy: { eyebrow: 'Նախադիտում', title: 'Ձեր հրավերը', mark: 'Նախադիտում', note: 'Հյուրերի համար հրավերը կբացվի վճարումից հետո, և այս նշումը կանհետանա։', frame: 'Հրավերի նախադիտում' },
  ru: { eyebrow: 'Предпросмотр', title: 'Ваше приглашение', mark: 'Предпросмотр', note: 'Для гостей приглашение откроется после оплаты, и эта отметка исчезнет.', frame: 'Предпросмотр приглашения' },
  en: { eyebrow: 'Preview', title: 'Your invitation', mark: 'Preview', note: 'Guests can open the invitation once it’s paid, and this mark will disappear.', frame: 'Invitation preview' },
}

// The order's invitation content (the content builders are heavy — every
// design's demo — so they load lazily).
export function useOrderContent(slug, preview) {
  const [content, setContent] = useState(null)
  const key = JSON.stringify(preview || null)
  useEffect(() => {
    if (!slug || !preview) return undefined
    let alive = true
    import('../orderContent').then((m) => { if (alive) setContent(m.orderInvitationContent(slug, preview)) })
    return () => { alive = false }
  }, [slug, key]) // eslint-disable-line react-hooks/exhaustive-deps
  return content
}

export default function OrderPreview({ slug, preview, paid }) {
  const t = useText(PREVIEW_TEXT)
  const content = useOrderContent(slug, preview)
  const width = typeof window !== 'undefined' && window.innerWidth <= 360 ? 240 : 280
  return (
    <section className="co-preview" aria-label={t.frame}>
      <p className="eyebrow">{paid ? t.title : t.eyebrow}</p>
      <div className="co-preview-phone">
        <div className="co-preview-screen">
          <InvitationLive slug={slug} content={content} width={width} mark={paid ? null : t.mark} title={t.frame} />
        </div>
      </div>
      {!paid && <p className="co-preview-note">{t.note}</p>}
    </section>
  )
}
