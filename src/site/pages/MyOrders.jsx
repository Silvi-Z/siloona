import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { findDesign } from '../designCatalog'
import { CUSTOM_DESIGN_ID, CUSTOM_DESIGN_LABEL } from '../customRequest'
import { formatPrice } from '../pricing'
import { getOrderStatus, listOrders, orderLink, rememberOrder } from '../checkout/checkoutApi'
import '../checkout/checkout.css'

// «Իմ պատվերները» — the orders placed (or opened by their link) on this
// device. Checkout needs no account, so the order link is the customer's
// key; this page keeps them all in one place, with the invitation link to
// share and how many guests have answered. An order from another device
// is added by pasting its link.

const STATUS = {
  paid: ['Վճարված', 'ok'],
  pending: ['Վճարումը ընթացքում է', 'wait'],
  unpaid: ['Վճարված չէ', 'wait'],
  failed: ['Վճարումը չի կատարվել', 'bad'],
  cancelled: ['Վճարումը չեղարկվել է', 'bad'],
  refunded: ['Գումարը վերադարձված է', 'muted'],
}

function parseLink(text) {
  try {
    const u = new URL(text.trim(), window.location.origin)
    const orderId = u.searchParams.get('order')
    const token = u.searchParams.get('t')
    return orderId && token ? { orderId, token } : null
  } catch { return null }
}

function OrderCard({ o }) {
  const d = o.data
  const design = findDesign(d.designId)
  const name = design ? `${design.code} · ${design.title}` : d.designId === CUSTOM_DESIGN_ID ? CUSTOM_DESIGN_LABEL : d.designId
  const [label, tone] = d.amount == null && d.paymentStatus === 'unpaid' ? ['Գինը ճշտվում է', 'wait'] : STATUS[d.paymentStatus] || [d.paymentStatus, 'muted']
  const link = d.invitationCode && design?.previewSlug ? `${window.location.origin}/i/${d.invitationCode}` : null
  const coming = (d.rsvps || []).filter((r) => r.status === 'confirmed')
  const people = coming.reduce((n, r) => n + 1 + (r.plus || 0), 0)
  const [copied, setCopied] = useState(false)
  return (
    <li className="mo-card">
      <div className="mo-top">
        <span className="mo-num">№ {d.orderNumber}</span>
        <span className={`mo-st tone-${tone}`}>{label}</span>
      </div>
      <h2 className="mo-name">{name}</h2>
      <p className="mo-meta">{formatPrice(d.amount)} · {new Date(d.createdAt).toLocaleDateString('hy-AM')}</p>
      {link && (
        <>
          <p className="mo-link"><a href={link} target="_blank" rel="noopener noreferrer">{link.replace(/^https?:\/\//, '')}</a></p>
          <p className="mo-ans">{d.rsvps?.length ? <>Պատասխաններ՝ <b>{d.rsvps.length}</b> · կգա <b>{people}</b> հոգի</> : 'Պատասխաններ դեռ չկան'}</p>
        </>
      )}
      <div className="mo-actions">
        <Link className="btn btn-primary" to={orderLink(o.orderId, o.token)}>Բացել պատվերը</Link>
        {link && (
          <button type="button" className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })}>
            {copied ? 'Պատճենված է' : 'Պատճենել հղումը'}
          </button>
        )}
      </div>
    </li>
  )
}

export default function MyOrders() {
  const [orders, setOrders] = useState(null)
  const [paste, setPaste] = useState('')
  const [pasteErr, setPasteErr] = useState('')

  const load = async () => {
    const saved = listOrders()
    const got = await Promise.all(saved.map(async (o) => {
      try { return { ...o, data: await getOrderStatus(o.orderId, o.token) } } catch (e) { return { ...o, error: e.status === 404 ? 'gone' : 'error' } }
    }))
    setOrders(got)
  }
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    const o = parseLink(paste)
    if (!o) { setPasteErr('Սա պատվերի հղում չէ։ Այն սկսվում է …/checkout/result?order=…'); return }
    try {
      await getOrderStatus(o.orderId, o.token)
      rememberOrder(o.orderId, o.token)
      setPaste(''); setPasteErr('')
      load()
    } catch (err) { setPasteErr(err.message) }
  }

  const shown = (orders || []).filter((o) => o.data)
  return (
    <main className="co mo">
      <div className="wrap">
        <p className="eyebrow">Siloona</p>
        <h1 className="co-title">Իմ պատվերները</h1>
        {orders === null ? (
          <p className="co-note">Բեռնվում է…</p>
        ) : shown.length ? (
          <ul className="mo-list">{shown.map((o) => <OrderCard key={o.orderId} o={o} />)}</ul>
        ) : (
          <div className="co-note">
            Այս սարքում պատվերներ դեռ չկան։ <Link to="/invitations">Ընտրել հրավիրատոմս →</Link>
          </div>
        )}
        {orders?.some((o) => o.error === 'error') && <p className="co-alert">Որոշ պատվերներ չհաջողվեց բեռնել։ Ստուգեք ինտերնետ կապը և թարմացրեք էջը։</p>}

        <form className="mo-add" onSubmit={add}>
          <label htmlFor="mo-paste">Պատվերը կատարել եք այլ սարքից՝ տեղադրեք պատվերի հղումը</label>
          <div className="mo-add-row">
            <input id="mo-paste" value={paste} onChange={(e) => { setPaste(e.target.value); setPasteErr('') }} placeholder="https://…/checkout/result?order=…" />
            <button type="submit" className="btn btn-ghost">Ավելացնել</button>
          </div>
          {pasteErr && <p className="co-err">{pasteErr}</p>}
        </form>
      </div>
    </main>
  )
}
