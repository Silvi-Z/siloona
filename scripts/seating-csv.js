import { nameKey } from '../api/_lib/seating.js'

// The couple's seating list as a CSV file → rows for import_seating()
// (supabase/seating.sql). Kept apart from import-seating.js so the tests
// can check it without a database.
//
// Columns (first line): guest_name, table_label. Commas or semicolons
// (Excel saves «;» in some languages), quotes around values with commas,
// UTF-8 with or without a BOM.

export function parseCsv(text) {
  const src = String(text).replace(/^﻿/, '')
  const firstLine = src.split(/\r?\n/, 1)[0] || ''
  const sep = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ','
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++ }
      else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === sep) { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''
    } else cell += c
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows
}

const MAX_NAME = 160
const MAX_TABLE = 40

// → { rows: [{ name, key, table }], skipped: [{ line, name, reason }] }
// A line number is the file's own (the header is line 1).
export function prepareSeating(text) {
  const all = parseCsv(text)
  const header = (all[0] || []).map((h) => h.trim().toLowerCase())
  const iName = header.indexOf('guest_name')
  const iTable = header.indexOf('table_label')
  if (iName < 0 || iTable < 0) {
    throw new Error('Առաջին տողում պետք է լինեն սյունակների անունները՝ guest_name,table_label')
  }
  const rows = []
  const skipped = []
  const seen = new Map() // key → line
  all.slice(1).forEach((cells, i) => {
    const line = i + 2
    if (cells.every((c) => !c.trim())) return // blank line
    const name = (cells[iName] || '').trim().replace(/\s+/g, ' ')
    const table = (cells[iTable] || '').trim().replace(/\s+/g, ' ')
    const skip = (reason) => skipped.push({ line, name, reason })
    if (!name) return skip('անուն չկա')
    if (!table) return skip('սեղան չկա')
    if (name.length > MAX_NAME) return skip(`անունը ${MAX_NAME} նիշից երկար է`)
    if (table.length > MAX_TABLE) return skip(`սեղանը ${MAX_TABLE} նիշից երկար է`)
    const key = nameKey(name)
    if (!key) return skip('անվան մեջ տառ չկա')
    if (seen.has(key)) return skip(`նույն անունն արդեն կա ${seen.get(key)}-րդ տողում`)
    seen.set(key, line)
    rows.push({ name, key, table })
  })
  return { rows, skipped }
}

// «2027-09-18 18:00» in Yerevan time (UTC+4, no daylight saving) → ISO.
// Also takes a full ISO time with its own offset.
export function parseRevealAt(s) {
  const v = String(s || '').trim()
  const local = v.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?$/)
  const iso = local
    ? `${local[1]}-${local[2]}-${local[3]}T${(local[4] || '0').padStart(2, '0')}:${local[5] || '00'}:00+04:00`
    : v
  const d = new Date(iso)
  if (!v || Number.isNaN(d.getTime())) throw new Error(`Սխալ ամսաթիվ՝ «${s}»։ Գրեք, օրինակ՝ 2027-09-18 18:00 (Երևանի ժամով)։`)
  return d.toISOString()
}
