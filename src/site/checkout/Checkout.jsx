import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { DesignThumb } from '../DesignCard'
import { findDesign } from '../designCatalog'
import { CATEGORY_LABELS_I18N, designTitle } from '../designI18n'
import { formatPrice } from '../pricing'
import { legalTitle } from '../legal'
import { LANG_NAMES_IN, stripLang, useLang, useText, withLang } from '../i18n'
import PaymentMethods, { SecureNote } from './PaymentMethods'
import TimeSelect from '../invitations/shared/TimeSelect'
import { DateField } from '../invitations/shared/ArmenianDate'
import { loadOverride } from '../invitations/shared/storage'
import {
  createOrder, getCheckoutConfig, goToProvider, isTestChoice, optionInfo, orderLink, paymentChoices, rememberOrder, startPayment, uploadPhotos,
} from './checkoutApi'
import './checkout.css'

const EMPTY = { name: '', phone: '', email: '', contactVia: '', tg: '', names: '', eventDate: '', eventTime: '', venue: '', notes: '', website: '' }
const CONTACT_FIELDS = ['name', 'phone', 'email', 'contact', 'contactVia', 'tg', 'names', 'eventDate']

// How the customer wants to be contacted — one choice. The order stores it
// as plain text in customer.contact (e.g. «Telegram · @anna»).
const CONTACT_VIA = ['telegram', 'viber', 'whatsapp', 'call']

const TEXT = {
  hy: {
    errName: 'Նշեք Ձեր անունը։', errPhone: 'Նշեք ճիշտ հեռախոսահամար, օրինակ՝ +374 99 123456։', errEmail: 'Էլ. հասցեն սխալ է։',
    errNames: 'Նշեք անունները, որոնք կերևան հրավերում։', errDate: 'Նշեք միջոցառման ամսաթիվը։', errFill: 'Լրացրեք այս դաշտը։',
    errConsent: 'Անհրաժեշտ է համաձայնել։', errMethod: 'Ընտրեք վճարման եղանակը։',
    order: 'Պատվեր', notFound: 'Այս դիզայնը չի գտնվել', viewCollection: 'Դիտել հավաքածուն',
    change: 'Փոխել', schedWhat: 'Ինչ է տեղի ունենում', remove: 'Հեռացնել', addItem: '+ Ավելացնել կետ', checkMap: 'Ստուգել քարտեզում →',
    pay: (a) => `Վճարել ${a}`, sendRequest: 'Ուղարկել հայտը', sendOrder: 'Ուղարկել պատվերը',
    crumbs: 'Ուղի', collection: 'Հավաքածու', title: 'Պատվերի ձևակերպում', step1: 'Ձեր ընտրությունը', option: 'Տարբերակ',
    attach: 'Կցել իմ խմբագրած տարբերակը պատվերին',
    edited: 'Դուք խմբագրել եք այս հրավերը կայքում․ Ձեր փոփոխությունները կերևան պատրաստի հրավերում։',
    continueEdit: 'Շարունակել խմբագրումը →', editOnSite: 'Խմբագրել հրավերը կայքում →', viewDemo: 'Դիտել դեմոն', continue: 'Շարունակել',
    step2: 'Ձեր տվյալները', fName: 'Անուն, ազգանուն', fPhone: 'Հեռախոս', fEmail: 'Էլ. փոստ', fContactVia: 'Ինչպես կապվել Ձեզ հետ', via: { telegram: 'Telegram', viber: 'Viber', whatsapp: 'WhatsApp', call: 'Զանգ' }, fTg: 'Telegram username', tgHint: 'Ոչ պարտադիր, օրինակ՝ @anna', errContactVia: 'Ընտրեք, թե ինչպես կապվենք Ձեզ հետ։', errTg: 'Telegram username-ը սխալ է (տառեր, թվեր և _)։', contactLabel: 'Կապ',
    details: 'Հրավերի մանրամասներ', detailsNote: 'սրանք կերևան Ձեր հրավերում', fromEdit: 'Վերցված է Ձեր խմբագրած հրավերից',
    changeInInvitation: 'Փոխել հրավերում →', fNotes: 'Ցանկություններ',
    notesHint1: 'Ոչ պարտադիր․ այն, ինչ ցանկանում եք մեզ հայտնել հրավերի մասին',
    notesHint2: 'Ոչ պարտադիր․ գույներ, լուսանկարներ, տեքստ՝ այն ամենը, ինչ ցանկանում եք ավելացնել կամ փոխել',
    notesHint3: 'Գույներ, տեքստ, լուսանկարներ, ծրագիր՝ այն ամենը, ինչ ցանկանում եք տեսնել հրավերում',
    fNames: 'Անուններ հրավերի վրա', namesHint: 'Օրինակ՝ «Աննա & Միքայել» կամ «Նարե»', fDate: 'Միջոցառման ամսաթիվ', fTime: 'Ժամ', fVenue: 'Վայր',
    step3Request: 'Հայտի ուղարկում', step3Pay: 'Վճարում', customer: 'Պատվիրատու', onInvitation: 'Հրավերի վրա', date: 'Ամսաթիվ',
    loading: 'Բեռնվում է…',
    ordersOff: (code, opt) => `Առցանց պատվերը դեռ միացված չէ։ Գրեք մեզ Instagram կամ Telegram-ում (տես՝ կայքի ստորին մասում)՝ նշելով «${code}» և «${opt}» տարբերակը։`,
    noPrice: 'Այս դիզայնի գինը դեռ ճշտվում է։ Ուղարկեք հայտը, և մենք կկապվենք Ձեզ հետ՝ գինն ու մանրամասները հաստատելու համար։ Վճարումը կկատարվի դրանից հետո։',
    noMethods: 'Ուղարկեք պատվերը, և մենք կկապվենք Ձեզ հետ նույն օրը՝ կճշտենք վճարումը և կուղարկենք հրավերի հղումը։',
    // [before, link to /privacy, after]
    consent: ['Համաձայն եմ, որ Siloona-ն օգտագործի իմ տվյալները՝ այս պատվերը կատարելու և ինձ հետ կապվելու համար՝ համաձայն ', 'Գաղտնիության քաղաքականության', '։'],
    redirecting: 'Ուղղորդում ենք վճարման էջ…', sending: 'Ուղարկում ենք…',
    invLang: 'Հրավերի լեզուն', invOnlyHy: 'Այս դիզայնը դեռ միայն հայերեն է։',
    summary: 'Պատվերի ամփոփում', cardKind: 'Քարտային հրավիրատոմս', webKind: 'Վեբ հրավիրատոմս', total: 'Ընդամենը', currency: 'Գինը՝ ՀՀ դրամով (AMD)',
  },
  ru: {
    errName: 'Укажите Ваше имя.', errPhone: 'Укажите правильный номер телефона, например +374 99 123456.', errEmail: 'Неверный адрес эл. почты.',
    errNames: 'Укажите имена, которые будут в приглашении.', errDate: 'Укажите дату события.', errFill: 'Заполните это поле.',
    errConsent: 'Необходимо Ваше согласие.', errMethod: 'Выберите способ оплаты.',
    order: 'Заказ', notFound: 'Этот дизайн не найден', viewCollection: 'Смотреть коллекцию',
    change: 'Изменить', schedWhat: 'Что происходит', remove: 'Удалить', addItem: '+ Добавить пункт', checkMap: 'Проверить на карте →',
    pay: (a) => `Оплатить ${a}`, sendRequest: 'Отправить заявку', sendOrder: 'Отправить заказ',
    crumbs: 'Навигация', collection: 'Коллекция', title: 'Оформление заказа', step1: 'Ваш выбор', option: 'Вариант',
    attach: 'Приложить мою отредактированную версию к заказу',
    edited: 'Вы отредактировали это приглашение на сайте — Ваши изменения будут в готовом приглашении.',
    continueEdit: 'Продолжить редактирование →', editOnSite: 'Отредактировать приглашение на сайте →', viewDemo: 'Смотреть демо', continue: 'Продолжить',
    step2: 'Ваши данные', fName: 'Имя и фамилия', fPhone: 'Телефон', fEmail: 'Эл. почта', fContactVia: 'Как с Вами связаться', via: { telegram: 'Telegram', viber: 'Viber', whatsapp: 'WhatsApp', call: 'Звонок' }, fTg: 'Telegram username', tgHint: 'Необязательно, например @anna', errContactVia: 'Выберите, как с Вами связаться.', errTg: 'Неверный Telegram username (буквы, цифры и _).', contactLabel: 'Связь',
    details: 'Детали приглашения', detailsNote: 'они будут в Вашем приглашении', fromEdit: 'Взято из Вашего отредактированного приглашения',
    changeInInvitation: 'Изменить в приглашении →', fNotes: 'Пожелания',
    notesHint1: 'Необязательно: всё, что Вы хотите сообщить нам о приглашении',
    notesHint2: 'Необязательно: цвета, фотографии, текст — всё, что Вы хотите добавить или изменить',
    notesHint3: 'Цвета, текст, фотографии, программа — всё, что Вы хотите видеть в приглашении',
    fNames: 'Имена в приглашении', namesHint: 'Например: «Анна и Микаэл» или «Наре»', fDate: 'Дата события', fTime: 'Время', fVenue: 'Место',
    step3Request: 'Отправка заявки', step3Pay: 'Оплата', customer: 'Заказчик', onInvitation: 'В приглашении', date: 'Дата',
    loading: 'Загрузка…',
    ordersOff: (code, opt) => `Онлайн-заказ пока не подключён. Напишите нам в Instagram или Telegram (ссылки внизу сайта) и укажите дизайн «${code}» и вариант «${opt}».`,
    noPrice: 'Цена этого дизайна ещё уточняется. Отправьте заявку, и мы свяжемся с Вами, чтобы согласовать цену и детали. Оплата — после этого.',
    noMethods: 'Отправьте заказ — мы свяжемся с Вами в тот же день, уточним оплату и пришлём ссылку на приглашение.',
    consent: ['Я согласен(на), чтобы Siloona использовала мои данные для выполнения этого заказа и связи со мной в соответствии с ', 'Политикой конфиденциальности', '.'],
    redirecting: 'Переходим на страницу оплаты…', sending: 'Отправляем…',
    invLang: 'Язык приглашения', invOnlyHy: 'Этот дизайн пока доступен только на армянском.',
    summary: 'Сводка заказа', cardKind: 'Приглашение-открытка', webKind: 'Веб-приглашение', total: 'Итого', currency: 'Цена в армянских драмах (AMD)',
  },
  en: {
    errName: 'Please enter your name.', errPhone: 'Please enter a valid phone number, e.g. +374 99 123456.', errEmail: 'The email address is not valid.',
    errNames: 'Please enter the names to show on the invitation.', errDate: 'Please enter the event date.', errFill: 'Please fill in this field.',
    errConsent: 'Your consent is required.', errMethod: 'Please choose a payment method.',
    order: 'Order', notFound: 'This design wasn’t found', viewCollection: 'View the collection',
    change: 'Change', schedWhat: 'What happens', remove: 'Remove', addItem: '+ Add an item', checkMap: 'Check on the map →',
    pay: (a) => `Pay ${a}`, sendRequest: 'Send the request', sendOrder: 'Send the order',
    crumbs: 'Breadcrumb', collection: 'Collection', title: 'Checkout', step1: 'Your choice', option: 'Option',
    attach: 'Attach my edited version to the order',
    edited: 'You’ve edited this invitation on the site — your changes will appear in the finished invitation.',
    continueEdit: 'Continue editing →', editOnSite: 'Edit the invitation on the site →', viewDemo: 'View the demo', continue: 'Continue',
    step2: 'Your details', fName: 'Full name', fPhone: 'Phone', fEmail: 'Email', fContactVia: 'How should we contact you', via: { telegram: 'Telegram', viber: 'Viber', whatsapp: 'WhatsApp', call: 'Phone call' }, fTg: 'Telegram username', tgHint: 'Optional, e.g. @anna', errContactVia: 'Choose how we should contact you.', errTg: 'That Telegram username isn’t valid (letters, digits and _).', contactLabel: 'Contact',
    details: 'Invitation details', detailsNote: 'these will appear on your invitation', fromEdit: 'Taken from the invitation you edited',
    changeInInvitation: 'Change in the invitation →', fNotes: 'Wishes',
    notesHint1: 'Optional: anything you’d like to tell us about the invitation',
    notesHint2: 'Optional: colours, photos, text — anything you’d like to add or change',
    notesHint3: 'Colours, text, photos, programme — everything you’d like to see in the invitation',
    fNames: 'Names on the invitation', namesHint: 'For example, “Anna & Mikayel” or “Nare”', fDate: 'Event date', fTime: 'Time', fVenue: 'Venue',
    step3Request: 'Send the request', step3Pay: 'Payment', customer: 'Customer', onInvitation: 'On the invitation', date: 'Date',
    loading: 'Loading…',
    ordersOff: (code, opt) => `Online ordering isn’t switched on yet. Write to us on Instagram or Telegram (links at the bottom of the site), mentioning design “${code}” and the “${opt}” option.`,
    noPrice: 'The price of this design is still being confirmed. Send the request and we’ll be in touch to agree the price and details. You pay after that.',
    noMethods: 'Send the order and we’ll get in touch the same day to arrange payment and send you the invitation link.',
    consent: ['I agree that Siloona may use my details to fulfil this order and to contact me, in line with the ', 'Privacy Policy', '.'],
    redirecting: 'Taking you to the payment page…', sending: 'Sending…',
    invLang: 'Invitation language', invOnlyHy: 'This design is available in Armenian only for now.',
    summary: 'Order summary', cardKind: 'Card invitation', webKind: 'Web invitation', total: 'Total', currency: 'Price in Armenian drams (AMD)',
  },
}

const uuid = () => (crypto.randomUUID ? crypto.randomUUID()
  : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)))

// The contact choice as one readable line for the order and the Telegram
// notice: «Viber», «Telegram · @anna».
function contactText(f, t) {
  if (!f.contactVia) return ''
  const via = t.via[f.contactVia] || f.contactVia
  const tg = f.contactVia === 'telegram' ? f.tg.trim() : ''
  return tg ? `${via} · ${tg.startsWith('@') ? tg : `@${tg}`}` : via
}

// Same rules the server applies (api/_lib/orders.js) — checked here first
// only so the customer gets instant feedback.
function validateContact(f, hasDetails, t) {
  const e = {}
  if (f.name.trim().length < 2) e.name = t.errName
  if (!/^\+?\d{8,15}$/.test(f.phone.replace(/[\s()-]/g, ''))) e.phone = t.errPhone
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = t.errEmail
  if (!CONTACT_VIA.includes(f.contactVia)) e.contactVia = t.errContactVia
  else if (f.contactVia === 'telegram' && f.tg.trim() && !/^@?[A-Za-z0-9_]{4,32}$/.test(f.tg.trim())) e.tg = t.errTg
  if (hasDetails) return e // the design's own fields are checked instead
  if (f.names.trim().length < 2) e.names = t.errNames
  if (!f.eventDate) e.eventDate = t.errDate
  return e
}

export default function Checkout() {
  const { designId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { lang, to } = useLang()
  const { pathname, search } = useLocation()
  const t = useText(TEXT)
  const OPTION_INFO = optionInfo(lang)
  const design = findDesign(designId)

  const [option, setOption] = useState(params.get('option') === 'assisted' ? 'assisted' : 'diy')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [consent, setConsent] = useState(false)
  const [config, setConfig] = useState(null)
  const [method, setMethod] = useState(null)
  const [busy, setBusy] = useState(false)
  // What the customer changed in this design's web editor (only the
  // differences from the design), sent with the order unless they opt out.
  const [edits, setEdits] = useState(null)
  const [attachEdits, setAttachEdits] = useState(true)
  // Names / date / venue read back out of the edited invitation, when it
  // has them all — then checkout doesn't ask for them again.
  const [fromEditor, setFromEditor] = useState(null)
  // Everything this design needs (invitationDetails.js): its field groups,
  // the customer's answers and the demo's values as placeholders.
  const [spec, setSpec] = useState(null)
  const [invLang, setInvLang] = useState('hy')
  const [invLangs, setInvLangs] = useState(['hy'])
  const [det, setDet] = useState({ extra: {} })
  const [error, setError] = useState('')
  const idem = useRef({ key: null, ref: null })
  const photoCache = useRef(new Map())
  const created = useRef(null)
  const stepRefs = useRef({})

  useEffect(() => {
    getCheckoutConfig()
      .then((c) => { setConfig(c); setMethod((m) => m || paymentChoices(c.methods)[0] || null) })
      .catch(() => setConfig({ ordersEnabled: false, methods: [] }))
  }, [])

  // Coming back from the bank page with the Back button restores this page
  // from the browser cache with the spinner still on.
  useEffect(() => {
    const onShow = (e) => { if (e.persisted) setBusy(false) }
    window.addEventListener('pageshow', onShow)
    return () => window.removeEventListener('pageshow', onShow)
  }, [])

  useEffect(() => {
    if (step > 1) stepRefs.current[step]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step])

  useEffect(() => {
    const slug = design?.previewSlug
    if (!slug) return
    let alive = true
    Promise.all([import('../invitationDefaults'), import('../invitations/shared/pathUtils'), import('../invitationDetails')]).then(([d, u, m]) => {
      // The invitation is in the page's language if the design has it.
      const inv = d.invitationLang(slug, lang)
      setInvLang(inv)
      setInvLangs(d.invitationLangs(slug))
      const defaults = d.defaultsFor(slug, inv)
      if (!alive || !defaults || !m.detailFields(slug, lang)) return
      const demo = m.detailsFromContent(slug, defaults)
      setSpec({ m, groups: m.detailGroups(slug, lang), demo })
      // The demo's programme to start from — easier to adjust than to type.
      setDet((x) => ({ ...x, schedule: x.schedule || demo.schedule }))

      const saved = loadOverride(slug, inv)
      const diff = saved && u.diffData(defaults, saved)
      // (switching the language drops the other language's edits)
      setEdits(diff || null)
      setFromEditor(null)
      if (!diff) return
      const got = m.detailsFromContent(slug, u.deepMerge(defaults, saved))
      // Fill what's empty; never overwrite something the customer typed.
      setDet((x) => {
        const out = { ...got, ...x, extra: { ...got.extra, ...x.extra } }
        for (const [k, v] of Object.entries(x)) if (v === '' || v == null) out[k] = got[k]
        out.schedule = got.schedule
        return out
      })
      if (!m.missingDetails(slug, got, lang).length) setFromEditor(got)
    })
    return () => { alive = false }
  }, [design?.previewSlug, lang])

  if (!design || design.available === false) {
    return (
      <main className="co">
        <div className="wrap co-empty">
          <p className="eyebrow">{t.order}</p>
          <h1>{t.notFound}</h1>
          <Link className="btn btn-primary" to={to('/invitations')}>{t.viewCollection}</Link>
        </div>
      </main>
    )
  }

  const price = design.pricing[option]
  const ordersEnabled = config?.ordersEnabled
  const methods = paymentChoices(config?.methods || [])
  const payable = price != null && methods.length > 0
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })) }

  const useEditor = !!(edits && attachEdits && fromEditor)
  const detKey = (k) => `d-${k.replace(/[^a-z0-9]+/gi, '-')}`
  const setD = (k, v) => {
    setDet((d) => (k.startsWith('x:') ? { ...d, extra: { ...d.extra, [k.slice(2)]: v } } : { ...d, [k]: v }))
    setErrors((x) => ({ ...x, [detKey(k)]: undefined }))
  }

  const toPayment = () => {
    const e = validateContact(form, !!spec, t)
    if (spec && !useEditor) {
      for (const k of spec.m.missingDetails(design.previewSlug, det, lang)) e[detKey(k)] = t.errFill
    }
    setErrors(e)
    if (Object.keys(e).length) {
      document.getElementById(`co-${Object.keys(e)[0]}`)?.focus()
      return
    }
    setStep(3)
  }

  async function submit() {
    setError('')
    if (!consent) { setErrors((x) => ({ ...x, consent: t.errConsent })); return }
    if (payable && !method) { setError(t.errMethod); return }

    setBusy(true)
    // The customer's own photos go up first; the order then carries their addresses.
    let content = edits && attachEdits ? edits : null
    // A Russian / English invitation says so in its content, which is what
    // the guest's page reads (Armenian needs nothing).
    if (invLang !== 'hy') content = { ...(content || {}), lang: invLang }
    try {
      if (content) content = await uploadPhotos(content, photoCache.current)
    } catch (e) {
      setBusy(false)
      setError(e.message)
      return
    }
    const payload = {
      designId: design.id,
      option,
      consent: true,
      website: form.website,
      // the server writes the contact line itself from these two
      customer: { name: form.name, phone: form.phone, email: form.email, contactVia: form.contactVia, tg: form.contactVia === 'telegram' ? form.tg.trim() : '' },
      customization: spec ? {
        names: spec.m.namesFromDetails(det), eventDate: det.eventDate || '', eventTime: det.eventTime || '',
        venue: spec.m.venueFromDetails(det), notes: form.notes,
        details: useEditor ? { ...det, source: 'editor' } : det,
        ...(content ? { content } : {}),
      } : {
        names: form.names, eventDate: form.eventDate, eventTime: form.eventTime, venue: form.venue, notes: form.notes,
        ...(content ? { content } : {}),
      },
    }
    // One idempotency key per version of the form: a double click or a retry
    // after a dropped connection returns the same order; changed details
    // make a new one.
    const key = JSON.stringify(payload)
    if (idem.current.key !== key) idem.current = { key, ref: uuid() }

    try {
      if (!created.current || created.current.key !== key) {
        const r = await createOrder({ ...payload, clientRef: idem.current.ref })
        created.current = { key, ...r }
        rememberOrder(r.orderId, r.token)
      }
      const { orderId, token } = created.current
      if (!payable) { navigate(to(orderLink(orderId, token))); return }
      const r = await startPayment(orderId, token, method)
      if (r.alreadyPaid || !goToProvider(r)) navigate(to(orderLink(orderId, token)))
      // else: the browser is leaving for the payment page — keep the spinner.
    } catch (e) {
      setBusy(false)
      if (e.fields) {
        setErrors(e.fields)
        if (Object.keys(e.fields).some((k) => CONTACT_FIELDS.includes(k) || k === 'details')) setStep(2)
      }
      setError(e.message)
    }
  }

  const stepHead = (n, title, summary) => (
    <header className="co-step-h">
      <span className="co-num">{String(n).padStart(2, '0')}</span>
      <div className="co-step-t">
        <h2>{title}</h2>
        {step > n && summary && <p className="co-step-sum">{summary}</p>}
      </div>
      {step > n && !busy && <button type="button" className="co-edit" onClick={() => setStep(n)}>{t.change}</button>}
    </header>
  )

  const field = (k, label, props = {}, hint) => (
    <label className={`co-field ${props.wide ? 'wide' : ''}`} htmlFor={`co-${k}`}>
      <span className="co-label">{label}{props.required && <i aria-hidden="true"> *</i>}</span>
      {props.type === 'date' ? (
        <DateField id={`co-${k}`} className="co-datebtn" value={form[k]} invalid={!!errors[k]} onChange={(v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((x) => ({ ...x, [k]: undefined })) }} />
      ) : props.type === 'time' ? (
        <TimeSelect id={`co-${k}`} className="co-sel" value={form[k]} allowEmpty onChange={(v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((x) => ({ ...x, [k]: undefined })) }} invalid={!!errors[k]} />
      ) : props.textarea ? (
        <textarea id={`co-${k}`} rows={4} value={form[k]} onChange={set(k)} maxLength={props.maxLength} aria-invalid={!!errors[k]} />
      ) : (
        <input
          id={`co-${k}`} type={props.type || 'text'} value={form[k]} onChange={set(k)}
          autoComplete={props.autoComplete} inputMode={props.inputMode} maxLength={props.maxLength}
          placeholder={props.placeholder} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `co-${k}-err` : undefined}
        />
      )}
      {errors[k] ? <span className="co-err" id={`co-${k}-err`}>{errors[k]}</span> : hint && <span className="co-hint">{hint}</span>}
    </label>
  )

  // «Ինչպես կապվել Ձեզ հետ» — one choice, same look as the option cards.
  const contactViaField = () => (
    <fieldset className="co-field wide co-via" id="co-contactVia" tabIndex={-1} aria-invalid={!!errors.contactVia} aria-describedby={errors.contactVia ? 'co-contactVia-err' : undefined}>
      <legend className="co-label">{t.fContactVia}<i aria-hidden="true"> *</i></legend>
      <div className="co-via-row">
        {CONTACT_VIA.map((v) => (
          <label key={v} className={`co-via-opt ${form.contactVia === v ? 'on' : ''}`}>
            <input
              type="radio" name="contactVia" value={v} checked={form.contactVia === v}
              onChange={() => { setForm((f) => ({ ...f, contactVia: v })); setErrors((x) => ({ ...x, contactVia: undefined })) }}
            />
            {t.via[v]}
          </label>
        ))}
      </div>
      {errors.contactVia && <span className="co-err" id="co-contactVia-err">{errors.contactVia}</span>}
    </fieldset>
  )

  const detField = (f) => {
    const id = `co-${detKey(f.key)}`
    const err = errors[detKey(f.key)]
    const value = f.key.startsWith('x:') ? det.extra?.[f.key.slice(2)] ?? '' : det[f.key] ?? ''
    const ph = spec.m.detailValue(spec.demo, f)
    if (f.type === 'schedule') {
      const rows = det.schedule || []
      const setRows = (r) => setDet((d) => ({ ...d, schedule: r }))
      return (
        <div key={f.key} className="co-field wide co-sched">
          <span className="co-label">{f.label}</span>
          {rows.map((r, i) => (
            <div className="co-sched-row" key={i}>
              <TimeSelect className="co-sel" value={r.time} allowEmpty onChange={(v) => setRows(rows.map((x, j) => (j === i ? { ...x, time: v } : x)))} />
              <input type="text" aria-label={t.schedWhat} maxLength={120} value={r.title} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
              <button type="button" className="co-sched-x" aria-label={t.remove} onClick={() => setRows(rows.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
          <button type="button" className="co-sched-add" onClick={() => setRows([...rows, { time: '', title: '' }])}>{t.addItem}</button>
        </div>
      )
    }
    if (f.type === 'time') {
      return (
        <label key={f.key} className="co-field" htmlFor={id}>
          <span className="co-label">{f.label}{f.required && <i aria-hidden="true"> *</i>}</span>
          <TimeSelect id={id} className="co-sel" value={value} allowEmpty onChange={(v) => setD(f.key, v)} invalid={!!err} />
          {err && <span className="co-err" id={`${id}-err`}>{err}</span>}
        </label>
      )
    }
    if (f.type === 'date') {
      return (
        <label key={f.key} className="co-field" htmlFor={id}>
          <span className="co-label">{f.label}{f.required && <i aria-hidden="true"> *</i>}</span>
          <DateField id={id} className="co-datebtn" value={value} onChange={(v) => setD(f.key, v)} invalid={!!err} />
          {err && <span className="co-err" id={`${id}-err`}>{err}</span>}
        </label>
      )
    }
    // Under an address: open it the way guests' map button will.
    const mapQ = f.key.endsWith('.address') ? (value || det[f.key.replace('.address', '.name')] || '').trim() : ''
    const wide = f.type === 'text' && !f.inputMode && /name|address|title|company/.test(f.key)
    return (
      <label key={f.key} className={`co-field ${wide ? 'wide' : ''}`} htmlFor={id}>
        <span className="co-label">{f.label}{f.required && <i aria-hidden="true"> *</i>}</span>
        <input
          id={id} type={f.type} value={value} onChange={(e) => setD(f.key, e.target.value)}
          inputMode={f.inputMode || (f.type === 'tel' ? 'tel' : undefined)} maxLength={f.type === 'text' || f.type === 'tel' ? 160 : undefined}
          placeholder={f.type === 'text' || f.type === 'tel' ? ph : undefined}
          aria-invalid={!!err} aria-describedby={err ? `${id}-err` : undefined}
        />
        {err ? <span className="co-err" id={`${id}-err`}>{err}</span> : mapQ && (
          <a className="co-maplink" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQ)}`} target="_blank" rel="noopener noreferrer">{t.checkMap}</a>
        )}
      </label>
    )
  }

  // What the customer's edited invitation already says, group by group.
  const detRecap = () => spec.groups.map((g) => {
    const rows = g.fields.map((f) => {
      if (f.type === 'schedule') {
        const r = (det.schedule || []).filter((x) => x.title)
        return r.length ? [f.label, r.map((x) => [x.time, x.title].filter(Boolean).join(' ')).join(' · ')] : null
      }
      let v = spec.m.detailValue(det, f)
      if (f.type === 'date' && v) v = v.split('-').reverse().join('.')
      return v ? [f.label, v] : null
    }).filter(Boolean)
    return rows.length ? (
      <div key={g.id} className="co-recap-g">
        {g.title && <p className="co-recap-gt">{g.title}</p>}
        <dl className="co-recap">{rows.map(([k, v], i) => <div key={i}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      </div>
    ) : null
  })

  let payLabel = t.pay(formatPrice(price, lang))
  if (price == null) payLabel = t.sendRequest
  else if (!methods.length) payLabel = t.sendOrder
  const title = designTitle(design, lang)

  return (
    <main className="co">
      <div className="wrap co-grid">
        <div className="co-main">
          <nav className="co-crumbs" aria-label={t.crumbs}>
            <Link to={to('/invitations')}>{t.collection}</Link><span aria-hidden="true">/</span><span>{design.code}</span>
          </nav>
          <h1 className="co-title">{t.title}</h1>

          {/* 01 — the design and option */}
          <section className={`co-step ${step === 1 ? 'on' : 'done'}`} ref={(el) => { stepRefs.current[1] = el }}>
            {stepHead(1, t.step1, `${design.code} · ${OPTION_INFO[option].label} · ${formatPrice(price, lang)}`)}
            {step === 1 && (
              <div className="co-step-b">
                <div className="co-options" role="radiogroup" aria-label={t.option}>
                  {Object.entries(OPTION_INFO).map(([k, o]) => (
                    <label key={k} className={`co-opt ${option === k ? 'on' : ''}`}>
                      <input type="radio" name="option" value={k} checked={option === k} onChange={() => setOption(k)} />
                      <span className="co-opt-top">
                        <span className="co-opt-name">{o.label}</span>
                        <span className="co-opt-price">{formatPrice(design.pricing[k], lang)}</span>
                      </span>
                      <span className="co-opt-text">{o.text}</span>
                    </label>
                  ))}
                </div>
                {edits ? (
                  <div className="co-edits">
                    <label className="co-consent">
                      <input type="checkbox" checked={attachEdits} onChange={(e) => setAttachEdits(e.target.checked)} />
                      <span>{t.attach}</span>
                    </label>
                    <p>{t.edited} <Link to={to(`${design.previewRoute}?edit=1`)}>{t.continueEdit}</Link></p>
                  </div>
                ) : design.previewRoute && (
                  <p className="co-demo">
                    <Link to={to(`${design.previewRoute}?edit=1`)}>{t.editOnSite}</Link>
                    <span className="co-demo-sep" aria-hidden="true">·</span>
                    <Link to={to(design.previewRoute)}>{t.viewDemo}</Link>
                  </p>
                )}
                <div className="co-actions">
                  <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>{t.continue}</button>
                </div>
              </div>
            )}
          </section>

          {/* 02 — contact + what goes on the invitation */}
          <section className={`co-step ${step === 2 ? 'on' : step > 2 ? 'done' : 'todo'}`} ref={(el) => { stepRefs.current[2] = el }}>
            {stepHead(2, t.step2, [form.name, form.phone].filter(Boolean).join(' · '))}
            {step === 2 && (
              <form className="co-step-b" noValidate onSubmit={(e) => { e.preventDefault(); toPayment() }}>
                <div className="co-fields">
                  {field('name', t.fName, { required: true, autoComplete: 'name', maxLength: 120 })}
                  {field('phone', t.fPhone, { required: true, type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: '+374 __ ______', maxLength: 32 })}
                  {field('email', t.fEmail, { type: 'email', autoComplete: 'email', inputMode: 'email', maxLength: 200 })}
                  {contactViaField()}
                  {form.contactVia === 'telegram' && field('tg', t.fTg, { placeholder: '@', maxLength: 60, autoComplete: 'off' }, t.tgHint)}
                </div>

                <h3 className="co-sub">{t.details} <span>{t.detailsNote}</span></h3>
                {useEditor && spec ? (
                  // Already on the invitation they edited — show it, don't ask again.
                  <div className="co-fromedit">
                    <p className="co-fromedit-lead">{t.fromEdit}</p>
                    {detRecap()}
                    <p className="co-fromedit-edit"><Link to={to(`${design.previewRoute}?edit=1`)}>{t.changeInInvitation}</Link></p>
                    <div className="co-fields">
                      {field('notes', t.fNotes, { wide: true, textarea: true, maxLength: 2000 }, t.notesHint1)}
                    </div>
                  </div>
                ) : spec ? (
                  <>
                    {spec.groups.map((g) => (
                      <fieldset key={g.id} className="co-group">
                        {g.title && <legend className="co-group-t">{g.title}</legend>}
                        <div className="co-fields">{g.fields.map(detField)}</div>
                      </fieldset>
                    ))}
                    <div className="co-fields">
                      {field('notes', t.fNotes, { wide: true, textarea: true, maxLength: 2000 }, t.notesHint2)}
                    </div>
                  </>
                ) : (
                  <div className="co-fields">
                    {field('names', t.fNames, { wide: true, required: true, maxLength: 160, placeholder: title }, t.namesHint)}
                    {field('eventDate', t.fDate, { type: 'date', required: true })}
                    {field('eventTime', t.fTime, { type: 'time' })}
                    {field('venue', t.fVenue, { wide: true, maxLength: 300 })}
                    {field('notes', t.fNotes, { wide: true, textarea: true, maxLength: 2000 }, t.notesHint3)}
                  </div>
                )}
                {/* Honeypot — hidden from people, filled in by bots. */}
                <input className="co-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')} name="website" />

                <div className="co-actions">
                  <button type="submit" className="btn btn-primary">{t.continue}</button>
                </div>
              </form>
            )}
          </section>

          {/* 03 — summary + payment */}
          <section className={`co-step ${step === 3 ? 'on' : 'todo'}`} ref={(el) => { stepRefs.current[3] = el }}>
            {stepHead(3, price == null ? t.step3Request : t.step3Pay)}
            {step === 3 && (
              <div className="co-step-b">
                <dl className="co-recap">
                  <div><dt>{t.customer}</dt><dd>{form.name}</dd></div>
                  <div><dt>{t.fPhone}</dt><dd>{form.phone}</dd></div>
                  {form.email && <div><dt>{t.fEmail}</dt><dd>{form.email}</dd></div>}
                  {form.contactVia && <div><dt>{t.contactLabel}</dt><dd>{contactText(form, t)}</dd></div>}
                  {(() => {
                    const names = spec ? spec.m.namesFromDetails(det) : form.names
                    const date = spec ? det.eventDate : form.eventDate
                    const time = spec ? det.eventTime : form.eventTime
                    return (
                      <>
                        {names && <div><dt>{t.onInvitation}</dt><dd>{names}</dd></div>}
                        {date && <div><dt>{t.date}</dt><dd>{date.split('-').reverse().join('.')}{time && `, ${time}`}</dd></div>}
                      </>
                    )
                  })()}
                </dl>

                {config === null ? (
                  <p className="co-note">{t.loading}</p>
                ) : !ordersEnabled ? (
                  <div className="co-note">
                    {t.ordersOff(design.code, OPTION_INFO[option].label)}
                  </div>
                ) : price == null ? (
                  <p className="co-note">{t.noPrice}</p>
                ) : !methods.length ? (
                  <p className="co-note">{t.noMethods}</p>
                ) : (
                  <PaymentMethods methods={methods} value={method} onChange={setMethod} disabled={busy} />
                )}

                {ordersEnabled && (
                  <>
                    <label className="co-consent">
                      <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setErrors((x) => ({ ...x, consent: undefined })) }} />
                      <span>{t.consent[0]}<Link to={to('/privacy')} target="_blank" rel="noopener">{t.consent[1]}</Link>{t.consent[2]}</span>
                    </label>
                    <p className="co-legal">
                      <Link to={to('/terms')} target="_blank" rel="noopener">{legalTitle('terms', lang)}</Link>
                      <Link to={to('/refund')} target="_blank" rel="noopener">{legalTitle('refund', lang)}</Link>
                    </p>
                    {errors.consent && <p className="co-err">{errors.consent}</p>}

                    {error && <p className="co-alert" role="alert">{error}</p>}

                    <button type="button" className={`btn btn-primary co-pay ${busy ? 'busy' : ''}`} onClick={submit} disabled={busy} aria-busy={busy}>
                      {busy ? <><span className="co-spin" aria-hidden="true" />{payable ? t.redirecting : t.sending}</> : payLabel}
                    </button>
                    {payable && <SecureNote test={isTestChoice(method)} />}
                  </>
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="co-aside" aria-label={t.summary}>
          <div className="co-sum">
            <div className="co-sum-thumb"><DesignThumb design={design} /></div>
            <div className="co-sum-body">
              <p className="eyebrow">{CATEGORY_LABELS_I18N[lang][design.category]} · {design.code}</p>
              <h3 className="co-sum-title">{title}</h3>
              <p className="co-sum-type">{design.kind === 'card' ? t.cardKind : t.webKind} · {OPTION_INFO[option].label}</p>
              <div className="co-sum-total">
                <span>{t.total}</span>
                <strong>{formatPrice(price, lang)}</strong>
              </div>
              {price != null && <p className="co-sum-cur">{t.currency}</p>}
              {design.kind === 'web' && (
                <div className="co-sum-lang">
                  <span>{t.invLang}: <b>{LANG_NAMES_IN[lang][invLang]}</b></span>
                  {invLangs.length > 1 ? (
                    // another language = the same checkout in that language
                    <span className="co-sum-langs">
                      {invLangs.filter((l) => l !== invLang).map((l) => (
                        <Link key={l} to={withLang(l, stripLang(pathname) + search)} hrefLang={l}>{LANG_NAMES_IN[lang][l]}</Link>
                      ))}
                    </span>
                  ) : lang !== 'hy' && <small>{t.invOnlyHy}</small>}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
