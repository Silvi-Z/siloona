#!/usr/bin/env node
// «Անհատական դիմում հյուրին»: personal links for a purchased invitation.
//
//   node scripts/import-guests.js --invitation <code> --file guests.csv --out links.csv
//
//   --invitation <code>  the purchased invitation (the 12 characters after /i/)
//   --file <path>        the CSV: display_name[,phone][,note] (see scripts/guests.example.csv).
//                        display_name is how the invitation greets them:
//                        «Արամ և Անի», «Պետրոսյանների ընտանիք».
//   --out <path>         where to write the links (name,link) to send to the
//                        guests; without it they are printed
//   --enable             also turn the personal_greeting add-on on for this
//                        invitation (if it was sold outside the checkout)
//   --dry-run            check the file and show what would happen; change nothing
//
// Running it again with a longer list only adds the new names: a name
// already on the list keeps its link (its phone and note are updated).
// Nobody is removed — their link may already have been sent.
//
// Needs SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY and
// PUBLIC_SITE_URL (for the links; default https://siloona.am) — from the
// environment or .env.local, the same as the site's server.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { linksCsv, newGuestToken, prepareGuests } from './guests-csv.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function fail(msg) {
  console.error(`\n  ✗ ${msg}\n`)
  process.exit(1)
}

function args(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) fail(`Անհասկանալի արգումենտ՝ ${a}`)
    const k = a.slice(2)
    if (['dry-run', 'enable', 'help'].includes(k)) out[k] = true
    else if (['invitation', 'file', 'out'].includes(k)) {
      if (argv[i + 1] === undefined || argv[i + 1].startsWith('--')) fail(`--${k}-ից հետո արժեք չկա`)
      out[k] = argv[++i]
    } else fail(`Անծանոթ տարբերակ՝ ${a}`)
  }
  return out
}

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2')
  }
}

const opt = args(process.argv.slice(2))
if (opt.help || !opt.invitation || !opt.file) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 23).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'))
  process.exit(opt.help ? 0 : 1)
}
if (!/^[0-9a-f]{12}$/.test(opt.invitation)) fail('Հրավերի կոդը 12 նիշ է (0-9, a-f), այն, ինչ հղման մեջ /i/-ից հետո է։')

const file = path.resolve(opt.file)
if (!fs.existsSync(file)) fail(`Ֆայլը չի գտնվել՝ ${file}`)
let prepared
try { prepared = prepareGuests(fs.readFileSync(file, 'utf8')) } catch (e) { fail(e.message) }
if (!prepared.rows.length) fail('Ֆայլում ոչ մի ճիշտ տող չկա։ Ոչինչ չի փոխվել։')

loadEnvFile(path.join(ROOT, '.env.local'))
loadEnvFile(path.join(ROOT, '.env'))
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) fail('SUPABASE_URL և SUPABASE_SERVICE_ROLE_KEY չկան (environment կամ .env.local)։')
const site = (process.env.PUBLIC_SITE_URL || 'https://siloona.am').replace(/\/+$/, '')
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

const { data: inv, error: e1 } = await db.from('invitations').select('id, design_id, order_id, features').eq('code', opt.invitation).maybeSingle()
if (e1) fail(e1.message)
if (!inv) fail(`Այս կոդով հրավեր չկա՝ ${opt.invitation}`)
const { data: order } = await db.from('orders').select('addons').eq('id', inv.order_id).maybeSingle()
const paidFor = (order?.addons || []).some((a) => a?.id === 'personal_greeting')
const granted = (inv.features || []).includes('personal_greeting')

console.log(`\n  հրավեր ${opt.invitation} (${inv.design_id})`)
console.log(`  Ֆայլում՝ ${prepared.rows.length} ճիշտ տող${prepared.skipped.length ? `, ${prepared.skipped.length} բաց թողնված` : ''}`)
for (const s of prepared.skipped) console.log(`    · տող ${s.line}${s.name ? ` «${s.name}»` : ''} — ${s.reason}`)

const { data: existing, error: e2 } = await db.from('invitation_guests').select('id, token, display_name, name_key, phone, note').eq('invitation_id', inv.id)
if (e2) fail(`${e2.message} (գործարկե՞լ եք supabase/personal-links.sql-ը)`)
const byKey = new Map(existing.map((g) => [g.name_key, g]))
const add = prepared.rows.filter((r) => !byKey.has(r.key))
const change = prepared.rows.filter((r) => {
  const g = byKey.get(r.key)
  return g && (g.display_name !== r.name || (g.phone || null) !== r.phone || (g.note || null) !== r.note)
})
console.log(`  Նոր՝ ${add.length}, թարմացվող՝ ${change.length}, առանց փոփոխության՝ ${prepared.rows.length - add.length - change.length}`)

if (!paidFor && !granted && !opt.enable) {
  console.log('\n  ! Այս հրավերի պատվերում «Անհատական դիմում հյուրին» հավելումը չկա. հղումները կբացեն սովորական հրավերը։')
  console.log('    Եթե այն վաճառվել է այլ կերպ, գործարկեք --enable-ով։')
}

if (opt['dry-run']) {
  console.log('\n  --dry-run. ոչինչ չի փոխվել։\n')
  process.exit(0)
}

for (const r of add) {
  const { error } = await db.from('invitation_guests').insert({ invitation_id: inv.id, token: newGuestToken(), display_name: r.name, name_key: r.key, phone: r.phone, note: r.note })
  if (error) fail(`«${r.name}»՝ ${error.message}`)
}
for (const r of change) {
  const { error } = await db.from('invitation_guests').update({ display_name: r.name, phone: r.phone, note: r.note }).eq('id', byKey.get(r.key).id)
  if (error) fail(`«${r.name}»՝ ${error.message}`)
}
if (opt.enable && !granted) {
  const { error } = await db.from('invitations').update({ features: [...(inv.features || []), 'personal_greeting'] }).eq('id', inv.id)
  if (error) fail(`Չհաջողվեց միացնել հավելումը՝ ${error.message}`)
  console.log('  «Անհատական դիմում հյուրին» հավելումը միացված է այս հրավերի համար։')
}

// The links, in the file's order.
const { data: all, error: e3 } = await db.from('invitation_guests').select('display_name, name_key, token').eq('invitation_id', inv.id)
if (e3) fail(e3.message)
const keyed = new Map(all.map((g) => [g.name_key, g]))
const list = prepared.rows.map((r) => keyed.get(r.key)).filter(Boolean)
const csv = linksCsv(site, opt.invitation, list)
if (opt.out) {
  // a BOM so Excel opens the Armenian names right
  fs.writeFileSync(path.resolve(opt.out), `﻿${csv}`)
  console.log(`\n  ${list.length} հղում գրված է՝ ${path.resolve(opt.out)}\n`)
} else {
  console.log(`\n${csv}`)
}
