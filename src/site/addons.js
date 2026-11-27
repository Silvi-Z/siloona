import { ADDON_PRICES } from './prices.js'

// Paid add-ons to a web invitation. Plain data with no React and no
// assets: the checkout, the prices page and the server
// (api/_lib/orders.js, which works out the order's price) all read it.
// Prices live in prices.js (ADDON_PRICES) only.
//
//   type      'feature' — something guests see in the invitation; it shows
//             there only when that invitation has it (invitationFeatures)
//             'service' — work Siloona does (nothing changes in the page)
//   enabled   offered in the checkout and on the prices page. Switch a
//             feature on only once it works in the designs it applies to.
//   included  part of every invitation, free — never a checkbox
//   options   only with these price options (prices.js PRICE_OPTIONS)
//   designs   only for designs this test accepts (by design id)

const isCard = (id) => id.startsWith('card-')
const web = (id) => !isCard(id)
// Wedding designs (there are no separate engagement designs yet).
const wedding = (id) => id.startsWith('wd-')
// Designs with the «Ձեր սեղանը» section built in.
export const SEATING_DESIGNS = ['wd-portrait', 'wd-noir', 'wd-noir-lite', 'ce-sparkle', 'ce-cozy']

export const ADDONS = [
  {
    id: 'calendar', type: 'feature', enabled: true, included: true, designs: web,
    name: { hy: 'Ավելացնել օրացույցում', ru: 'Добавить в календарь', en: 'Add to calendar' },
    text: { hy: 'Հյուրը մեկ սեղմումով ավելացնում է միջոցառումը իր օրացույցում։', ru: 'Гость добавляет событие в свой календарь одним нажатием.', en: 'Guests add the event to their calendar in one tap.' },
  },
  {
    id: 'personal_greeting', type: 'feature', enabled: true, designs: web,
    name: { hy: 'Անհատական դիմում հյուրին', ru: 'Персональное обращение к гостю', en: 'A personal greeting for each guest' },
    text: { hy: 'Յուրաքանչյուր հյուր ստանում է իր հղումը, և հրավերը դիմում է նրան անունով։', ru: 'Каждый гость получает свою ссылку, и приглашение обращается к нему по имени.', en: 'Each guest gets their own link, and the invitation greets them by name.' },
  },
  {
    id: 'seating', type: 'feature', enabled: true, designs: (id) => SEATING_DESIGNS.includes(id),
    name: { hy: 'Ձեր սեղանը', ru: 'Ваш стол', en: 'Your table' },
    text: { hy: 'Հյուրը գրում է իր անունը և տեսնում, թե որ սեղանի մոտ է նստելու։', ru: 'Гость вводит своё имя и видит, за каким столом сидит.', en: 'Guests type their name and see which table they’re at.' },
  },
  {
    id: 'live_schedule', type: 'feature', enabled: false, designs: web,
    name: { hy: 'Կենդանի ծրագիր + տաքսի', ru: 'Живая программа + такси', en: 'Live schedule + taxi' },
    text: { hy: 'Միջոցառման օրը ծրագիրը ցույց է տալիս, թե ինչ է կատարվում հիմա, և առաջարկում ճանապարհ ու տաքսի։', ru: 'В день события программа показывает, что идёт сейчас, и предлагает маршрут и такси.', en: 'On the day, the schedule shows what’s on now, with directions and a taxi.' },
  },
  {
    id: 'extra_rsvp_question', type: 'feature', enabled: false, designs: web,
    name: { hy: 'Լրացուցիչ հարց RSVP-ում', ru: 'Дополнительный вопрос в RSVP', en: 'Extra RSVP questions' },
    text: { hy: 'Մինչև 3 Ձեր հարցը պատասխանի ձևում, օրինակ՝ ուտեստի ընտրություն։', ru: 'До 3 Ваших вопросов в форме ответа — например, выбор блюда.', en: 'Up to 3 questions of your own in the reply form, such as a meal choice.' },
  },
  {
    id: 'wishes', type: 'feature', enabled: false, designs: wedding,
    name: { hy: 'Մաղթանքների գիրք', ru: 'Книга пожеланий', en: 'Wishes book' },
    text: { hy: 'Հյուրերը թողնում են մաղթանքներ, որոնք տեսնում եք միայն Դուք։', ru: 'Гости оставляют пожелания, которые видите только Вы.', en: 'Guests leave wishes that only you can see.' },
  },
  {
    id: 'thank_you_page', type: 'feature', enabled: false, designs: web,
    name: { hy: 'Շնորհակալական էջ', ru: 'Страница благодарности', en: 'Thank-you page' },
    text: { hy: 'Միջոցառումից հետո նույն հղումը բացում է Ձեր շնորհակալական խոսքը և լուսանկարները։', ru: 'После события та же ссылка открывает Ваши слова благодарности и фотографии.', en: 'After the event, the same link opens your thank-you note and photos.' },
  },
  {
    id: 'extra_language', type: 'service', enabled: true, designs: web,
    name: { hy: 'Լրացուցիչ լեզու', ru: 'Дополнительный язык', en: 'An extra language' },
    text: { hy: 'Հրավերը նաև ևս մեկ լեզվով։', ru: 'Приглашение ещё на одном языке.', en: 'The invitation in one more language.' },
  },
  {
    id: 'rush', type: 'service', enabled: true, options: ['assisted'],
    name: { hy: 'Շտապ պատրաստում (24 ժամ)', ru: 'Срочное изготовление (24 часа)', en: 'Rush (24 hours)' },
    text: { hy: 'Հրավերը պատրաստ կլինի 24 ժամվա ընթացքում։', ru: 'Приглашение будет готово в течение 24 часов.', en: 'Your invitation is ready within 24 hours.' },
  },
  {
    id: 'print_adaptation', type: 'service', enabled: true,
    name: { hy: 'Դիզայնի ադապտացիա տպագրի համար', ru: 'Адаптация дизайна для печати', en: 'Design adapted for print' },
    text: { hy: 'Նույն դիզայնը՝ տպագրության համար պատրաստ ֆայլով։', ru: 'Тот же дизайн — файлом, готовым к печати.', en: 'The same design as a print-ready file.' },
  },
]

export const addonById = (id) => ADDONS.find((a) => a.id === id) || null
export const addonPrice = (id) => ADDON_PRICES[id] ?? null
export const addonName = (a, lang = 'hy') => (typeof a === 'string' ? addonById(a) : a)?.name[lang] || (typeof a === 'string' ? a : a?.name.hy)
export const addonText = (a, lang = 'hy') => a.text[lang] || a.text.hy

export function addonApplies(a, designId, option) {
  if (a.options && !a.options.includes(option)) return false
  return !a.designs || a.designs(String(designId || ''))
}

// The checkboxes a design + option gets in the checkout.
export const orderableAddons = (designId, option) =>
  ADDONS.filter((a) => a.enabled && !a.included && addonPrice(a.id) != null && addonApplies(a, designId, option))

// The prices page: everything switched on.
export const offeredAddons = () => ADDONS.filter((a) => a.enabled && addonPrice(a.id) != null)

// The chosen add-ons with their prices, as the order stores them. Throws
// on anything that can't be ordered with this design and option.
export function priceAddons(designId, option, ids) {
  const list = Array.isArray(ids) ? [...new Set(ids.map(String))] : []
  const allowed = new Set(orderableAddons(designId, option).map((a) => a.id))
  const bad = list.filter((id) => !allowed.has(id))
  if (bad.length) { const e = new Error('addon_unavailable'); e.ids = bad; throw e }
  const items = ADDONS.filter((a) => list.includes(a.id)).map((a) => ({ id: a.id, price: addonPrice(a.id) }))
  return { items, total: items.reduce((s, x) => s + x.price, 0) }
}

// What an invitation shows: the free features every invitation has, the
// features its order paid for, and any Siloona turned on for it by hand
// (invitations.features, e.g. by scripts/import-seating.js). Only features
// that are switched on (enabled) count.
export function invitationFeatures(orderAddons, granted) {
  const ids = new Set()
  for (const a of ADDONS) if (a.type === 'feature' && a.included && a.enabled) ids.add(a.id)
  for (const x of Array.isArray(orderAddons) ? orderAddons : []) ids.add(typeof x === 'string' ? x : x?.id)
  for (const x of Array.isArray(granted) ? granted : []) ids.add(x)
  return ADDONS.filter((a) => a.type === 'feature' && a.enabled && ids.has(a.id)).map((a) => a.id)
}
