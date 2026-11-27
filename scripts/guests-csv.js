import { randomBytes } from 'node:crypto'
import { nameKey } from '../api/_lib/seating.js'
import { parseCsv } from './seating-csv.js'

// The couple's guest list as a CSV file → personal links
// (supabase/personal-links.sql, scripts/import-guests.js). Kept apart from
// the script so the tests can check it without a database.
//
// Columns (first line): display_name, and optionally phone and note.
// display_name is how the invitation addresses them: «Արամ և Անի»,
// «Պետրոսյանների ընտանիք». Commas or semicolons, quotes around values
// with commas, UTF-8 with or without a BOM — as Excel saves it.

const MAX_NAME = 120
const MAX_PHONE = 40
const MAX_NOTE = 300

export function prepareGuests(text) {
  const rows = parseCsv(text)
  const head = (rows.shift() || []).map((h) => h.trim().toLowerCase())
  const col = (names) => head.findIndex((h) => names.includes(h))
  const iName = col(['display_name', 'name', 'անուն'])
  if (iName < 0) throw new Error('Առաջին տողում պետք է լինի display_name սյունակը (ըստ ցանկության՝ phone, note)։')
  const iPhone = col(['phone', 'հեռախոս'])
  const iNote = col(['note', 'նշում'])
  const out = []
  const skipped = []
  const seen = new Map()
  rows.forEach((r, i) => {
    const line = i + 2
    const cell = (k) => (k >= 0 ? String(r[k] ?? '').trim() : '')
    const name = cell(iName).replace(/\s+/g, ' ')
    if (!name && r.every((c) => !String(c).trim())) return // an empty line
    if (!name) return skipped.push({ line, name: '', reason: 'անունը դատարկ է' })
    if (name.length > MAX_NAME) return skipped.push({ line, name, reason: `անունը ${MAX_NAME} նիշից երկար է` })
    const key = nameKey(name)
    if (!key) return skipped.push({ line, name, reason: 'անունում տառեր չկան' })
    if (seen.has(key)) return skipped.push({ line, name, reason: `նույն անունն արդեն կա ${seen.get(key)}-րդ տողում` })
    seen.set(key, line)
    out.push({ name, key, phone: cell(iPhone).slice(0, MAX_PHONE) || null, note: cell(iNote).slice(0, MAX_NOTE) || null })
  })
  return { rows: out, skipped }
}

// 24 letters and digits from a cryptographic source (~143 bits): a link
// nobody can guess or work out from another guest's.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
export function newGuestToken(length = 24) {
  let out = ''
  while (out.length < length) {
    for (const b of randomBytes(length * 2)) {
      if (b < 248 && out.length < length) out += ALPHABET[b % 62] // 248 = 4 × 62: no bias
    }
  }
  return out
}

// One line of the links file: the name and the link to send.
const q = (s) => (/[",;\n]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : s)
export function linksCsv(site, code, guests) {
  return ['display_name,link', ...guests.map((g) => `${q(g.display_name)},${site}/i/${code}/${g.token}`)].join('\r\n') + '\r\n'
}
