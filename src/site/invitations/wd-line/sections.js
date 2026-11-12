// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings).
const placeFields = (i) => [
  { path: `places.${i}.label`, label: `${i + 1}-ին վայրի վերնագիրը`, type: 'text' },
  { path: `places.${i}.time`, label: 'Ժամը', type: 'text' },
  { path: `places.${i}.name`, label: 'Վայրը', type: 'text' },
  { path: `places.${i}.address`, label: 'Հասցե (քարտեզի հղման համար)', type: 'text' },
]

export const wdLineSections = [
  {
    id: 'greeting', role: 'greeting',
    fields: [
      { path: 'greeting.personal', label: 'Հյուրի անհատական հղումով', type: 'text', personal: true },
      { path: 'greeting.general', label: 'Ընդհանուր հղումով', type: 'text' },
    ],
  },
  { id: 'message', role: 'message', fields: [{ path: 'message', label: 'Տեքստը', type: 'textarea' }] },
  {
    id: 'couple', title: 'Զույգը և ամսաթիվը', hideable: false, fromEvent: true,
    fields: [
      { path: 'couple.first', label: 'Փեսացու', type: 'text' },
      { path: 'couple.second', label: 'Հարսնացու', type: 'text' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
      { path: 'hero.kicker', label: 'Վերին տող', type: 'text' },
      { path: 'hero.place', label: 'Քաղաքը', type: 'text' },
    ],
  },
  {
    id: 'countdown', title: 'Ամսաթիվ և հետհաշվարկ', hint: 'Հաշվվում է ավտոմատ՝ միջոցառման ամսաթվից։',
    fields: [
      { path: 'dateTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'countdownTitle', label: 'Հետհաշվարկի վերնագիր', type: 'text' },
      { path: 'calendarButton', label: 'Օրացույցի կոճակը', type: 'text' },
    ],
  },
  {
    id: 'schedule', title: 'Օրվա ծրագիր', fromEvent: true,
    fields: [
      { path: 'scheduleTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'schedule', label: 'Ծրագիր', type: 'schedule' },
    ],
  },
  {
    id: 'venue', title: 'Վայրերը', fromEvent: true,
    fields: [
      { path: 'venueTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'mapButton', label: 'Քարտեզի կոճակը', type: 'text' },
      ...placeFields(0), ...placeFields(1),
    ],
  },
  {
    id: 'dressCode', title: 'Հագուստի ոճ',
    fields: [
      { path: 'dressCode.title', label: 'Վերնագիր', type: 'text' },
      { path: 'dressCode.intro', label: 'Տեքստը', type: 'textarea' },
      { path: 'dressCode.colors', label: 'Գույներ', type: 'colors' },
    ],
  },
  {
    id: 'rsvp', title: 'Հաստատում (RSVP)', rsvpSettings: true,
    fields: [
      { path: 'rsvp.title', label: 'Վերնագիր', type: 'text' },
      { path: 'rsvp.intro', label: 'Տեքստը', type: 'text' },
      { path: 'rsvp.yes', label: '«Գալիս եմ» տարբերակը', type: 'text' },
      { path: 'rsvp.no', label: '«Չեմ գալիս» տարբերակը', type: 'text' },
      { path: 'rsvp.guestLabel', label: 'Հյուրերի թվի հարցը', type: 'text' },
      { path: 'rsvp.wishLabel', label: 'Մաղթանքի դաշտը', type: 'text' },
      { path: 'rsvp.button', label: 'Կոճակը', type: 'text' },
      { path: 'rsvp.thanksYes', label: 'Պատասխան, եթե գալիս է ({name}՝ հյուրի անունը)', type: 'text' },
      { path: 'rsvp.thanksNo', label: 'Պատասխան, եթե չի գալիս ({name}՝ հյուրի անունը)', type: 'text' },
    ],
  },
  {
    id: 'closing', title: 'Ավարտ',
    fields: [
      { path: 'closing.line', label: 'Տեքստը', type: 'text' },
      { path: 'closing.sign', label: 'Անուններից առաջ', type: 'text' },
    ],
  },
]
