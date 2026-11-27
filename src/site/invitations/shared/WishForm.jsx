import { useState } from 'react'
import { useInvitationContent } from './EditableContext'
import './wishForm.css'

// «Թողեք մաղթանք» (the wishes add-on): a guest writes a wish for the
// couple — name + up to 500 characters. Only on a published invitation
// with the book (the server sends `wishes`); the wishes are never shown
// here, only the couple reads them (their order page → «Մաղթանքների գիրք»).
// The design places it in its own section with its heading, and passes its
// own button / text classes, so it looks like the rest of the invitation.

export const MAX_WISH = 500

const TEXT = {
  hy: {
    title: 'Թողեք մաղթանք', lead: 'Ձեր խոսքերը կտեսնեն միայն զույգը։', name: 'Ձեր անունը', text: 'Ձեր մաղթանքը',
    send: 'Ուղարկել', sending: 'Ուղարկում ենք…', thanks: (n) => `Շնորհակալություն, ${n}։ Ձեր մաղթանքը կպահվի զույգի համար՝ որպես հիշողություն այս օրվա մասին։`,
    another: 'Գրել ևս մեկը', closed: 'Մաղթանքների ընդունումն ավարտվել է։ Շնորհակալություն բոլորին։',
    errName: 'Գրեք Ձեր անունը։', errText: 'Գրեք Ձեր մաղթանքը։', busy: 'Շատ արագ ենք ստանում։ Փորձեք մի քանի րոպեից։', error: 'Չհաջողվեց ուղարկել։ Ստուգեք ինտերնետը և փորձեք նորից։',
  },
  ru: {
    title: 'Оставьте пожелание', lead: 'Ваши слова увидит только пара.', name: 'Ваше имя', text: 'Ваше пожелание',
    send: 'Отправить', sending: 'Отправляем…', thanks: (n) => `Спасибо, ${n}! Ваше пожелание сохранится для пары как память об этом дне.`,
    another: 'Написать ещё', closed: 'Приём пожеланий завершён. Спасибо всем!',
    errName: 'Напишите ваше имя.', errText: 'Напишите ваше пожелание.', busy: 'Слишком много сообщений. Попробуйте через несколько минут.', error: 'Не удалось отправить. Проверьте интернет и попробуйте ещё раз.',
  },
  en: {
    title: 'Leave a wish', lead: 'Only the couple will see your words.', name: 'Your name', text: 'Your wish',
    send: 'Send', sending: 'Sending…', thanks: (n) => `Thank you, ${n}! Your wish will be kept for the couple as a memory of this day.`,
    another: 'Write another', closed: 'Wishes are no longer being collected. Thank you all!',
    errName: 'Please write your name.', errText: 'Please write your wish.', busy: 'Too many messages. Please try again in a few minutes.', error: 'Couldn’t send. Check the connection and try again.',
  },
}

export const useWishWords = () => {
  const { data } = useInvitationContent()
  return TEXT[data?.lang] || TEXT.hy
}

// Whether this copy has the book (published page, with the add-on).
export function useWishBook() {
  const { wishes, editing } = useInvitationContent()
  return !editing && !!wishes
}

export default function WishForm({ btnClass = '', bodyClass = '' }) {
  const { wishes, onWish, guestName } = useInvitationContent()
  const t = useWishWords()
  const [state, setState] = useState('') // '' | sending | sent
  const [error, setError] = useState('')
  const [count, setCount] = useState(0)
  const [who, setWho] = useState('')
  if (!wishes) return null
  if (!wishes.open) return <p className={`wf-lead ${bodyClass}`}>{t.closed}</p>

  async function submit(e) {
    e.preventDefault()
    if (state === 'sending') return
    const f = e.currentTarget.elements
    const name = f.wn.value.trim()
    const text = f.wt.value.trim()
    if (name.length < 2) { setError(t.errName); f.wn.focus(); return }
    if (text.length < 2) { setError(t.errText); f.wt.focus(); return }
    setState('sending')
    setError('')
    const r = await onWish({ name, text, website: f.website.value })
    if (r.ok) { setWho(name.split(/\s+/)[0]); setState('sent'); setCount((n) => n + 1); return }
    setState('')
    setError(r.status === 429 ? t.busy : r.message || t.error)
  }

  if (state === 'sent') {
    return (
      <div className="wf-done" role="status">
        <p className={`wf-thanks ${bodyClass}`}>{t.thanks(who)}</p>
        <button type="button" className={`wf-again ${btnClass}`} onClick={() => setState('')}>{t.another}</button>
      </div>
    )
  }
  return (
    <form className="wf" noValidate onSubmit={submit} key={count}>
      <p className={`wf-lead ${bodyClass}`}>{t.lead}</p>
      <label className="wf-field">
        <span className="wf-lbl">{t.name}</span>
        <input name="wn" type="text" autoComplete="name" maxLength={80} defaultValue={guestName || ''} />
      </label>
      <label className="wf-field">
        <span className="wf-lbl">{t.text}</span>
        <WishText />
      </label>
      {/* honeypot — hidden from people, filled in by bots */}
      <input className="wf-hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error && <p className="wf-err" role="alert">{error}</p>}
      <button type="submit" className={btnClass} disabled={state === 'sending'} aria-busy={state === 'sending' || undefined}>
        {state === 'sending' ? t.sending : t.send}
      </button>
    </form>
  )
}

function WishText() {
  const [n, setN] = useState(0)
  return (
    <>
      <textarea name="wt" rows={4} maxLength={MAX_WISH} onInput={(e) => setN(e.currentTarget.value.length)} />
      <span className="wf-count" aria-live="off">{n}/{MAX_WISH}</span>
    </>
  )
}
