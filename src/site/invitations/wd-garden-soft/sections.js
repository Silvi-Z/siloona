// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings).
export const wdGardenSoftSections = [
  {
    id: 'greeting', role: 'greeting',
    fields: [
      { path: 'greeting.personal', label: 'Հյուրի անհատական հղումով', type: 'text', personal: true },
      { path: 'greeting.general', label: 'Ընդհանուր հղումով', type: 'text' },
    ],
  },
  {
    id: 'message', role: 'message',
    fields: [
      { path: 'message', label: '1-ին պարբերություն', type: 'textarea' },
      { path: 'message2', label: '2-րդ պարբերություն', type: 'textarea' },
    ],
  },
  {
    id: 'couple', title: 'Զույգը և ամսաթիվը', hideable: false, fromEvent: true,
    fields: [
      { path: 'couple.first', label: 'Հարսնացու', type: 'text' },
      { path: 'couple.second', label: 'Փեսացու', type: 'text' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
      { path: 'hero.line', label: 'Կամարի տակի տողը', type: 'text' },
      { path: 'hero.caption', label: 'Կամարի տեքստը', type: 'textarea' },
      { path: 'hero.note', label: 'Գրառման թերթիկ', type: 'text' },
      { path: 'hero.city', label: 'Քաղաք', type: 'text' },
    ],
  },
  {
    id: 'intro', title: 'Բացման էկրան', hideable: false,
    fields: [
      { path: 'gate.lead', label: 'Վերին տող', type: 'text' },
      { path: 'gate.line1', label: 'Վերնագիր · 1-ին տող', type: 'text' },
      { path: 'gate.line2', label: 'Վերնագիր · 2-րդ տող', type: 'text' },
      { path: 'gate.hint1', label: 'Հուշում · 1-ին տող', type: 'text' },
      { path: 'gate.hint2', label: 'Հուշում · 2-րդ տող', type: 'text' },
    ],
  },
  { id: 'calendar', title: 'Շաբաթվա օրացույց', hint: 'Հաշվվում է ավտոմատ՝ միջոցառման ամսաթվից։', fields: [] },
  {
    id: 'venue', title: 'Վայրը', fromEvent: true,
    fields: [
      { path: 'venue.name', label: 'Անվանում', type: 'text' },
      { path: 'venue.address', label: 'Հասցե (քարտեզի հղման համար)', type: 'text' },
      { path: 'venue.note', label: 'Տեքստը', type: 'text' },
    ],
  },
  {
    id: 'schedule', title: 'Ժամանակացույց', fromEvent: true,
    fields: [
      { path: 'scheduleSub', label: 'Ենթավերնագիր', type: 'text' },
      { path: 'schedule', label: 'Ծրագիր', type: 'schedule' },
      { path: 'scheduleCaption', label: 'Տեքստը ներքևում', type: 'textarea' },
    ],
  },
  {
    id: 'dressCode', title: 'Դրես-կոդ',
    fields: [
      { path: 'dressCode.intro', label: 'Ներածություն', type: 'textarea' },
      { path: 'dressCode.colors', label: 'Գույներ', type: 'colors' },
      { path: 'dressCode.note', label: 'Մանրամասներ', type: 'textarea' },
    ],
  },
  { id: 'gifts', title: 'Նվերներ', fields: [{ path: 'gifts.title', label: 'Վերնագիր', type: 'text' }, { path: 'gifts.text', label: 'Տեքստը', type: 'textarea' }] },
  { id: 'contribution', title: 'Ներդրում', fields: [{ path: 'contribution.title', label: 'Վերնագիր', type: 'text' }, { path: 'contribution.text', label: 'Տեքստը', type: 'textarea' }] },
  { id: 'kids', title: 'Փոքրիկներ', fields: [{ path: 'kids.title', label: 'Վերնագիր', type: 'text' }, { path: 'kids.text', label: 'Տեքստը', type: 'textarea' }] },
  {
    id: 'rsvp', title: 'Հարցաթերթիկ (RSVP)', rsvpSettings: true,
    fields: [
      { path: 'rsvp.intro', label: 'Ներածություն', type: 'textarea' },
      { path: 'rsvp.thanksYes', label: 'Պատասխան, եթե գալիս է', type: 'textarea' },
      { path: 'rsvp.thanksNo', label: 'Պատասխան, եթե չի գալիս', type: 'textarea' },
    ],
  },
  {
    id: 'contacts', title: 'Կոնտակտներ',
    fields: [
      { path: 'contacts.intro', label: 'Տեքստը', type: 'textarea' },
      { path: 'contacts.name', label: 'Անուն', type: 'text' },
      { path: 'contacts.phone', label: 'Հեռախոս', type: 'text' },
    ],
  },
  { id: 'closing', title: 'Եզրափակում', fields: [{ path: 'closing', label: 'Վերջին տողը', type: 'text' }] },
]
