#!/usr/bin/env node
// «Ձեր սեղանը»: puts a couple's seating list on their invitation.
//
//   node scripts/import-seating.js --invitation <code> --file seating.csv --reveal-at "2027-09-18 18:00"
//
//   --invitation <code>  the purchased invitation (the 12 characters after /i/)
//   --event <id>         or a dashboard event (its id / link slug)
//   --file <path>        the CSV: guest_name,table_label (see scripts/seating.example.csv).
//                        The list on the invitation becomes exactly this file:
//                        new names are added, changed tables updated, and names
//                        no longer in the file removed.
//   --reveal-at <time>   from when guests see their table, Yerevan time
//                        («2027-09-18 18:00»). Needed the first time; later only
//                        to change it.
//   --off / --on         hide the section / show it again (the list is kept)
//   --dry-run            check the file and show what would happen; change nothing
//
// Needs SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY —
// from the environment or .env.local, the same as the site's server.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { parseRevealAt, prepareSeating } from './seating-csv.js'

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
    if (['off', 'on', 'dry-run', 'help'].includes(k)) out[k] = true
    else if (['invitation', 'event', 'file', 'reveal-at'].includes(k)) {
      if (argv[i + 1] === undefined || argv[i + 1].startsWith('--')) fail(`--${k}-ից հետո արժեք չկա`)
      out[k] = argv[++i]
    } else fail(`Անծանոթ տարբերակ՝ ${a}`)
  }
  return out
}

// KEY=VALUE lines of .env.local, without overriding the real environment.
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2')
  }
}

const opt = args(process.argv.slice(2))
if (opt.help || (!opt.invitation && !opt.event)) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 19).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'))
  process.exit(opt.help ? 0 : 1)
}
if (opt.invitation && opt.event) fail('Նշեք կամ --invitation, կամ --event, ոչ երկուսը միասին։')
if (opt.off && opt.on) fail('--off և --on միասին չեն կարող լինել։')
if (!opt.file && !opt['reveal-at'] && !opt.off && !opt.on) fail('Ոչինչ չկա փոխելու․ նշեք --file, --reveal-at, --off կամ --on։')
if (opt.invitation && !/^[0-9a-f]{12}$/.test(opt.invitation)) fail('Հրավերի կոդը 12 նիշ է (0-9, a-f), այն, ինչ հղման մեջ /i/-ից հետո է։')

let revealAt = null
try { if (opt['reveal-at']) revealAt = parseRevealAt(opt['reveal-at']) } catch (e) { fail(e.message) }

let prepared = null
if (opt.file) {
  const file = path.resolve(opt.file)
  if (!fs.existsSync(file)) fail(`Ֆայլը չի գտնվել՝ ${file}`)
  try { prepared = prepareSeating(fs.readFileSync(file, 'utf8')) } catch (e) { fail(e.message) }
  if (!prepared.rows.length) fail('Ֆայլում ոչ մի ճիշտ տող չկա։ Ոչինչ չի փոխվել։')
}

loadEnvFile(path.join(ROOT, '.env.local'))
loadEnvFile(path.join(ROOT, '.env'))
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) fail('SUPABASE_URL և SUPABASE_SERVICE_ROLE_KEY չկան (environment կամ .env.local)։')
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

// Which invitation
let target
if (opt.invitation) {
  const { data, error } = await db.from('invitations').select('id, design_id').eq('code', opt.invitation).maybeSingle()
  if (error) fail(error.message)
  if (!data) fail(`Այս կոդով հրավեր չկա՝ ${opt.invitation}`)
  target = { p_invitation: data.id, p_event: null, label: `հրավեր ${opt.invitation} (${data.design_id})` }
} else {
  let { data, error } = await db.from('events').select('id, title').eq('id', opt.event).maybeSingle()
  if (!data && !error) ({ data, error } = await db.from('events').select('id, title').eq('data->inv->>slug', opt.event).limit(1).maybeSingle())
  if (error) fail(error.message)
  if (!data) fail(`Այս id-ով կամ slug-ով միջոցառում չկա՝ ${opt.event}`)
  target = { p_invitation: null, p_event: data.id, label: `միջոցառում ${data.id}${data.title ? ` («${data.title}»)` : ''}` }
}

console.log(`\n  ${target.label}`)
if (prepared) {
  console.log(`  Ֆայլում՝ ${prepared.rows.length} ճիշտ տող${prepared.skipped.length ? `, ${prepared.skipped.length} բաց թողնված` : ''}`)
  for (const s of prepared.skipped) console.log(`    · տող ${s.line}${s.name ? ` «${s.name}»` : ''} — ${s.reason}`)
}

if (opt['dry-run']) {
  console.log('\n  --dry-run. ոչինչ չի փոխվել։\n')
  process.exit(0)
}

const { data: r, error } = await db.rpc('import_seating', {
  p_invitation: target.p_invitation,
  p_event: target.p_event,
  p_reveal_at: revealAt,
  p_enabled: opt.off ? false : opt.on ? true : null,
  p_rows: prepared ? prepared.rows : null,
})
if (error) {
  if (String(error.message).includes('seating_reveal_required')) fail('Առաջին անգամ պետք է նշել --reveal-at (երբից են հյուրերը տեսնում սեղանը)։')
  fail(error.message)
}

// The section shows only on invitations with the seating feature
// (src/site/addons.js): an order that paid for it has it; importing a list
// also turns it on for this invitation (supabase/addons.sql →
// invitations.features), so a list set up by hand works too.
async function grantSeating() {
  let invId = target.p_invitation
  if (!invId) {
    const { data: o } = await db.from('orders').select('id').eq('event_id', target.p_event).maybeSingle()
    const { data: inv } = o ? await db.from('invitations').select('id').eq('order_id', o.id).maybeSingle() : { data: null }
    invId = inv?.id
  }
  if (!invId) return console.log('  ! Միջոցառմանը վճարված պատվեր կապված չէ. բաժինը կերևա, երբ պատվերը կապվի և այն ունենա «Ձեր սեղանը» հավելումը։')
  const { data: row, error: e1 } = await db.from('invitations').select('features').eq('id', invId).maybeSingle()
  if (e1) return console.log(`  ! Չհաջողվեց միացնել «Ձեր սեղանը» հավելումը (գործարկե՞լ եք supabase/addons.sql-ը)՝ ${e1.message}`)
  const features = Array.isArray(row?.features) ? row.features : []
  if (features.includes('seating')) return
  const { error: e2 } = await db.from('invitations').update({ features: [...features, 'seating'] }).eq('id', invId)
  if (e2) console.log(`  ! Չհաջողվեց միացնել «Ձեր սեղանը» հավելումը՝ ${e2.message}`)
}
await grantSeating()

const when = new Date(r.reveal_at).toLocaleString('en-GB', { timeZone: 'Asia/Yerevan', dateStyle: 'medium', timeStyle: 'short' })
console.log('')
if (prepared) console.log(`  Ներմուծված է՝ ${r.added} նոր, ${r.updated} թարմացված, ${r.deleted} հեռացված։ Ցուցակում հիմա՝ ${r.total} անուն։`)
console.log(`  Բաժինը ${r.enabled ? 'միացված է' : 'անջատված է'}. սեղանները երևում են ${when}-ից (Երևանի ժամով)։\n`)
