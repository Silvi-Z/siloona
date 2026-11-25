import { isTestChoice, methodInfo } from './checkoutApi'
import { useLang, useText } from '../i18n'

const TEXT = {
  hy: {
    legend: 'Վճարման եղանակ',
    tag: 'Թեստ',
    test: 'Թեստային ռեժիմ․ վճարման էջում ընդունվում են միայն թեստային քարտեր, և իրական գումար չի գանձվում։',
    secure: 'Վճարումը կատարվում է բանկի կամ Idram-ի պաշտպանված էջում։ Քարտի տվյալները Siloona-ին չեն փոխանցվում և չեն պահվում։',
  },
  ru: {
    legend: 'Способ оплаты',
    tag: 'Тест',
    test: 'Тестовый режим: на странице оплаты принимаются только тестовые карты, реальные деньги не списываются.',
    secure: 'Оплата проходит на защищённой странице банка или Idram. Данные карты не передаются Siloona и не хранятся.',
  },
  en: {
    legend: 'Payment method',
    tag: 'Test',
    test: 'Test mode: the payment page accepts test cards only, and no real money is charged.',
    secure: 'You pay on the secure page of the bank or Idram. Your card details are never passed to or stored by Siloona.',
  },
}

// Payment method picker, shared by the checkout and the order page's
// "try again". `methods` are payment choices (checkoutApi.paymentChoices):
// only methods switched on in the server env are listed.
export default function PaymentMethods({ methods, value, onChange, disabled }) {
  const { lang } = useLang()
  const t = useText(TEXT)
  const METHOD_INFO = methodInfo(lang)
  return (
    <fieldset className="co-methods" disabled={disabled}>
      <legend className="co-label">{t.legend}</legend>
      {methods.map((m) => {
        const info = METHOD_INFO[m === 'test' ? 'test:card' : m]
        return (
          <label key={m} className={`co-method ${value === m ? 'on' : ''}`}>
            <input type="radio" name="method" value={m} checked={value === m} onChange={() => onChange(m)} />
            <span className="co-method-dot" aria-hidden="true" />
            <span className="co-method-txt">
              <span className="co-method-name">
                {info?.label || m}
                {isTestChoice(m) && <span className="co-method-tag">{t.tag}</span>}
              </span>
              <span className="co-method-sub">{info?.sub}</span>
            </span>
            <MethodIcon wallet={m === 'idram' || m === 'test-idram'} />
          </label>
        )
      })}
    </fieldset>
  )
}

function MethodIcon({ wallet }) {
  return (
    <svg className="co-method-ico" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
      {wallet ? (
        <>
          <path d="M4 7.5h14.5a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V7.5Zm0 0V6.5A1.5 1.5 0 0 1 5.5 5H16" />
          <path d="M20 11.5h-3.5a1.5 1.5 0 0 0 0 3H20" />
        </>
      ) : (
        <>
          <rect x="3" y="5.5" width="18" height="13" rx="2" />
          <path d="M3 9.5h18M6.5 15h4" />
        </>
      )}
    </svg>
  )
}

export function SecureNote({ test = false }) {
  const t = useText(TEXT)
  return (
    <p className="co-secure">
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
        <path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" />
      </svg>
      <span>{test ? t.test : t.secure}</span>
    </p>
  )
}
