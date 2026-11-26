import { HttpError } from './http.js'

// «Ձեր սեղանը»: a guest types their name on the invitation and sees their
// table. The list lives in `seating` (supabase/seating.sql); the server
// reads it only after the plan's reveal time and only ever answers with
// one table, "type your surname too" or "not found" — never a name or
// anything about other guests.

// ---------------------------------------------------------------------------
// Names: the same person written differently must compare equal —
// «Անի Պետրոսյան», «ani petrosyan», «Ani Petrosian», «Ани Петросян».
// Each word is spelled out in Latin letters, then the usual spelling
// variants are folded together (kh/x, ts/c, ye-/e-, -ia-/-ya-, double
// letters, a dropped h). No dictionary, no dependency.
// ---------------------------------------------------------------------------

const ARMENIAN = {
  ա: 'a', բ: 'b', գ: 'g', դ: 'd', ե: 'e', զ: 'z', է: 'e', ը: 'e', թ: 't', ժ: 'zh', ի: 'i', լ: 'l', խ: 'kh',
  ծ: 'ts', կ: 'k', հ: 'h', ձ: 'dz', ղ: 'gh', ճ: 'ch', մ: 'm', յ: 'y', ն: 'n', շ: 'sh', ո: 'o', չ: 'ch',
  պ: 'p', ջ: 'j', ռ: 'r', ս: 's', վ: 'v', տ: 't', ր: 'r', ց: 'ts', ւ: 'v', փ: 'p', ք: 'k', օ: 'o', ֆ: 'f',
}
const CYRILLIC = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l',
  м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}
// «և» on its own is "and" (NFKC turns the ligature into «եւ»).
const CONNECTORS = new Set(['&', 'and', 'ev', 'եւ', 'и'])

function spell(word) {
  let s = word.replace(/ու/g, 'u')
  s = [...s].map((c) => ARMENIAN[c] ?? CYRILLIC[c] ?? c).join('')
  // é → e and the like, then anything that isn't a letter or digit goes
  s = s.normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]/g, '')
  return s
    .replace(/tch/g, 'ch')
    .replace(/dzh/g, 'j').replace(/dj/g, 'j')
    .replace(/sh/g, 'S').replace(/zh/g, 'Z').replace(/ch/g, 'C')
    .replace(/kh/g, 'x').replace(/gh/g, 'g').replace(/ph/g, 'p').replace(/th/g, 't')
    .replace(/t[sz]/g, 'c')
    .replace(/ou|oo/g, 'u')
    .replace(/w/g, 'v').replace(/q/g, 'k')
    .replace(/h/g, '')
    .replace(/^ye/, 'e').replace(/^vo/, 'o')
    .replace(/iy/g, 'y').replace(/i(?=[aeou])/g, 'y')
    .replace(/(.)\1+/g, '$1')
}

// The words of a name, each in its comparable form.
export function nameTokens(name) {
  if (typeof name !== 'string') return []
  return name
    .normalize('NFKC')
    .toLowerCase()
    .replace(/&/g, ' & ')
    .split(/[^\p{L}\p{N}&]+/u)
    .filter((w) => w && !CONNECTORS.has(w))
    .map(spell)
    .filter(Boolean)
}

// One string per name — the import's "is this the same guest" key.
export const nameKey = (name) => nameTokens(name).join(' ')

// Every word the guest typed must be one of the listed name's words; from
// 4 letters a word may also be the start of one (Պետրոսյան finds
// Պետրոսյաններ), and a single letter stands for an initial.
function covers(listed, typed) {
  const used = new Array(listed.length).fill(false)
  const take = (ok) => {
    const i = listed.findIndex((w, j) => !used[j] && ok(w))
    if (i < 0) return false
    used[i] = true
    return true
  }
  return typed.every((t) => take((w) => w === t) || ((t.length >= 4 || t.length === 1) && take((w) => w.startsWith(t))))
}

export const MAX_NAME = 120

// rows: [{ guest_name, table_label }] of one plan.
//   { status: 'found', table }   one table (also when every match sits there)
//   { status: 'ambiguous' }      several guests, different tables
//   { status: 'not_found' }
//   { status: 'empty' }          nothing usable was typed
export function matchSeat(rows, query) {
  const typed = nameTokens(String(query ?? '').slice(0, MAX_NAME))
  if (!typed.some((t) => t.length >= 2)) return { status: 'empty' }
  const hits = rows.filter((r) => covers(nameTokens(r.guest_name), typed))
  if (!hits.length) return { status: 'not_found' }
  const tables = [...new Set(hits.map((r) => String(r.table_label).trim()))]
  return tables.length === 1 ? { status: 'found', table: tables[0] } : { status: 'ambiguous' }
}

// ---------------------------------------------------------------------------
// The plan behind an invitation
// ---------------------------------------------------------------------------

// target: { invitation_id } or { event_id }. null when there is none or
// it is switched off.
export async function seatingPlan(store, target) {
  if (!store.getSeatingPlan) return null
  const plan = await store.getSeatingPlan(target)
  return plan?.enabled ? plan : null
}

const isOpen = (plan, now) => now >= Date.parse(plan.reveal_at)

// What the invitation page gets: only when, never a table.
export function seatingView(plan, now = Date.now()) {
  if (!plan) return null
  return { revealAt: new Date(plan.reveal_at).toISOString(), open: isOpen(plan, now) }
}

export async function findSeat(store, plan, name, now = Date.now()) {
  if (!plan) throw new HttpError(404, 'seating_off', 'Այս հրավերում սեղանների ցուցակ չկա։')
  // Before the reveal the list isn't even read.
  if (!isOpen(plan, now)) throw new HttpError(409, 'not_open', 'Սեղանները դեռ հասանելի չեն։')
  if (typeof name !== 'string' || name.length > MAX_NAME) throw new HttpError(422, 'invalid', 'Գրեք Ձեր անունը։')
  const result = matchSeat([], name)
  if (result.status === 'empty') return result
  return matchSeat(await store.listSeats(plan.id), name)
}
