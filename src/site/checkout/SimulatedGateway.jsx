import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { formatPrice } from '../pricing'
import './checkout.css'

// Stand-in for a bank's hosted payment page, used only by the payment
// simulator (PAYMENTS_SIMULATION=1). It asks for no card details — it just
// lets you pick what a real gateway could answer. The result is applied on
// the server (api/payments/simulator/complete.js), never in the browser.

const OUTCOMES = [
  { id: 'paid', label: 'Հաստատել վճարումը', cls: 'btn-primary', note: 'Բանկը հաստատում է գործարքը' },
  { id: 'failed', label: 'Մերժել', cls: 'btn-ghost', note: 'Օրինակ՝ քարտին բավարար միջոցներ չկան' },
  { id: 'cancelled', label: 'Չեղարկել և վերադառնալ', cls: 'btn-ghost', note: 'Հաճախորդը լքում է վճարման էջը' },
]

async function api(method, body, qs = '') {
  const r = await fetch(`/api/payments/simulator/complete${qs}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await r.json().catch(() => null)
  if (!r.ok) throw new Error(data?.message || 'Սխալ։ Փորձեք կրկին։')
  return data
}

export default function SimulatedGateway() {
  const [params] = useSearchParams()
  const tx = params.get('tx')
  const k = params.get('k')
  const [info, setInfo] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(null)

  useEffect(() => {
    api('GET', null, `?tx=${encodeURIComponent(tx || '')}&k=${encodeURIComponent(k || '')}`).then(setInfo, (e) => setErr(e.message))
  }, [tx, k])

  async function finish(outcome) {
    setBusy(outcome)
    setErr('')
    try {
      // A short pause, like a real authorisation, so the flow reads naturally in demos.
      const [r] = await Promise.all([api('POST', { tx, k, outcome }), new Promise((res) => setTimeout(res, outcome === 'paid' ? 1200 : 400))])
      window.location.replace(r.redirect)
    } catch (e) {
      setBusy(null)
      setErr(e.message)
    }
  }

  const done = info && !['created', 'pending'].includes(info.status)

  return (
    <div className="siloona-site">
      <main className="co co-sim">
        <div className="co-sim-banner" role="note">Թեստային ռեժիմ · իրական գումար չի գանձվում</div>
        <div className="wrap">
          <article className="co-card co-sim-card">
            <p className="eyebrow">Վճարման սիմուլյացիա</p>
            <h1>Թեստային վճարման էջ</h1>
            <p className="co-lede">Այս էջը փոխարինում է բանկի վճարման էջը՝ ստուգելու համար, թե ինչպես է աշխատում պատվերը։ Քարտի տվյալներ չեն պահանջվում։</p>

            {err && <p className="co-alert" role="alert">{err}</p>}
            {!info && !err && <span className="co-spin lg" aria-hidden="true" />}

            {info && (
              <>
                <dl className="co-details">
                  <div><dt>Վաճառող</dt><dd>Siloona</dd></div>
                  <div><dt>Պատվեր</dt><dd>№ {info.orderNumber}</dd></div>
                  <div><dt>Գործարքի հղում</dt><dd className="mono">{info.merchantRef}</dd></div>
                  <div><dt>Գումար</dt><dd className="co-sim-amount">{formatPrice(info.amount)}</dd></div>
                </dl>

                {done ? (
                  <p className="co-note" style={{ marginTop: 24 }}>Այս թեստային վճարումն արդեն ավարտված է։</p>
                ) : (
                  <div className="co-sim-actions">
                    {OUTCOMES.map((o) => (
                      <div key={o.id} className="co-sim-opt">
                        <button type="button" className={`btn ${o.cls}`} disabled={!!busy} onClick={() => finish(o.id)} aria-busy={busy === o.id}>
                          {busy === o.id ? <><span className={`co-spin ${o.id === 'paid' ? '' : 'dark'}`} aria-hidden="true" />Մշակվում է…</> : o.label}
                        </button>
                        <span>{o.note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </article>
        </div>
      </main>
    </div>
  )
}
