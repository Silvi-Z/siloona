// «Ձեր սեղանը»: name matching, the CSV import, and the public API
// (against the in-memory Postgres running the real supabase/*.sql).
// Run: npm run test:seating
import { test, before, after, describe } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { matchSeat, nameKey, nameTokens } from '../../api/_lib/seating.js'
import { parseCsv, parseRevealAt, prepareSeating } from '../../scripts/seating-csv.js'
import { createPgStore } from '../payments/pgStore.js'

const same = (a, b) => assert.equal(nameKey(a), nameKey(b), `«${a}» ≠ «${b}»: ${nameKey(a)} / ${nameKey(b)}`)
const differ = (a, b) => assert.notEqual(nameKey(a), nameKey(b), `«${a}» = «${b}»`)

// ---------------------------------------------------------------------------
describe('names', () => {
  test('case, spaces, hyphens and punctuation do not matter', () => {
    same('Անի Պետրոսյան', '  անի   ՊԵՏՐՈՍՅԱՆ ')
    same('Ter-Petrosyan Ani', 'ter petrosyan, ani.')
    same('Ani  Petrosyan', 'ANI PETROSYAN!')
  })
  test('«և», «&», «and», «и» are the same (or nothing)', () => {
    same('Արամ և Լիլիթ', 'Aram & Lilit')
    same('Aram and Lilit', 'Արամ եւ Լիլիթ')
    same('Арам и Лилит', 'Aram Lilit')
  })
  test('Armenian ↔ Latin', () => {
    same('Անի', 'Ani')
    same('Արամ', 'Aram')
    same('Խաչատրյան', 'Khachatryan')
    same('Խաչատրյան', 'Xachatryan')
    same('Ծովինար', 'Tsovinar')
    same('Ղազարյան', 'Ghazaryan')
    same('Ղազարյան', 'Gazaryan')
    same('Եղիազարյան', 'Yeghiazaryan')
    same('Եղիազարյան', 'Eghiazaryan')
    same('Պետրոսյան', 'Petrosian')
    same('Շուշան', 'Shushan')
    same('Ժաննա', 'Zhanna')
    same('Հասմիկ', 'Hasmik')
    same('Ոսկան', 'Voskan')
  })
  test('Russian ↔ Armenian ↔ Latin', () => {
    same('Ани', 'Անի')
    same('Петросян', 'Petrosyan')
    same('Хачатрян', 'Խաչատրյան')
    same('Асмик', 'Հասմիկ')
    same('Мариам', 'Մարիամ')
  })
  test('Armenian ligature «և» inside a word stays a letter', () => {
    same('Սևակ', 'Sevak')
    differ('Սևակ', 'Սակ')
  })
  test('different names stay different', () => {
    differ('Անի', 'Աննա')
    differ('Արամ', 'Արման')
    differ('Կարեն', 'Կարինե')
    differ('Gor', 'Goar')
  })
  test('empty and odd input', () => {
    assert.deepEqual(nameTokens(''), [])
    assert.deepEqual(nameTokens('   '), [])
    assert.deepEqual(nameTokens(null), [])
    assert.deepEqual(nameTokens(42), [])
    assert.deepEqual(nameTokens('— , . & и և'), [])
  })
})

// ---------------------------------------------------------------------------
describe('finding a table', () => {
  const LIST = [
    { guest_name: 'Անի Պետրոսյան', table_label: '7' },
    { guest_name: 'Անի Հակոբյան', table_label: '5' },
    { guest_name: 'Արամ և Լիլիթ Սարգսյաններ', table_label: '7' },
    { guest_name: 'Կարեն Մուրադյան', table_label: '3' },
    { guest_name: 'Կարեն Մուրադյան կրտսեր', table_label: '3' },
    { guest_name: 'Մարիամ Ավետիսյան', table_label: 'VIP' },
    { guest_name: 'Нина Иванова', table_label: '12' },
  ]
  const find = (q) => matchSeat(LIST, q)

  test('full name, either order, any script', () => {
    assert.deepEqual(find('Անի Պետրոսյան'), { status: 'found', table: '7' })
    assert.deepEqual(find('Petrosyan Ani'), { status: 'found', table: '7' })
    assert.deepEqual(find('ани петросян'), { status: 'found', table: '7' })
    assert.deepEqual(find('Nina Ivanova'), { status: 'found', table: '12' })
  })
  test('a first name alone, when it is unique', () => {
    assert.deepEqual(find('Մարիամ'), { status: 'found', table: 'VIP' })
    assert.deepEqual(find('lilit'), { status: 'found', table: '7' })
  })
  test('two «Անի» at different tables: asks for the surname, reveals nothing', () => {
    assert.deepEqual(find('Անի'), { status: 'ambiguous' })
    assert.deepEqual(find('Ani'), { status: 'ambiguous' })
    assert.deepEqual(find('Ani Hakobyan'), { status: 'found', table: '5' })
  })
  test('several matches at the same table: that table', () => {
    assert.deepEqual(find('Կարեն Մուրադյան'), { status: 'found', table: '3' })
  })
  test('one of a couple, and a surname written in the singular', () => {
    assert.deepEqual(find('Lilit Sargsyan'), { status: 'found', table: '7' })
    assert.deepEqual(find('Արամ Սարգսյան'), { status: 'found', table: '7' })
  })
  test('an initial with the surname', () => {
    assert.deepEqual(find('Ա. Հակոբյան'), { status: 'found', table: '5' })
  })
  test('not on the list', () => {
    assert.deepEqual(find('Գոհար Սիմոնյան'), { status: 'not_found' })
    assert.deepEqual(find('Անի Սիմոնյան'), { status: 'not_found' })
    // a short fragment is not a name
    assert.deepEqual(find('Պետ'), { status: 'not_found' })
  })
  test('empty input', () => {
    assert.deepEqual(find(''), { status: 'empty' })
    assert.deepEqual(find('   '), { status: 'empty' })
    assert.deepEqual(find('Ա.'), { status: 'empty' })
    assert.deepEqual(find(undefined), { status: 'empty' })
  })
})

// ---------------------------------------------------------------------------
describe('CSV', () => {
  test('quotes, semicolons, a BOM and CRLF', () => {
    assert.deepEqual(parseCsv('﻿a;b\r\n"x; y";"he said ""hi"""\r\n'), [['a', 'b'], ['x; y', 'he said "hi"']])
    assert.deepEqual(parseCsv('a,b\n"Harutyunyan, Gor",3'), [['a', 'b'], ['Harutyunyan, Gor', '3']])
  })
  test('rows kept, rows skipped and why', () => {
    const { rows, skipped } = prepareSeating([
      'Guest_Name,Table_Label',
      'Անի Պետրոսյան,7',
      ',4',
      'Կարեն,',
      '',
      'ANI petrosyan,8',
      '"Արամ և Լիլիթ",  VIP ',
      '...,2',
    ].join('\n'))
    assert.deepEqual(rows.map((r) => [r.name, r.table]), [['Անի Պետրոսյան', '7'], ['Արամ և Լիլիթ', 'VIP']])
    assert.deepEqual(skipped.map((s) => s.line), [3, 4, 6, 8])
    assert.match(skipped[2].reason, /2-րդ տողում/)
  })
  test('without the column names it refuses', () => {
    assert.throws(() => prepareSeating('name,table\nԱնի,7'), /guest_name/)
  })
  test('reveal time is Yerevan time', () => {
    assert.equal(parseRevealAt('2027-09-18 18:00'), '2027-09-18T14:00:00.000Z')
    assert.equal(parseRevealAt('2027-09-18'), '2027-09-17T20:00:00.000Z')
    assert.throws(() => parseRevealAt('18.09.2027'))
  })
})

// ---------------------------------------------------------------------------
// The API, end to end
// ---------------------------------------------------------------------------
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
let store, server, base
const CODES = { off: 'aaaaaaaa0001', soon: 'aaaaaaaa0002', open: 'aaaaaaaa0003', none: 'aaaaaaaa0004' }

async function paidInvitation(code) {
  const o = await store.db.query(
    `insert into orders (access_token, customer_name, customer_phone, design_id, design_option, customization, amount, payment_status)
     values ('t', 'Test', '+37499000000', 'wd-portrait', 'diy', '{"names":"Լիլիթ & Արման"}', 15000, 'paid') returning id`)
  const inv = await store.db.query('insert into invitations (code, order_id, design_id) values ($1, $2, $3) returning id', [code, o.rows[0].id, 'wd-portrait'])
  return inv.rows[0].id
}

const call = async (method, url, body) => {
  const r = await fetch(base + url, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined })
  return { status: r.status, json: await r.json().catch(() => null) }
}
const seat = (code, name) => call('POST', '/api/invitations', { seat: true, code, name })

before(async () => {
  process.env.RATE_LIMITS = 'off'
  process.env.SUPABASE_URL = 'test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test'
  store = await createPgStore()
  ;(await import(pathToFileURL(path.join(ROOT, 'api/_lib/store.js')).href)).setStore(store)
  const route = (await import(pathToFileURL(path.join(ROOT, 'api/invitations/index.js')).href)).default
  server = http.createServer((req, res) => route(req, res))
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  base = `http://127.0.0.1:${server.address().port}`

  const rows = prepareSeating('guest_name,table_label\nԱնի Պետրոսյան,7\nԱնի Հակոբյան,5\nԿարեն Մուրադյան,3').rows
  const ids = {}
  for (const [k, code] of Object.entries(CODES)) ids[k] = await paidInvitation(code)
  const hour = 3600 * 1000
  await store.importSeating({ invitation: ids.off, revealAt: new Date(Date.now() - hour).toISOString(), enabled: false, rows })
  await store.importSeating({ invitation: ids.soon, revealAt: new Date(Date.now() + 24 * hour).toISOString(), rows })
  await store.importSeating({ invitation: ids.open, revealAt: new Date(Date.now() - hour).toISOString(), rows })
})
after(() => server?.close())

describe('API', () => {
  test('no seating ordered / switched off: the page gets nothing, lookups refused', async () => {
    for (const code of [CODES.none, CODES.off]) {
      const page = await call('GET', `/api/invitations?code=${code}`)
      assert.equal(page.status, 200)
      assert.equal(page.json.seating, null)
      const r = await seat(code, 'Անի Պետրոսյան')
      assert.equal(r.status, 404)
      assert.equal(r.json.table, undefined)
    }
  })

  test('before the reveal: the date only, and no table even when asked directly', async () => {
    const page = await call('GET', `/api/invitations?code=${CODES.soon}`)
    assert.equal(page.json.seating.open, false)
    assert.ok(Date.parse(page.json.seating.revealAt) > Date.now())
    assert.deepEqual(Object.keys(page.json.seating).sort(), ['open', 'revealAt'])
    const r = await seat(CODES.soon, 'Անի Պետրոսյան')
    assert.equal(r.status, 409)
    assert.equal(r.json.error, 'not_open')
    assert.ok(!JSON.stringify(r.json).includes('7'))
  })

  test('after the reveal: one table by name; nothing about anyone else', async () => {
    const page = await call('GET', `/api/invitations?code=${CODES.open}`)
    assert.equal(page.json.seating.open, true)
    assert.ok(!JSON.stringify(page.json).includes('Պետրոսյան'))

    assert.deepEqual((await seat(CODES.open, 'ani petrosyan')).json, { status: 'found', table: '7' })
    assert.deepEqual((await seat(CODES.open, 'Անի')).json, { status: 'ambiguous' })
    assert.deepEqual((await seat(CODES.open, 'Գոհար')).json, { status: 'not_found' })
    assert.deepEqual((await seat(CODES.open, '  ')).json, { status: 'empty' })
    assert.equal((await seat(CODES.open, 'x'.repeat(500))).status, 422)
    assert.equal((await seat(CODES.open, { name: 1 })).status, 422)
  })

  test('unknown links are refused', async () => {
    assert.equal((await seat('ffffffffffff', 'Անի')).status, 404)
    assert.equal((await seat('', 'Անի')).status, 404)
  })

  test('re-import replaces the list: changed, added, removed — never duplicated', async () => {
    const id = (await store.db.query('select id from invitations where code = $1', [CODES.open])).rows[0].id
    const next = prepareSeating('guest_name,table_label\nani petrosyan,9\nԿարեն Մուրադյան,3\nԳոհար Սիմոնյան,1').rows
    const r = await store.importSeating({ invitation: id, rows: next })
    assert.deepEqual([r.added, r.updated, r.deleted, r.total], [1, 1, 1, 3])
    assert.deepEqual((await seat(CODES.open, 'Անի Պետրոսյան')).json, { status: 'found', table: '9' })
    assert.deepEqual((await seat(CODES.open, 'Անի Հակոբյան')).json, { status: 'not_found' })
    assert.deepEqual((await seat(CODES.open, 'Gohar Simonyan')).json, { status: 'found', table: '1' })
    // the same file again changes nothing
    const again = await store.importSeating({ invitation: id, rows: next })
    assert.deepEqual([again.added, again.updated, again.deleted, again.total], [0, 0, 0, 3])
  })

  test('the first import needs a reveal time', async () => {
    const id = (await store.db.query('select id from invitations where code = $1', [CODES.none])).rows[0].id
    await assert.rejects(store.importSeating({ invitation: id, rows: [] }), /seating_reveal_required/)
  })

  test('the RSVP still works as before', async () => {
    const r = await call('POST', '/api/invitations', { code: CODES.open, name: 'Անի', status: 'confirmed', plus: 1 })
    assert.equal(r.status, 201)
  })
})
