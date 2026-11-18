// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings). Photos are
// changed on the invitation itself («Փոխել լուսանկարը» in edit mode).
const placeFields = (i) => [
  { path: `places.${i}.label`, label: `${i + 1}-ին վայրի վերնագիրը`, type: 'text' },
  { path: `places.${i}.time`, label: 'Ժամը', type: 'text' },
  { path: `places.${i}.name`, label: 'Վայրը', type: 'text' },
  { path: `places.${i}.address`, label: 'Հասցե (քարտեզի հղման համար)', type: 'text' },
]

export const wdRougeSections = [
  {
    id: 'greeting', role: 'greeting',
    fields: [
      { path: 'greeting.personal', label: 'Հյուրի անհատական հղումով (վերնագրի տակ)', type: 'text', personal: true },
      { path: 'greeting.general', label: 'Վերնագիր', type: 'text' },
      { path: 'greeting.sub', label: 'Ընդհանուր հղումով (վերնագրի տակ)', type: 'text' },
    ],
  },
  {
    id: 'message', role: 'message',
    fields: [
      { path: 'message', label: 'Տեքստը', type: 'textarea' },
      { path: 'message2', label: 'Երկրորդ պարբերություն', type: 'textarea' },
    ],
  },
  {
    id: 'couple', title: 'Զույգը և ամսաթիվը', hideable: false, fromEvent: true,
    fields: [
      { path: 'couple.first', label: 'Փեսացու', type: 'text' },
      { path: 'couple.second', label: 'Հարսնացու', type: 'text' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
      { path: 'hero.word', label: 'Մեծ բառը (լատինատառ, օր.՝ LOVE)', type: 'text' },
      { path: 'hero.ribbon', label: 'Ձեռագիր ժապավենի տեքստը (լատինատառ)', type: 'text' },
    ],
  },
  { id: 'date', title: 'Մեծ ամսաթիվ', fields: [] },
  { id: 'countdown', title: 'Հետհաշվարկ', fields: [{ path: 'countdownTitle', label: 'Տեքստը', type: 'text' }] },
  { id: 'photos', title: 'Լուսանկարներ', fields: [] },
  {
    id: 'schedule', title: 'Օրվա ծրագիր', fromEvent: true,
    fields: [
      { path: 'scheduleTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'scheduleSub', label: 'Վերնագրի տակ', type: 'text' },
      { path: 'schedule', label: 'Ծրագիր', type: 'schedule' },
    ],
  },
  {
    id: 'venue', title: 'Վայրերը', fromEvent: true,
    fields: [
      { path: 'venueTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'venueSub', label: 'Վերնագրի տակ', type: 'text' },
      { path: 'mapButton', label: 'Քարտեզի կոճակը', type: 'text' },
      ...placeFields(0), ...placeFields(1),
    ],
  },
  {
    id: 'rsvp', title: 'Հաստատում (RSVP)', rsvpSettings: true,
    fields: [
      { path: 'rsvp.title', label: 'Վերնագիր', type: 'text' },
      { path: 'rsvp.sub', label: 'Վերնագրի տակ', type: 'text' },
      { path: 'rsvp.intro', label: 'Տեքստը', type: 'text' },
      { path: 'rsvp.yes', label: '«Գալիս եմ» տարբերակը', type: 'text' },
      { path: 'rsvp.no', label: '«Չեմ գալիս» տարբերակը', type: 'text' },
      { path: 'rsvp.guestLabel', label: 'Հյուրերի թվի հարցը', type: 'text' },
      { path: 'rsvp.button', label: 'Կոճակը', type: 'text' },
      { path: 'rsvp.thanksYes', label: 'Պատասխան, եթե գալիս է ({name}՝ հյուրի անունը)', type: 'text' },
      { path: 'rsvp.thanksNo', label: 'Պատասխան, եթե չի գալիս ({name}՝ հյուրի անունը)', type: 'text' },
    ],
  },
  { id: 'closing', title: 'Ավարտ', fields: [{ path: 'closing.line', label: 'Անուններից առաջ', type: 'text' }] },
]
