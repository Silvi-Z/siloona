import { useEffect, useRef, useState } from 'react'
import { useInvitationContent } from './EditableContext'
import { MAX_ANSWER } from '../../rsvpQuestions'
import './rsvpExtra.css'

// «Լրացուցիչ հարց RSVP-ում»: the couple's 1–3 questions inside a design's
// RSVP form, before its send button. Shown only when the published page has
// them (the server sends them only with the extra_rsvp_question add-on).
// The answers are kept in the host's store (rsvpAnswers) and go with the
// RSVP (SharedInvitation.jsx); a required question left empty stops the
// form with a message. The fields take the design's typeface and colour.

const TEXT = {
  hy: { yes: 'Այո', no: 'Ոչ', required: 'Խնդրում ենք պատասխանել այս հարցին։', optional: 'ըստ ցանկության' },
  ru: { yes: 'Да', no: 'Нет', required: 'Пожалуйста, ответьте на этот вопрос.', optional: 'по желанию' },
  en: { yes: 'Yes', no: 'No', required: 'Please answer this question.', optional: 'optional' },
}

export default function RsvpExtra() {
  const { rsvpQuestions, rsvpAnswers, editing, data } = useInvitationContent()
  const root = useRef(null)
  const [missing, setMissing] = useState(null)
  const t = TEXT[data?.lang] || TEXT.hy
  const questions = !editing && Array.isArray(rsvpQuestions) ? rsvpQuestions : []

  // A required question left empty stops the design's own submit.
  useEffect(() => {
    const form = root.current?.closest('form')
    if (!form || !questions.some((q) => q.required)) return undefined
    const onSubmit = (e) => {
      const q = questions.find((x) => x.required && !String(rsvpAnswers?.current?.[x.id] || '').trim())
      if (!q) return
      e.preventDefault()
      e.stopImmediatePropagation()
      setMissing(q.id)
      root.current?.querySelector(`[data-q="${q.id}"] input`)?.focus()
    }
    form.addEventListener('submit', onSubmit, true)
    return () => form.removeEventListener('submit', onSubmit, true)
  }, [questions, rsvpAnswers])

  if (!questions.length) return null
  const set = (id, v) => {
    if (rsvpAnswers) rsvpAnswers.current = { ...rsvpAnswers.current, [id]: v }
    if (missing === id) setMissing(null)
  }
  return (
    <div className="rx" ref={root}>
      {questions.map((q) => {
        const err = missing === q.id
        const label = <>{q.text}{!q.required && <small className="rx-opt-note"> · {t.optional}</small>}</>
        if (q.type === 'text') {
          return (
            <label key={q.id} className="rx-q" data-q={q.id}>
              <span className="rx-t">{label}</span>
              <input type="text" className="rx-in" maxLength={MAX_ANSWER} aria-invalid={err || undefined} onInput={(e) => set(q.id, e.currentTarget.value)} />
              {err && <span className="rx-err" role="alert">{t.required}</span>}
            </label>
          )
        }
        const options = q.type === 'yesno' ? [['yes', t.yes], ['no', t.no]] : q.options.map((o) => [o, o])
        return (
          <fieldset key={q.id} className="rx-q" data-q={q.id} aria-invalid={err || undefined}>
            <legend className="rx-t">{label}</legend>
            <div className="rx-opts">
              {options.map(([v, l]) => (
                <label key={v} className="rx-opt">
                  <input type="radio" name={`rx-${q.id}`} value={v} onChange={() => set(q.id, v)} />
                  <span>{l}</span>
                </label>
              ))}
            </div>
            {err && <span className="rx-err" role="alert">{t.required}</span>}
          </fieldset>
        )
      })}
    </div>
  )
}
