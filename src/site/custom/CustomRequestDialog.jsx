import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CARD_DESIGNS, WEB_DESIGNS } from '../designCatalog'
import { designTitle } from '../designI18n'
import { CUSTOM_DESIGN_ID, CUSTOM_EVENT_TYPES_I18N, CUSTOM_KINDS_I18N } from '../customRequest'
import { createOrder, orderLink, rememberOrder } from '../checkout/checkoutApi'
import { useLang, useText, withLang } from '../i18n'
import './custom.css'

// The home page's «Անհատական դիզայն» request. Sent as an order with no
// price (see customRequest.js); the customer lands on their order page,
// which says the request is received and that we'll be in touch.

const EMPTY = {
  eventType: '', kind: 'new', basedOn: '', names: '', eventDate: '', notes: '', references: '',
  name: '', phone: '', email: '', contact: '', website: '',
}
const DESIGNS = [...WEB_DESIGNS, ...CARD_DESIGNS].filter((d) => d.available !== false)

const uuid = () => (crypto.randomUUID ? crypto.randomUUID()
  : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)))

const TEXT = {
  hy: {
    errEventType: 'Ընտրեք միջոցառման տեսակը։',
    errNotes: 'Պատմեք մի փոքր Ձեր գաղափարի մասին։',
    errName: 'Նշեք Ձեր անունը։',
    errPhone: 'Նշեք ճիշտ հեռախոսահամար, օրինակ՝ +374 99 123456։',
    errEmail: 'Էլ. հասցեն սխալ է։',
    errConsent: 'Անհրաժեշտ է համաձայնել։',
    close: 'Փակել',
    eyebrow: 'Անհատական դիզայն',
    title: 'Պատմեք Ձեր գաղափարի մասին',
    intro: 'Կստեղծենք հրավեր հատուկ Ձեր միջոցառման համար կամ կհարմարեցնենք մեր դիզայններից մեկը։ Կկապվենք Ձեզ հետ՝ մանրամասներն ու գինը քննարկելու համար։',
    event: 'Միջոցառումը',
    want: 'Ինչ եք ցանկանում',
    which: 'Որ դիզայնը',
    notChosen: 'Դեռ չեմ ընտրել',
    names: 'Անուններ հրավերի վրա',
    namesPh: 'Օրինակ՝ Աննա & Միքայել',
    date: 'Ամսաթիվ',
    dateHint: 'Եթե արդեն հայտնի է',
    notes: 'Ձեր գաղափարը',
    notesPh: 'Ոճ, գույներ, տրամադրություն, ինչ բաժիններ եք ուզում (ծրագիր, քարտեզ, RSVP, լուսանկարներ)…',
    refs: 'Օրինակներ',
    refsHint: 'Ոչ պարտադիր․ Pinterest, Instagram կամ այլ հղումներ, որոնք Ձեզ դուր են գալիս',
    contactHead: 'Ինչպես կապվենք Ձեզ հետ',
    name: 'Անուն, ազգանուն',
    phone: 'Հեռախոս',
    email: 'Էլ. փոստ',
    contact: 'Telegram կամ Instagram',
    contactHint: 'Եթե նախընտրում եք կապ այնտեղ',
    consent: 'Համաձայն եմ, որ Siloona-ն օգտագործի իմ տվյալները՝ այս հայտին պատասխանելու և ինձ հետ կապվելու համար։',
    sending: 'Ուղարկում ենք…',
    send: 'Ուղարկել հայտը',
  },
  ru: {
    errEventType: 'Выберите тип события.',
    errNotes: 'Расскажите немного о Вашей идее.',
    errName: 'Укажите Ваше имя.',
    errPhone: 'Укажите правильный номер телефона, например +374 99 123456.',
    errEmail: 'Неверный адрес эл. почты.',
    errConsent: 'Необходимо согласие.',
    close: 'Закрыть',
    eyebrow: 'Индивидуальный дизайн',
    title: 'Расскажите о Вашей идее',
    intro: 'Мы создадим приглашение специально для Вашего события или адаптируем один из наших дизайнов. Мы свяжемся с Вами, чтобы обсудить детали и цену.',
    event: 'Событие',
    want: 'Что Вы хотите',
    which: 'Какой дизайн',
    notChosen: 'Ещё не выбрал(а)',
    names: 'Имена в приглашении',
    namesPh: 'Например: Анна и Микаэл',
    date: 'Дата',
    dateHint: 'Если уже известна',
    notes: 'Ваша идея',
    notesPh: 'Стиль, цвета, настроение, какие разделы нужны (программа, карта, RSVP, фотографии)…',
    refs: 'Примеры',
    refsHint: 'Необязательно: ссылки на Pinterest, Instagram или другие примеры, которые Вам нравятся',
    contactHead: 'Как с Вами связаться',
    name: 'Имя и фамилия',
    phone: 'Телефон',
    email: 'Эл. почта',
    contact: 'Telegram или Instagram',
    contactHint: 'Если Вам удобнее связь там',
    consent: 'Я согласен(на), чтобы Siloona использовала мои данные, чтобы ответить на эту заявку и связаться со мной.',
    sending: 'Отправляем…',
    send: 'Отправить заявку',
  },
  en: {
    errEventType: 'Choose the type of event.',
    errNotes: 'Tell us a little about your idea.',
    errName: 'Enter your name.',
    errPhone: 'Enter a valid phone number, e.g. +374 99 123456.',
    errEmail: 'The email address is not valid.',
    errConsent: 'Your consent is required.',
    close: 'Close',
    eyebrow: 'Custom design',
    title: 'Tell us about your idea',
    intro: 'We’ll create an invitation just for your event or adapt one of our designs. We’ll get in touch to discuss the details and the price.',
    event: 'The event',
    want: 'What you’d like',
    which: 'Which design',
    notChosen: 'Not chosen yet',
    names: 'Names on the invitation',
    namesPh: 'E.g. Anna & Mikayel',
    date: 'Date',
    dateHint: 'If you already know it',
    notes: 'Your idea',
    notesPh: 'Style, colours, mood, which sections you want (schedule, map, RSVP, photos)…',
    refs: 'Examples',
    refsHint: 'Optional: Pinterest, Instagram or other links you like',
    contactHead: 'How we can reach you',
    name: 'Full name',
    phone: 'Phone',
    email: 'Email',
    contact: 'Telegram or Instagram',
    contactHint: 'If you’d rather talk there',
    consent: 'I agree that Siloona may use my details to answer this request and contact me.',
    sending: 'Sending…',
    send: 'Send the request',
  },
}

function validate(f, t) {
  const e = {}
  if (!f.eventType) e.eventType = t.errEventType
  if (f.notes.trim().length < 10) e.notes = t.errNotes
  if (f.name.trim().length < 2) e.name = t.errName
  if (!/^\+?\d{8,15}$/.test(f.phone.replace(/[\s()-]/g, ''))) e.phone = t.errPhone
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = t.errEmail
  return e
}

export default function CustomRequestDialog({ onClose }) {
  const navigate = useNavigate()
  const { lang } = useLang()
  const t = useText(TEXT)
  const eventTypes = CUSTOM_EVENT_TYPES_I18N[lang] || CUSTOM_EVENT_TYPES_I18N.hy
  const kinds = CUSTOM_KINDS_I18N[lang] || CUSTOM_KINDS_I18N.hy
  const [f, setF] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef(null)
  const idem = useRef(uuid())

  // A modal: Escape closes it, the page behind doesn't scroll, focus starts inside.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !busy) onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.focus({ preventScroll: true })
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose, busy])

  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })) }

  async function submit(e) {
    e.preventDefault()
    setError('')
    const errs = validate(f, t)
    if (!consent) errs.consent = t.errConsent
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) { ref.current?.querySelector(`[data-f="${first}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }); return }
    setBusy(true)
    try {
      const r = await createOrder({
        designId: CUSTOM_DESIGN_ID,
        option: 'assisted',
        consent: true,
        website: f.website,
        clientRef: idem.current,
        customer: { name: f.name, phone: f.phone, email: f.email, contact: f.contact },
        customization: {
          eventType: f.eventType, kind: f.kind, basedOn: f.kind === 'adapt' ? f.basedOn : '',
          names: f.names, eventDate: f.eventDate, notes: f.notes, references: f.references,
        },
      })
      rememberOrder(r.orderId, r.token)
      document.body.style.overflow = ''
      navigate(withLang(lang, orderLink(r.orderId, r.token)))
    } catch (err) {
      setBusy(false)
      if (err.fields) setErrors(err.fields)
      setError(err.message)
    }
  }

  const err = (k) => errors[k] && <span className="cr-err" id={`cr-${k}-err`}>{errors[k]}</span>
  const input = (k, label, props = {}) => (
    <label className={`cr-field ${props.wide ? 'wide' : ''}`} data-f={k}>
      <span className="cr-label">{label}{props.required && <i aria-hidden="true"> *</i>}</span>
      {props.textarea ? (
        <textarea rows={props.rows || 4} value={f[k]} onChange={set(k)} maxLength={props.maxLength} placeholder={props.placeholder} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `cr-${k}-err` : undefined} />
      ) : (
        <input
          type={props.type || 'text'} value={f[k]} onChange={set(k)} maxLength={props.maxLength} placeholder={props.placeholder}
          autoComplete={props.autoComplete} inputMode={props.inputMode} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `cr-${k}-err` : undefined}
        />
      )}
      {err(k) || (props.hint && <span className="cr-hint">{props.hint}</span>)}
    </label>
  )

  return (
    <div className="cr-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose() }}>
      <div className="cr-panel" role="dialog" aria-modal="true" aria-labelledby="cr-title" ref={ref} tabIndex={-1}>
        <button type="button" className="cr-close" onClick={onClose} disabled={busy} aria-label={t.close}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>

        <header className="cr-head">
          <p className="hm-eyebrow">{t.eyebrow}</p>
          <h2 id="cr-title">{t.title}</h2>
          <p>{t.intro}</p>
        </header>

        <form onSubmit={submit} noValidate>
          <fieldset className="cr-group" data-f="eventType">
            <legend className="cr-label">{t.event} <i aria-hidden="true">*</i></legend>
            <div className="cr-chips">
              {Object.entries(eventTypes).map(([k, label]) => (
                <label key={k} className={`cr-chip ${f.eventType === k ? 'on' : ''}`}>
                  <input type="radio" name="eventType" value={k} checked={f.eventType === k} onChange={set('eventType')} />
                  {label}
                </label>
              ))}
            </div>
            {err('eventType')}
          </fieldset>

          <fieldset className="cr-group">
            <legend className="cr-label">{t.want}</legend>
            <div className="cr-kinds">
              {Object.entries(kinds).map(([k, label]) => (
                <label key={k} className={`cr-kind ${f.kind === k ? 'on' : ''}`}>
                  <input type="radio" name="kind" value={k} checked={f.kind === k} onChange={set('kind')} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {f.kind === 'adapt' && (
              <label className="cr-field wide" style={{ marginTop: 14 }}>
                <span className="cr-label">{t.which}</span>
                <select value={f.basedOn} onChange={set('basedOn')}>
                  <option value="">{t.notChosen}</option>
                  {DESIGNS.map((d) => <option key={d.id} value={d.id}>{designTitle(d, lang)} · {d.code}</option>)}
                </select>
              </label>
            )}
          </fieldset>

          <div className="cr-fields">
            {input('names', t.names, { maxLength: 160, placeholder: t.namesPh })}
            {input('eventDate', t.date, { type: 'date', hint: t.dateHint })}
            {input('notes', t.notes, { wide: true, required: true, textarea: true, rows: 5, maxLength: 2000, placeholder: t.notesPh })}
            {input('references', t.refs, { wide: true, textarea: true, rows: 2, maxLength: 1000, hint: t.refsHint })}
          </div>

          <p className="cr-sub">{t.contactHead}</p>
          <div className="cr-fields">
            {input('name', t.name, { required: true, maxLength: 120, autoComplete: 'name' })}
            {input('phone', t.phone, { required: true, type: 'tel', maxLength: 32, autoComplete: 'tel', inputMode: 'tel', placeholder: '+374 __ ______' })}
            {input('email', t.email, { type: 'email', maxLength: 200, autoComplete: 'email', inputMode: 'email' })}
            {input('contact', t.contact, { maxLength: 120, placeholder: '@', hint: t.contactHint })}
          </div>
          {/* Honeypot — hidden from people, filled in by bots. */}
          <input className="cr-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set('website')} name="website" />

          <label className="cr-consent" data-f="consent">
            <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setErrors((x) => ({ ...x, consent: undefined })) }} />
            <span>{t.consent}</span>
          </label>
          {err('consent')}
          {error && <p className="cr-alert" role="alert">{error}</p>}

          <div className="cr-actions">
            <button type="submit" className="hm-btn hm-btn-solid" disabled={busy}>{busy ? t.sending : t.send}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
