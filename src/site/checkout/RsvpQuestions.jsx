import { useState } from 'react'
import { useLang, useText } from '../i18n'
import { MAX_OPTION, MAX_QUESTIONS, MAX_TEXT, PRESETS } from '../rsvpQuestions'

// «Լրացուցիչ հարց RSVP-ում» on the couple's order page: up to 3 questions
// for the guests' reply form — ready ones to start from or their own. Saved
// through the order's secret link (POST /api/orders/status, rsvp_questions).
// Only for a paid order with the extra_rsvp_question add-on.

const TEXT = {
  hy: {
    eyebrow: 'Լրացուցիչ հարցեր', title: 'Ձեր հարցերը հյուրերին',
    lead: 'Մինչև 3 հարց, որոնք հյուրերը կտեսնեն պատասխանի ձևում։ Պատասխանները կերևան ստորև և ցուցակում (CSV)։',
    ready: 'Պատրաստի հարցեր', own: '+ Իմ հարցը', type: 'Տեսակ', types: { text: 'Կարճ տեքստ', choice: 'Ընտրություն ցանկից', yesno: 'Այո / Ոչ' },
    question: 'Հարցը', options: 'Տարբերակները (ստորակետով)', required: 'Պարտադիր', remove: 'Հեռացնել', save: 'Պահպանել', saving: 'Պահպանում ենք…', saved: 'Պահպանված է',
    none: 'Դեռ հարցեր չկան։', max: 'Առավելագույնը 3 հարց։',
  },
  ru: {
    eyebrow: 'Дополнительные вопросы', title: 'Ваши вопросы гостям',
    lead: 'До 3 вопросов, которые гости увидят в форме ответа. Ответы появятся ниже и в списке (CSV).',
    ready: 'Готовые вопросы', own: '+ Свой вопрос', type: 'Тип', types: { text: 'Короткий текст', choice: 'Выбор из списка', yesno: 'Да / Нет' },
    question: 'Вопрос', options: 'Варианты (через запятую)', required: 'Обязательный', remove: 'Удалить', save: 'Сохранить', saving: 'Сохраняем…', saved: 'Сохранено',
    none: 'Вопросов пока нет.', max: 'Не больше 3 вопросов.',
  },
  en: {
    eyebrow: 'Extra questions', title: 'Your questions for the guests',
    lead: 'Up to 3 questions guests will see in the reply form. Their answers appear below and in the list (CSV).',
    ready: 'Ready questions', own: '+ My own question', type: 'Type', types: { text: 'Short text', choice: 'Choice from a list', yesno: 'Yes / No' },
    question: 'Question', options: 'Choices (comma-separated)', required: 'Required', remove: 'Remove', save: 'Save', saving: 'Saving…', saved: 'Saved',
    none: 'No questions yet.', max: 'At most 3 questions.',
  },
}

const toForm = (q) => ({ ...q, optionsText: (q.options || []).join(', ') })

export default function RsvpQuestions({ id, token, questions, onSaved }) {
  const t = useText(TEXT)
  const { lang } = useLang()
  const [list, setList] = useState(() => (questions || []).map(toForm))
  const [state, setState] = useState('') // '' | saving | saved
  const [error, setError] = useState('')
  const full = list.length >= MAX_QUESTIONS
  const change = (i, patch) => { setList((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x))); setState(''); setError('') }
  const add = (q) => { if (!full) { setList((xs) => [...xs, toForm(q)]); setState('') } }

  async function save() {
    setState('saving')
    setError('')
    const body = {
      action: 'rsvp_questions', id, t: token,
      questions: list.map(({ optionsText, ...q }) => ({ ...q, options: q.type === 'choice' ? optionsText.split(/[,،;]/).map((s) => s.trim()).filter(Boolean) : undefined })),
    }
    try {
      const r = await fetch('/api/orders/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(json.message || 'Error')
      setList(json.rsvpQuestions.map(toForm))
      setState('saved')
      onSaved?.(json.rsvpQuestions)
    } catch (e) {
      setState('')
      setError(e.message)
    }
  }

  return (
    <section className="co-share co-rq" aria-labelledby="co-rq-h">
      <p className="eyebrow">{t.eyebrow}</p>
      <h2 id="co-rq-h">{t.title}</h2>
      <p className="co-share-note">{t.lead}</p>
      {!list.length && <p className="co-rq-none">{t.none}</p>}
      {list.map((q, i) => (
        <fieldset key={q.id || i} className="co-rq-item">
          <legend className="co-rq-n">{i + 1}</legend>
          <label className="co-field wide">
            <span className="co-label">{t.question}</span>
            <input type="text" value={q.text} maxLength={MAX_TEXT} onChange={(e) => change(i, { text: e.target.value })} />
          </label>
          <div className="co-rq-row">
            <label className="co-field">
              <span className="co-label">{t.type}</span>
              <select className="co-sel" value={q.type} onChange={(e) => change(i, { type: e.target.value })}>
                {Object.entries(t.types).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="co-consent co-rq-req">
              <input type="checkbox" checked={!!q.required} onChange={(e) => change(i, { required: e.target.checked })} />
              <span>{t.required}</span>
            </label>
          </div>
          {q.type === 'choice' && (
            <label className="co-field wide">
              <span className="co-label">{t.options}</span>
              <input type="text" value={q.optionsText} maxLength={MAX_OPTION * 6} onChange={(e) => change(i, { optionsText: e.target.value })} />
            </label>
          )}
          <button type="button" className="co-edit" onClick={() => { setList((xs) => xs.filter((_, j) => j !== i)); setState('') }}>{t.remove}</button>
        </fieldset>
      ))}
      {!full ? (
        <div className="co-rq-add">
          <span className="co-label">{t.ready}</span>
          <div className="co-via-row">
            {(PRESETS[lang] || PRESETS.hy).map((p) => (
              <button key={p.text} type="button" className="co-via-opt" onClick={() => add(p)}>{p.text}</button>
            ))}
            <button type="button" className="co-via-opt" onClick={() => add({ type: 'text', text: '' })}>{t.own}</button>
          </div>
        </div>
      ) : <p className="co-rq-none">{t.max}</p>}
      {error && <p className="co-alert" role="alert">{error}</p>}
      <div className="co-actions center">
        <button type="button" className="btn btn-primary" onClick={save} disabled={state === 'saving'}>
          {state === 'saving' ? t.saving : state === 'saved' ? t.saved : t.save}
        </button>
      </div>
    </section>
  )
}
