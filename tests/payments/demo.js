// npm run demo:payments
// Runs the site locally with a throw-away in-memory database and the
// payment simulator switched on, so the whole checkout (order → test
// payment page → paid / declined / cancelled → order page) can be tried
// without Supabase keys or bank credentials. Everything is lost on exit.
// (The admin dashboard still needs the real Supabase login, so it isn't
// part of this demo.)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { createPgStore } from './pgStore.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const PORT = Number(process.env.PORT || 5180)

// Only the simulator: no real gateway is reachable from the demo.
for (const k of ['ARCA_USERNAME', 'ARCA_PASSWORD', 'IDRAM_ACCOUNT_ID', 'IDRAM_SECRET_KEY']) process.env[k] = ''
Object.assign(process.env, {
  PAYMENTS_SIMULATION: '1',
  RATE_LIMITS: 'off', // the demo makes many requests from one address
  PUBLIC_SITE_URL: `http://localhost:${PORT}`,
  SUPABASE_URL: 'demo-in-memory',
  SUPABASE_SERVICE_ROLE_KEY: 'demo-in-memory',
})

const store = await createPgStore()

// A sample dashboard event, published, so guests' links can be tried too
// (the dashboard writes events straight to Supabase, which the demo has not).
const GUESTS = [
  { id: 'g1', first: 'Լուսինե', last: 'Հակոբյան', inviteToken: 'DemoGuestLusine01', rsvp: 'pending', companions: 0 },
  { id: 'g2', first: 'Կարեն', last: 'Մուրադյան', inviteToken: 'DemoGuestKaren002', rsvp: 'pending', companions: 0 },
]
await store.db.query(
  `insert into events (id, owner_id, owner_mode, type, title, event_date, data) values ('demo-event', $1, 'couple', 'wedding', 'Մեր հարսանիքը', '2027-09-18', $2::jsonb)`,
  ['00000000-0000-4000-8000-00000000000c', JSON.stringify({
    time: '16:00',
    person1: { first: 'Մարիամ', last: '' }, person2: { first: 'Դավիթ', last: '' },
    locations: [
      { id: 'l1', kind: 'Եկեղեցի', name: 'Սուրբ Գայանե եկեղեցի', address: 'Էջմիածին', time: '15:00' },
      { id: 'l2', kind: 'Ռեստորան', name: '«Վարդենի» դահլիճ', address: 'Երևան', time: '18:00' },
    ],
    schedule: [{ id: 's1', time: '15:00', title: 'Պսակադրություն' }, { id: 's2', time: '18:00', title: 'Խնջույք' }],
    info: { maxPlus: 2 },
    inv: { slug: 'demo-event', status: 'published', design: 'wd-cherry', rsvp: true, personalize: true, greeting: 'Սիրով հրավիրում ենք Ձեզ, {name}', message: 'Սիրով հրավիրում ենք Ձեզ', deadline: '2027-08-18T00:00:00.000Z', designContent: {} },
    guests: GUESTS,
  })],
)
// «Ձեր սեղանը»: paid wd-portrait invitations in each state of the seating
// section (supabase/seating.sql), filled the way the import script does.
const { prepareSeating } = await import('../../scripts/seating-csv.js')
const SEATS = prepareSeating(fs.readFileSync(path.join(ROOT, 'scripts/seating.example.csv'), 'utf8')).rows
const HOUR = 3600 * 1000
const SEATING_DEMOS = [
  { code: 'd0000000000a', what: 'առանց սեղանների (ինչպես մինչ այժմ)' },
  { code: 'd0000000000b', what: 'մինչև բացումը (3 օր հետո)', revealAt: Date.now() + 72 * HOUR },
  { code: 'd0000000000c', what: 'բացված, հայերեն', revealAt: Date.now() - HOUR },
  { code: 'd0000000000d', what: 'բացված, ռուսերեն', revealAt: Date.now() - HOUR, lang: 'ru' },
  { code: 'd0000000000e', what: 'բացված, անգլերեն', revealAt: Date.now() - HOUR, lang: 'en' },
]
for (const d of SEATING_DEMOS) {
  const customization = { names: 'Լիլիթ & Արման', eventDate: '2027-09-18', eventTime: '17:00', venue: 'Երևան', ...(d.lang ? { content: { lang: d.lang } } : {}) }
  const { rows: [o] } = await store.db.query(
    `insert into orders (access_token, customer_name, customer_phone, design_id, design_option, customization, amount, payment_status)
     values ('demo', 'Demo', '+37499000000', 'wd-portrait', 'diy', $1::jsonb, 15000, 'paid') returning id`, [JSON.stringify(customization)])
  const { rows: [inv] } = await store.db.query(`insert into invitations (code, order_id, design_id) values ($1, $2, 'wd-portrait') returning id`, [d.code, o.id])
  if (d.revealAt) {
    await store.importSeating({ invitation: inv.id, revealAt: new Date(d.revealAt).toISOString(), rows: SEATS })
    await store.grantFeature(inv.id, 'seating') // as scripts/import-seating.js does
  }
}

const vite = await createServer({ root: ROOT, configFile: path.join(ROOT, 'vite.config.js'), server: { port: PORT, strictPort: true } })
await vite.listen()
;(await vite.ssrLoadModule('/api/_lib/store.js')).setStore(store)

console.log(`\n  Siloona payment demo (simulated payments, in-memory orders)`)
console.log(`  → http://localhost:${PORT}/invitations  — pick a design and press «Գնել»`)
console.log(`  → guests' links of a sample dashboard event:`)
console.log(`      http://localhost:${PORT}/i/demo-event               (general)`)
for (const g of GUESTS) console.log(`      http://localhost:${PORT}/i/demo-event/${g.inviteToken}   (${g.first})`)
console.log(`  → «Ձեր սեղանը» (wd-portrait; names from scripts/seating.example.csv):`)
for (const d of SEATING_DEMOS) console.log(`      http://localhost:${PORT}/i/${d.code}   ${d.what}`)
console.log('')
