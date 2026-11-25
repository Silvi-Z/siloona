// Payment SIMULATOR — for demos and testing the checkout before real
// merchant accounts exist. No money moves. The stand-in "payment page"
// (/checkout/simulate) plays a bank's hosted page — card form, 3-D Secure
// code, or an Idram wallet — and the server applies its outcome (paid /
// declined / cancelled) through the same state machine as real payments.
//
// Off unless PAYMENTS_SIMULATION=1, and always off on Vercel's production
// deployment, whatever that variable says. Every attempt is stored with
// provider 'test', shown as «Թեստ» in the dashboard and left out of
// revenue. It must never run on the public site: anyone could "pay" for an
// order with it.

export const simulator = {
  id: 'test',
  configured: () => process.env.PAYMENTS_SIMULATION === '1' && process.env.VERCEL_ENV !== 'production',
}

// The only card numbers the test page accepts — so a real card typed there
// by mistake goes nowhere. `result` is what the "bank" answers after the
// 3-D Secure code: paid, funds (not enough money) or declined.
export const SIM_CARDS = [
  { number: '4111111111111111', brand: 'visa', result: 'paid' },
  { number: '5555555555554444', brand: 'mastercard', result: 'paid' },
  { number: '9051000000000009', brand: 'arca', result: 'paid' },
  { number: '4000000000000002', brand: 'visa', result: 'funds' },
  { number: '4000000000000069', brand: 'visa', result: 'declined' },
]

const FAIL = {
  funds: { error_code: 'SIM-116', error_message: 'Թեստային մերժում՝ անբավարար միջոցներ (սիմուլյացիա)' },
  declined: { error_code: 'SIM-05', error_message: 'Թեստային մերժում՝ թողարկող բանկը մերժել է գործարքը (սիմուլյացիա)' },
  '3ds': { error_code: 'SIM-3DS', error_message: 'Թեստային մերժում՝ 3-D Secure կոդը սխալ է (սիմուլյացիա)' },
}
const CANCEL = { error_code: 'SIM-CANCEL', error_message: 'Վճարումը չեղարկվել է (սիմուլյացիա)' }

// { outcome: paid|failed|cancelled, via: card|idram, card?, reason? } →
// { status, patch }, or null when it doesn't add up. A card payment with no
// card given (older callers, tests) is booked on the Visa test card.
export function simOutcome({ outcome, via = 'card', card, reason } = {}) {
  if (via !== 'card' && via !== 'idram') return null
  const c = card == null ? SIM_CARDS[0] : SIM_CARDS.find((x) => x.number === String(card))
  if (!c) return null
  if (outcome === 'paid') {
    return { status: 'paid', patch: via === 'card' ? { card_mask: c.number.replace(/^(\d{6})\d+(\d{4})$/, '$1**$2') } : {} }
  }
  if (outcome === 'failed') return FAIL[reason || 'funds'] ? { status: 'failed', patch: FAIL[reason || 'funds'] } : null
  if (outcome === 'cancelled') return { status: 'cancelled', patch: CANCEL }
  return null
}
