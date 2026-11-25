import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LANGS, savedLang } from '../i18n'
import { formatPrice } from '../pricing'
import './checkout.css'

// Stand-in for the payment provider's hosted page, used only by the payment
// simulator (PAYMENTS_SIMULATION=1). It plays what a customer goes through
// on the real one — the card form (or Idram wallet), the 3-D Secure code,
// the bank's answer — so the whole checkout can be tried end to end.
//
// It accepts only the test cards the server lists, so a real card typed
// here by mistake is refused on the spot; card details never leave the
// page (the server is told which test card was used, never anything typed).
// The result is applied on the server (api/payments/simulator/complete.js),
// never in the browser.

const OTP = '123456'
const OTP_TRIES = 3
// Test Idram wallets; like the cards, nothing else is accepted.
const IDRAM_IDS = [{ number: '100000001', result: 'paid' }, { number: '100000002', result: 'funds' }]

const TEXT = {
  hy: {
    banner: 'Թեստային ռեժիմ · իրական գումար չի գանձվում',
    secure: 'Անվտանգ վճարում', merchant: 'Վաճառող', order: 'Պատվեր', ref: 'Գործարք', amount: 'Վճարման գումար',
    cardTitle: 'Վճարում բանկային քարտով', idramTitle: 'Վճարում Idram-ով',
    number: 'Քարտի համար', exp: 'Գործողության ժամկետ', expPh: 'ԱԱ/ՏՏ', cvc: 'CVV/CVC', cvcHint: '3 թվանշան քարտի հետևում', holder: 'Քարտապանի անուն', holderPh: 'ԻՆՉՊԵՍ ՔԱՐՏԻ ՎՐԱ (լատինատառ)',
    idramId: 'Idram ID', idramHint: '9 թվանշան',
    pay: (a) => `Վճարել ${a}`, cancel: 'Չեղարկել և վերադառնալ խանութ',
    errNumber: 'Քարտի համարը սխալ է։', errNotTest: 'Թեստային ռեժիմում ընդունվում են միայն ստորև նշված թեստային քարտերը։',
    errExp: 'Նշեք ժամկետը՝ ԱԱ/ՏՏ ձևաչափով։', errExpired: 'Քարտի ժամկետն անցել է։', errCvc: 'CVV/CVC-ն 3 թվանշան է։', errHolder: 'Նշեք քարտապանի անունը լատինատառ։',
    errIdram: 'Idram ID-ն 9 թվանշան է։', errIdramTest: 'Թեստային ռեժիմում ընդունվում են միայն ստորև նշված թեստային Idram ID-ները։',
    authTitle: '3-D Secure հաստատում', authIdramTitle: 'Վճարման հաստատում',
    authText: (m) => `Ձեր բանկը հաստատման կոդ է ուղարկել քարտին կցված հեռախոսահամարին։ Քարտ՝ ${m}`,
    authIdramText: 'Idram-ը հաստատման կոդ է ուղարկել դրամապանակին կցված հեռախոսահամարին։',
    otp: 'Հաստատման կոդ', confirm: 'Հաստատել', back: 'Չեղարկել',
    otpWrong: (n) => `Կոդը սխալ է։ Մնաց ${n} փորձ։`,
    connecting: 'Կապ ենք հաստատում բանկի հետ…', processing: 'Վճարումը մշակվում է…', dontClose: 'Խնդրում ենք չփակել և չթարմացնել էջը։',
    returning: 'Վերադառնում ենք Siloona…',
    done: 'Այս վճարումն արդեն ավարտված է։', toOrder: 'Անցնել պատվերին',
    testTitle: 'Թեստային տվյալներ', testCards: 'Քարտեր (ժամկետ՝ ցանկացած ապագա, CVV՝ ցանկացած 3 թվանշան)', testIdram: 'Idram ID-ներ',
    testOtp: (c) => `Հաստատման կոդ՝ ${c}։ Սխալ կոդը ${OTP_TRIES} անգամ՝ մերժում։`, use: 'Լրացնել',
    result: { paid: 'Հաջող վճարում', funds: 'Մերժում՝ անբավարար միջոցներ', declined: 'Մերժում՝ բանկը մերժել է' },
    foot: 'Սա թեստային վճարման էջ է։ Իրական վճարման ժամանակ քարտի տվյալները լրացվում են բանկի պաշտպանված էջում և Siloona-ին չեն փոխանցվում։',
    error: 'Սխալ։ Փորձեք կրկին։',
  },
  ru: {
    banner: 'Тестовый режим · реальные деньги не списываются',
    secure: 'Безопасная оплата', merchant: 'Продавец', order: 'Заказ', ref: 'Транзакция', amount: 'Сумма к оплате',
    cardTitle: 'Оплата банковской картой', idramTitle: 'Оплата через Idram',
    number: 'Номер карты', exp: 'Срок действия', expPh: 'ММ/ГГ', cvc: 'CVV/CVC', cvcHint: '3 цифры на обороте карты', holder: 'Имя держателя', holderPh: 'КАК НА КАРТЕ (латиницей)',
    idramId: 'Idram ID', idramHint: '9 цифр',
    pay: (a) => `Оплатить ${a}`, cancel: 'Отменить и вернуться в магазин',
    errNumber: 'Неверный номер карты.', errNotTest: 'В тестовом режиме принимаются только тестовые карты, указанные ниже.',
    errExp: 'Укажите срок в формате ММ/ГГ.', errExpired: 'Срок действия карты истёк.', errCvc: 'CVV/CVC — 3 цифры.', errHolder: 'Укажите имя держателя латиницей.',
    errIdram: 'Idram ID — 9 цифр.', errIdramTest: 'В тестовом режиме принимаются только тестовые Idram ID, указанные ниже.',
    authTitle: 'Подтверждение 3-D Secure', authIdramTitle: 'Подтверждение оплаты',
    authText: (m) => `Ваш банк отправил код подтверждения на номер телефона, привязанный к карте. Карта: ${m}`,
    authIdramText: 'Idram отправил код подтверждения на номер телефона, привязанный к кошельку.',
    otp: 'Код подтверждения', confirm: 'Подтвердить', back: 'Отменить',
    otpWrong: (n) => `Неверный код. Осталось попыток: ${n}.`,
    connecting: 'Связываемся с банком…', processing: 'Платёж обрабатывается…', dontClose: 'Пожалуйста, не закрывайте и не обновляйте страницу.',
    returning: 'Возвращаемся в Siloona…',
    done: 'Этот платёж уже завершён.', toOrder: 'Перейти к заказу',
    testTitle: 'Тестовые данные', testCards: 'Карты (срок — любой будущий, CVV — любые 3 цифры)', testIdram: 'Idram ID',
    testOtp: (c) => `Код подтверждения: ${c}. Неверный код ${OTP_TRIES} раза — отказ.`, use: 'Заполнить',
    result: { paid: 'Успешная оплата', funds: 'Отказ: недостаточно средств', declined: 'Отказ: банк отклонил' },
    foot: 'Это тестовая страница оплаты. При реальной оплате данные карты вводятся на защищённой странице банка и не передаются Siloona.',
    error: 'Ошибка. Попробуйте ещё раз.',
  },
  en: {
    banner: 'Test mode · no real money is charged',
    secure: 'Secure payment', merchant: 'Merchant', order: 'Order', ref: 'Transaction', amount: 'Amount to pay',
    cardTitle: 'Pay by bank card', idramTitle: 'Pay with Idram',
    number: 'Card number', exp: 'Expiry date', expPh: 'MM/YY', cvc: 'CVV/CVC', cvcHint: '3 digits on the back of the card', holder: 'Cardholder name', holderPh: 'AS ON THE CARD',
    idramId: 'Idram ID', idramHint: '9 digits',
    pay: (a) => `Pay ${a}`, cancel: 'Cancel and return to the shop',
    errNumber: 'The card number is not valid.', errNotTest: 'In test mode only the test cards listed below are accepted.',
    errExp: 'Enter the expiry as MM/YY.', errExpired: 'The card has expired.', errCvc: 'The CVV/CVC is 3 digits.', errHolder: 'Enter the cardholder name in Latin letters.',
    errIdram: 'The Idram ID is 9 digits.', errIdramTest: 'In test mode only the test Idram IDs listed below are accepted.',
    authTitle: '3-D Secure verification', authIdramTitle: 'Confirm the payment',
    authText: (m) => `Your bank has sent a confirmation code to the phone number linked to the card. Card: ${m}`,
    authIdramText: 'Idram has sent a confirmation code to the phone number linked to the wallet.',
    otp: 'Confirmation code', confirm: 'Confirm', back: 'Cancel',
    otpWrong: (n) => `Wrong code. ${n} ${n === 1 ? 'try' : 'tries'} left.`,
    connecting: 'Contacting your bank…', processing: 'Processing the payment…', dontClose: 'Please don’t close or refresh this page.',
    returning: 'Returning to Siloona…',
    done: 'This payment is already finished.', toOrder: 'Go to the order',
    testTitle: 'Test data', testCards: 'Cards (expiry: any future date, CVV: any 3 digits)', testIdram: 'Idram IDs',
    testOtp: (c) => `Confirmation code: ${c}. A wrong code ${OTP_TRIES} times is a decline.`, use: 'Fill in',
    result: { paid: 'Successful payment', funds: 'Declined: insufficient funds', declined: 'Declined by the bank' },
    foot: 'This is a test payment page. On a real payment, card details are entered on the bank’s secure page and never passed to Siloona.',
    error: 'Error. Please try again.',
  },
}

const BRANDS = { visa: 'VISA', mastercard: 'Mastercard', arca: 'ArCa' }
function brandOf(n) {
  if (/^9051/.test(n)) return 'arca'
  if (/^4/.test(n)) return 'visa'
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n)) return 'mastercard'
  return null
}
function luhn(n) {
  let sum = 0
  for (let i = 0; i < n.length; i++) {
    let d = +n[n.length - 1 - i]
    if (i % 2) { d *= 2; if (d > 9) d -= 9 }
    sum += d
  }
  return n.length >= 13 && sum % 10 === 0
}
const groups = (n) => n.replace(/(\d{4})(?=\d)/g, '$1 ')
const maskOf = (n) => `${n.slice(0, 4)} •••• •••• ${n.slice(-4)}`
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function api(method, body, qs = '', fallback) {
  const r = await fetch(`/api/payments/simulator/complete${qs}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await r.json().catch(() => null)
  if (!r.ok) throw new Error(data?.message || fallback)
  return data
}

export default function SimulatedGateway() {
  const [params] = useSearchParams()
  const tx = params.get('tx')
  const k = params.get('k')
  const via = params.get('via') === 'idram' ? 'idram' : 'card'
  const lang = LANGS.includes(params.get('lang')) ? params.get('lang') : savedLang() || 'hy'
  const t = TEXT[lang] || TEXT.hy

  const [info, setInfo] = useState(null)
  const [err, setErr] = useState('')
  // form → (connecting) → auth → (processing) → leaving
  const [stage, setStage] = useState('form')
  const [f, setF] = useState({ number: '', exp: '', cvc: '', holder: '', idram: '' })
  const [fe, setFe] = useState({})
  const [otp, setOtp] = useState('')
  const [otpErr, setOtpErr] = useState('')
  const tries = useRef(0)
  const chosen = useRef(null) // the test card / wallet that passed the form
  const otpRef = useRef(null)

  useEffect(() => { document.documentElement.lang = lang }, [lang])
  useEffect(() => {
    api('GET', null, `?tx=${encodeURIComponent(tx || '')}&k=${encodeURIComponent(k || '')}`, t.error).then(setInfo, (e) => setErr(e.message))
  }, [tx, k]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (stage === 'auth') otpRef.current?.focus() }, [stage])

  const set = (key, v) => { setF((x) => ({ ...x, [key]: v })); setFe((x) => ({ ...x, [key]: undefined })) }
  const digits = (s, max) => s.replace(/\D/g, '').slice(0, max)

  // Sends the outcome and leaves for the order page, like a gateway's return.
  async function finish(body, pause = 900) {
    setStage('processing')
    setErr('')
    try {
      const [r] = await Promise.all([api('POST', { tx, k, via, ...body }, '', t.error), wait(pause)])
      setStage('leaving')
      window.location.replace(withLangPrefix(r.redirect, lang))
    } catch (e) {
      setStage('form')
      setErr(e.message)
    }
  }

  async function submitForm(e) {
    e.preventDefault()
    const errs = {}
    let pick = null
    if (via === 'card') {
      const n = f.number
      if (!luhn(n)) errs.number = t.errNumber
      else if (!(pick = info.cards.find((c) => c.number === n))) errs.number = t.errNotTest
      const m = f.exp.match(/^(\d{2})\/(\d{2})$/)
      const now = new Date()
      if (!m || +m[1] < 1 || +m[1] > 12) errs.exp = t.errExp
      else if (2000 + +m[2] < now.getFullYear() || (2000 + +m[2] === now.getFullYear() && +m[1] < now.getMonth() + 1)) errs.exp = t.errExpired
      if (!/^\d{3}$/.test(f.cvc)) errs.cvc = t.errCvc
      if (!/^[A-Z][A-Z .'-]{1,}$/.test(f.holder.trim())) errs.holder = t.errHolder
    } else if (!/^\d{9}$/.test(f.idram)) errs.idram = t.errIdram
    else if (!(pick = IDRAM_IDS.find((w) => w.number === f.idram))) errs.idram = t.errIdramTest
    setFe(errs)
    if (Object.keys(errs).length) {
      document.getElementById(`gw-${Object.keys(errs)[0]}`)?.focus()
      return
    }
    chosen.current = pick
    tries.current = 0
    setOtp('')
    setOtpErr('')
    setStage('connecting')
    await wait(1100)
    setStage('auth')
  }

  function submitOtp(e) {
    e.preventDefault()
    const pick = chosen.current
    const card = via === 'card' ? pick.number : undefined
    if (otp !== OTP) {
      tries.current += 1
      const left = OTP_TRIES - tries.current
      if (left > 0) { setOtpErr(t.otpWrong(left)); setOtp(''); otpRef.current?.focus(); return }
      return finish({ outcome: 'failed', reason: '3ds', card })
    }
    // the code is right: now the bank (or Idram) answers
    finish(pick.result === 'paid' ? { outcome: 'paid', card } : { outcome: 'failed', reason: pick.result, card }, 1600)
  }

  const fillCard = (c) => {
    const y = String((new Date().getFullYear() + 3) % 100).padStart(2, '0')
    setF((x) => ({ ...x, number: c.number, exp: x.exp || `12/${y}`, cvc: x.cvc || '123', holder: x.holder || 'TEST CARDHOLDER' }))
    setFe({})
  }

  const done = info && !['created', 'pending'].includes(info.status)
  const brand = brandOf(f.number)
  const busy = stage === 'connecting' || stage === 'processing' || stage === 'leaving'

  return (
    <div className="siloona-site">
      <main className="gw">
        <div className="co-sim-banner" role="note">{t.banner}</div>
        <div className="gw-wrap">
          <header className="gw-head">
            <Lock />
            <span>{t.secure}</span>
            <span className="gw-3ds">3-D Secure</span>
          </header>

          {!info && !err && <div className="gw-card gw-solo gw-wait"><span className="co-spin dark lg" aria-hidden="true" /></div>}
          {!info && err && <div className="gw-card gw-solo"><p className="co-alert" role="alert">{err}</p></div>}

          {info && (
            <>
              <section className="gw-order" aria-label={t.amount}>
                <dl>
                  <div><dt>{t.merchant}</dt><dd>Siloona</dd></div>
                  <div><dt>{t.order}</dt><dd>№ {info.orderNumber}</dd></div>
                  <div><dt>{t.ref}</dt><dd className="mono">{info.merchantRef}</dd></div>
                </dl>
                <p className="gw-amount"><span>{t.amount}</span><strong>{formatPrice(info.amount, lang)}</strong></p>
              </section>

              <article className="gw-card" aria-live="polite">
                {done ? (
                  <div className="gw-center">
                    <p>{t.done}</p>
                    <a className="btn btn-primary" href={withLangPrefix(`/checkout/result?order=${info.orderId}&t=${k}`, lang)}>{t.toOrder}</a>
                  </div>
                ) : busy ? (
                  <div className="gw-center gw-busy">
                    <span className="co-spin dark lg" aria-hidden="true" />
                    <p className="gw-busy-t">{stage === 'connecting' ? t.connecting : stage === 'leaving' ? t.returning : t.processing}</p>
                    <p className="gw-busy-s">{t.dontClose}</p>
                  </div>
                ) : stage === 'auth' ? (
                  <form className="gw-form" noValidate onSubmit={submitOtp}>
                    <h1 className="gw-title">{via === 'card' ? t.authTitle : t.authIdramTitle}</h1>
                    <p className="gw-text">{via === 'card' ? t.authText(maskOf(chosen.current.number)) : t.authIdramText}</p>
                    <label className="gw-field" htmlFor="gw-otp">
                      <span className="gw-label">{t.otp}</span>
                      <input
                        id="gw-otp" ref={otpRef} className="gw-otp" value={otp} inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                        onChange={(e) => { setOtp(digits(e.target.value, 6)); setOtpErr('') }} aria-invalid={!!otpErr} aria-describedby={otpErr ? 'gw-otp-err' : undefined}
                      />
                      {otpErr && <span className="co-err" id="gw-otp-err">{otpErr}</span>}
                    </label>
                    <button type="submit" className="btn btn-primary gw-pay" disabled={otp.length !== 6}>{t.confirm}</button>
                    <button type="button" className="gw-cancel" onClick={() => finish({ outcome: 'cancelled' }, 400)}>{t.back}</button>
                  </form>
                ) : (
                  <form className="gw-form" noValidate onSubmit={submitForm}>
                    <h1 className="gw-title">{via === 'card' ? t.cardTitle : t.idramTitle}</h1>
                    {err && <p className="co-alert" role="alert">{err}</p>}
                    {via === 'card' ? (
                      <>
                        <div className="gw-brands" aria-hidden="true">
                          {Object.entries(BRANDS).map(([id, name]) => <span key={id} className={`gw-brand ${brand === id ? 'on' : ''} ${brand && brand !== id ? 'off' : ''}`}>{name}</span>)}
                        </div>
                        {/* autoComplete off: the browser mustn't offer a real saved card on a test page */}
                        <Field id="number" label={t.number} err={fe.number}>
                          <input id="gw-number" className="mono" value={groups(f.number)} inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000"
                            onChange={(e) => set('number', digits(e.target.value, 19))} aria-invalid={!!fe.number} />
                        </Field>
                        <div className="gw-row">
                          <Field id="exp" label={t.exp} err={fe.exp}>
                            <input id="gw-exp" className="mono" value={f.exp} inputMode="numeric" autoComplete="off" placeholder={t.expPh}
                              onChange={(e) => { const d = digits(e.target.value, 4); set('exp', d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d) }} aria-invalid={!!fe.exp} />
                          </Field>
                          <Field id="cvc" label={t.cvc} err={fe.cvc} hint={t.cvcHint}>
                            <input id="gw-cvc" className="mono gw-secret" value={f.cvc} inputMode="numeric" autoComplete="off" placeholder="•••"
                              onChange={(e) => set('cvc', digits(e.target.value, 3))} aria-invalid={!!fe.cvc} />
                          </Field>
                        </div>
                        <Field id="holder" label={t.holder} err={fe.holder}>
                          <input id="gw-holder" value={f.holder} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder={t.holderPh}
                            onChange={(e) => set('holder', e.target.value.toUpperCase().slice(0, 26))} aria-invalid={!!fe.holder} />
                        </Field>
                      </>
                    ) : (
                      <Field id="idram" label={t.idramId} err={fe.idram} hint={t.idramHint}>
                        <input id="gw-idram" className="mono" value={f.idram} inputMode="numeric" autoComplete="off" placeholder="000000000"
                          onChange={(e) => set('idram', digits(e.target.value, 9))} aria-invalid={!!fe.idram} />
                      </Field>
                    )}
                    <button type="submit" className="btn btn-primary gw-pay">{t.pay(formatPrice(info.amount, lang))}</button>
                    <button type="button" className="gw-cancel" onClick={() => finish({ outcome: 'cancelled' }, 400)}>{t.cancel}</button>
                  </form>
                )}
              </article>

              {!done && (
                <details className="gw-test">
                  <summary>{t.testTitle}</summary>
                  {via === 'card' ? (
                    <>
                      <p className="gw-test-h">{t.testCards}</p>
                      <ul>
                        {info.cards.map((c) => (
                          <li key={c.number}>
                            <span className="mono">{groups(c.number)}</span>
                            <span className="gw-test-r">{BRANDS[c.brand]} · {t.result[c.result]}</span>
                            {stage === 'form' && <button type="button" onClick={() => fillCard(c)}>{t.use}</button>}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <p className="gw-test-h">{t.testIdram}</p>
                      <ul>
                        {IDRAM_IDS.map((w) => (
                          <li key={w.number}>
                            <span className="mono">{w.number}</span>
                            <span className="gw-test-r">{t.result[w.result]}</span>
                            {stage === 'form' && <button type="button" onClick={() => set('idram', w.number)}>{t.use}</button>}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  <p className="gw-test-h">{t.testOtp(OTP)}</p>
                </details>
              )}
            </>
          )}

          <p className="gw-foot"><Lock />{t.foot}</p>
        </div>
      </main>
    </div>
  )
}

// The gateway sends customers back to the plain address; the order page
// is shown in the language they paid in.
function withLangPrefix(path, lang) {
  return lang === 'hy' ? path : `/${lang}${path}`
}

function Field({ id, label, err, hint, children }) {
  return (
    <label className="gw-field" htmlFor={`gw-${id}`}>
      <span className="gw-label">{label}</span>
      {children}
      {err ? <span className="co-err">{err}</span> : hint && <span className="gw-hint">{hint}</span>}
    </label>
  )
}

function Lock() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
      <path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" />
    </svg>
  )
}
