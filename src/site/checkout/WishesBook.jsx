import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLang, useText } from '../i18n'
import { orderLink } from './checkoutApi'
import './wishes.css'

// «Մաղթանքների գիրք» — the couple's own page with every wish their guests
// left (the wishes add-on). Opened from the order page with the order's
// secret link, the same key as their guests' answers; nobody else can read
// it. A wish can be hidden (kept, but out of the book and the downloads).
// Download as CSV, or print: the print view is an A5 book, one wish after
// another, without the page's controls.

const TEXT = {
  hy: {
    eyebrow: 'Մաղթանքների գիրք', title: 'Ձեր հյուրերի մաղթանքները', back: '← Պատվերի էջ',
    count: (n) => `${n} մաղթանք`, none: 'Մաղթանքներ դեռ չկան։ Դրանք կհայտնվեն այստեղ, հենց հյուրերը գրեն հրավերում։',
    hide: 'Թաքցնել', show: 'Վերադարձնել', hidden: 'Թաքցված է', csv: 'Ներբեռնել (CSV)', print: 'Տպել գիրքը',
    close: 'Ընդունել մաղթանքներ', closeNever: 'միշտ', closeAfter: (d) => `միջոցառումից ${d} օր հետո փակել`, closed: 'Ընդունումը փակված է', open: 'Ընդունվում են',
    days: 'Օր միջոցառումից հետո', save: 'Պահպանել', loading: 'Բեռնվում է…', notFound: 'Գիրքը չի գտնվել։ Ստուգեք հղումը։',
    csvHead: ['Անուն', 'Մաղթանք', 'Երբ', 'Թաքցված'], yes: 'այո', wrote: 'գրել է',
  },
  ru: {
    eyebrow: 'Книга пожеланий', title: 'Пожелания ваших гостей', back: '← Страница заказа',
    count: (n) => `Пожеланий: ${n}`, none: 'Пожеланий пока нет. Они появятся здесь, как только гости напишут их в приглашении.',
    hide: 'Скрыть', show: 'Вернуть', hidden: 'Скрыто', csv: 'Скачать (CSV)', print: 'Распечатать книгу',
    close: 'Принимать пожелания', closeNever: 'всегда', closeAfter: (d) => `закрыть через ${d} дн. после события`, closed: 'Приём закрыт', open: 'Принимаются',
    days: 'Дней после события', save: 'Сохранить', loading: 'Загрузка…', notFound: 'Книга не найдена. Проверьте ссылку.',
    csvHead: ['Имя', 'Пожелание', 'Когда', 'Скрыто'], yes: 'да', wrote: 'написал(а)',
  },
  en: {
    eyebrow: 'Wishes book', title: 'Your guests’ wishes', back: '← Order page',
    count: (n) => `${n} wishes`, none: 'No wishes yet. They’ll appear here as soon as guests write them in the invitation.',
    hide: 'Hide', show: 'Show again', hidden: 'Hidden', csv: 'Download (CSV)', print: 'Print the book',
    close: 'Accept wishes', closeNever: 'always', closeAfter: (d) => `close ${d} days after the event`, closed: 'Closed', open: 'Open',
    days: 'Days after the event', save: 'Save', loading: 'Loading…', notFound: 'Book not found. Check the link.',
    csvHead: ['Name', 'Wish', 'When', 'Hidden'], yes: 'yes', wrote: 'wrote',
  },
}

// (browsers often have no Armenian month names: written out here)
const HY_MONTHS = ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի']
const fmt = (iso, lang) => {
  const d = new Date(iso)
  if (lang === 'hy') return `${d.getDate()} ${HY_MONTHS[d.getMonth()]} ${d.getFullYear()}`
  return d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function WishesBook() {
  const [params] = useSearchParams()
  const id = params.get('order')
  const token = params.get('t')
  const { lang, to } = useLang()
  const t = useText(TEXT)
  const [book, setBook] = useState(null)
  const [error, setError] = useState('')
  const [days, setDays] = useState('')

  const call = useCallback(async (extra = {}) => {
    const r = await fetch('/api/orders/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'wishes', id, t: token, ...extra }) })
    const json = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(r.status === 404 ? t.notFound : json.message || t.notFound)
    setBook(json)
    setDays(json.closeDays == null ? '' : String(json.closeDays))
    return json
  }, [id, token, t.notFound])

  useEffect(() => { call().catch((e) => setError(e.message)) }, [call])
  useEffect(() => {
    const before = document.title
    document.title = `${t.eyebrow} · Siloona`
    return () => { document.title = before }
  }, [t.eyebrow])

  if (error && !book) return <main className="wb"><div className="wb-wrap"><p className="wb-note">{error}</p></div></main>
  if (!book) return <main className="wb"><div className="wb-wrap"><p className="wb-note">{t.loading}</p></div></main>

  const shown = book.wishes.filter((w) => !w.hidden)
  const download = () => {
    const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = [t.csvHead, ...book.wishes.map((w) => [w.name, w.text, fmt(w.at, lang), w.hidden ? t.yes : ''])]
    const blob = new Blob(['﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'siloona-wishes.csv' })
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  const toggle = (w) => call({ action: 'wish_hide', wishId: w.id, hidden: !w.hidden }).catch((e) => setError(e.message))

  return (
    <main className="wb">
      <div className="wb-wrap">
        <p className="wb-back wb-noprint"><Link to={to(orderLink(id, token))}>{t.back}</Link></p>
        <header className="wb-head">
          <p className="wb-eyebrow">{t.eyebrow}</p>
          {book.names && <h1 className="wb-names">{book.names}</h1>}
          {book.eventDate && <p className="wb-date">{fmt(`${book.eventDate}T12:00:00`, lang)}</p>}
          <p className="wb-count">{t.count(shown.length)}</p>
        </header>

        <div className="wb-tools wb-noprint">
          <button type="button" className="wb-btn" onClick={() => window.print()} disabled={!shown.length}>{t.print}</button>
          <button type="button" className="wb-btn ghost" onClick={download} disabled={!book.wishes.length}>{t.csv}</button>
          <form className="wb-close" onSubmit={(e) => { e.preventDefault(); call({ action: 'wishes_close', days: days === '' ? null : Number(days) }).catch((x) => setError(x.message)) }}>
            <label>
              <span>{t.days}</span>
              <input type="number" min="0" max="365" inputMode="numeric" value={days} placeholder="—" onChange={(e) => setDays(e.target.value)} />
            </label>
            <button type="submit" className="wb-btn ghost small">{t.save}</button>
            <span className={`wb-state ${book.open ? 'on' : 'off'}`}>{book.open ? t.open : t.closed} · {book.closeDays == null ? t.closeNever : t.closeAfter(book.closeDays)}</span>
          </form>
        </div>
        {error && <p className="wb-err wb-noprint" role="alert">{error}</p>}

        {!book.wishes.length ? <p className="wb-note">{t.none}</p> : (
          <ol className="wb-list">
            {book.wishes.map((w) => (
              <li key={w.id} className={`wb-wish${w.hidden ? ' is-hidden' : ''}`}>
                <blockquote>{w.text}</blockquote>
                <p className="wb-who">— {w.name}<span className="wb-when"> · {fmt(w.at, lang)}</span></p>
                <button type="button" className="wb-hide wb-noprint" onClick={() => toggle(w)}>{w.hidden ? t.show : t.hide}</button>
                {w.hidden && <span className="wb-hidden-tag wb-noprint">{t.hidden}</span>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  )
}
