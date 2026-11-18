import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { DesignThumb } from '../DesignCard'
import { CATEGORY_LABELS, findDesign } from '../designCatalog'
import { formatPrice } from '../pricing'
import PaymentMethods, { SecureNote } from './PaymentMethods'
import TimeSelect from '../invitations/shared/TimeSelect'
import { DateField } from '../invitations/shared/ArmenianDate'
import { loadOverride } from '../invitations/shared/storage'
import {
  OPTION_INFO, createOrder, getCheckoutConfig, goToProvider, orderLink, rememberOrder, startPayment, uploadPhotos,
} from './checkoutApi'
import './checkout.css'

const EMPTY = { name: '', phone: '', email: '', contact: '', names: '', eventDate: '', eventTime: '', venue: '', notes: '', website: '' }
const CONTACT_FIELDS = ['name', 'phone', 'email', 'contact', 'names', 'eventDate']

const uuid = () => (crypto.randomUUID ? crypto.randomUUID()
  : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)))

// Same rules the server applies (api/_lib/orders.js) — checked here first
// only so the customer gets instant feedback.
function validateContact(f, hasDetails) {
  const e = {}
  if (f.name.trim().length < 2) e.name = 'Նշեք Ձեր անունը։'
  if (!/^\+?\d{8,15}$/.test(f.phone.replace(/[\s()-]/g, ''))) e.phone = 'Նշեք ճիշտ հեռախոսահամար, օրինակ՝ +374 99 123456։'
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Էլ. հասցեն սխալ է։'
  if (hasDetails) return e // the design's own fields are checked instead
  if (f.names.trim().length < 2) e.names = 'Նշեք անունները, որոնք կերևան հրավերում։'
  if (!f.eventDate) e.eventDate = 'Նշեք միջոցառման ամսաթիվը։'
  return e
}

export default function Checkout() {
  const { designId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
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
  const [det, setDet] = useState({ extra: {} })
  const [error, setError] = useState('')
  const idem = useRef({ key: null, ref: null })
  const photoCache = useRef(new Map())
  const created = useRef(null)
  const stepRefs = useRef({})

  useEffect(() => {
    getCheckoutConfig()
      .then((c) => { setConfig(c); setMethod((m) => m || c.methods[0] || null) })
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
      const defaults = d.INVITATION_DEFAULTS[slug]
      if (!alive || !defaults || !m.detailFields(slug)) return
      const demo = m.detailsFromContent(slug, defaults)
      setSpec({ m, groups: m.detailGroups(slug), demo })
      // The demo's programme to start from — easier to adjust than to type.
      setDet((x) => ({ ...x, schedule: x.schedule || demo.schedule }))

      const saved = loadOverride(slug)
      const diff = saved && u.diffData(defaults, saved)
      if (!diff) return
      setEdits(diff)
      const got = m.detailsFromContent(slug, u.deepMerge(defaults, saved))
      // Fill what's empty; never overwrite something the customer typed.
      setDet((x) => {
        const out = { ...got, ...x, extra: { ...got.extra, ...x.extra } }
        for (const [k, v] of Object.entries(x)) if (v === '' || v == null) out[k] = got[k]
        out.schedule = got.schedule
        return out
      })
      if (!m.missingDetails(slug, got).length) setFromEditor(got)
    })
    return () => { alive = false }
  }, [design?.previewSlug])

  if (!design || design.available === false) {
    return (
      <main className="co">
        <div className="wrap co-empty">
          <p className="eyebrow">Պատվեր</p>
          <h1>Այս դիզայնը չի գտնվել</h1>
          <Link className="btn btn-primary" to="/invitations">Դիտել հավաքածուն</Link>
        </div>
      </main>
    )
  }

  const price = design.pricing[option]
  const ordersEnabled = config?.ordersEnabled
  const methods = config?.methods || []
  const payable = price != null && methods.length > 0
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })) }

  const useEditor = !!(edits && attachEdits && fromEditor)
  const detKey = (k) => `d-${k.replace(/[^a-z0-9]+/gi, '-')}`
  const setD = (k, v) => {
    setDet((d) => (k.startsWith('x:') ? { ...d, extra: { ...d.extra, [k.slice(2)]: v } } : { ...d, [k]: v }))
    setErrors((x) => ({ ...x, [detKey(k)]: undefined }))
  }

  const toPayment = () => {
    const e = validateContact(form, !!spec)
    if (spec && !useEditor) {
      for (const k of spec.m.missingDetails(design.previewSlug, det)) e[detKey(k)] = 'Լրացրեք այս դաշտը։'
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
    if (!consent) { setErrors((x) => ({ ...x, consent: 'Անհրաժեշտ է համաձայնել։' })); return }
    if (payable && !method) { setError('Ընտրեք վճարման եղանակը։'); return }

    setBusy(true)
    // The customer's own photos go up first; the order then carries their addresses.
    let content = edits && attachEdits ? edits : null
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
      customer: { name: form.name, phone: form.phone, email: form.email, contact: form.contact },
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
      if (!payable) { navigate(orderLink(orderId, token)); return }
      const r = await startPayment(orderId, token, method)
      if (r.alreadyPaid || !goToProvider(r)) navigate(orderLink(orderId, token))
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
      {step > n && !busy && <button type="button" className="co-edit" onClick={() => setStep(n)}>Փոխել</button>}
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
              <input type="text" aria-label="Ինչ է տեղի ունենում" maxLength={120} value={r.title} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
              <button type="button" className="co-sched-x" aria-label="Հեռացնել" onClick={() => setRows(rows.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
          <button type="button" className="co-sched-add" onClick={() => setRows([...rows, { time: '', title: '' }])}>+ Ավելացնել կետ</button>
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
          <a className="co-maplink" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQ)}`} target="_blank" rel="noopener noreferrer">Ստուգել քարտեզում →</a>
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

  let payLabel = `Վճարել ${formatPrice(price)}`
  if (price == null) payLabel = 'Ուղարկել հայտը'
  else if (!methods.length) payLabel = 'Ուղարկել պատվերը'

  return (
    <main className="co">
      <div className="wrap co-grid">
        <div className="co-main">
          <nav className="co-crumbs" aria-label="Ուղի">
            <Link to="/invitations">Հավաքածու</Link><span aria-hidden="true">/</span><span>{design.code}</span>
          </nav>
          <h1 className="co-title">Պատվերի ձևակերպում</h1>

          {/* 01 — the design and option */}
          <section className={`co-step ${step === 1 ? 'on' : 'done'}`} ref={(el) => { stepRefs.current[1] = el }}>
            {stepHead(1, 'Ձեր ընտրությունը', `${design.code} · ${OPTION_INFO[option].label} · ${formatPrice(price)}`)}
            {step === 1 && (
              <div className="co-step-b">
                <div className="co-options" role="radiogroup" aria-label="Տարբերակ">
                  {Object.entries(OPTION_INFO).map(([k, o]) => (
                    <label key={k} className={`co-opt ${option === k ? 'on' : ''}`}>
                      <input type="radio" name="option" value={k} checked={option === k} onChange={() => setOption(k)} />
                      <span className="co-opt-top">
                        <span className="co-opt-name">{o.label}</span>
                        <span className="co-opt-price">{formatPrice(design.pricing[k])}</span>
                      </span>
                      <span className="co-opt-text">{o.text}</span>
                    </label>
                  ))}
                </div>
                {edits ? (
                  <div className="co-edits">
                    <label className="co-consent">
                      <input type="checkbox" checked={attachEdits} onChange={(e) => setAttachEdits(e.target.checked)} />
                      <span>Կցել իմ խմբագրած տարբերակը պատվերին</span>
                    </label>
                    <p>Դուք խմբագրել եք այս հրավերը կայքում․ Ձեր փոփոխությունները կերևան պատրաստի հրավերում։ <Link to={`${design.previewRoute}?edit=1`}>Շարունակել խմբագրումը →</Link></p>
                  </div>
                ) : design.previewRoute && (
                  <p className="co-demo">
                    <Link to={`${design.previewRoute}?edit=1`}>Խմբագրել հրավերը կայքում →</Link>
                    <span className="co-demo-sep" aria-hidden="true">·</span>
                    <Link to={design.previewRoute}>Դիտել դեմոն</Link>
                  </p>
                )}
                <div className="co-actions">
                  <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>Շարունակել</button>
                </div>
              </div>
            )}
          </section>

          {/* 02 — contact + what goes on the invitation */}
          <section className={`co-step ${step === 2 ? 'on' : step > 2 ? 'done' : 'todo'}`} ref={(el) => { stepRefs.current[2] = el }}>
            {stepHead(2, 'Ձեր տվյալները', [form.name, form.phone].filter(Boolean).join(' · '))}
            {step === 2 && (
              <form className="co-step-b" noValidate onSubmit={(e) => { e.preventDefault(); toPayment() }}>
                <div className="co-fields">
                  {field('name', 'Անուն, ազգանուն', { required: true, autoComplete: 'name', maxLength: 120 })}
                  {field('phone', 'Հեռախոս', { required: true, type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: '+374 __ ______', maxLength: 32 })}
                  {field('email', 'Էլ. փոստ', { type: 'email', autoComplete: 'email', inputMode: 'email', maxLength: 200 })}
                  {field('contact', 'Telegram կամ Instagram', { placeholder: '@', maxLength: 120 }, 'Եթե նախընտրում եք կապ այնտեղ')}
                </div>

                <h3 className="co-sub">Հրավերի մանրամասներ <span>սրանք կերևան Ձեր հրավերում</span></h3>
                {useEditor && spec ? (
                  // Already on the invitation they edited — show it, don't ask again.
                  <div className="co-fromedit">
                    <p className="co-fromedit-lead">Վերցված է Ձեր խմբագրած հրավերից</p>
                    {detRecap()}
                    <p className="co-fromedit-edit"><Link to={`${design.previewRoute}?edit=1`}>Փոխել հրավերում →</Link></p>
                    <div className="co-fields">
                      {field('notes', 'Ցանկություններ', { wide: true, textarea: true, maxLength: 2000 }, 'Ոչ պարտադիր․ այն, ինչ ցանկանում եք մեզ հայտնել հրավերի մասին')}
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
                      {field('notes', 'Ցանկություններ', { wide: true, textarea: true, maxLength: 2000 }, 'Ոչ պարտադիր․ գույներ, լուսանկարներ, տեքստ՝ այն ամենը, ինչ ցանկանում եք ավելացնել կամ փոխել')}
                    </div>
                  </>
                ) : (
                  <div className="co-fields">
                    {field('names', 'Անուններ հրավերի վրա', { wide: true, required: true, maxLength: 160, placeholder: design.title }, 'Օրինակ՝ «Աննա & Միքայել» կամ «Նարե»')}
                    {field('eventDate', 'Միջոցառման ամսաթիվ', { type: 'date', required: true })}
                    {field('eventTime', 'Ժամ', { type: 'time' })}
                    {field('venue', 'Վայր', { wide: true, maxLength: 300 })}
                    {field('notes', 'Ցանկություններ', { wide: true, textarea: true, maxLength: 2000 }, 'Գույներ, տեքստ, լուսանկարներ, ծրագիր՝ այն ամենը, ինչ ցանկանում եք տեսնել հրավերում')}
                  </div>
                )}
                {/* Honeypot — hidden from people, filled in by bots. */}
                <input className="co-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')} name="website" />

                <div className="co-actions">
                  <button type="submit" className="btn btn-primary">Շարունակել</button>
                </div>
              </form>
            )}
          </section>

          {/* 03 — summary + payment */}
          <section className={`co-step ${step === 3 ? 'on' : 'todo'}`} ref={(el) => { stepRefs.current[3] = el }}>
            {stepHead(3, price == null ? 'Հայտի ուղարկում' : 'Վճարում')}
            {step === 3 && (
              <div className="co-step-b">
                <dl className="co-recap">
                  <div><dt>Պատվիրատու</dt><dd>{form.name}</dd></div>
                  <div><dt>Հեռախոս</dt><dd>{form.phone}</dd></div>
                  {form.email && <div><dt>Էլ. փոստ</dt><dd>{form.email}</dd></div>}
                  {(() => {
                    const names = spec ? spec.m.namesFromDetails(det) : form.names
                    const date = spec ? det.eventDate : form.eventDate
                    const time = spec ? det.eventTime : form.eventTime
                    return (
                      <>
                        {names && <div><dt>Հրավերի վրա</dt><dd>{names}</dd></div>}
                        {date && <div><dt>Ամսաթիվ</dt><dd>{date.split('-').reverse().join('.')}{time && `, ${time}`}</dd></div>}
                      </>
                    )
                  })()}
                </dl>

                {config === null ? (
                  <p className="co-note">Բեռնվում է…</p>
                ) : !ordersEnabled ? (
                  <div className="co-note">
                    Առցանց պատվերը դեռ միացված չէ։ Գրեք մեզ Instagram կամ Telegram-ում (տես՝ կայքի ստորին մասում)՝
                    նշելով «{design.code}» և «{OPTION_INFO[option].label}» տարբերակը։
                  </div>
                ) : price == null ? (
                  <p className="co-note">Այս դիզայնի գինը դեռ ճշտվում է։ Ուղարկեք հայտը, և մենք կկապվենք Ձեզ հետ՝ գինն ու մանրամասները հաստատելու համար։ Վճարումը կկատարվի դրանից հետո։</p>
                ) : !methods.length ? (
                  <p className="co-note">Առցանց վճարումը շուտով հասանելի կլինի։ Ուղարկեք պատվերը, և մենք կկապվենք Ձեզ հետ վճարման մանրամասների համար։</p>
                ) : (
                  <PaymentMethods methods={methods} value={method} onChange={setMethod} disabled={busy} />
                )}

                {ordersEnabled && (
                  <>
                    <label className="co-consent">
                      <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setErrors((x) => ({ ...x, consent: undefined })) }} />
                      <span>Համաձայն եմ, որ Siloona-ն օգտագործի իմ տվյալները՝ այս պատվերը կատարելու և ինձ հետ կապվելու համար։</span>
                    </label>
                    {errors.consent && <p className="co-err">{errors.consent}</p>}

                    {error && <p className="co-alert" role="alert">{error}</p>}

                    <button type="button" className={`btn btn-primary co-pay ${busy ? 'busy' : ''}`} onClick={submit} disabled={busy} aria-busy={busy}>
                      {busy ? <><span className="co-spin" aria-hidden="true" />{payable ? 'Ուղղորդում ենք վճարման էջ…' : 'Ուղարկում ենք…'}</> : payLabel}
                    </button>
                    {payable && <SecureNote test={method === 'test'} />}
                  </>
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="co-aside" aria-label="Պատվերի ամփոփում">
          <div className="co-sum">
            <div className="co-sum-thumb"><DesignThumb design={design} /></div>
            <div className="co-sum-body">
              <p className="eyebrow">{CATEGORY_LABELS[design.category]} · {design.code}</p>
              <h3 className="co-sum-title">{design.title}</h3>
              <p className="co-sum-type">{design.kind === 'card' ? 'Քարտային հրավիրատոմս' : 'Վեբ հրավիրատոմս'} · {OPTION_INFO[option].label}</p>
              <div className="co-sum-total">
                <span>Ընդամենը</span>
                <strong>{formatPrice(price)}</strong>
              </div>
              {price != null && <p className="co-sum-cur">Գինը՝ ՀՀ դրամով (AMD)</p>}
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
