import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { findDesign } from '../designCatalog'
import { CUSTOM_DESIGN_ID, CUSTOM_DESIGN_LABEL } from '../customRequest'
import { formatPrice } from '../pricing'
import PaymentMethods, { SecureNote } from './PaymentMethods'
import {
  METHOD_INFO, OPTION_INFO, getOrderStatus, goToProvider, orderLink, recallOrder, rememberOrder, startPayment,
} from './checkoutApi'
import './checkout.css'

// The customer's order page. Everything shown comes from the server
// (/api/orders/status), which reads the payment state from the provider —
// nothing in this URL can make an order look paid.

const POLL_MS = 3000
const MAX_POLLS = 40 // ~2 minutes

// The paid order's invitation link, ready to send to guests.
function ShareInvitation({ code }) {
  const url = `${window.location.origin}/i/${code}`
  const shown = url.replace(/^https?:\/\//, '')
  const [copied, setCopied] = useState(false)
  const text = 'Հրավեր'
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked — the link is visible to select */ }
  }
  const share = () => navigator.share({ title: text, url }).catch(() => {})
  return (
    <section className="co-share" aria-label="Հրավերի հղում">
      <p className="eyebrow">Ձեր հրավերը</p>
      <h2>Ուղարկեք այս հղումը հյուրերին</h2>
      <div className="co-link">
        <a href={url} target="_blank" rel="noopener noreferrer">{shown}</a>
        <button type="button" onClick={copy}>{copied ? 'Պատճենված է' : 'Պատճենել'}</button>
      </div>
      <div className="co-share-btns">
        {typeof navigator !== 'undefined' && navigator.share && <button type="button" className="btn btn-primary" onClick={share}>Կիսվել</button>}
        <a className="btn btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(`${text}
${url}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a className="btn btn-ghost" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">Telegram</a>
        <a className="btn btn-ghost" href={url} target="_blank" rel="noopener noreferrer">Բացել հրավերը</a>
      </div>
      <p className="co-share-note">Հրավերում երևում են պատվերի ժամանակ նշված անունները, ամսաթիվը և վայրը։ Եթե ինչ-որ բան պետք է փոխել, գրեք մեզ, և մենք կթարմացնենք այն՝ հղումը կմնա նույնը։</p>
    </section>
  )
}

const ORDER_STATUS = { new: 'Ընդունված', in_progress: 'Պատրաստվում է', delivered: 'Հանձնված', cancelled: 'Չեղարկված' }

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}, ${p(d.getHours())}:${p(d.getMinutes())}`
}

function stateCopy(d, pollsDone) {
  switch (d.paymentStatus) {
    case 'paid':
      return { tone: 'ok', eyebrow: 'Վճարումը հաստատված է', title: `Շնորհակալություն, ${d.customerName.split(' ')[0]}`,
        text: 'Ձեր պատվերը վճարված է։ Մենք կկապվենք Ձեզ հետ՝ հրավերի հաջորդ քայլերը համաձայնեցնելու համար։' }
    case 'pending':
      return pollsDone
        ? { tone: 'wait', eyebrow: 'Սպասում ենք հաստատման', title: 'Վճարումը դեռ հաստատված չէ',
            text: 'Եթե վճարումը կատարել եք, այն կհաստատվի մի քանի րոպեում, թարմացրեք էջը։ Եթե ոչ, կարող եք վճարել ստորև։' }
        : { tone: 'wait', eyebrow: 'Սպասում ենք հաստատման', title: 'Ստուգում ենք վճարումը',
            text: 'Սովորաբար դա տևում է մի քանի վայրկյան։ Էջը կթարմանա ինքնաբերաբար։' }
    case 'failed':
      return { tone: 'bad', eyebrow: 'Վճարումը չի կատարվել', title: 'Վճարումը չհաջողվեց',
        text: 'Վճարումը չհաստատվեց։ Պատվերը պահպանված է․ կարող եք փորձել կրկին՝ նույն կամ այլ եղանակով։' }
    case 'cancelled':
      return { tone: 'bad', eyebrow: 'Վճարումը չի կատարվել', title: 'Վճարումը չեղարկվեց',
        text: 'Դուք դուրս եկաք վճարման էջից առանց վճարելու։ Պատվերը պահպանված է, կարող եք վճարել ցանկացած պահի։' }
    case 'refunded':
      return { tone: 'muted', eyebrow: 'Վերադարձ', title: 'Գումարը վերադարձված է',
        text: 'Այս պատվերի վճարումը վերադարձվել է։ Հարցերի դեպքում գրեք մեզ։' }
    default: // unpaid
      if (d.amount == null) {
        return { tone: 'ok', eyebrow: 'Հայտը ստացված է', title: `Շնորհակալություն, ${d.customerName.split(' ')[0]}`,
          text: 'Մենք կկապվենք Ձեզ հետ՝ գինն ու մանրամասները հաստատելու համար։' }
      }
      return d.methods.length
        ? { tone: 'wait', eyebrow: 'Պատվերը գրանցված է', title: 'Մնում է վճարել', text: 'Ընտրեք վճարման եղանակը՝ պատվերը հաստատելու համար։' }
        : { tone: 'ok', eyebrow: 'Պատվերը գրանցված է', title: `Շնորհակալություն, ${d.customerName.split(' ')[0]}`,
            text: 'Մենք կկապվենք Ձեզ հետ վճարման մանրամասների համար։' }
  }
}

// The guests' answers to the shareable invitation: totals, the list, and a
// CSV download (opens in Excel / Google Sheets).
function GuestAnswers({ rsvps, orderNumber }) {
  const yes = rsvps.filter((r) => r.status === 'confirmed')
  const people = yes.reduce((n, r) => n + 1 + (r.plus || 0), 0)
  const download = () => {
    const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = [['Անուն', 'Պատասխան', 'Ուղեկցողներ', 'Նշում', 'Երբ'], ...rsvps.map((r) => [r.name, r.status === 'confirmed' ? 'Կգա' : 'Չի գա', r.plus || 0, r.note || '', fmtDate(r.at)])]
    // BOM first, so Excel reads the Armenian text as UTF-8
    const blob = new Blob(['\ufeff' + rows.map((r) => r.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `siloona-rsvp-${orderNumber}.csv` })
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  return (
    <section className="co-answers" aria-label="Հյուրերի պատասխանները">
      <h2>Հյուրերի պատասխանները</h2>
      {!rsvps.length ? (
        <p className="co-note center">Պատասխաններ դեռ չկան։ Դրանք կհայտնվեն այստեղ, հենց հյուրերը լրացնեն հրավերի ձևը։</p>
      ) : (
        <>
          <p className="co-ans-sum"><b>{people}</b> հոգի կգա ({yes.length} պատասխան) · <b>{rsvps.length - yes.length}</b> չի գա</p>
          <ul className="co-ans-list">
            {rsvps.map((r, i) => (
              <li key={i}>
                <span className="who">{r.name}{r.plus ? ` +${r.plus}` : ''}{r.note && <small>{r.note}</small>}</span>
                <span className={`st ${r.status}`}>{r.status === 'confirmed' ? 'Կգա' : 'Չի գա'}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-ghost" onClick={download}>Ներբեռնել ցուցակը (CSV)</button>
        </>
      )}
    </section>
  )
}

export default function CheckoutResult() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const fromUrl = params.get('order') && params.get('t')
  const last = fromUrl ? null : recallOrder()
  const id = fromUrl ? params.get('order') : last?.orderId
  const token = fromUrl ? params.get('t') : last?.token

  const [data, setData] = useState(null)
  const [err, setErr] = useState(id && token ? '' : 'Պատվերը չի գտնվել։ Ստուգեք հղումը։')
  const [polls, setPolls] = useState(0)
  const [method, setMethod] = useState(null)
  const [busy, setBusy] = useState(false)
  const [payErr, setPayErr] = useState('')
  const [copied, setCopied] = useState(false)
  const alive = useRef(true)

  const load = useCallback(async () => {
    try {
      const d = await getOrderStatus(id, token)
      if (!alive.current) return
      setData(d)
      // A real order, so it shows on «Իմ պատվերները» on this device too.
      rememberOrder(id, token)
      setMethod((m) => m || d.methods[0] || null)
      setErr('')
    } catch (e) {
      if (alive.current) setErr(e.message)
    }
  }, [id, token])

  useEffect(() => {
    alive.current = true
    if (id && token) load()
    // Put the order in the address bar so the page can be bookmarked.
    if (!fromUrl && id && token) navigate(orderLink(id, token), { replace: true })
    return () => { alive.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load])

  useEffect(() => {
    if (data?.paymentStatus !== 'pending' || polls >= MAX_POLLS) return
    const h = setTimeout(() => { setPolls((n) => n + 1); load() }, POLL_MS)
    return () => clearTimeout(h)
  }, [data, polls, load])

  useEffect(() => {
    const onShow = (e) => { if (e.persisted) { setBusy(false); load() } }
    window.addEventListener('pageshow', onShow)
    return () => window.removeEventListener('pageshow', onShow)
  }, [load])

  async function pay() {
    setPayErr('')
    setBusy(true)
    try {
      const r = await startPayment(id, token, method)
      if (r.alreadyPaid || !goToProvider(r)) { setBusy(false); load() }
    } catch (e) {
      setBusy(false)
      setPayErr(e.message)
      load()
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin + orderLink(id, token))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked — the link is in the address bar anyway */ }
  }

  if (err && !data) {
    return (
      <main className="co co-result">
        <div className="wrap co-empty">
          <p className="eyebrow">Պատվեր</p>
          <h1>{err}</h1>
          <div className="co-actions center">
            {id && token && <button type="button" className="btn btn-ghost" onClick={load}>Փորձել կրկին</button>}
            <Link className="btn btn-primary" to="/invitations">Դիտել հավաքածուն</Link>
          </div>
        </div>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="co co-result">
        <div className="wrap co-empty"><span className="co-spin lg" aria-hidden="true" /><p className="co-note center">Բեռնվում է…</p></div>
      </main>
    )
  }

  const design = findDesign(data.designId)
  const copy = stateCopy(data, polls >= MAX_POLLS)
  const pendingLive = data.paymentStatus === 'pending' && polls < MAX_POLLS
  const showPay = data.canPay && data.methods.length > 0 && !pendingLive

  return (
    <main className="co co-result">
      <div className="wrap">
        <article className={`co-card tone-${copy.tone}`} aria-live="polite">
          <div className="co-mark" aria-hidden="true">
            {copy.tone === 'ok' ? (
              <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" /><path d="m15 24.5 6 6 12-13" /></svg>
            ) : copy.tone === 'bad' ? (
              <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" /><path d="M17 17l14 14M31 17 17 31" /></svg>
            ) : pendingLive ? (
              <span className="co-spin lg" />
            ) : (
              <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" /><path d="M24 13v12l7 5" /></svg>
            )}
          </div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="co-lede">{copy.text}</p>
          {data.provider === 'test' && data.paymentStatus !== 'unpaid' && <p className="co-test-note">Թեստային վճարում · իրական գումար չի գանձվել</p>}
          {data.lastError && ['failed', 'cancelled'].includes(data.paymentStatus) && (
            <p className="co-reason">Պատճառ՝ {data.lastError}</p>
          )}

          {data.invitationCode && design?.previewSlug && <ShareInvitation code={data.invitationCode} />}
          {data.invitationCode && design?.previewSlug && <GuestAnswers rsvps={data.rsvps || []} orderNumber={data.orderNumber} />}

          <dl className="co-details">
            <div><dt>Պատվերի համար</dt><dd>№ {data.orderNumber}</dd></div>
            <div><dt>Դիզայն</dt><dd>{design ? design.code : data.designId === CUSTOM_DESIGN_ID ? CUSTOM_DESIGN_LABEL : data.designId}</dd></div>
            <div><dt>Տարբերակ</dt><dd>{OPTION_INFO[data.option]?.label}</dd></div>
            <div><dt>Գումար</dt><dd>{formatPrice(data.amount)}</dd></div>
            {data.provider && data.paymentStatus !== 'unpaid' && <div><dt>Վճարման եղանակ</dt><dd>{METHOD_INFO[data.provider]?.label || data.provider}</dd></div>}
            {data.cardMask && <div><dt>Քարտ</dt><dd>{data.cardMask}</dd></div>}
            {data.transactionId && ['paid', 'refunded'].includes(data.paymentStatus) && <div><dt>Գործարքի համար</dt><dd className="mono">{data.transactionId}</dd></div>}
            {data.paidAt && <div><dt>Վճարման ամսաթիվ</dt><dd>{fmtDate(data.paidAt)}</dd></div>}
            {data.paymentStatus === 'paid' && <div><dt>Պատվերի կարգավիճակ</dt><dd>{ORDER_STATUS[data.orderStatus]}</dd></div>}
            <div><dt>Ձևակերպված է</dt><dd>{fmtDate(data.createdAt)}</dd></div>
          </dl>

          {showPay && (
            <div className="co-retry">
              <PaymentMethods methods={data.methods} value={method} onChange={setMethod} disabled={busy} />
              {payErr && <p className="co-alert" role="alert">{payErr}</p>}
              <button type="button" className="btn btn-primary co-pay" onClick={pay} disabled={busy || !method} aria-busy={busy}>
                {busy ? <><span className="co-spin" aria-hidden="true" />Ուղղորդում ենք վճարման էջ…</> : `Վճարել ${formatPrice(data.amount)}`}
              </button>
              <SecureNote test={method === 'test'} />
            </div>
          )}

          <div className="co-foot">
            <p>Պահպանեք այս էջի հղումը՝ պատվերի կարգավիճակը ցանկացած պահի տեսնելու համար։{data.invitationCode && ' Այն միայն Ձեզ համար է․ հյուրերին ուղարկեք հրավերի հղումը։'}</p>
            <div className="co-actions center">
              <button type="button" className="btn btn-ghost" onClick={copyLink}>{copied ? 'Պատճենված է' : 'Պատճենել պատվերի հղումը'}</button>
              {data.paymentStatus === 'pending' && !pendingLive && <button type="button" className="btn btn-ghost" onClick={() => { setPolls(0); load() }}>Թարմացնել</button>}
              <Link className="btn btn-ghost" to="/">Գլխավոր էջ</Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}
