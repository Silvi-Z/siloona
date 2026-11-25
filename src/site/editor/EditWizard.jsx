import { useEffect, useMemo, useRef, useState } from 'react'
import { defaultsFor } from '../invitationDefaults'
import { detailFields, detailsFromContent, missingDetails } from '../invitationDetails'
import TimeSelect from '../invitations/shared/TimeSelect'
import { Calendar, DateField } from '../invitations/shared/ArmenianDate'
import { useLang, useText } from '../i18n'
import './editor.css'

// The short questionnaire a customer sees when they start editing a design:
// who it's for → when → where → the programme → a phone for guests (only
// the steps the design needs). The answers fill the invitation (names with
// the right Armenian endings, the date, places, programme); after that the
// customer fine-tunes by tapping texts on the invitation itself.
// The questions are the design's own details (invitationDetails.js), the
// same ones checkout asks.

const STEP_IDS = ['who', 'when', 'where', 'program', 'contact']

const TEXT = {
  hy: {
    steps: {
      who: { title: 'Ում համար է հրավերը', lead: 'Անունը բավական է գրել մեկ անգամ․ հրավերի նախադասություններում այն կհայտնվի ճիշտ վերջավորությամբ։' },
      when: { title: 'Երբ', lead: 'Ընտրեք միջոցառման օրը և ժամը։' },
      where: { title: 'Որտեղ', lead: 'Վայրի անվանումը և հասցեն․ հասցեով է բացվում հյուրերի «քարտեզ» կոճակը։' },
      program: { title: 'Օրվա ծրագիրը', lead: 'Փոխեք, հեռացրեք կամ ավելացրեք կետեր։' },
      contact: { title: 'Կապ հյուրերի համար', lead: 'Համար, որով հյուրերը կարող են կապվել Ձեզ հետ։ Կարող եք թողնել դատարկ։' },
    },
    required: 'Լրացրեք այս դաշտը',
    what: 'Ինչ է տեղի ունենում',
    remove: 'Հեռացնել կետը',
    add: '+ Ավելացնել կետ',
    map: 'Ստուգել քարտեզում →',
    count: (i, n) => `Քայլ ${i} / ${n}`,
    skip: 'Բաց թողնել',
    back: '← Հետ',
    done: 'Պատրաստ է',
    next: 'Հաջորդը →',
  },
  ru: {
    steps: {
      who: { title: 'Для кого приглашение', lead: 'Имя достаточно написать один раз — в предложениях приглашения оно появится с правильным окончанием.' },
      when: { title: 'Когда', lead: 'Выберите день и время события.' },
      where: { title: 'Где', lead: 'Название места и адрес — по адресу открывается кнопка «карта» для гостей.' },
      program: { title: 'Программа дня', lead: 'Измените, удалите или добавьте пункты.' },
      contact: { title: 'Связь для гостей', lead: 'Номер, по которому гости могут связаться с Вами. Можно оставить пустым.' },
    },
    required: 'Заполните это поле',
    what: 'Что происходит',
    remove: 'Удалить пункт',
    add: '+ Добавить пункт',
    map: 'Проверить на карте →',
    count: (i, n) => `Шаг ${i} / ${n}`,
    skip: 'Пропустить',
    back: '← Назад',
    done: 'Готово',
    next: 'Далее →',
  },
  en: {
    steps: {
      who: { title: 'Who the invitation is for', lead: 'Write the name just once — the invitation’s sentences will use it in the right form.' },
      when: { title: 'When', lead: 'Choose the day and time of the event.' },
      where: { title: 'Where', lead: 'The venue’s name and address — the address is what the guests’ “map” button opens.' },
      program: { title: 'The day’s schedule', lead: 'Change, remove or add items.' },
      contact: { title: 'Contact for guests', lead: 'A number your guests can reach you on. You can leave it empty.' },
    },
    required: 'Please fill in this field',
    what: 'What happens',
    remove: 'Remove this item',
    add: '+ Add an item',
    map: 'Check on the map →',
    count: (i, n) => `Step ${i} / ${n}`,
    skip: 'Skip',
    back: '← Back',
    done: 'Done',
    next: 'Next →',
  },
}

function stepOf(f) {
  if (f.key === 'eventDate' || f.key === 'eventTime' || f.key === 'deadline') return 'when'
  if (f.key.startsWith('place') || /\.(city|place)$/.test(f.path)) return 'where'
  if (f.type === 'schedule') return 'program'
  if (f.type === 'tel' || f.path.includes('contacts.') || f.path.endsWith('telegram')) return 'contact'
  return 'who'
}

const valueOf = (d, f) => (f.key.startsWith('x:') ? d.extra?.[f.path] ?? '' : d[f.key] ?? '')

export default function EditWizard({ slug, data, fromContent, onDone, onSkip }) {
  const { lang } = useLang()
  const t = useText(TEXT)
  const spec = detailFields(slug, lang)
  // the demo in the invitation's own language (data.lang)
  const demo = useMemo(() => detailsFromContent(slug, defaultsFor(slug, data.lang)), [slug, data.lang])
  // Already edited: start from what's on the invitation. New: empty fields
  // with the demo as hints, and the demo's programme to adjust.
  const [d, setD] = useState(() => (fromContent ? detailsFromContent(slug, data) : { extra: {}, schedule: demo.schedule || [] }))
  const steps = useMemo(() => STEP_IDS.map((id) => ({ id, ...t.steps[id], fields: spec.fields.filter((f) => stepOf(f) === id) })).filter((s) => s.fields.length), [spec, t])
  const [i, setI] = useState(0)
  const [errors, setErrors] = useState({})
  const body = useRef(null)
  const step = steps[i]
  const last = i === steps.length - 1

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onSkip() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onSkip])
  useEffect(() => { body.current?.scrollTo?.(0, 0); body.current?.querySelector('input:not([type=hidden]),select')?.focus({ preventScroll: true }) }, [i])

  const set = (f, v) => {
    setD((x) => (f.key.startsWith('x:') ? { ...x, extra: { ...x.extra, [f.path]: v } } : { ...x, [f.key]: v }))
    setErrors((e) => ({ ...e, [f.key]: undefined }))
  }

  const next = () => {
    const missing = missingDetails(slug, d, lang).filter((k) => step.fields.some((f) => f.key === k))
    if (missing.length) {
      setErrors(Object.fromEntries(missing.map((k) => [k, t.required])))
      body.current?.querySelector(`[data-k="${missing[0]}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    if (last) onDone(d)
    else setI(i + 1)
  }

  const field = (f) => {
    const v = valueOf(d, f)
    const err = errors[f.key]
    const ph = valueOf(demo, f)
    const label = <span className="sw-label">{f.label}{f.required && <i aria-hidden="true"> *</i>}</span>
    if (f.type === 'schedule') {
      const rows = d.schedule || []
      const setRows = (r) => setD((x) => ({ ...x, schedule: r }))
      return (
        <div key={f.key} className="sw-field">
          {rows.map((r, j) => (
            <div className="sw-row" key={j}>
              <TimeSelect className="sw-sel" value={r.time} allowEmpty onChange={(t) => setRows(rows.map((x, k) => (k === j ? { ...x, time: t } : x)))} />
              <input className="sw-input" value={r.title} maxLength={120} aria-label={t.what} onChange={(e) => setRows(rows.map((x, k) => (k === j ? { ...x, title: e.target.value } : x)))} />
              <button type="button" className="sw-x" aria-label={t.remove} onClick={() => setRows(rows.filter((_, k) => k !== j))}>×</button>
            </div>
          ))}
          <button type="button" className="sw-add" onClick={() => setRows([...rows, { time: '', title: '' }])}>{t.add}</button>
        </div>
      )
    }
    if (f.key === 'eventDate') {
      return (
        <div key={f.key} className="sw-field" data-k={f.key}>
          {label}
          <div className={`sw-cal ${err ? 'bad' : ''}`}><Calendar value={v} onChange={(x) => set(f, x)} /></div>
          {err && <span className="sw-err">{err}</span>}
        </div>
      )
    }
    if (f.type === 'date') {
      return (
        <label key={f.key} className="sw-field" data-k={f.key}>
          {label}
          <DateField className="sw-input sw-datebtn" value={v} onChange={(x) => set(f, x)} invalid={!!err} />
          {err && <span className="sw-err">{err}</span>}
        </label>
      )
    }
    if (f.type === 'time') {
      return (
        <label key={f.key} className="sw-field" data-k={f.key}>
          {label}
          <TimeSelect className="sw-sel" value={v} allowEmpty onChange={(x) => set(f, x)} invalid={!!err} />
          {err && <span className="sw-err">{err}</span>}
        </label>
      )
    }
    const mapQ = f.key.endsWith('.address') ? (v || d[f.key.replace('.address', '.name')] || '').trim() : ''
    return (
      <label key={f.key} className="sw-field" data-k={f.key}>
        {label}
        <input
          className="sw-input" type={f.type === 'tel' ? 'tel' : 'text'} value={v} maxLength={160} placeholder={ph}
          inputMode={f.inputMode || (f.type === 'tel' ? 'tel' : undefined)} aria-invalid={!!err}
          onChange={(e) => set(f, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); next() } }}
        />
        {err ? <span className="sw-err">{err}</span> : mapQ && (
          <a className="sw-map" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQ)}`} target="_blank" rel="noopener noreferrer">{t.map}</a>
        )}
      </label>
    )
  }

  // Sub-headings inside a step («Պսակադրություն», «Հանդիսություն»…) when it spans groups.
  const groups = []
  for (const f of step.fields) {
    const g = groups.at(-1)
    if (g && g.title === f.groupTitle) g.fields.push(f)
    else groups.push({ title: f.groupTitle, fields: [f] })
  }
  const showGroupTitles = groups.length > 1

  return (
    <div className="sw-backdrop">
      <div className="sw-panel" role="dialog" aria-modal="true" aria-labelledby="sw-title">
        <header className="sw-top">
          <span className="sw-count">{t.count(i + 1, steps.length)}</span>
          <button type="button" className="sw-skip" onClick={onSkip}>{t.skip}</button>
        </header>
        <div className="sw-progress" aria-hidden="true"><i style={{ width: `${((i + 1) / steps.length) * 100}%` }} /></div>
        <div className="sw-body" ref={body}>
          <h2 id="sw-title">{step.title}</h2>
          <p className="sw-lead">{step.lead}</p>
          {groups.map((g, gi) => (
            <div key={gi} className="sw-group">
              {showGroupTitles && g.title && <p className="sw-gt">{g.title}</p>}
              {g.fields.map(field)}
            </div>
          ))}
        </div>
        <footer className="sw-foot">
          {i > 0 ? <button type="button" className="sw-back" onClick={() => setI(i - 1)}>{t.back}</button> : <span />}
          <button type="button" className="sw-next" onClick={next}>{last ? t.done : t.next}</button>
        </footer>
      </div>
    </div>
  )
}
