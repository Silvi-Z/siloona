import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { findDesign } from '../designCatalog'
import { CUSTOM_DESIGN_ID, CUSTOM_DESIGN_LABEL } from '../customRequest'
import { formatPrice } from '../pricing'
import { useLang, useText } from '../i18n'
import PaymentMethods, { SecureNote } from './PaymentMethods'
import OrderPreview from './OrderPreview'
import { CONTACTS, opensTab } from '../contacts'
import ContactIcon from '../ContactIcon'
import RsvpQuestions from './RsvpQuestions'
import ThankYouEditor from './ThankYouEditor'
import { GuestsSetup, LiveHint, SeatingSetup } from './CoupleSetup'
import { addonName } from '../addons'
import {
  getOrderStatus, goToProvider, isTestChoice, methodInfo, paymentChoices, optionInfo, orderLink, recallOrder, rememberOrder, startPayment,
} from './checkoutApi'
import './checkout.css'
import { CUSTOMER_DASHBOARD } from '../features'

// The customer's order page. Everything shown comes from the server
// (/api/orders/status), which reads the payment state from the provider —
// nothing in this URL can make an order look paid.

const TEXT = {
  hy: {
    invitation: 'Հրավեր', linkLabel: 'Հրավերի հղում', yourInvitation: 'Ձեր հրավերը', sendLink: 'Ուղարկեք այս հղումը հյուրերին',
    copied: 'Պատճենված է', copy: 'Պատճենել', share: 'Կիսվել', openInvitation: 'Բացել հրավերը',
    shareNote: 'Հրավերում երևում են պատվերի ժամանակ նշված անունները, ամսաթիվը և վայրը։ Եթե ինչ-որ բան պետք է փոխել, գրեք մեզ, և մենք կթարմացնենք այն՝ հղումը կմնա նույնը։',
    status: { new: 'Ընդունված', in_progress: 'Պատրաստվում է', delivered: 'Հանձնված', cancelled: 'Չեղարկված' },
    paidEyebrow: 'Վճարումը հաստատված է', thanks: (n) => `Շնորհակալություն, ${n}`,
    paidText: 'Ձեր պատվերը վճարված է։ Մենք կկապվենք Ձեզ հետ՝ հրավերի հաջորդ քայլերը համաձայնեցնելու համար։',
    waitEyebrow: 'Սպասում ենք հաստատման', notYet: 'Վճարումը դեռ հաստատված չէ',
    notYetText: 'Եթե վճարումը կատարել եք, այն կհաստատվի մի քանի րոպեում, թարմացրեք էջը։ Եթե ոչ, կարող եք վճարել ստորև։',
    checking: 'Ստուգում ենք վճարումը', checkingText: 'Սովորաբար դա տևում է մի քանի վայրկյան։ Էջը կթարմանա ինքնաբերաբար։',
    failEyebrow: 'Վճարումը չի կատարվել', failed: 'Վճարումը չհաջողվեց',
    failedText: 'Վճարումը չհաստատվեց։ Պատվերը պահպանված է․ կարող եք փորձել կրկին՝ նույն կամ այլ եղանակով։',
    cancelled: 'Վճարումը չեղարկվեց', cancelledText: 'Դուք դուրս եկաք վճարման էջից առանց վճարելու։ Պատվերը պահպանված է, կարող եք վճարել ցանկացած պահի։',
    refundEyebrow: 'Վերադարձ', refunded: 'Գումարը վերադարձված է', refundedText: 'Այս պատվերի վճարումը վերադարձվել է։ Հարցերի դեպքում գրեք մեզ։',
    requestEyebrow: 'Հայտը ստացված է', requestText: 'Մենք կկապվենք Ձեզ հետ՝ գինն ու մանրամասները հաստատելու համար։',
    placedEyebrow: 'Պատվերը գրանցված է', toPay: 'Մնում է վճարել', toPayText: 'Ընտրեք վճարման եղանակը՝ պատվերը հաստատելու համար։',
    contactPay: 'Մենք կկապվենք Ձեզ հետ նույն օրը՝ կճշտենք վճարումը և կուղարկենք հրավերի հղումը։',
    accepted: 'Պատվերը ընդունված է', acceptedText: 'Նույն օրը կկապվենք Ձեզ հետ՝ վճարումը համաձայնեցնելու համար։', writeUs: 'Կամ գրեք մեզ',
    csvHead: ['Անուն', 'Պատասխան', 'Ուղեկցողներ', 'Նշում', 'Երբ'], yes: 'Կգա', no: 'Չի գա', ansYes: 'Այո', ansNo: 'Ոչ',
    answers: 'Հյուրերի պատասխանները', noAnswers: 'Պատասխաններ դեռ չկան։ Դրանք կհայտնվեն այստեղ, հենց հյուրերը լրացնեն հրավերի ձևը։',
    answersSum: (people, yes, no) => <><b>{people}</b> հոգի կգա ({yes} պատասխան) · <b>{no}</b> չի գա</>,
    download: 'Ներբեռնել ցուցակը (CSV)',
    notFound: 'Պատվերը չի գտնվել։ Ստուգեք հղումը։', order: 'Պատվեր', retry: 'Փորձել կրկին', viewCollection: 'Դիտել հավաքածուն',
    loading: 'Բեռնվում է…', testNote: 'Թեստային վճարում · իրական գումար չի գանձվել', reason: 'Պատճառ՝',
    orderNumber: 'Պատվերի համար', design: 'Դիզայն', option: 'Տարբերակ', amount: 'Գումար', method: 'Վճարման եղանակ', card: 'Քարտ',
    txId: 'Գործարքի համար', paidAt: 'Վճարման ամսաթիվ', orderStatus: 'Պատվերի կարգավիճակ', created: 'Ձևակերպված է', addons: 'Հավելումներ',
    redirecting: 'Ուղղորդում ենք վճարման էջ…', pay: (a) => `Վճարել ${a}`,
    keepLink: 'Պահպանեք այս էջի հղումը՝ պատվերի կարգավիճակը ցանկացած պահի տեսնելու համար։',
    onlyYou: ' Այն միայն Ձեզ համար է․ հյուրերին ուղարկեք հրավերի հղումը։',
    copyOrder: 'Պատճենել պատվերի հղումը', refresh: 'Թարմացնել', home: 'Գլխավոր էջ', custom: 'Անհատական դիզայն',
    wbEyebrow: 'Մաղթանքների գիրք', wbTitle: 'Ձեր հյուրերի մաղթանքները', wbText: 'Հյուրերի թողած մաղթանքները տեսնում եք միայն Դուք։ Կարող եք թաքցնել որևէ մեկը, ներբեռնել կամ տպել։', wbOpen: 'Բացել գիրքը',
    manageEyebrow: 'Անձնական հրավերներ', manageTitle: 'Ուղարկեք յուրաքանչյուր հյուրին իր հրավերը',
    manageText: 'Ձեր վահանակում ավելացրեք հյուրերին․ յուրաքանչյուրը կստանա իր անունով հրավեր, իսկ Դուք կտեսնեք, թե ով է բացել և ինչ է պատասխանել։',
    manageBtn: 'Բացել վահանակը', linkedText: 'Պատվերը կապված է Ձեր վահանակի հետ․ հյուրերի նոր պատասխանները այնտեղ են։',
  },
  ru: {
    invitation: 'Приглашение', linkLabel: 'Ссылка на приглашение', yourInvitation: 'Ваше приглашение', sendLink: 'Отправьте эту ссылку гостям',
    copied: 'Скопировано', copy: 'Копировать', share: 'Поделиться', openInvitation: 'Открыть приглашение',
    shareNote: 'В приглашении указаны имена, дата и место, которые Вы указали при заказе. Если что-то нужно изменить, напишите нам, и мы обновим его — ссылка останется прежней.',
    status: { new: 'Принят', in_progress: 'Готовится', delivered: 'Выполнен', cancelled: 'Отменён' },
    paidEyebrow: 'Оплата подтверждена', thanks: (n) => `Спасибо, ${n}`,
    paidText: 'Ваш заказ оплачен. Мы свяжемся с Вами, чтобы согласовать следующие шаги по приглашению.',
    waitEyebrow: 'Ждём подтверждения', notYet: 'Оплата ещё не подтверждена',
    notYetText: 'Если Вы уже оплатили, оплата подтвердится в течение нескольких минут — обновите страницу. Если нет, Вы можете оплатить ниже.',
    checking: 'Проверяем оплату', checkingText: 'Обычно это занимает несколько секунд. Страница обновится сама.',
    failEyebrow: 'Оплата не прошла', failed: 'Оплата не удалась',
    failedText: 'Оплата не подтвердилась. Заказ сохранён — можно попробовать ещё раз тем же или другим способом.',
    cancelled: 'Оплата отменена', cancelledText: 'Вы вышли со страницы оплаты, не оплатив заказ. Заказ сохранён, оплатить его можно в любой момент.',
    refundEyebrow: 'Возврат', refunded: 'Деньги возвращены', refundedText: 'Оплата по этому заказу возвращена. Если есть вопросы, напишите нам.',
    requestEyebrow: 'Заявка получена', requestText: 'Мы свяжемся с Вами, чтобы согласовать цену и детали.',
    placedEyebrow: 'Заказ оформлен', toPay: 'Осталось оплатить', toPayText: 'Выберите способ оплаты, чтобы подтвердить заказ.',
    contactPay: 'Мы свяжемся с Вами в тот же день, уточним оплату и пришлём ссылку на приглашение.',
    accepted: 'Заказ принят', acceptedText: 'Мы свяжемся с Вами в тот же день, чтобы согласовать оплату.', writeUs: 'Или напишите нам',
    csvHead: ['Имя', 'Ответ', 'Сопровождающие', 'Комментарий', 'Когда'], yes: 'Придёт', no: 'Не придёт', ansYes: 'Да', ansNo: 'Нет',
    answers: 'Ответы гостей', noAnswers: 'Ответов пока нет. Они появятся здесь, как только гости заполнят форму в приглашении.',
    answersSum: (people, yes, no) => <>Придут: <b>{people}</b> чел. (ответов: {yes}) · не придут: <b>{no}</b></>,
    download: 'Скачать список (CSV)',
    notFound: 'Заказ не найден. Проверьте ссылку.', order: 'Заказ', retry: 'Попробовать ещё раз', viewCollection: 'Смотреть коллекцию',
    loading: 'Загрузка…', testNote: 'Тестовая оплата · реальные деньги не списаны', reason: 'Причина:',
    orderNumber: 'Номер заказа', design: 'Дизайн', option: 'Вариант', amount: 'Сумма', method: 'Способ оплаты', card: 'Карта',
    txId: 'Номер транзакции', paidAt: 'Дата оплаты', orderStatus: 'Статус заказа', created: 'Оформлен', addons: 'Дополнения',
    redirecting: 'Переходим на страницу оплаты…', pay: (a) => `Оплатить ${a}`,
    keepLink: 'Сохраните ссылку на эту страницу, чтобы в любой момент видеть статус заказа.',
    onlyYou: ' Она только для Вас — гостям отправляйте ссылку на приглашение.',
    copyOrder: 'Копировать ссылку на заказ', refresh: 'Обновить', home: 'На главную', custom: 'Индивидуальный дизайн',
    wbEyebrow: 'Книга пожеланий', wbTitle: 'Пожелания ваших гостей', wbText: 'Пожелания гостей видите только вы. Можно скрыть любое, скачать или распечатать.', wbOpen: 'Открыть книгу',
    manageEyebrow: 'Личные приглашения', manageTitle: 'Отправьте каждому гостю его приглашение',
    manageText: 'Добавьте гостей в личном кабинете: каждый получит приглашение со своим именем, а Вы увидите, кто открыл его и что ответил.',
    manageBtn: 'Открыть кабинет', linkedText: 'Заказ связан с Вашим кабинетом — новые ответы гостей теперь там.',
  },
  en: {
    invitation: 'Invitation', linkLabel: 'Invitation link', yourInvitation: 'Your invitation', sendLink: 'Send this link to your guests',
    copied: 'Copied', copy: 'Copy', share: 'Share', openInvitation: 'Open the invitation',
    shareNote: 'The invitation shows the names, date and venue you gave when ordering. If anything needs changing, write to us and we’ll update it — the link stays the same.',
    status: { new: 'Received', in_progress: 'In progress', delivered: 'Delivered', cancelled: 'Cancelled' },
    paidEyebrow: 'Payment confirmed', thanks: (n) => `Thank you, ${n}`,
    paidText: 'Your order is paid. We’ll be in touch to agree the next steps for your invitation.',
    waitEyebrow: 'Awaiting confirmation', notYet: 'Payment not confirmed yet',
    notYetText: 'If you’ve already paid, it will be confirmed within a few minutes — refresh the page. If not, you can pay below.',
    checking: 'Checking your payment', checkingText: 'This usually takes a few seconds. The page will update by itself.',
    failEyebrow: 'Payment not completed', failed: 'Payment failed',
    failedText: 'The payment wasn’t confirmed. Your order is saved — you can try again with the same or another method.',
    cancelled: 'Payment cancelled', cancelledText: 'You left the payment page without paying. Your order is saved and you can pay at any time.',
    refundEyebrow: 'Refund', refunded: 'Payment refunded', refundedText: 'The payment for this order has been refunded. If you have any questions, write to us.',
    requestEyebrow: 'Request received', requestText: 'We’ll be in touch to confirm the price and details.',
    placedEyebrow: 'Order placed', toPay: 'One step left: payment', toPayText: 'Choose a payment method to confirm your order.',
    contactPay: 'We’ll get in touch the same day to arrange payment and send you the invitation link.',
    accepted: 'Order received', acceptedText: 'We’ll get in touch the same day to arrange payment.', writeUs: 'Or write to us',
    csvHead: ['Name', 'Answer', 'Plus-ones', 'Note', 'When'], yes: 'Attending', no: 'Not attending', ansYes: 'Yes', ansNo: 'No',
    answers: 'Guests’ answers', noAnswers: 'No answers yet. They’ll appear here as soon as guests fill in the form in the invitation.',
    answersSum: (people, yes, no) => <><b>{people}</b> attending ({yes} answers) · <b>{no}</b> not attending</>,
    download: 'Download the list (CSV)',
    notFound: 'Order not found. Please check the link.', order: 'Order', retry: 'Try again', viewCollection: 'View the collection',
    loading: 'Loading…', testNote: 'Test payment · no real money was charged', reason: 'Reason:',
    orderNumber: 'Order number', design: 'Design', option: 'Option', amount: 'Amount', method: 'Payment method', card: 'Card',
    txId: 'Transaction ID', paidAt: 'Payment date', orderStatus: 'Order status', created: 'Placed', addons: 'Add-ons',
    redirecting: 'Taking you to the payment page…', pay: (a) => `Pay ${a}`,
    keepLink: 'Keep the link to this page to check your order status at any time.',
    onlyYou: ' It’s for you only — send your guests the invitation link.',
    copyOrder: 'Copy order link', refresh: 'Refresh', home: 'Home page', custom: 'Custom design',
    wbEyebrow: 'Wishes book', wbTitle: 'Your guests’ wishes', wbText: 'Only you can see the wishes your guests leave. Hide any of them, download or print them.', wbOpen: 'Open the book',
    manageEyebrow: 'Personal invitations', manageTitle: 'Send each guest their own invitation',
    manageText: 'Add your guests in your dashboard: each one gets an invitation with their name, and you see who opened it and what they answered.',
    manageBtn: 'Open your dashboard', linkedText: 'This order is linked to your dashboard — new answers from guests are there now.',
  },
}

const POLL_MS = 3000
const MAX_POLLS = 40 // ~2 minutes

// The paid order's invitation link, ready to send to guests.
function ShareInvitation({ code }) {
  const t = useText(TEXT)
  const url = `${window.location.origin}/i/${code}`
  const shown = url.replace(/^https?:\/\//, '')
  const [copied, setCopied] = useState(false)
  const text = t.invitation
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked — the link is visible to select */ }
  }
  const share = () => navigator.share({ title: text, url }).catch(() => {})
  return (
    <section className="co-share" aria-label={t.linkLabel}>
      <p className="eyebrow">{t.yourInvitation}</p>
      <h2>{t.sendLink}</h2>
      <div className="co-link">
        <a href={url} target="_blank" rel="noopener noreferrer">{shown}</a>
        <button type="button" onClick={copy}>{copied ? t.copied : t.copy}</button>
      </div>
      <div className="co-share-btns">
        {typeof navigator !== 'undefined' && navigator.share && <button type="button" className="btn btn-primary" onClick={share}>{t.share}</button>}
        <a className="btn btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(`${text}
${url}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a className="btn btn-ghost" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">Telegram</a>
        <a className="btn btn-ghost" href={url} target="_blank" rel="noopener noreferrer">{t.openInvitation}</a>
      </div>
      <p className="co-share-note">{t.shareNote}</p>
    </section>
  )
}

// Paid: bring the order into the customer's dashboard (guest list,
// personal links, answers) — /dashboard?claim=… links it once they sign in.
function ManageGuests({ id, token, linked }) {
  const t = useText(TEXT)
  const href = linked ? '/dashboard' : `/dashboard?claim=${encodeURIComponent(id)}&t=${encodeURIComponent(token)}`
  return (
    <section className="co-share" aria-label={t.manageEyebrow}>
      <p className="eyebrow">{t.manageEyebrow}</p>
      <h2>{t.manageTitle}</h2>
      <p className="co-share-note" style={{ marginTop: 0 }}>{linked ? t.linkedText : t.manageText}</p>
      <div className="co-share-btns">
        <a className="btn btn-primary" href={href}>{t.manageBtn}</a>
      </div>
    </section>
  )
}

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}, ${p(d.getHours())}:${p(d.getMinutes())}`
}

function stateCopy(d, pollsDone, t) {
  const first = d.customerName.split(' ')[0]
  // only a payment really going on now is «being checked»; one left on
  // the bank's page is an unpaid order
  const status = d.paymentStatus === 'pending' && !d.payingNow ? 'unpaid' : d.paymentStatus
  switch (status) {
    case 'paid':
      return { tone: 'ok', eyebrow: t.paidEyebrow, title: t.thanks(first), text: t.paidText }
    case 'pending':
      return pollsDone
        ? { tone: 'wait', eyebrow: t.waitEyebrow, title: t.notYet, text: t.notYetText }
        : { tone: 'wait', eyebrow: t.waitEyebrow, title: t.checking, text: t.checkingText }
    case 'failed':
      return { tone: 'bad', eyebrow: t.failEyebrow, title: t.failed, text: t.failedText }
    case 'cancelled':
      return { tone: 'bad', eyebrow: t.failEyebrow, title: t.cancelled, text: t.cancelledText }
    case 'refunded':
      return { tone: 'muted', eyebrow: t.refundEyebrow, title: t.refunded, text: t.refundedText }
    default: // unpaid
      if (d.amount == null) {
        return { tone: 'ok', eyebrow: t.requestEyebrow, title: t.thanks(first), text: t.requestText }
      }
      return d.methods.length
        ? { tone: 'wait', eyebrow: t.placedEyebrow, title: t.toPay, text: t.toPayText }
        // no online payment (orders as requests): we get in touch
        : { tone: 'ok', eyebrow: t.placedEyebrow, title: t.accepted, text: t.acceptedText }
  }
}

// The guests' answers to the shareable invitation: totals, the list, and a
// CSV download (opens in Excel / Google Sheets).
// The couple's own questions' answers as text: «Այո»/«Ոչ» for yes/no.
const answerText = (q, v, t) => (q.type === 'yesno' ? (v === 'yes' ? t.ansYes : v === 'no' ? t.ansNo : '') : v || '')

function GuestAnswers({ rsvps, orderNumber, questions = [] }) {
  const t = useText(TEXT)
  const yes = rsvps.filter((r) => r.status === 'confirmed')
  const people = yes.reduce((n, r) => n + 1 + (r.plus || 0), 0)
  const download = () => {
    const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    // one column per question of the couple's
    const rows = [[...t.csvHead, ...questions.map((q) => q.text)], ...rsvps.map((r) => [r.name, r.status === 'confirmed' ? t.yes : t.no, r.plus || 0, r.note || '', fmtDate(r.at), ...questions.map((q) => answerText(q, r.answers?.[q.id], t))])]
    // BOM first, so Excel reads the Armenian text as UTF-8
    const blob = new Blob(['\ufeff' + rows.map((r) => r.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `siloona-rsvp-${orderNumber}.csv` })
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  return (
    <section className="co-answers" aria-label={t.answers}>
      <h2>{t.answers}</h2>
      {!rsvps.length ? (
        <p className="co-note center">{t.noAnswers}</p>
      ) : (
        <>
          <p className="co-ans-sum">{t.answersSum(people, yes.length, rsvps.length - yes.length)}</p>
          <ul className="co-ans-list">
            {rsvps.map((r, i) => (
              <li key={i}>
                <span className="who">
                  {r.name}{r.plus ? ` +${r.plus}` : ''}{r.note && <small>{r.note}</small>}
                  {questions.filter((q) => r.answers?.[q.id]).map((q) => <small key={q.id}>{q.text}՝ {answerText(q, r.answers[q.id], t)}</small>)}
                </span>
                <span className={`st ${r.status}`}>{r.status === 'confirmed' ? t.yes : t.no}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-ghost" onClick={download}>{t.download}</button>
        </>
      )}
    </section>
  )
}

export default function CheckoutResult() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { lang, to } = useLang()
  const t = useText(TEXT)
  const fromUrl = params.get('order') && params.get('t')
  const last = fromUrl ? null : recallOrder()
  const id = fromUrl ? params.get('order') : last?.orderId
  const token = fromUrl ? params.get('t') : last?.token

  const [data, setData] = useState(null)
  const [err, setErr] = useState(id && token ? '' : t.notFound)
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
      setMethod((m) => m || paymentChoices(d.methods)[0] || null)
      setErr('')
    } catch (e) {
      if (alive.current) setErr(e.message)
    }
  }, [id, token])

  useEffect(() => {
    alive.current = true
    if (id && token) load()
    // Put the order in the address bar so the page can be bookmarked.
    if (!fromUrl && id && token) navigate(to(orderLink(id, token)), { replace: true })
    return () => { alive.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load])

  useEffect(() => {
    if (data?.paymentStatus !== 'pending' || !data.payingNow || polls >= MAX_POLLS) return
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
      await navigator.clipboard.writeText(window.location.origin + to(orderLink(id, token)))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked — the link is in the address bar anyway */ }
  }

  if (err && !data) {
    return (
      <main className="co co-result">
        <div className="wrap co-empty">
          <p className="eyebrow">{t.order}</p>
          <h1>{err}</h1>
          <div className="co-actions center">
            {id && token && <button type="button" className="btn btn-ghost" onClick={load}>{t.retry}</button>}
            <Link className="btn btn-primary" to={to('/invitations')}>{t.viewCollection}</Link>
          </div>
        </div>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="co co-result">
        <div className="wrap co-empty"><span className="co-spin lg" aria-hidden="true" /><p className="co-note center">{t.loading}</p></div>
      </main>
    )
  }

  const design = findDesign(data.designId)
  const copy = stateCopy(data, polls >= MAX_POLLS, t)
  const OPTION_INFO = optionInfo(lang)
  const METHOD_INFO = methodInfo(lang)
  const pendingLive = data.paymentStatus === 'pending' && data.payingNow && polls < MAX_POLLS
  // no online payment switched on: how to reach us, for an order still to pay
  const contactUs = !data.methods.length && !['paid', 'refunded'].includes(data.paymentStatus) && data.orderStatus !== 'cancelled'
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
          {data.provider === 'test' && data.paymentStatus !== 'unpaid' && <p className="co-test-note">{t.testNote}</p>}
          {data.lastError && ['failed', 'cancelled'].includes(data.paymentStatus) && (
            <p className="co-reason">{t.reason} {data.lastError}</p>
          )}

          {contactUs && (
            <div className="co-contact">
              <p className="co-contact-h">{t.writeUs}</p>
              <div className="co-contact-row">
                {CONTACTS.map((c) => (
                  <a key={c.id} className="co-contact-btn" href={c.href} {...(opensTab(c.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    <ContactIcon id={c.id} /><span>{c.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          {data.invitationCode && design?.previewSlug && <ShareInvitation code={data.invitationCode} />}
          {design?.previewSlug && data.preview && data.paymentStatus !== 'refunded' && data.orderStatus !== 'cancelled' && (
            <OrderPreview slug={design.previewSlug} preview={data.preview} paid={data.paymentStatus === 'paid'} />
          )}
          {CUSTOMER_DASHBOARD && data.invitationCode && design?.previewSlug && <ManageGuests id={id} token={token} linked={data.linked} />}
          {/* add-ons whose data the couple fills in here (CoupleSetup.jsx) */}
          {data.invitationCode && data.setup?.seating && <SeatingSetup id={id} token={token} eventDate={data.preview?.customization?.eventDate} />}
          {data.invitationCode && data.setup?.guests && <GuestsSetup id={id} token={token} code={data.invitationCode} />}
          {data.invitationCode && data.setup?.liveSchedule && design?.previewSlug && <LiveHint slug={design.previewSlug} preview={data.preview} />}
          {data.invitationCode && Array.isArray(data.rsvpQuestions) && (
            <RsvpQuestions id={id} token={token} questions={data.rsvpQuestions} onSaved={(qs) => setData((d) => ({ ...d, rsvpQuestions: qs }))} />
          )}
          {data.invitationCode && data.thankYou && (
            <ThankYouEditor id={id} token={token} value={data.thankYou} eventDate={data.preview?.customization?.eventDate} />
          )}
          {data.invitationCode && data.wishesBook && (
            <section className="co-share" aria-labelledby="co-wb-h">
              <p className="eyebrow">{t.wbEyebrow}</p>
              <h2 id="co-wb-h">{t.wbTitle}</h2>
              <p className="co-share-note">{t.wbText}</p>
              <div className="co-share-btns"><Link className="btn btn-primary" to={to(`/checkout/wishes?order=${id}&t=${token}`)}>{t.wbOpen}</Link></div>
            </section>
          )}
          {data.invitationCode && design?.previewSlug && <GuestAnswers rsvps={data.rsvps || []} orderNumber={data.orderNumber} questions={data.rsvpQuestions || []} />}

          <dl className="co-details">
            <div><dt>{t.orderNumber}</dt><dd>№ {data.orderNumber}</dd></div>
            <div><dt>{t.design}</dt><dd>{design ? design.code : data.designId === CUSTOM_DESIGN_ID ? (lang === 'hy' ? CUSTOM_DESIGN_LABEL : t.custom) : data.designId}</dd></div>
            <div><dt>{t.option}</dt><dd>{OPTION_INFO[data.option]?.label}</dd></div>
            {data.addons?.length > 0 && <div><dt>{t.addons}</dt><dd>{data.addons.map((a) => addonName(a.id, lang)).join(', ')}</dd></div>}
            <div><dt>{t.amount}</dt><dd>{formatPrice(data.amount, lang)}</dd></div>
            {data.provider && data.paymentStatus !== 'unpaid' && <div><dt>{t.method}</dt><dd>{METHOD_INFO[data.provider]?.label || data.provider}</dd></div>}
            {data.cardMask && <div><dt>{t.card}</dt><dd>{data.cardMask}</dd></div>}
            {data.transactionId && ['paid', 'refunded'].includes(data.paymentStatus) && <div><dt>{t.txId}</dt><dd className="mono">{data.transactionId}</dd></div>}
            {data.paidAt && <div><dt>{t.paidAt}</dt><dd>{fmtDate(data.paidAt)}</dd></div>}
            {data.paymentStatus === 'paid' && <div><dt>{t.orderStatus}</dt><dd>{t.status[data.orderStatus]}</dd></div>}
            <div><dt>{t.created}</dt><dd>{fmtDate(data.createdAt)}</dd></div>
          </dl>

          {showPay && (
            <div className="co-retry">
              <PaymentMethods methods={paymentChoices(data.methods)} value={method} onChange={setMethod} disabled={busy} />
              {payErr && <p className="co-alert" role="alert">{payErr}</p>}
              <button type="button" className="btn btn-primary co-pay" onClick={pay} disabled={busy || !method} aria-busy={busy}>
                {busy ? <><span className="co-spin" aria-hidden="true" />{t.redirecting}</> : t.pay(formatPrice(data.amount, lang))}
              </button>
              <SecureNote test={isTestChoice(method)} />
            </div>
          )}

          <div className="co-foot">
            <p>{t.keepLink}{data.invitationCode && t.onlyYou}</p>
            <div className="co-actions center">
              <button type="button" className="btn btn-ghost" onClick={copyLink}>{copied ? t.copied : t.copyOrder}</button>
              {data.paymentStatus === 'pending' && !pendingLive && <button type="button" className="btn btn-ghost" onClick={() => { setPolls(0); load() }}>{t.refresh}</button>}
              <Link className="btn btn-ghost" to={to('/')}>{t.home}</Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}
