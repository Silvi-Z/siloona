import { METHOD_INFO } from './checkoutApi'

// Payment method picker, shared by the checkout and the order page's
// "try again". Only methods switched on in the server env are listed.
export default function PaymentMethods({ methods, value, onChange, disabled }) {
  return (
    <fieldset className="co-methods" disabled={disabled}>
      <legend className="co-label">Վճարման եղանակ</legend>
      {methods.map((m) => (
        <label key={m} className={`co-method ${value === m ? 'on' : ''}`}>
          <input type="radio" name="method" value={m} checked={value === m} onChange={() => onChange(m)} />
          <span className="co-method-dot" aria-hidden="true" />
          <span className="co-method-txt">
            <span className="co-method-name">{METHOD_INFO[m]?.label || m}</span>
            <span className="co-method-sub">{METHOD_INFO[m]?.sub}</span>
          </span>
        </label>
      ))}
    </fieldset>
  )
}

export function SecureNote({ test = false }) {
  return (
    <p className="co-secure">
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
        <path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" />
      </svg>
      <span>{test
        ? 'Թեստային վճարում․ քարտի տվյալներ չեն պահանջվում, և իրական գումար չի գանձվում։'
        : 'Վճարումը կատարվում է բանկի կամ Idram-ի պաշտպանված էջում։ Քարտի տվյալները Siloona-ին չեն փոխանցվում և չեն պահվում։'}</span>
    </p>
  )
}
