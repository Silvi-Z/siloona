// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings).
const placeFields = (i, what) => [
  { path: `places.${i}.label`, label: `${what}՝ անվանում`, type: 'text' },
  { path: `places.${i}.time`, label: `${what}՝ ժամը`, type: 'text' },
  { path: `places.${i}.name`, label: `${what}՝ վայրը`, type: 'text' },
  { path: `places.${i}.address`, label: `${what}՝ հասցեն (քարտեզի համար)`, type: 'text' },
]

export const wdNoirLiteSections = [
  {
    id: 'couple', title: 'Զույգը և ամսաթիվը', hideable: false, fromEvent: true,
    hint: 'Ֆոնի լուսանկարը փոխվում է հենց հրավերի վրա՝ առաջին էկրանին։',
    fields: [
      { path: 'couple.first', label: 'Փեսացու', type: 'text' },
      { path: 'couple.second', label: 'Հարսնացու', type: 'text' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
      { path: 'kicker', label: 'Անունների վերևում', type: 'text' },
    ],
  },
  {
    id: 'greeting', role: 'greeting',
    fields: [
      { path: 'greeting.personal', label: 'Հյուրի անհատական հղումով', type: 'text', personal: true },
      { path: 'greeting.general', label: 'Ընդհանուր հղումով', type: 'text' },
    ],
  },
  { id: 'message', role: 'message', fields: [{ path: 'message', label: 'Տեքստը', type: 'textarea' }] },
  {
    id: 'countdown', title: 'Հետհաշվարկ',
    fields: [
      { path: 'countdownTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'calendarButton', label: 'Օրացույցի կոճակը', type: 'text' },
    ],
  },
  {
    id: 'venue', title: 'Վայրերը', fromEvent: true,
    fields: [
      { path: 'venueTitle', label: 'Վերնագիր', type: 'text' },
      ...placeFields(0, '1-ին վայր'), ...placeFields(1, '2-րդ վայր'),
      { path: 'mapButton', label: 'Քարտեզի կոճակը', type: 'text' },
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
    id: 'dressCode', title: 'Դրես-կոդ',
    fields: [
      { path: 'dressCode.title', label: 'Վերնագիր', type: 'text' },
      { path: 'dressCode.text', label: 'Տեքստը', type: 'textarea' },
    ],
  },
  {
    id: 'rsvp', title: 'Հաստատում (RSVP)', rsvpSettings: true,
    fields: [
      { path: 'rsvp.title', label: 'Վերնագիր', type: 'text' },
      { path: 'rsvp.intro', label: 'Տեքստը', type: 'text' },
      { path: 'rsvp.yes', label: '«Գալիս եմ» տարբերակը', type: 'text' },
      { path: 'rsvp.no', label: '«Չեմ գալիս» տարբերակը', type: 'text' },
      { path: 'rsvp.guestsLabel', label: 'Հյուրերի քանակի հարցը', type: 'text' },
      { path: 'rsvp.button', label: 'Կոճակը', type: 'text' },
      { path: 'rsvp.thanksYes', label: 'Պատասխան, եթե գալիս է ({name}՝ հյուրի անունը)', type: 'text' },
      { path: 'rsvp.thanksNo', label: 'Պատասխան, եթե չի գալիս ({name}՝ հյուրի անունը)', type: 'text' },
    ],
  },
  { id: 'closing', title: 'Ավարտ', fields: [{ path: 'closing.line', label: 'Տեքստը', type: 'text' }] },
]
