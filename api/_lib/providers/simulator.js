// Payment SIMULATOR — for demos and testing the checkout before real
// merchant accounts exist. No money moves and no card details are asked
// for: the "payment page" (/checkout/simulate) just offers the outcomes a
// real gateway can produce (paid / declined / cancelled), and the server
// applies them through the same state machine as real payments.
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

export const SIM_OUTCOMES = {
  paid: { status: 'paid', patch: { card_mask: '411111**1111' } },
  failed: { status: 'failed', patch: { error_code: 'SIM-116', error_message: 'Թեստային մերժում՝ անբավարար միջոցներ (սիմուլյացիա)' } },
  cancelled: { status: 'cancelled', patch: { error_code: 'SIM-CANCEL', error_message: 'Վճարումը չեղարկվել է (սիմուլյացիա)' } },
}
