// «Լրացուցիչ հարց RSVP-ում» (the extra_rsvp_question add-on): the couple's
// own 1–3 questions in the guests' reply form. Plain data and checks with
// no React — the order page (where the couple sets them), the invitation's
// form and the server (api/_lib/orders.js) all use these.

export const MAX_QUESTIONS = 3
export const MAX_TEXT = 160 // a question
export const MAX_OPTION = 60 // one choice
export const MAX_OPTIONS = 6
export const MAX_ANSWER = 300 // a guest's text answer

export const QUESTION_TYPES = ['text', 'choice', 'yesno']

// Ready questions the couple can start from (they may change the words).
export const PRESETS = {
  hy: [
    { type: 'text', text: 'Ո՞ր երգը կուզեիք լսել պարահրապարակում' },
    { type: 'choice', text: 'Սննդային նախընտրություններ', options: ['Միս', 'Ձուկ', 'Բուսական'] },
    { type: 'yesno', text: 'Տրանսպորտ պե՞տք է' },
  ],
  ru: [
    { type: 'text', text: 'Какую песню вы хотели бы услышать на танцполе?' },
    { type: 'choice', text: 'Предпочтения в еде', options: ['Мясо', 'Рыба', 'Вегетарианское'] },
    { type: 'yesno', text: 'Нужен ли вам транспорт?' },
  ],
  en: [
    { type: 'text', text: 'Which song would you like to hear on the dance floor?' },
    { type: 'choice', text: 'Food preferences', options: ['Meat', 'Fish', 'Vegetarian'] },
    { type: 'yesno', text: 'Do you need transport?' },
  ],
}

// Plain text only: no tags, no control characters, single spaces.
export const cleanText = (v, max) => String(v ?? '').replace(/<[^>]*>/g, '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)

const newId = () => `q${Math.random().toString(36).slice(2, 8)}`

// The couple's questions, cleaned. Throws Error(message) on something it
// can't accept (the order page shows the message).
export function cleanQuestions(list) {
  if (!Array.isArray(list)) return []
  if (list.length > MAX_QUESTIONS) throw new Error(`Առավելագույնը ${MAX_QUESTIONS} հարց։`)
  const seen = new Set()
  return list.map((q) => {
    const type = QUESTION_TYPES.includes(q?.type) ? q.type : 'text'
    const text = cleanText(q?.text, MAX_TEXT)
    if (text.length < 2) throw new Error('Գրեք հարցը։')
    let id = typeof q?.id === 'string' && /^[a-z0-9]{2,12}$/i.test(q.id) && !seen.has(q.id) ? q.id : newId()
    while (seen.has(id)) id = newId()
    seen.add(id)
    const out = { id, type, text, required: q?.required === true }
    if (type === 'choice') {
      const options = [...new Set((Array.isArray(q.options) ? q.options : []).map((o) => cleanText(o, MAX_OPTION)).filter(Boolean))].slice(0, MAX_OPTIONS)
      if (options.length < 2) throw new Error(`«${text}»՝ նշեք առնվազն 2 տարբերակ։`)
      out.options = options
    }
    return out
  })
}

// A guest's answers to these questions, cleaned: unknown questions are
// dropped, a choice must be one of its options, yes/no is 'yes' or 'no'.
// Returns { answers, missing: [question text] } (required ones unanswered).
export function cleanAnswers(questions, raw) {
  const answers = {}
  const missing = []
  const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  for (const q of questions || []) {
    let v = cleanText(src[q.id], MAX_ANSWER)
    if (q.type === 'choice' && !q.options.includes(v)) v = ''
    if (q.type === 'yesno' && !['yes', 'no'].includes(v)) v = ''
    if (v) answers[q.id] = v
    else if (q.required) missing.push(q.text)
  }
  return { answers, missing }
}
