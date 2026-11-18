import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CARD_DESIGNS, WEB_DESIGNS } from '../designCatalog'
import { CUSTOM_DESIGN_ID, CUSTOM_EVENT_TYPES, CUSTOM_KINDS } from '../customRequest'
import { createOrder, orderLink, rememberOrder } from '../checkout/checkoutApi'
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

function validate(f) {
  const e = {}
  if (!f.eventType) e.eventType = 'Ընտրեք միջոցառման տեսակը։'
  if (f.notes.trim().length < 10) e.notes = 'Պատմեք մի փոքր Ձեր գաղափարի մասին։'
  if (f.name.trim().length < 2) e.name = 'Նշեք Ձեր անունը։'
  if (!/^\+?\d{8,15}$/.test(f.phone.replace(/[\s()-]/g, ''))) e.phone = 'Նշեք ճիշտ հեռախոսահամար, օրինակ՝ +374 99 123456։'
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Էլ. հասցեն սխալ է։'
  return e
}

export default function CustomRequestDialog({ onClose }) {
  const navigate = useNavigate()
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
    const errs = validate(f)
    if (!consent) errs.consent = 'Անհրաժեշտ է համաձայնել։'
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
      navigate(orderLink(r.orderId, r.token))
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
        <button type="button" className="cr-close" onClick={onClose} disabled={busy} aria-label="Փակել">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>

        <header className="cr-head">
          <p className="hm-eyebrow">Անհատական դիզայն</p>
          <h2 id="cr-title">Պատմեք Ձեր գաղափարի մասին</h2>
          <p>Կստեղծենք հրավեր հատուկ Ձեր միջոցառման համար կամ կհարմարեցնենք մեր դիզայններից մեկը։ Կկապվենք Ձեզ հետ՝ մանրամասներն ու գինը քննարկելու համար։</p>
        </header>

        <form onSubmit={submit} noValidate>
          <fieldset className="cr-group" data-f="eventType">
            <legend className="cr-label">Միջոցառումը <i aria-hidden="true">*</i></legend>
            <div className="cr-chips">
              {Object.entries(CUSTOM_EVENT_TYPES).map(([k, label]) => (
                <label key={k} className={`cr-chip ${f.eventType === k ? 'on' : ''}`}>
                  <input type="radio" name="eventType" value={k} checked={f.eventType === k} onChange={set('eventType')} />
                  {label}
                </label>
              ))}
            </div>
            {err('eventType')}
          </fieldset>

          <fieldset className="cr-group">
            <legend className="cr-label">Ինչ եք ցանկանում</legend>
            <div className="cr-kinds">
              {Object.entries(CUSTOM_KINDS).map(([k, label]) => (
                <label key={k} className={`cr-kind ${f.kind === k ? 'on' : ''}`}>
                  <input type="radio" name="kind" value={k} checked={f.kind === k} onChange={set('kind')} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {f.kind === 'adapt' && (
              <label className="cr-field wide" style={{ marginTop: 14 }}>
                <span className="cr-label">Որ դիզայնը</span>
                <select value={f.basedOn} onChange={set('basedOn')}>
                  <option value="">Դեռ չեմ ընտրել</option>
                  {DESIGNS.map((d) => <option key={d.id} value={d.id}>{d.title} · {d.code}</option>)}
                </select>
              </label>
            )}
          </fieldset>

          <div className="cr-fields">
            {input('names', 'Անուններ հրավերի վրա', { maxLength: 160, placeholder: 'Օրինակ՝ Աննա & Միքայել' })}
            {input('eventDate', 'Ամսաթիվ', { type: 'date', hint: 'Եթե արդեն հայտնի է' })}
            {input('notes', 'Ձեր գաղափարը', { wide: true, required: true, textarea: true, rows: 5, maxLength: 2000, placeholder: 'Ոճ, գույներ, տրամադրություն, ինչ բաժիններ եք ուզում (ծրագիր, քարտեզ, RSVP, լուսանկարներ)…' })}
            {input('references', 'Օրինակներ', { wide: true, textarea: true, rows: 2, maxLength: 1000, hint: 'Ոչ պարտադիր․ Pinterest, Instagram կամ այլ հղումներ, որոնք Ձեզ դուր են գալիս' })}
          </div>

          <p className="cr-sub">Ինչպես կապվենք Ձեզ հետ</p>
          <div className="cr-fields">
            {input('name', 'Անուն, ազգանուն', { required: true, maxLength: 120, autoComplete: 'name' })}
            {input('phone', 'Հեռախոս', { required: true, type: 'tel', maxLength: 32, autoComplete: 'tel', inputMode: 'tel', placeholder: '+374 __ ______' })}
            {input('email', 'Էլ. փոստ', { type: 'email', maxLength: 200, autoComplete: 'email', inputMode: 'email' })}
            {input('contact', 'Telegram կամ Instagram', { maxLength: 120, placeholder: '@', hint: 'Եթե նախընտրում եք կապ այնտեղ' })}
          </div>
          {/* Honeypot — hidden from people, filled in by bots. */}
          <input className="cr-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set('website')} name="website" />

          <label className="cr-consent" data-f="consent">
            <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setErrors((x) => ({ ...x, consent: undefined })) }} />
            <span>Համաձայն եմ, որ Siloona-ն օգտագործի իմ տվյալները՝ այս հայտին պատասխանելու և ինձ հետ կապվելու համար։</span>
          </label>
          {err('consent')}
          {error && <p className="cr-alert" role="alert">{error}</p>}

          <div className="cr-actions">
            <button type="submit" className="hm-btn hm-btn-solid" disabled={busy}>{busy ? 'Ուղարկում ենք…' : 'Ուղարկել հայտը'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
