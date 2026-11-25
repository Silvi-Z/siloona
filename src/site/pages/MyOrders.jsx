import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { findDesign } from '../designCatalog'
import { designTitle } from '../designI18n'
import { CUSTOM_DESIGN_ID, CUSTOM_DESIGN_LABEL } from '../customRequest'
import { formatPrice } from '../pricing'
import { useLang, useText } from '../i18n'
import { getOrderStatus, listOrders, orderLink, rememberOrder } from '../checkout/checkoutApi'
import '../checkout/checkout.css'

// «Իմ պատվերները» — the orders placed (or opened by their link) on this
// device. Checkout needs no account, so the order link is the customer's
// key; this page keeps them all in one place, with the invitation link to
// share and how many guests have answered. An order from another device
// is added by pasting its link.

const TONE = { paid: 'ok', pending: 'wait', unpaid: 'wait', failed: 'bad', cancelled: 'bad', refunded: 'muted' }

const TEXT = {
  hy: {
    status: {
      paid: 'Վճարված', pending: 'Վճարումը ընթացքում է', unpaid: 'Վճարված չէ',
      failed: 'Վճարումը չի կատարվել', cancelled: 'Վճարումը չեղարկվել է', refunded: 'Գումարը վերադարձված է',
    },
    priceTbd: 'Գինը ճշտվում է', custom: CUSTOM_DESIGN_LABEL, locale: 'hy-AM',
    answers: (n, people) => <>Պատասխաններ՝ <b>{n}</b> · կգա <b>{people}</b> հոգի</>, noAnswers: 'Պատասխաններ դեռ չկան',
    open: 'Բացել պատվերը', copied: 'Պատճենված է', copyLink: 'Պատճենել հղումը',
    notLink: 'Սա պատվերի հղում չէ։ Այն սկսվում է …/checkout/result?order=…',
    title: 'Իմ պատվերները', loading: 'Բեռնվում է…', empty: 'Այս սարքում պատվերներ դեռ չկան։', choose: 'Ընտրել հրավիրատոմս →',
    loadErr: 'Որոշ պատվերներ չհաջողվեց բեռնել։ Ստուգեք ինտերնետ կապը և թարմացրեք էջը։',
    pasteLabel: 'Պատվերը կատարել եք այլ սարքից՝ տեղադրեք պատվերի հղումը', add: 'Ավելացնել',
  },
  ru: {
    status: {
      paid: 'Оплачен', pending: 'Оплата в процессе', unpaid: 'Не оплачен',
      failed: 'Оплата не прошла', cancelled: 'Оплата отменена', refunded: 'Деньги возвращены',
    },
    priceTbd: 'Цена уточняется', custom: 'Индивидуальный дизайн', locale: 'ru-RU',
    answers: (n, people) => <>Ответов: <b>{n}</b> · придут <b>{people}</b> чел.</>, noAnswers: 'Ответов пока нет',
    open: 'Открыть заказ', copied: 'Скопировано', copyLink: 'Копировать ссылку',
    notLink: 'Это не ссылка на заказ. Она начинается с …/checkout/result?order=…',
    title: 'Мои заказы', loading: 'Загрузка…', empty: 'На этом устройстве заказов пока нет.', choose: 'Выбрать приглашение →',
    loadErr: 'Некоторые заказы не удалось загрузить. Проверьте подключение к интернету и обновите страницу.',
    pasteLabel: 'Заказ сделан с другого устройства? Вставьте ссылку на заказ', add: 'Добавить',
  },
  en: {
    status: {
      paid: 'Paid', pending: 'Payment in progress', unpaid: 'Not paid',
      failed: 'Payment failed', cancelled: 'Payment cancelled', refunded: 'Refunded',
    },
    priceTbd: 'Price being confirmed', custom: 'Custom design', locale: 'en-GB',
    answers: (n, people) => <>Answers: <b>{n}</b> · <b>{people}</b> attending</>, noAnswers: 'No answers yet',
    open: 'Open the order', copied: 'Copied', copyLink: 'Copy the link',
    notLink: 'This isn’t an order link. It starts with …/checkout/result?order=…',
    title: 'My orders', loading: 'Loading…', empty: 'No orders on this device yet.', choose: 'Choose an invitation →',
    loadErr: 'Some orders couldn’t be loaded. Check your internet connection and refresh the page.',
    pasteLabel: 'Ordered from another device? Paste the order link', add: 'Add',
  },
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
  const { lang, to } = useLang()
  const t = useText(TEXT)
  const d = o.data
  const design = findDesign(d.designId)
  const name = design ? `${design.code} · ${designTitle(design, lang)}` : d.designId === CUSTOM_DESIGN_ID ? t.custom : d.designId
  const [label, tone] = d.amount == null && d.paymentStatus === 'unpaid' ? [t.priceTbd, 'wait'] : TONE[d.paymentStatus] ? [t.status[d.paymentStatus], TONE[d.paymentStatus]] : [d.paymentStatus, 'muted']
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
      <p className="mo-meta">{formatPrice(d.amount, lang)} · {new Date(d.createdAt).toLocaleDateString(t.locale)}</p>
      {link && (
        <>
          <p className="mo-link"><a href={link} target="_blank" rel="noopener noreferrer">{link.replace(/^https?:\/\//, '')}</a></p>
          <p className="mo-ans">{d.rsvps?.length ? t.answers(d.rsvps.length, people) : t.noAnswers}</p>
        </>
      )}
      <div className="mo-actions">
        <Link className="btn btn-primary" to={to(orderLink(o.orderId, o.token))}>{t.open}</Link>
        {link && (
          <button type="button" className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })}>
            {copied ? t.copied : t.copyLink}
          </button>
        )}
      </div>
    </li>
  )
}

export default function MyOrders() {
  const { to } = useLang()
  const t = useText(TEXT)
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
    if (!o) { setPasteErr(t.notLink); return }
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
        <h1 className="co-title">{t.title}</h1>
        {orders === null ? (
          <p className="co-note">{t.loading}</p>
        ) : shown.length ? (
          <ul className="mo-list">{shown.map((o) => <OrderCard key={o.orderId} o={o} />)}</ul>
        ) : (
          <div className="co-note">
            {t.empty} <Link to={to('/invitations')}>{t.choose}</Link>
          </div>
        )}
        {orders?.some((o) => o.error === 'error') && <p className="co-alert">{t.loadErr}</p>}

        <form className="mo-add" onSubmit={add}>
          <label htmlFor="mo-paste">{t.pasteLabel}</label>
          <div className="mo-add-row">
            <input id="mo-paste" value={paste} onChange={(e) => { setPaste(e.target.value); setPasteErr('') }} placeholder="https://…/checkout/result?order=…" />
            <button type="submit" className="btn btn-ghost">{t.add}</button>
          </div>
          {pasteErr && <p className="co-err">{pasteErr}</p>}
        </form>
      </div>
    </main>
  )
}
