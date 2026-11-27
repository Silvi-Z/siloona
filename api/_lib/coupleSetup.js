import { HttpError } from './http.js'
import { featuresOf, invitationForOrder, loadOrderForCustomer } from './orders.js'
import { seatingView } from './seating.js'
import { parseRevealAt, prepareSeating } from '../../scripts/seating-csv.js'
import { newGuestToken, prepareGuests } from '../../scripts/guests-csv.js'

// What the couple fills in themselves on their order page (after payment),
// for the add-ons that need their data — the same rules and storage as
// Siloona's scripts (import-seating.js, import-guests.js), so a diy order
// gets its add-ons working without anyone at Siloona:
//
//   { action: 'seating_get',  id, t }                         the list and the reveal time
//   { action: 'seating_save', id, t, csv?, rows?, revealAt }  replace the list (as the import does)
//   { action: 'guests_get',   id, t }                         the personal links
//   { action: 'guests_add',   id, t, csv?, names? }           add guests (existing names keep their link)
// The order's secret link is the key; each needs its add-on on the order.

const MAX_ROWS = 2000

async function couple(store, body, feature, missing) {
  const order = await loadOrderForCustomer(store, body.id, body.t)
  const inv = await invitationForOrder(store, order)
  if (!inv) throw new HttpError(409, 'not_paid', 'Սա կարելի է լրացնել վճարումից հետո։')
  if (!featuresOf(order, inv).includes(feature)) throw new HttpError(403, 'no_addon', missing)
  return { order, inv }
}

const csvCell = (s) => (/[",;\n]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : String(s))

// ---------------------------------------------------------------------------
// «Ձեր սեղանը»
// ---------------------------------------------------------------------------
async function seatingNow(store, inv) {
  const plan = store.getSeatingPlan ? await store.getSeatingPlan({ invitation_id: inv.id }) : null
  const rows = plan ? await store.listSeats(plan.id) : []
  return {
    revealAt: plan?.reveal_at ? new Date(plan.reveal_at).toISOString() : null,
    view: seatingView(plan?.enabled ? plan : null),
    rows: rows.map((r) => ({ name: r.guest_name, table: r.table_label })).sort((a, b) => String(a.table).localeCompare(String(b.table), 'hy', { numeric: true }) || a.name.localeCompare(b.name, 'hy')),
  }
}

export async function coupleSeating(store, body) {
  const { inv } = await couple(store, body, 'seating', 'Այս պատվերը չունի «Ձեր սեղանը» հավելումը։')
  if (body.action === 'seating_save') {
    // a table typed on the page, or a CSV file (guest_name,table_label)
    const text = typeof body.csv === 'string' && body.csv.trim()
      ? body.csv.slice(0, 400_000)
      : ['guest_name,table_label', ...(Array.isArray(body.rows) ? body.rows.slice(0, MAX_ROWS) : []).map((r) => `${csvCell(String(r?.name ?? '').trim())},${csvCell(String(r?.table ?? '').trim())}`)].join('\n')
    let prepared
    let revealAt
    try {
      prepared = prepareSeating(text)
      revealAt = parseRevealAt(body.revealAt)
    } catch (e) {
      throw new HttpError(422, 'invalid', e.message)
    }
    if (!prepared.rows.length) throw new HttpError(422, 'invalid', 'Ցուցակում ոչ մի ճիշտ տող չկա. նշեք անունը և սեղանը։')
    if (prepared.rows.length > MAX_ROWS) throw new HttpError(422, 'invalid', `Առավելագույնը ${MAX_ROWS} տող։`)
    await store.importSeating({ invitation: inv.id, revealAt, enabled: true, rows: prepared.rows })
    return { ...(await seatingNow(store, inv)), skipped: prepared.skipped }
  }
  return seatingNow(store, inv)
}

// ---------------------------------------------------------------------------
// «Անհատական դիմում հյուրին»
// ---------------------------------------------------------------------------
const guestsView = (list) => ({ guests: list.map((g) => ({ name: g.display_name, token: g.token })) })

export async function coupleGuests(store, body) {
  const { inv } = await couple(store, body, 'personal_greeting', 'Այս պատվերը չունի «Անհատական դիմում հյուրին» հավելումը։')
  if (body.action === 'guests_add') {
    // one name per line, or a CSV file (display_name[,phone][,note])
    const text = typeof body.csv === 'string' && body.csv.trim()
      ? body.csv.slice(0, 400_000)
      : ['display_name', ...String(body.names ?? '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean).slice(0, MAX_ROWS).map(csvCell)].join('\n')
    let prepared
    try { prepared = prepareGuests(text) } catch (e) { throw new HttpError(422, 'invalid', e.message) }
    if (!prepared.rows.length) throw new HttpError(422, 'invalid', 'Գրեք առնվազն մեկ անուն։')
    const existing = new Set((await store.listInvitationGuests(inv.id)).map((g) => g.name_key))
    for (const r of prepared.rows) {
      if (existing.has(r.key)) continue // already has a link: kept as it is
      await store.addInvitationGuest({ invitation_id: inv.id, token: newGuestToken(), display_name: r.name, name_key: r.key, phone: r.phone, note: r.note })
      existing.add(r.key)
    }
    return { ...guestsView(await store.listInvitationGuests(inv.id)), skipped: prepared.skipped }
  }
  return guestsView(await store.listInvitationGuests(inv.id))
}

export const SETUP_ACTIONS = { seating_get: coupleSeating, seating_save: coupleSeating, guests_get: coupleGuests, guests_add: coupleGuests }
