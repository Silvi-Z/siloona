// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings).
export const bdDuckSections = [
  {
    id: 'greeting', role: 'greeting',
    fields: [
      { path: 'greeting.personal', label: 'Հյուրի անհատական հղումով', type: 'text', personal: true },
      { path: 'greeting.general', label: 'Ընդհանուր հղումով', type: 'text' },
    ],
  },
  { id: 'message', role: 'message', fields: [{ path: 'message', label: 'Տեքստը', type: 'textarea' }] },
  {
    id: 'hero', title: 'Տոնի հերոսը', hideable: false, fromEvent: true,
    fields: [
      { path: 'kicker', label: 'Վերնագրի վերևի տողը', type: 'text' },
      { path: 'title', label: 'Անունը նախադասության մեջ', type: 'text' },
      { path: 'age', label: 'Տարիքը', type: 'text' },
      { path: 'ageLabel', label: 'Տարիքից հետո', type: 'text' },
      { path: 'heroText', label: 'Տեքստը', type: 'textarea' },
    ],
  },
  {
    id: 'intro', title: 'Բացման էկրան', hideable: false,
    fields: [
      { path: 'gate.kicker', label: 'Վերնագիր', type: 'text' },
      { path: 'gate.hint', label: 'Հուշում', type: 'text' },
    ],
  },
  {
    id: 'date', title: 'Ամսաթիվ', hideable: false, fromEvent: true,
    fields: [
      { path: 'dateNote', label: 'Տեքստը քարտի վրա', type: 'text' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
    ],
  },
  {
    id: 'countdown', title: 'Հետհաշվարկ', hint: 'Հաշվվում է ավտոմատ՝ միջոցառման ամսաթվից։',
    fields: [
      { path: 'countdown.label', label: 'Վերնագիր', type: 'text' },
      { path: 'countdown.done', label: 'Տեքստը միջոցառման օրը', type: 'text' },
    ],
  },
  {
    id: 'details', title: 'Վայրը', fromEvent: true,
    fields: [
      { path: 'venue.name', label: 'Անվանում', type: 'text' },
      { path: 'venue.address', label: 'Հասցե (քարտեզի հղման համար)', type: 'text' },
    ],
  },
  { id: 'schedule', title: 'Օրվա ծրագիր', fromEvent: true, fields: [{ path: 'schedule', label: 'Ծրագիր', type: 'schedule' }] },
  { id: 'dressCode', title: 'Հագուստ', fields: [{ path: 'dressCode.text', label: 'Տեքստը', type: 'textarea' }] },
  { id: 'gifts', title: 'Նվերներ', fields: [{ path: 'gifts.text', label: 'Տեքստը', type: 'textarea' }] },
  {
    id: 'rsvp', title: 'Հաստատում (RSVP)', rsvpSettings: true,
    fields: [
      { path: 'rsvp.intro', label: 'Ներածություն', type: 'textarea' },
      { path: 'rsvp.thanksYes', label: 'Պատասխան, եթե գալիս է', type: 'textarea' },
      { path: 'rsvp.thanksNo', label: 'Պատասխան, եթե չի գալիս', type: 'textarea' },
    ],
  },
  {
    id: 'closing', title: 'Եզրափակում',
    fields: [
      { path: 'closing.title', label: 'Վերնագիր', type: 'text' },
      { path: 'closing.signature', label: 'Ստորագրություն', type: 'text' },
    ],
  },
]
