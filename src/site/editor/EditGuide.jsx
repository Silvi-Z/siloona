import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useText } from '../i18n'
import './editGuide.css'

// A short tour of edit mode on the public preview: each step dims the page,
// lights up one real control (a text, the date picker, the programme's «+»,
// the edit bar's buttons) and explains it in a card next to it. Steps whose
// control isn't on the page are left out, so it fits any design. Shown
// once per design after the editing wizard (see InvitationPreview.jsx);
// the edit bar's «?» replays it.

// The first element matching `selector` that is actually shown — designs
// keep some editable parts hidden (closed intros, collapsed panels).
function firstVisible(selector) {
  for (const el of document.querySelectorAll(selector)) {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden') return el
  }
  return null
}

// Each step: the control it lights up, and its words per language.
const STEPS = [
  // The main heading's text if the design has one, else the first text.
  { id: 'text', target: () => firstVisible('h1 .wdb-editable') || firstVisible('.wdb-editable') },
  { id: 'date', target: () => firstVisible('.wdb-edit-dt') },
  { id: 'rows', target: () => firstVisible('[data-guide="row-add"]') },
  { id: 'wizard', target: () => firstVisible('[data-guide="wizard"]') },
  { id: 'reset', target: () => firstVisible('[data-guide="reset"]') },
  { id: 'done', target: () => firstVisible('[data-guide="done"]') },
]

const TEXT = {
  hy: {
    text: { title: 'Սեղմեք տեքստի վրա', text: 'Հրավերի ցանկացած տեքստ կարելի է փոխել․ սեղմեք դրա վրա և գրեք։ Փոփոխությունները պահպանվում են ինքնաշխատ։' },
    date: { title: 'Ամսաթիվ և ժամ', text: 'Ընտրեք միջոցառման օրը և ժամը․ հետհաշվարկը և հրավերի բոլոր ամսաթվերը կթարմացվեն ինքնաշխատ։' },
    rows: { title: 'Օրվա ծրագիրը', text: '«+ Ավելացնել կետ» կոճակով ավելացրեք նոր կետ, իսկ կետի կողքի «×»-ով հեռացրեք ավելորդը։' },
    wizard: { title: 'Քայլ առ քայլ', text: 'Անունը, ամսաթիվը, վայրը և ծրագիրը կարող եք լրացնել նաև հարցերի օգնությամբ՝ այս կոճակով։' },
    reset: { title: 'Սկսել նորից', text: 'Այս կոճակը կվերադարձնի հրավերի նախնական տեքստերը։' },
    done: { title: 'Դիտեք արդյունքը', text: 'Ավարտելուց հետո կտեսնեք հրավերն այնպես, ինչպես այն կտեսնեն հյուրերը, և կկարողանաք պատվիրել այն։' },
    skip: 'Բաց թողնել', back: 'Հետ', next: 'Հաջորդը', last: 'Հասկանալի է',
  },
  ru: {
    text: { title: 'Нажмите на текст', text: 'Любой текст приглашения можно изменить: нажмите на него и пишите. Изменения сохраняются автоматически.' },
    date: { title: 'Дата и время', text: 'Выберите день и время события — обратный отсчёт и все даты приглашения обновятся автоматически.' },
    rows: { title: 'Программа дня', text: 'Кнопкой «+ Добавить пункт» добавьте новый пункт, а «×» рядом с пунктом удалит лишний.' },
    wizard: { title: 'Пошагово', text: 'Имя, дату, место и программу можно заполнить и с помощью вопросов — этой кнопкой.' },
    reset: { title: 'Начать заново', text: 'Эта кнопка вернёт исходные тексты приглашения.' },
    done: { title: 'Посмотрите результат', text: 'После завершения Вы увидите приглашение так, как его увидят гости, и сможете его заказать.' },
    skip: 'Пропустить', back: 'Назад', next: 'Далее', last: 'Понятно',
  },
  en: {
    text: { title: 'Tap a text', text: 'Any text on the invitation can be changed: tap it and type. Your changes are saved automatically.' },
    date: { title: 'Date and time', text: 'Choose the day and time of the event — the countdown and every date on the invitation update automatically.' },
    rows: { title: 'The day’s schedule', text: 'Use «+ Add an item» to add a new item, and the «×» beside an item to remove it.' },
    wizard: { title: 'Step by step', text: 'You can also fill in the name, date, venue and schedule by answering a few questions — with this button.' },
    reset: { title: 'Start over', text: 'This button brings back the invitation’s original texts.' },
    done: { title: 'See the result', text: 'When you finish, you’ll see the invitation as your guests will, and you can order it.' },
    skip: 'Skip', back: 'Back', next: 'Next', last: 'Got it',
  },
}

// Controls in the fixed edit bar are always on screen — no scrolling to them.
function inFixedBar(el) {
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    if (getComputedStyle(n).position === 'fixed') return true
  }
  return false
}

const PAD = 8 // breathing room around the lit-up control
const GAP = 14 // between the control and the card

export default function EditGuide({ onClose }) {
  const t = useText(TEXT)
  // Only the steps whose control is on the page right now.
  const [steps] = useState(() => STEPS.filter((s) => s.target()))
  const [i, setI] = useState(0)
  const [rect, setRect] = useState(null)
  const [cardH, setCardH] = useState(0)
  const cardRef = useRef(null)
  const nextRef = useRef(null)
  const step = steps[i]
  const last = i === steps.length - 1

  const measure = useCallback(() => {
    const el = step?.target()
    if (!el) { setRect(null); return }
    const r = el.getBoundingClientRect()
    setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 })
  }, [step])

  // Bring the control into view, then follow it while the page settles.
  useEffect(() => {
    if (!step) { onClose(); return }
    const el = step.target()
    if (el && !inFixedBar(el)) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
    }
    measure()
    // Capture: also follows designs that scroll inside their own container.
    window.addEventListener('scroll', measure, { capture: true, passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure, { capture: true })
      window.removeEventListener('resize', measure)
    }
  }, [step, measure, onClose])

  useLayoutEffect(() => { setCardH(cardRef.current?.offsetHeight || 0) }, [i, rect?.width])
  useEffect(() => { nextRef.current?.focus({ preventScroll: true }) }, [i])

  // Keyboard: Esc closes, arrows move between steps.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') setI((n) => Math.min(n + 1, steps.length - 1))
      else if (e.key === 'ArrowLeft') setI((n) => Math.max(n - 1, 0))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, steps.length])

  if (!step) return null

  // The card goes under the control if it fits, otherwise above it; on
  // narrow screens it spans the width, on wide ones it centres on the control.
  const vw = window.innerWidth
  const vh = window.innerHeight
  const cardW = Math.min(360, vw - 32)
  let cardTop = vh / 2 - cardH / 2
  let cardLeft = (vw - cardW) / 2
  if (rect) {
    const below = rect.top + rect.height + GAP
    cardTop = below + cardH <= vh - 16 ? below : Math.max(16, rect.top - GAP - cardH)
    cardLeft = Math.min(Math.max(16, rect.left + rect.width / 2 - cardW / 2), vw - cardW - 16)
  }

  return (
    <div className="eg-layer" role="dialog" aria-modal="true" aria-labelledby="eg-title" aria-describedby="eg-text">
      {rect
        ? <div className="eg-hole" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }} aria-hidden="true" />
        : <div className="eg-dim" aria-hidden="true" />}
      <div ref={cardRef} className="eg-card" style={{ top: cardTop, left: cardLeft, width: cardW }} key={i}>
        <div className="eg-top">
          <span className="eg-count">{i + 1} / {steps.length}</span>
          <button type="button" className="eg-skip" onClick={onClose}>{t.skip}</button>
        </div>
        <h2 id="eg-title">{t[step.id].title}</h2>
        <p id="eg-text">{t[step.id].text}</p>
        <div className="eg-foot">
          <span className="eg-dots" aria-hidden="true">
            {steps.map((_, j) => <i key={j} className={j === i ? 'on' : ''} />)}
          </span>
          {i > 0 && <button type="button" className="eg-back" onClick={() => setI(i - 1)}>{t.back}</button>}
          <button ref={nextRef} type="button" className="eg-next" onClick={() => (last ? onClose() : setI(i + 1))}>
            {last ? t.last : t.next}
          </button>
        </div>
      </div>
    </div>
  )
}
