import { createHash, timingSafeEqual } from 'node:crypto'

// Idram — Armenian e-wallet (Idram app / Idram&IDBank balance).
//
// Flow (Idram merchant protocol):
//   1. The browser POSTs a form to Idram's payment page (buildForm).
//   2. Idram calls our RESULT_URL server-to-server with EDP_PRECHECK=YES —
//      we answer "OK" only if that bill exists, is unpaid and the amount
//      and account match.
//   3. After the customer pays, Idram calls RESULT_URL again with the
//      transaction and EDP_CHECKSUM = MD5(EDP_REC_ACCOUNT:EDP_AMOUNT:
//      SECRET_KEY:EDP_BILL_NO:EDP_PAYER_ACCOUNT:EDP_TRANS_ID:EDP_TRANS_DATE).
//      Only a valid checksum marks the order paid.
//   4. Idram sends the customer to SUCCESS_URL / FAIL_URL. Those just show
//      the order page; they never change the order.
// RESULT_URL, SUCCESS_URL and FAIL_URL are set in the Idram merchant
// account, not per payment (see .env.example for the values to give Idram).
//
// Env: IDRAM_ACCOUNT_ID (EDP_REC_ACCOUNT), IDRAM_SECRET_KEY.

const PAY_URL = 'https://banking.idram.am/Payment/GetPayment'

function cfg() {
  return { account: process.env.IDRAM_ACCOUNT_ID, secret: process.env.IDRAM_SECRET_KEY }
}

export const idram = {
  id: 'idram',
  configured() {
    const c = cfg()
    return Boolean(c.account && c.secret)
  },
  account: () => cfg().account,

  buildForm({ merchantRef, amount, description, email }) {
    const fields = {
      EDP_LANGUAGE: 'AM',
      EDP_REC_ACCOUNT: cfg().account,
      EDP_DESCRIPTION: description,
      EDP_AMOUNT: String(amount),
      EDP_BILL_NO: merchantRef,
    }
    if (email) fields.EDP_EMAIL = email
    return { action: PAY_URL, fields }
  },

  checksumValid(p) {
    const { account, secret } = cfg()
    const src = [account, p.EDP_AMOUNT, secret, p.EDP_BILL_NO, p.EDP_PAYER_ACCOUNT, p.EDP_TRANS_ID, p.EDP_TRANS_DATE].join(':')
    const want = createHash('md5').update(src, 'utf8').digest('hex').toUpperCase()
    const got = String(p.EDP_CHECKSUM || '').toUpperCase()
    return got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want))
  },

  amountMatches(p, tx) {
    return Math.abs(parseFloat(p.EDP_AMOUNT) - tx.amount) < 0.005
  },
}
