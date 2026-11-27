import { useEffect, useState } from 'react'
import { useText } from '../i18n'
import { useOrderContent } from './OrderPreview'
import { scheduleParts } from '../invitations/shared/liveTimes'

// On the couple's order page, after payment: the data some add-ons need,
// filled in by the couple themselves (api/_lib/coupleSetup.js — the same
// rules as Siloona's import scripts), so the add-on works in the
// invitation whether they edit it themselves (diy) or Siloona prepares it.
//   SeatingSetup  «Ձեր սեղանը» — name · table, or a CSV, and when it opens
//   GuestsSetup   «Անհատական դիմում» — names → each guest's own link
//   LiveHint      «Կենդանի ծրագիր» — places with no coordinates for the taxi

const TEXT = {
  hy: {
    seatEyebrow: 'Ձեր սեղանը', seatTitle: 'Սեղանների ցուցակը', seatEmpty: 'Լրացրեք սեղանների ցուցակը, որ բաժինը երևա հրավերում։',
    seatOn: 'Բաժինը երևում է հրավերում։', seatSoon: (d) => `Հյուրերը կտեսնեն իրենց սեղանը ${d}-ից։`, reveal: 'Երբից տեսնեն սեղանները (Երևանի ժամով)',
    name: 'Անուն, ազգանուն', table: 'Սեղան', addRow: '+ Ավելացնել տող', csv: 'Բեռնել CSV', csvHint: 'CSV՝ guest_name,table_label սյունակներով (Excel → Save as CSV UTF-8)։ Այն կփոխարինի ցուցակը։',
    download: 'Ներբեռնել CSV', remove: 'Հեռացնել', save: 'Պահպանել ցուցակը', saving: 'Պահպանում ենք…', saved: (n) => `Պահպանված է՝ ${n} անուն։`, skipped: (n) => `Բաց թողնված տողեր՝ ${n}`,
    guestsEyebrow: 'Անհատական դիմում', guestsTitle: 'Հյուրերի անհատական հղումները', guestsEmpty: 'Ավելացրեք հյուրերին, որ յուրաքանչյուրը ստանա իր հղումը, և հրավերը դիմի նրան անունով։',
    names: 'Անուններ՝ մեկ տողում մեկը («Արամ և Անի», «Պետրոսյանների ընտանիք»)', add: 'Ստեղծել հղումները', adding: 'Ստեղծում ենք…', csvGuests: 'Բեռնել CSV', csvGuestsHint: 'CSV՝ display_name սյունակով (ըստ ցանկության՝ phone, note)։',
    copy: 'Պատճենել', copied: 'Պատճենված է', downloadLinks: 'Ներբեռնել հղումները (CSV)', count: (n) => `${n} հղում`,
    liveEyebrow: 'Կենդանի ծրագիր', liveTitle: 'Տաքսու համար',
    liveText: 'Որ «Տաքսի» կոճակը բացվի հենց նպատակակետով, այս վայրերի համար պետք է Google Maps-ի հղում կամ կոորդինատներ (օր.՝ 40.1772, 44.5035)։ Ուղարկեք դրանք մեզ, և մենք կավելացնենք։ Առանց դրանց «Ճանապարհ»-ը աշխատում է հասցեով։',
  },
  ru: {
    seatEyebrow: 'Ваш стол', seatTitle: 'Список столов', seatEmpty: 'Заполните список столов, чтобы раздел появился в приглашении.',
    seatOn: 'Раздел виден в приглашении.', seatSoon: (d) => `Гости увидят свой стол с ${d}.`, reveal: 'С какого момента видны столы (по Еревану)',
    name: 'Имя и фамилия', table: 'Стол', addRow: '+ Добавить строку', csv: 'Загрузить CSV', csvHint: 'CSV со столбцами guest_name,table_label (Excel → Сохранить как CSV UTF-8). Он заменит список.',
    download: 'Скачать CSV', remove: 'Удалить', save: 'Сохранить список', saving: 'Сохраняем…', saved: (n) => `Сохранено: ${n} имён.`, skipped: (n) => `Пропущено строк: ${n}`,
    guestsEyebrow: 'Персональное обращение', guestsTitle: 'Личные ссылки гостей', guestsEmpty: 'Добавьте гостей — каждый получит свою ссылку, и приглашение обратится к нему по имени.',
    names: 'Имена — по одному в строке («Арам и Ани», «Семья Петросян»)', add: 'Создать ссылки', adding: 'Создаём…', csvGuests: 'Загрузить CSV', csvGuestsHint: 'CSV со столбцом display_name (по желанию phone, note).',
    copy: 'Копировать', copied: 'Скопировано', downloadLinks: 'Скачать ссылки (CSV)', count: (n) => `Ссылок: ${n}`,
    liveEyebrow: 'Живая программа', liveTitle: 'Для такси',
    liveText: 'Чтобы кнопка «Такси» открывалась сразу с адресом, для этих мест нужна ссылка Google Maps или координаты (например, 40.1772, 44.5035). Пришлите их нам, и мы добавим. Без них «Маршрут» работает по адресу.',
  },
  en: {
    seatEyebrow: 'Your table', seatTitle: 'The seating list', seatEmpty: 'Fill in the seating list so the section appears in the invitation.',
    seatOn: 'The section is showing in the invitation.', seatSoon: (d) => `Guests will see their table from ${d}.`, reveal: 'From when guests see the tables (Yerevan time)',
    name: 'Full name', table: 'Table', addRow: '+ Add a row', csv: 'Upload CSV', csvHint: 'A CSV with guest_name,table_label columns (Excel → Save as CSV UTF-8). It replaces the list.',
    download: 'Download CSV', remove: 'Remove', save: 'Save the list', saving: 'Saving…', saved: (n) => `Saved: ${n} names.`, skipped: (n) => `Rows skipped: ${n}`,
    guestsEyebrow: 'Personal greeting', guestsTitle: 'Guests’ personal links', guestsEmpty: 'Add your guests — each gets their own link, and the invitation greets them by name.',
    names: 'Names — one per line (“Aram & Ani”, “The Petrosyan family”)', add: 'Create the links', adding: 'Creating…', csvGuests: 'Upload CSV', csvGuestsHint: 'A CSV with a display_name column (phone and note optional).',
    copy: 'Copy', copied: 'Copied', downloadLinks: 'Download the links (CSV)', count: (n) => `${n} links`,
    liveEyebrow: 'Live schedule', liveTitle: 'For the taxi',
    liveText: 'For the “Taxi” button to open with the destination set, these places need a Google Maps link or coordinates (e.g. 40.1772, 44.5035). Send them to us and we’ll add them. Without them, “Directions” works by the address.',
  },
}

async function post(body) {
  const r = await fetch('/api/orders/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const json = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(json.message || 'Error')
  return json
}

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
function downloadCsv(name, rows) {
  const blob = new Blob(['﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name })
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
const readFile = (file) => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.onerror = rej; fr.readAsText(file, 'utf-8') })

// 'YYYY-MM-DDTHH:mm' in Yerevan time ↔ an instant
const toLocal = (iso) => (iso ? new Date(Date.parse(iso) + 4 * 3600e3).toISOString().slice(0, 16) : '')
const shown = (local) => local.replace('T', ' ')

export function SeatingSetup({ id, token, eventDate }) {
  const t = useText(TEXT)
  const [rows, setRows] = useState(null)
  const [reveal, setReveal] = useState('')
  const [view, setView] = useState(null)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const apply = (r) => {
    setRows(r.rows.length ? r.rows : [{ name: '', table: '' }])
    setView(r.view)
    setReveal(r.revealAt ? toLocal(r.revealAt) : /^\d{4}-\d{2}-\d{2}/.test(eventDate || '') ? `${eventDate.slice(0, 10)}T10:00` : '')
  }
  useEffect(() => { post({ action: 'seating_get', id, t: token }).then(apply).catch((e) => setError(e.message)) }, [id, token]) // eslint-disable-line react-hooks/exhaustive-deps

  async function save(extra = {}) {
    setBusy(true); setError(''); setMsg('')
    try {
      const r = await post({ action: 'seating_save', id, t: token, revealAt: shown(reveal), rows: rows.filter((x) => x.name.trim() || x.table.trim()), ...extra })
      apply(r)
      setMsg([t.saved(r.rows.length), r.skipped?.length ? t.skipped(r.skipped.length) : ''].filter(Boolean).join(' · '))
    } catch (e) { setError(e.message) }
    setBusy(false)
  }
  const set = (i, k, v) => { setRows((xs) => xs.map((x, j) => (j === i ? { ...x, [k]: v } : x))); setMsg('') }

  if (!rows) return error ? <p className="co-alert">{error}</p> : null
  return (
    <section className="co-share co-setup" aria-labelledby="co-seat-h">
      <p className="eyebrow">{t.seatEyebrow}</p>
      <h2 id="co-seat-h">{t.seatTitle}</h2>
      <p className={`co-setup-state ${view ? 'on' : 'todo'}`}>{!view ? t.seatEmpty : view.open ? t.seatOn : t.seatSoon(shown(toLocal(view.revealAt)))}</p>
      <label className="co-field wide">
        <span className="co-label">{t.reveal}</span>
        <input type="datetime-local" value={reveal} onChange={(e) => { setReveal(e.target.value); setMsg('') }} />
      </label>
      <div className="co-seat-rows" role="table">
        <div className="co-seat-row head" role="row"><span role="columnheader">{t.name}</span><span role="columnheader">{t.table}</span><span /></div>
        {rows.map((r, i) => (
          <div className="co-seat-row" role="row" key={i}>
            <input type="text" aria-label={t.name} value={r.name} maxLength={160} onChange={(e) => set(i, 'name', e.target.value)} />
            <input type="text" aria-label={t.table} value={r.table} maxLength={40} onChange={(e) => set(i, 'table', e.target.value)} />
            <button type="button" className="co-seat-x" aria-label={t.remove} onClick={() => setRows((xs) => (xs.length > 1 ? xs.filter((_, j) => j !== i) : [{ name: '', table: '' }]))}>×</button>
          </div>
        ))}
      </div>
      <div className="co-setup-tools">
        <button type="button" className="co-edit" onClick={() => setRows((xs) => [...xs, { name: '', table: '' }])}>{t.addRow}</button>
        <label className="co-edit co-file">
          <input type="file" accept=".csv,text/csv" onChange={async (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) save({ csv: await readFile(f) }) }} />
          {t.csv}
        </label>
        {view && <button type="button" className="co-edit" onClick={() => downloadCsv('siloona-seating.csv', [['guest_name', 'table_label'], ...rows.filter((x) => x.name).map((x) => [x.name, x.table])])}>{t.download}</button>}
      </div>
      <p className="co-hint">{t.csvHint}</p>
      {error && <p className="co-alert" role="alert">{error}</p>}
      {msg && <p className="co-setup-ok" role="status">{msg}</p>}
      <div className="co-actions center"><button type="button" className="btn btn-primary" onClick={() => save()} disabled={busy}>{busy ? t.saving : t.save}</button></div>
    </section>
  )
}

export function GuestsSetup({ id, token, code }) {
  const t = useText(TEXT)
  const [guests, setGuests] = useState(null)
  const [names, setNames] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(null)
  useEffect(() => { post({ action: 'guests_get', id, t: token }).then((r) => setGuests(r.guests)).catch((e) => setError(e.message)) }, [id, token])
  const link = (g) => `${window.location.origin}/i/${code}/${g.token}`

  async function add(extra = {}) {
    setBusy(true); setError('')
    try {
      const r = await post({ action: 'guests_add', id, t: token, names, ...extra })
      setGuests(r.guests)
      setNames('')
    } catch (e) { setError(e.message) }
    setBusy(false)
  }
  async function copy(g) {
    try { await navigator.clipboard.writeText(link(g)); setCopied(g.token); setTimeout(() => setCopied(null), 1800) } catch { /* blocked: the link is shown */ }
  }

  if (!guests) return error ? <p className="co-alert">{error}</p> : null
  return (
    <section className="co-share co-setup" aria-labelledby="co-guests-h">
      <p className="eyebrow">{t.guestsEyebrow}</p>
      <h2 id="co-guests-h">{t.guestsTitle}</h2>
      {!guests.length && <p className="co-setup-state todo">{t.guestsEmpty}</p>}
      <label className="co-field wide">
        <span className="co-label">{t.names}</span>
        <textarea rows={4} value={names} onChange={(e) => setNames(e.target.value)} />
      </label>
      <div className="co-setup-tools">
        <label className="co-edit co-file">
          <input type="file" accept=".csv,text/csv" onChange={async (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) add({ csv: await readFile(f), names: '' }) }} />
          {t.csvGuests}
        </label>
      </div>
      <p className="co-hint">{t.csvGuestsHint}</p>
      {error && <p className="co-alert" role="alert">{error}</p>}
      <div className="co-actions center"><button type="button" className="btn btn-primary" onClick={() => add()} disabled={busy || !names.trim()}>{busy ? t.adding : t.add}</button></div>
      {guests.length > 0 && (
        <>
          <p className="co-label co-guests-n">{t.count(guests.length)}</p>
          <ul className="co-guests">
            {guests.map((g) => (
              <li key={g.token}>
                <span className="co-guest-name">{g.name}</span>
                <span className="co-guest-link">{link(g).replace(/^https?:\/\//, '')}</span>
                <button type="button" className="co-guest-copy" onClick={() => copy(g)}>{copied === g.token ? t.copied : t.copy}</button>
              </li>
            ))}
          </ul>
          <div className="co-actions center">
            <button type="button" className="btn btn-ghost" onClick={() => downloadCsv('siloona-guest-links.csv', [['display_name', 'link'], ...guests.map((g) => [g.name, link(g)])])}>{t.downloadLinks}</button>
          </div>
        </>
      )}
    </section>
  )
}

export function LiveHint({ slug, preview }) {
  const t = useText(TEXT)
  const content = useOrderContent(slug, preview)
  if (!content) return null
  const missing = []
  for (const p of scheduleParts(content).parts) {
    const place = p.place
    if (place && !place.coords && place.name && !missing.includes(place.name)) missing.push(place.name)
  }
  if (!missing.length) return null
  return (
    <section className="co-share co-setup" aria-labelledby="co-live-h">
      <p className="eyebrow">{t.liveEyebrow}</p>
      <h2 id="co-live-h">{t.liveTitle}</h2>
      <p className="co-share-note">{t.liveText}</p>
      <ul className="co-live-list">{missing.map((n) => <li key={n}>{n}</li>)}</ul>
    </section>
  )
}
